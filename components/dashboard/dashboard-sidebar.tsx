"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  LayoutDashboard,
  Users,
  Package,
  FileCheck,
  Database,
  ChevronUp,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { SidebarUser } from "./sidebar-user";

const dashboardNav = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
];

const databaseNav = [
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Items",
    href: "/admin/items",
    icon: Package,
  },
  {
    title: "Claims",
    href: "/admin/claims",
    icon: FileCheck,
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
