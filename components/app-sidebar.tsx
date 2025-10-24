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

  MessageSquare,
  CreditCard,
  Banknote,
  Wrench,
  DollarSign,
  User,
} from "lucide-react";
import { NotificationBadge } from "@/components/notification-badge";
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
import { logout } from "@/lib/logout";

// Menu items for different roles
const menuItems = {

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
      title: "Payments",
      url: "/dashboard/guest/payment",
      icon: CreditCard,
    },
    {
      title: "Maintenance",
      url: "/dashboard/guest/maintenance",
      icon: Wrench,
    },
    {
      title: "Complaints",
      url: "/dashboard/guest/complaints",
      icon: MessageSquare,
    },
    {
      title: "Profile",
      url: "/dashboard/guest/profile",
      icon: UserCheck,
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
      title: "Salaries",
      url: "/dashboard/admin/salaries",
      icon: DollarSign,
    },


    {
      title: "Roles",
      url: "/dashboard/admin/roles",
      icon: User,
    },
    {
      title: "Users Records",
      url: "/dashboard/admin/records",
      icon: Users,
    },
    {
      title: "Reports",
      url: "/dashboard/admin/reports",
      icon: FileText,
    },
    {
      title: "Complaints",
      url: "/dashboard/admin/complaints",
      icon: MessageSquare,
    },
    {
      title: "Expenses",
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
  warden: [
    {
      title: "Dashboard",
      url: "/dashboard/warden",
      icon: Home,
    },
    {
      title: "All Hostels",
      url: "/dashboard/warden/hostel",
      icon: Bed,
    },
    {
      title: "All Rooms",
      url: "/dashboard/warden/rooms",
      icon: Bed,
    },
    {
      title: "All Bookings",
      url: "/dashboard/warden/bookings",
      icon: Calendar,
    },
    {
      title: "All Payments",
      url: "/dashboard/warden/payments",
      icon: CreditCard,
    },
    {
      title: "Payment Approvals",
      url: "/dashboard/warden/payment-approvals",
      icon: UserCheck,
    },
    // {
    //   title: "Salaries",
    //   url: "/dashboard/warden/salaries",
    //   icon: DollarSign,
    // },


    // {
    //   title: "Roles",
    //   url: "/dashboard/warden/roles",
    //   icon: User,
    // },
    {
      title: "Users Records",
      url: "/dashboard/warden/records",
      icon: Users,
    },
    {
      title: "Reports",
      url: "/dashboard/warden/reports",
      icon: FileText,
    },
    {
      title: "Complaints",
      url: "/dashboard/warden/complaints",
      icon: MessageSquare,
    },
    {
      title: "Expenses",
      url: "/dashboard/warden/expenses",
      icon: DollarSign,
    },
    // {
    //   title: "Reports",
    //   url: "/dashboard/admin/report",
    //   icon: FileText,
    // },
    {
      title: "Profile",
      url: "/dashboard/warden/profile",
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-wide text-gray-800">
            {roleDisplayNames[currentRole]}
          </h2>
          <NotificationBadge />
        </div>
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
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
