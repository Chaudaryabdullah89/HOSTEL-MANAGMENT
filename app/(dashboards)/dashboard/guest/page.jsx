"use client"
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, User, Calendar, TrendingUp, BookIcon, Bed, RefreshCcw, Download, CreditCard, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton";

// Stats
const guestStats = [
  {
    title: "Total Bookings",
    value: 12,
    icon: <BookIcon className="h-4 w-4 text-muted-foreground" />,
    description: "All your bookings",
  },
  {
    title: "Active Stay",
    value: 1,
    icon: <Bed className="h-4 w-4 text-muted-foreground" />,
    description: "Currently checked in",
  },
  {
    title: "Upcoming Bookings",
    value: 2,
    icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    description: "Future stays",
  },
  {
    title: "Total Spent",
    value: "PKR 18,500",
    icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    description: "Total amount paid",
  },
];

// Recent Bookings
const recentBookings = [
  {
    id: 1,
    room: "A-101",
    checkIn: "2024-06-10",
    checkOut: "2024-06-15",
    status: "Active",
  },
  {
    id: 2,
    room: "B-202",
    checkIn: "2024-07-01",
    checkOut: "2024-07-05",
    status: "Upcoming",
  },
  {
    id: 3,
    room: "C-303",
    checkIn: "2024-05-01",
    checkOut: "2024-05-05",
    status: "Completed",
  },
];

// Recent Payments
const recentPayments = [
  {
    id: 1,
    amount: 3500,
    method: "Credit Card",
    date: "2024-06-10",
    status: "Completed",
    booking: "A-101",
  },
  {
    id: 2,
    amount: 5000,
    method: "UPI",
    date: "2024-05-01",
    status: "Completed",
    booking: "C-303",
  },
  {
    id: 3,
    amount: 2000,
    method: "Cash",
    date: "2024-04-15",
    status: "Pending",
    booking: "B-202",
  },
];

// Recent Maintenance Requests
const recentMaintenance = [
  {
    id: 1,
    title: "AC not working",
    room: "A-101",
    date: "2024-06-12",
    status: "In Progress",
  },
  {
    id: 2,
    title: "Leaky faucet",
    room: "B-202",
    date: "2024-05-20",
    status: "Resolved",
  },
  {
    id: 3,
    title: "Broken chair",
    room: "C-303",
    date: "2024-04-30",
    status: "Pending",
  },
];

const page = () => {
  const [loading, setLoading] = useState(true);

  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <PageLoadingSkeleton 
        title={true}
        statsCards={4}
        filterTabs={0}
        searchBar={false}
        contentCards={4}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Welcome, Guest!</h1>
          <p className="text-muted-foreground leading-loose">
            Here’s a quick overview of your hostel activity.
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button variant="outline" className="flex items-center gap-1">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
          <Button className="flex items-center gap-1">
            <Download className="w-4 h-4" /> Download Summary
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {guestStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Sections: Bookings, Payments, Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your latest hostel bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex justify-between items-center border-b pb-2 last:border-b-0"
                >
                  <div>
                    <span className="font-medium">{booking.room}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.status === "Active" && (
                      <>
                        Checked in: {booking.checkIn}
                        <span className="ml-2">| Out: {booking.checkOut}</span>
                      </>
                    )}
                    {booking.status === "Upcoming" && (
                      <>
                        Upcoming: {booking.checkIn} - {booking.checkOut}
                      </>
                    )}
                    {booking.status === "Completed" && (
                      <>
                        Past: {booking.checkIn} - {booking.checkOut}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/dashboard/guest/bookings">
                <Button variant="outline" size="sm">
                  View All Bookings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              Recent Payments
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your latest payment activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center border-b pb-2 last:border-b-0"
                >
                  <div>
                    <span className="font-medium">PKR{payment.amount}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {payment.method}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">
                      {payment.date}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        payment.status === "Completed"
                          ? "text-green-600"
                          : payment.status === "Pending"
                          ? "text-yellow-600"
                          : "text-gray-500"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/dashboard/guest/payment">
                <Button variant="outline" size="sm">
                  View All Payments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Maintenance Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-muted-foreground" />
              Maintenance Requests
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your recent maintenance requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentMaintenance.map((req) => (
                <div
                  key={req.id}
                  className="flex justify-between items-center border-b pb-2 last:border-b-0"
                >
                  <div>
                    <span className="font-medium">{req.title}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {req.room}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">
                      {req.date}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        req.status === "Resolved"
                          ? "text-green-600"
                          : req.status === "In Progress"
                          ? "text-yellow-600"
                          : "text-gray-500"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/dashboard/guest/maintenance">
                <Button variant="outline" size="sm">
                  View All Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;