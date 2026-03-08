"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  FileCheck,
  Backpack,
  Files,
  FileClock,
  Database,
  MessageSquare,
  MessageSquareText,
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
    title: "Reported Found Items",
    href: "/dashboard",
    icon: Backpack,
  },
  {
    title: "My Inquiries",
    href: "/dashboard/inquiries",
    icon: MessageSquare,
  },
  {
    title: "Chats",
    href: "/dashboard/chats",
    icon: MessageSquareText,
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
    href: "/dashboard/ongoing",
    icon: FileClock,
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
            <Files className="size-3.5 mr-1.5" />
            Claims
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
