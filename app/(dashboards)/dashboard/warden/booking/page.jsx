"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Filter,
  ChevronDown,
  Search,
  Edit,
  Wifi,
  Tv,
  Wind,
  Delete,
  Bin,
  Trash,
  Clock,
  User,
  Bed,
  Calendar,
  CardSim,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookingTabs from "@/components/menu";
import { getDaysBetween } from "@/lib/dateUtils";

const page = () => {
  // State to track the active booking status
  const [activeStatus, setActiveStatus] = useState("All Bookings");
  const [searchTerm, setSearchTerm] = useState("");

  // --- State variables for Add Room form ---

  // Guest creation form state variables
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestGender, setGuestGender] = useState("");
  const [bookingTypeInput, setBookingTypeInput] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [roomNumberInput, setRoomNumberInput] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Function to handle status changes from the menu
  const handleStatusChange = (status) => {
    setActiveStatus(status);
    console.log("Active status changed to:", status);
  };

  // Helper function to calculate remaining amount
  const calculateRemainingAmount = (payment) => {
    return payment.status.toLowerCase() === "completed" && payment.paid === true
      ? 0
      : payment.amount;
  };

  const tempbookings = [
    {
      id: Math.random().toString(36).substring(2, 15),
      guest: {
        id: Math.random().toString(36).substring(2, 15),
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
      },
      checkIn: "Oct 23, 2025",
      checkOut: "Oct 30, 2025",
      status: "Pending",
      totalAmount: 1000,
      notes:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
      createdAt: "2025-01-01",
      room: {
        id: Math.random().toString(36).substring(2, 15),
        number: "101",
        floor: 1,
        type: "Single",
        price: 1000,
        status: "Available",
        amenities: ["Wifi", "TV", "AC"],
        description: "A comfortable single room with a private bathroom",
      },
      payments: [
        {
          id: Math.random().toString(36).substring(2, 15),
          amount: 1000,
          paid: false,
          status: "Pending",
          get remaining() {
            return calculateRemainingAmount(this);
          },
        },
      ],
    },
    {
      id: Math.random().toString(36).substring(2, 15),
      guest: {
        id: Math.random().toString(36).substring(2, 15),
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "0987654321",
      },
      checkIn: "Oct 28, 2025",
      checkOut: "Oct 30, 2025",
      status: "Confirmed",
      totalAmount: 1500,
      notes: "Guest requested late checkout",
      createdAt: "2025-01-02",
      room: {
        id: Math.random().toString(36).substring(2, 15),
        number: "102",
        floor: 1,
        type: "Double",
        price: 1500,
        status: "Occupied",
        amenities: ["Wifi", "TV", "AC"],
        description: "A spacious double room with a private bathroom",
      },
      payments: [
        {
          id: Math.random().toString(36).substring(2, 15),
          amount: 1500,
          paid: true,
          status: "Completed",
          get remaining() {
            return calculateRemainingAmount(this);
          },
        },
      ],
    },
  ];
  const avaibleroom = [
    {
      id: 1,
      number: "A-101",
      floor: 1,
      type: "Single Room",
      status: "Available",
      price: 1500,
      features: ["WiFi", "TV", "AC"],
    },
    {
      id: 2,
      number: "B-202",
      floor: 2,
      type: "Double Room",
      status: "Available",
      price: 2000,
      features: ["WiFi", "TV"],
    },
    {
      id: 3,
      number: "C-303",
      floor: 3,
      type: "Triple Room",
      status: "Available",
      price: 2500,
      features: ["WiFi", "AC"],
    },
    {
      id: 4,
      number: "D-404",
      floor: 4,
      type: "Dormitory",
      status: "Available",
      price: 1000,
      features: ["WiFi"],
    },
  ];

  // Combined filtering for status and search
  const filteredBookings = tempbookings.filter((booking) => {
    const matchesStatus =
      activeStatus === "All Bookings" || booking.status === activeStatus;
    const matchesSearch =
      searchTerm === "" ||
      booking.guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room.type.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Debug logging
  console.log("Active Status:", activeStatus);
  console.log("Total bookings:", tempbookings.length);
  console.log("Filtered bookings:", filteredBookings.length);
  console.log(
    "Available statuses:",
    tempbookings.map((b) => b.status),
  );

  return (
    <div className="p-2">
      <div className="flex md:flex-row flex-col justify-between px-4">
        <div className="mt-4 ">
          <h1 className="text-3xl font-bold">Bookings ! </h1>
          <p className="text-muted-foreground leading-loose">
            Manage your rooms here.
          </p>
        </div>
        <div className="flex items-center overflow-visible gap-2 mt-4 md:mt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="cursor-pointer p-4" variant="outline">
                <Plus className="h-4 w-4" /> New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-xl font-semibold">
                  Add Guest
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Add The New Guest
                </DialogDescription>
              </DialogHeader>
              <div
                className="overflow-y-auto px-6 pb-6 pt-2"
                style={{ maxHeight: "70vh" }}
              >
                <form className="space-y-6 overflow-visible">
                  {/* Guest Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Guest Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Full Name *
                        </Label>
                        <Input
                          placeholder="e.g. John Doe"
                          className="w-full"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Email *
                        </Label>
                        <Input
                          placeholder="e.g. johndoe@email.com"
                          type="email"
                          className="w-full"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Phone Number *
                        </Label>
                        <Input
                          placeholder="e.g. +91 9876543210"
                          type="tel"
                          className="w-full"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              {guestGender ? guestGender : "Select Gender"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            <DropdownMenuItem
                              onClick={() => setGuestGender("Male")}
                            >
                              Male
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setGuestGender("Female")}
                            >
                              Female
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setGuestGender("Other")}
                            >
                              Other
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Booking Information
                    </h3>
                    <div className="flex items-end gap-4 w-full">
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Booking Type
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full mt-4 justify-between text-left font-normal"
                            >
                              {bookingTypeInput
                                ? bookingTypeInput
                                : "Select Booking Type"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full items-start ">
                            <DropdownMenuItem
                              onClick={() => setBookingTypeInput("Per day")}
                            >
                              Per day
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setBookingTypeInput("Montly Base")}
                            >
                              Montly Base
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Check-In Date *
                        </Label>
                        <Input
                          type="date"
                          className="w-full"
                          required
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Check-Out Date *
                        </Label>
                        <Input
                          type="date"
                          className="w-full"
                          required
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Room Number *
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              {roomNumberInput
                                ? roomNumberInput
                                : "Select the room number"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            {avaibleroom.map((rooms) => (
                              <DropdownMenuItem
                                key={rooms.id}
                                onClick={() => setRoomNumberInput(rooms.number)}
                              >
                                {rooms.number} | Floor {rooms.floor} |{" "}
                                {rooms.type} | {rooms.status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Payment Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Total Amount (INR) *
                        </Label>
                        <Input
                          placeholder="e.g. 4500"
                          type="number"
                          min="0"
                          className="w-full"
                          required
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Payment Status *
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              {paymentStatus ? paymentStatus : "Select Status"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            <DropdownMenuItem
                              onClick={() => setPaymentStatus("Pending")}
                            >
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setPaymentStatus("Completed")}
                            >
                              Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setPaymentStatus("Failed")}
                            >
                              Failed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setPaymentStatus("Refund")}
                            >
                              Refund
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Additional Notes
                    </Label>
                    <textarea
                      placeholder="Any additional information about the guest or booking..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      className="cursor-pointer"
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 cursor-pointer hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Guest
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4  bg-white p-6 my-6  shadow-sm rounded-md">
        <div className="col-span-4  items-center gap-2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <Input
            type="text"
            className="p-4 rounded-sm pl-12"
            placeholder="Search bookings"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="col-span-1 cursor-pointer items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="p-4 px-10" variant="outline">
                  {activeStatus}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("All Bookings")}
                >
                  All Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("Pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("Confirmed")}
                >
                  Confirmed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("Checked In")}
                >
                  Checked In
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("Checked Out")}
                >
                  Checked Out
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("Cancelled")}
                >
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <BookingTabs
        tabs={[
          "All Bookings",
          "Pending",
          "Confirmed",
          "Checked In",
          "Checked Out",
          "Cancelled",
        ]}
        onStatusChange={handleStatusChange}
        activeStatus={activeStatus}
      />

      {/* Display current active status */}
      <div className="px-4 py-2">
        <p className="text-sm text-gray-600">
          Showing:{" "}
          <span className="font-medium text-indigo-600">{activeStatus}</span>
        </p>
      </div>

      {/* Display filtered bookings */}
      <div className="grid grid-cols-1  bg-white p-6 my-6  shadow-sm rounded-md">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="mb-4">
              <CardHeader>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-6 w-6" />
                      <div>
                        <p className="text-md font-medium">
                          Booking #{booking.id.slice(-8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.createdAt}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        booking.status === "Pending"
                          ? "secondary"
                          : booking.status === "Confirmed"
                            ? "default"
                            : booking.status === "Checked In"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Guest Section */}
                    <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
                      <div>
                        <p className="text-md font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="text-sm font-semibold text-gray-800">
                            Guest
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-md font-medium text-gray-900">
                          Guest: {booking.guest.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.guest.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.guest.phone}
                        </p>
                      </div>
                    </div>

                    {/* Room Section */}
                    <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
                      <div>
                        <p className="text-md font-medium flex items-center gap-2">
                          <Bed className="w-4 h-4" />
                          <span className="text-sm font-semibold text-gray-800">
                            Room
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-md font-medium text-gray-900">
                          Room: {booking.room.number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.room.type}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.room.status}
                        </p>
                      </div>
                    </div>

                    {/* Date Section */}
                    <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
                      <div>
                        <p className="text-md font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-semibold text-gray-800">
                            Date
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-md font-medium text-gray-900">
                          {booking.checkIn}
                        </p>
                        <p className="text-sm text-gray-600">
                          to {booking.checkOut}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getDaysBetween(booking.checkIn, booking.checkOut)}{" "}
                          nights • PKR{booking.totalAmount}
                        </p>
                      </div>
                    </div>

                    {/* Payment Section */}
                    <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
                      <div>
                        <p className="text-md font-medium flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span className="text-sm font-semibold text-gray-800">
                            Payment
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-md font-medium text-gray-900">
                          Amount: PKR{booking.payments[0].amount}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            booking.payments[0].remaining === 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {booking.payments[0].remaining === 0
                            ? "Fully Paid"
                            : `Remaining: PKR${booking.payments[0].remaining}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          Paid: {booking.payments[0].paid ? "Yes" : "No"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: PKR{booking.payments[0].remaining}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <hr />
              <CardFooter>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                  <div>
                    <p className="text-muted-foreground text-md">
                      Notes : {booking.notes}
                    </p>
                  </div>
                  <div className="md:ml-auto flex gap-3 ">
                    <Button className="cursor-pointer">Cancel</Button>
                    {booking.status === "Pending" && (
                      <Button variant="outline" className="cursor-pointer">
                        Confirm Guest
                      </Button>
                    )}
                    {booking.status === "Confirmed" && (
                      <Button variant="outline" className="cursor-pointer">
                        Check In
                      </Button>
                    )}
                    {booking.status === "Checked In" && (
                      <Button variant="outline" className="cursor-pointer">
                        Check Out
                      </Button>
                    )}
                    {booking.status === "Checked Out" && (
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        disabled
                      >
                        Completed
                      </Button>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No bookings found for "{activeStatus}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
