"use client"
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Bed, CreditCard, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton";

// Example guest payments data
const guestPayments = [
  {
    id: 1,
    room: "A-101",
    checkIn: "2024-06-10",
    checkOut: "2024-06-15",
    amount: 3500,
    method: "Credit Card",
    date: "2024-06-10",
    status: "Completed",
  },
  {
    id: 2,
    room: "B-202",
    checkIn: "2024-07-01",
    checkOut: "2024-07-05",
    amount: 4000,
    method: "UPI",
    date: "2024-06-25",
    status: "Pending",
  },
  {
    id: 3,
    room: "C-303",
    checkIn: "2024-05-01",
    checkOut: "2024-05-05",
    amount: 3000,
    method: "Cash",
    date: "2024-05-01",
    status: "Completed",
  },
  {
    id: 4,
    room: "A-101",
    checkIn: "2024-06-10",
    checkOut: "2024-06-15",
    amount: 500,
    method: "Credit Card",
    date: "2024-06-12",
    status: "Refund",
  },
];

const statusOptions = ["All Payments", "Completed", "Pending", "Refund"];

const statusColor = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Refund":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const page = () => {
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("All Payments");
  const [searchTerm, setSearchTerm] = useState("");

  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredPayments = guestPayments.filter((payment) => {
    const matchesStatus =
      activeStatus === "All Payments" || payment.status === activeStatus;
    const matchesSearch =
      payment.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status.toLowerCase().includes(searchTerm.toLowerCase());
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
        contentCards={4}
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
            placeholder="Search by room, method, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No payments found.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">
                    Room {payment.room}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    {payment.checkIn} &rarr; {payment.checkOut}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={statusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{payment.method}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Date: {payment.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">PKR{payment.amount}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                {/* Optionally, add a button to download invoice or view details */}
                <Button variant="outline" size="sm">
                  Download Invoice
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
