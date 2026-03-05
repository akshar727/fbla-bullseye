"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  LayoutDashboard,
  Users,
  Package,
  FileCheck,
  Backpack,
  FileClock,
  Database,
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
const dashboardNav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
];

const databaseNav = [
  {
    title: "Previous Claims",
    href: "/dashboard/previous",
    icon: FileCheck,
  },
  {
    title: "Claims in Progress",
    href: "/dashboard/progress",
    icon: FileClock,
  },
  {
    title: "Reported Found Items",
    href: "/dashboard/found",
    icon: Backpack,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  return (
    <Sidebar variant="inset">
      <SidebarSeparator />

      <SidebarContent className="pt-18">
        {/* Dashboard */}
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

      <SidebarFooter>
        {/* <SidebarUser
          user={{
            name:
              user?.user_metadata?.full_name ||
              user?.user_metadata?.name ||
              user?.email ||
              "Admin User",
            email: user?.email || "admin@bullseye.app",
            avatar:
              user?.user_metadata?.avatar_url ||
              user?.user_metadata?.picture ||
              "",
          }}
        /> */}
      </SidebarFooter>
    </Sidebar>
  );
}
