"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  LayoutDashboard,
  Users,
  Package,
  FileCheck,
  MessageSquare,
  Database,
  LogOut,
  ShieldCheck,
  CalendarClock,
  ShieldAlert,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const dashboardNav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
];

const databaseNav = [
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Items", href: "/admin/items", icon: Package },
  { title: "Claims", href: "/admin/claims", icon: FileCheck },
  { title: "Spam Review", href: "/admin/spam", icon: ShieldAlert },
  { title: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  {
    title: "Exchange Requests",
    href: "/admin/exchanges",
    icon: CalendarClock,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Admin";
  const email = user?.email || "";
  const avatar =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Sidebar variant="inset">
      <SidebarContent style={{ paddingTop: "75px" }}>
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Database */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Database className="size-3.5 mr-1.5" />
            Database
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {databaseNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />
      <SidebarRail />
    </Sidebar>
  );
}
