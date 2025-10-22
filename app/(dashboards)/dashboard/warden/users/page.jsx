"use client"
import React, { useState } from 'react'
// import { Users,Calendar,TrendingUp, CheckCircle, AlertTriangle, Wrench} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { Plus, Filter, Users ,TrendingUp , ChevronDown, Search, Edit, Wifi, Tv, Wind, Delete, Bin, Trash, Clock, User, Bed, Calendar, CardSim, CreditCard, UserStar } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import BookingTabs from '@/components/menu'
import { format } from 'date-fns';
import { Phone, MapPin, Wrench } from 'lucide-react';
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from '@/components/ui/loading-skeleton';
import { useEffect } from 'react';

const page = () => {
    const [loading, setLoading] = useState(true);

    // Simulate loading for demonstration
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const [role,setactiveRole] = useState('All Types')
    const [searchTerm ,setSearchTerm] = useState('')
    const [room ,setroom] = useState('Select the room number')
    const [bookingtype ,setBookingType] = useState("Select the Booking type ")
    // Guest creation form state variables
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestGender, setGuestGender] = useState('');
    const [bookingTypeInput, setBookingTypeInput] = useState('');
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [roomNumberInput, setRoomNumberInput] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');

    // dumi 
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
        }
    ];
    
const guests = [
        {
          id: 1,
          name: "Aarav Sharma",
          email: "aarav.sharma@example.com",
          phone: "+91 9876543210",
          role: "Guest",
          roomNumber: "A-101",
          checkIn: "2025-09-25",
          checkOut: "2025-10-05",
          maintenanceRequests: [
            { id: 1, issue: "Leaky tap", status: "Pending" },
            { id: 2, issue: "Light not working", status: "Resolved" },
          ],
          totalAmount: 4500,
          paidAmount: 4500,
          bookings: [
            {
              id: 1,
              room: { number: "A-101", floor: 1 },
              checkIn: "2025-09-25",
              checkOut: "2025-10-05",
              status: "Checked In",
            }
          ],
          createdAt: "2025-01-10"
        },
        {
          id: 2,
          name: "Anjali Gupta",
          email: "anjali.gupta@example.com",
          phone: "+91 9988776655",
          role: "Guest",
          roomNumber: "B-202",
          checkIn: "2025-09-30",
          checkOut: "2025-10-07",
          maintenanceRequests: [],
          totalAmount: 3500,
          paidAmount: 2000,
          bookings: [
            {
              id: 2,
              room: { number: "B-202", floor: 2 },
              checkIn: "2025-09-30",
              checkOut: "2025-10-07",
              status: "Checked Out",
            }
          ],
          createdAt: "2025-02-15"
        },
        {
          id: 3,
          name: "Rohan Mehta",
          email: "rohan.mehta@example.com",
          phone: "+91 9123456789",
          role: "Guest",
          roomNumber: "C-303",
          checkIn: "2025-09-28",
          checkOut: "2025-10-10",
          maintenanceRequests: [
            { id: 3, issue: "Broken chair", status: "Resolved" },
          ],
          totalAmount: 5200,
          paidAmount: 5200,
          bookings: [
            {
              id: 3,
              room: { number: "C-303", floor: 3 },
              checkIn: "2025-09-28",
              checkOut: "2025-10-10",
              status: "Checked In",
            }
          ],
          createdAt: "2025-03-05"
        },
        {
          id: 4,
          name: "Sneha Kapoor",
          email: "sneha.kapoor@example.com",
          phone: "+91 9876501234",
          role: "Guest",
          roomNumber: "A-204",
          checkIn: "2025-10-02",
          checkOut: "2025-10-09",
          maintenanceRequests: [
            { id: 4, issue: "AC not cooling", status: "Pending" },
          ],
          totalAmount: 4800,
          paidAmount: 3000,
          bookings: [
            {
              id: 4,
              room: { number: "A-204", floor: 2 },
              checkIn: "2025-10-02",
              checkOut: "2025-10-09",
              status: "Confirmed",
            }
          ],
          createdAt: "2025-04-20"
        },
        {
          id: 5,
          name: "Vikram Desai",
          email: "vikram.desai@example.com",
          phone: "+91 9765432109",
          role: "Guest",
          roomNumber: "B-105",
          checkIn: "2025-09-29",
          checkOut: "2025-10-06",
          maintenanceRequests: [],
          totalAmount: 4000,
          paidAmount: 4000,
          bookings: [
            {
              id: 5,
              room: { number: "B-105", floor: 1 },
              checkIn: "2025-09-29",
              checkOut: "2025-10-06",
              status: "Checked Out",
            }
          ],
          createdAt: "2025-05-12"
        },
      ];

    // Helper functions

    const calculateTotalSpent = (guest) => {
      return guest.paidAmount || 0;
    };

    const getActiveBookings = (guest) => {
      if(!guest.bookings) return [];
      return guest.bookings.filter(booking => booking.status === "Checked In");
    };

    const getRoleColor = (role) => {
      switch(role) {
        case "Guest":
          return "bg-blue-100 text-blue-800";
        case "Staff":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const filteredGuests = guests.filter(guest => {
      const matchesRole = role === "All Types" || guest.bookings.some(booking => {
        if(role === "Checked In") return booking.status === "Checked In";
        if(role === "Checked out") return booking.status === "Checked Out";
        if(role === "Confirmed") return booking.status === "Confirmed";
        return true;
      });
      const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || guest.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <PageLoadingSkeleton 
        title={true}
        statsCards={4}
        filterTabs={3}
        searchBar={true}
        contentCards={6}
      />
    );
  }

  return (
    <div>
        <div className="flex md:flex-row flex-col justify-between px-4">
                <div className="mt-4 ">
                    <h1 className="text-3xl font-bold">Guest  ! </h1>
                    <p className="text-muted-foreground leading-loose" >Manage your guest here.</p>

                </div>
                
            </div>
        < div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
     <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground">
              All register user
            </p>
          </CardContent>
        </Card>
        <Card>  
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium"> Guests</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground">
              Regular Guest
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground">
                Staff Members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Active Guest</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent> 
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground">
                Currently checked in
            </p>
          </CardContent>
        </Card>
     </div>
     <div className='grid grid-cols-1 md:grid-cols-5 gap-4  bg-white p-6 my-6  shadow-sm rounded-md' >
                <div className='col-span-4  items-center gap-2 relative'>
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
                <div className='flex items-center gap-2'>


                    <div className='col-span-1 cursor-pointer items-center gap-2'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className='p-4 px-10' variant="outline"  >
                                    {role}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setactiveRole("All Types")}>
                                    All Types
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setactiveRole("Checked In")}>
                                    Checked In
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setactiveRole("Checked out")}>
                                    Checked Out
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setactiveRole("Confirmed")}>
                                    Confirmed
                                </DropdownMenuItem>
                                
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGuests.map((guest) => (
              <Card key={guest.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{guest.name}</CardTitle>
                      <CardDescription>{guest.email}</CardDescription>
                    </div>
                    <Badge className={getRoleColor(guest.role)}>
                      {guest.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {guest.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{guest.phone}</span>
                      </div>
                    )}
                    
                    {guest.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{guest.address}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Joined: {format(new Date(guest.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Bed className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Bookings</span>
                        </div>
                        <p className="font-medium">{guest.bookings?.length || 0 }</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Spent</span>
                        </div>
                        <p className="font-medium">${calculateTotalSpent(guest)}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Wrench className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Requests</span>
                        </div>
                        <p className="font-medium">{guest.maintenanceRequests?.length || 0}</p>
                      </div>
                    </div>

                    {getActiveBookings(guest).length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-green-600 font-medium">
                          Currently checked in
                        </p>
                        {getActiveBookings(guest).map((booking) => (
                          <p key={booking.id} className="text-xs text-muted-foreground">
                            Room {booking.room.number} - Floor {booking.room.floor}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
    </div>
  )
}

export default page