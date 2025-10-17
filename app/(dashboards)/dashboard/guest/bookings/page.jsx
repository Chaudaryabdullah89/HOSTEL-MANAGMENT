"use client"
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Bed, CreditCard, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton";

// Example guest bookings data
const guestBookings = [
  {
    id: 1,
    room: "A-101",
    checkIn: "2024-06-10",
    checkOut: "2024-06-15",
    status: "Active",
    amount: 3500,
    paymentStatus: "Completed",
  },
  {
    id: 2,
    room: "B-202",
    checkIn: "2024-07-01",
    checkOut: "2024-07-05",
    status: "Upcoming",
    amount: 4000,
    paymentStatus: "Pending",
  },
  {
    id: 3,
    room: "C-303",
    checkIn: "2024-05-01",
    checkOut: "2024-05-05",
    status: "Completed",
    amount: 3000,
    paymentStatus: "Completed",
  },
];

const statusOptions = ["All Bookings", "Active", "Upcoming", "Completed"];

const statusColor = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Upcoming":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const paymentColor = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const page = () => {
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("All Bookings");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredBookings = guestBookings.filter((booking) => {
    const matchesStatus =
      activeStatus === "All Bookings" || booking.status === activeStatus;
    const matchesSearch =
      booking.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <PageLoadingSkeleton 
        title={true}
        statsCards={0}
        filterTabs={4}
        searchBar={true}
        contentCards={3}
      />
    );
  }

  return (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status}
              variant={activeStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by room or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No bookings found.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">
                    Room {booking.room}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    {booking.checkIn} &rarr; {booking.checkOut}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={statusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  <Badge className= {paymentColor(booking.paymentStatus)}>
                   Payment {booking.paymentStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Stay: {booking.checkIn} to {booking.checkOut}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">PKR{booking.amount}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                {/* Optionally, add a button to view details or download invoice */}
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default page;
