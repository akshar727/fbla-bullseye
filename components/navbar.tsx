"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Menu, X, Search, Bell, User } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, u_loading, isAdmin } = useUser();
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
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
            {/* Notifications Placeholder */}
            {user && (
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
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
                    <Link href="/settings" className="w-full">
                      Settings
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
