"use client";
import React, { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bed,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Clock,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";

// IMPORTANT: Import your SessionContext (as in your dashboards/pages), and ensure the Provider is wrapping _app or layout

import { SessionContext } from "@/app/context/sessiondata";

export default function Home() {
  const { session } = useContext(SessionContext);
  const router = useRouter();

  useEffect(() => {
    if (!session || !session.user) {
      alert("You need to login to access this page.");
      router.replace("/auth/signin");
    }
  }, [session, router]);

  // Don't render the rest of the homepage if not logged in
  if (!session || !session.user) {
    return (
      <main className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertTriangle className="text-yellow-700 h-16 w-16 mb-4" />
        <div className="text-xl text-yellow-900 mb-2 font-semibold">Login Required</div>
        <div className="text-gray-600 mb-6">You must be logged in to view this page.</div>
        <Button onClick={() => router.replace("/auth/signin")}>Go to Login</Button>
      </main>
    );
  }


}