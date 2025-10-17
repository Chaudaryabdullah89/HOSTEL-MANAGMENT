"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "../components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useContext } from "react";
import { Footer } from "./footer";
import { SessionContext } from "../app/context/sessiondata";
import Link from "next/link";
export default function Layout({ children }) {
  const { session, loading } = useContext(SessionContext);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className=" flex justify-between w-full p-2 ml-3 items-center gap-2">
            <h1 className="text-lg font-semibold">Hostel Management System</h1>
            <Link href={`/dashboard/${session?.user?.role.toLowerCase()}/profile`} className="flex items-center justify-center gap-3">
              <Avatar className="h-8 w-8 bg-gray-200 flex items-center justify-center rounded-full">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="flex items-center justify-center rounded-full">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "Guest"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {" "}
                  {session?.user?.role || "Guest"}{" "}
                </p>
              </div>
            </Link>
          </div>
        </header>
        <div className="flex flex-1 bg-gray-50 flex-col gap-4 p-4">
          {children}
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
