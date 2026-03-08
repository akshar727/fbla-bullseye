"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, X, Search, Bell, User } from "lucide-react";
import { Badge } from "./ui/badge";

type Notification = {
  id: string;
  header: string;
  message: string;
  created_at: string;
  viewed: boolean;
};

function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  return (
    <div className="divide-y">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-4 py-3 space-y-0.5 ${!n.viewed ? "bg-muted/50" : ""}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug">{n.header}</p>
            {!n.viewed && (
              <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-snug">
            {n.message}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {new Date(n.created_at).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, u_loading, isAdmin } = useUser();

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.viewed).length;

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.viewed).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, viewed: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unreadIds }),
    }).catch(() => {});
  };

  const handleNotifOpenChange = (open: boolean) => {
    setNotifOpen(open);
    if (open) markAllRead();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand - LEFT SECTION */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-white rounded-md w-8 h-8">
                <img src="/favicon.ico" alt="Logo" className="h-8 w-8 z-10" />
              </div>
              <span className="text-xl font-bold">Bullseye</span>
            </Link>

            {/* Desktop Navigation Links - CENTER SECTION */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/browse"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Browse Items
              </Link>
              <Link
                href="/report/found"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Report a Found Item
              </Link>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            {user && (
              <Popover open={notifOpen} onOpenChange={handleNotifOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex"
                  >
                    <span className="sr-only">Notifications</span>
                    <div className="relative w-fit">
                      <Avatar className="size-9 rounded-sm">
                        <AvatarFallback className="rounded-sm">
                          <Bell className="size-5" />
                        </AvatarFallback>
                      </Avatar>
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-2.5 -right-2.5 h-5 min-w-5 px-1 tabular-nums bg-red-500 text-white">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <p className="text-sm font-semibold">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No notifications yet.
                    </div>
                  ) : notifications.length > 4 ? (
                    <ScrollArea className="h-80">
                      <NotificationList notifications={notifications} />
                    </ScrollArea>
                  ) : (
                    <NotificationList notifications={notifications} />
                  )}
                </PopoverContent>
              </Popover>
            )}

            {/* CTA Button Placeholder */}
            <Button className="hidden md:inline-flex" size="sm" asChild>
              <Link href={user ? "/dashboard" : "/login"}>
                {user ? "Dashboard" : "Login"}
              </Link>
            </Button>

            {/* Admin Button */}
            {isAdmin && (
              <Button
                className="hidden md:inline-flex"
                size="sm"
                variant="outline"
                asChild
              >
                <Link href="/admin">Admin</Link>
              </Button>
            )}

            {/* User Menu Dropdown */}
            {!u_loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback>
                        {user?.user_metadata?.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase() ||
                          user?.email?.[0]?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>User Menu</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/account" className="w-full">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/help" className="w-full">
                      Help & Support
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={async () => {
                      const { createClient } =
                        await import("@/lib/supabase/client");
                      const supabase = createClient();
                      await supabase.auth.signOut();
                      window.location.href = "/";
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            {/* Mobile Navigation Links */}
            <Link
              href="/browse"
              className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Items
            </Link>
            <Link
              href="/report/found"
              className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Report a Found Item
            </Link>

            <div className="border-t pt-3 mt-3 space-y-2">
              {/* Mobile Action Buttons */}
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button className="w-full mt-2" size="sm" asChild>
                <Link href={user ? "/dashboard" : "/login"}>
                  {user ? "Dashboard" : "Login"}
                </Link>
              </Button>
              {isAdmin && (
                <Button className="w-full" size="sm" variant="outline" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
