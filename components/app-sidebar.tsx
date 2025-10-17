"use client";

import {
  Calendar,
  Home,
  Inbox,
  UserCircle,
  Search,
  Settings,
  LogOut,
  Bed,
  Users,

  UserCheck,
  Shield,
  FileText,
  CreditCard,
  Banknote,
  Wrench,
  DollarSign,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { title } from "process";

// Menu items for different roles
const menuItems = {
  warden: [
    {
      title: "Dashboard",
      url: "/dashboard/warden",
      icon: Home,
    },
    {
      title: "Rooms",
      url: "/dashboard/warden/rooms",
      icon: Bed,
    },
    {
      title: "Bookings",
      url: "/dashboard/warden/booking",
      icon: Calendar,
    },
    {
      title: "Guests",
      url: "/dashboard/warden/guest",
      icon: Users,
    },
    {
      title: "Payments",
      url: "/dashboard/warden/payment",
      icon: CreditCard,
    },
    {
      title: "Maintenance",
      url: "/dashboard/warden/maintenance",
      icon: Wrench,
    },
    {
      title: "Expenses",
      url: "/dashboard/warden/expenses",
      icon: DollarSign,
    },
    {
      title: "Reports",
      url: "/dashboard/warden/report",
      icon: FileText,
    },
    {
      title: "Settings",
      url: "/dashboard/warden/setting",
      icon: Settings,
    },
  ],
  guest: [
    {
      title: "Dashboard",
      url: "/dashboard/guest",
      icon: Home,
    },
    {
      title: "My Bookings",
      url: "/dashboard/guest/bookings",
      icon: Calendar,
    },
    {
      title: "Available Rooms",
      url: "/dashboard/guest/rooms",
      icon: Bed,
    },
    {
      title: "Payments",
      url: "/dashboard/guest/payment",
      icon: CreditCard,
    },
    {
      title: "Profile",
      url: "/dashboard/guest/profile",
      icon: UserCheck,
    },
    {
      title: "Maintenance",
      url: "/dashboard/guest/maintenance",
      icon: Wrench,
    },
  ],
  admin: [
    {
      title: "Dashboard",
      url: "/dashboard/admin",
      icon: Home,
    },
    {
      title: "All Hostels",
      url: "/dashboard/admin/hostel",
      icon: Bed,
    },
    {
      title: "All Rooms",
      url: "/dashboard/admin/rooms",
      icon: Bed,
    },
    {
      title: "All Bookings",
      url: "/dashboard/admin/bookings",
      icon: Calendar,
    },
    {
      title: "All Payments",
      url: "/dashboard/admin/payments",
      icon: CreditCard,
    },
    {
      title: "Payment Approvals",
      url: "/dashboard/admin/payment-approvals",
      icon: UserCheck,
    },
    {
      title : "Salaries",
      url: "/dashboard/admin/salaries",
      icon: DollarSign,
    },


    {
      title : "Roles",
      url: "/dashboard/admin/roles",
      icon: User,
    },
    {
title : "Maintenance",
url : "/dashboard/admin/maintenance",
icon : Wrench,
    },
    {
      title : "Expenses",
      url: "/dashboard/admin/expenses",
      icon: DollarSign,
    },
    // {
    //   title: "Reports",
    //   url: "/dashboard/admin/report",
    //   icon: FileText,
    // },
    {
      title: "Profile",
      url: "/dashboard/admin/profile",
      icon: UserCircle,
    },
  ],
};

// Function to get current role from pathname
function getCurrentRole(pathname: string): "warden" | "guest" | "admin" {
  if (pathname.includes("/dashboard/admin")) return "admin";
  if (pathname.includes("/dashboard/guest")) return "guest";
  return "warden"; // default to warden
}

export function AppSidebar() {
  const pathname = usePathname();
  const currentRole = getCurrentRole(pathname);
  const items = menuItems[currentRole];

  // Get role display name
  const roleDisplayNames = {
    warden: "Warden Dashboard",
    guest: "Guest Dashboard",
    admin: "Admin Dashboard",
  };

  return (
    <Sidebar className="h-screen w-64 bg-white shadow-lg border-r">
      {/* Sidebar Header */}
      <SidebarHeader className="px-6 py-4 border-b">
        <h2 className="text-xl font-bold tracking-wide text-gray-800">
          {roleDisplayNames[currentRole]}
        </h2>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="flex flex-col py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Link href={item.url} className="flex items-center w-full">
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer with Sign Out */}
      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <Link
                href="/api/auth/signout"
                className="flex items-center w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
