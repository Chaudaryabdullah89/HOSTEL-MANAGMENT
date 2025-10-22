"use client"
import React, { useState } from 'react'
// import { Users,Calendar,TrendingUp, CheckCircle, AlertTriangle, Wrench} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { Plus, Filter, Users ,TrendingUp , ChevronDown, Search, Edit, Wifi, Tv, Wind, Delete, Bin, Trash, Clock, User, Bed, Calendar, CardSim, CreditCard, BookIcon } from 'lucide-react'
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
import { getDaysBetween } from '@/lib/dateUtils'
import BookingTabs from '@/components/menu'
import { format } from 'date-fns';
import { Phone, MapPin, Wrench } from 'lucide-react';



const page = () => {
    const [searchTerm ,setSearchTerm] = useState('')
    const [status ,setActiveStatus] = useState('All Status')

    const payments = [
        {
          room: {
            number: "A-101",
            type: "Deluxe Room",
            floor: 1,
          },
          guests: [
            {
              id: 1,
              name: "Aarav Sharma",
              email: "aarav.sharma@example.com",
              phone: "+91 9876543210",
              checkIn: "2025-09-25",
              checkOut: "2025-10-05",
              payments: [
                { id: 1, amount: 2000, method: "UPI", date: "2025-09-25", status: "Failed" },
                // { id: 2, amount: 2500, method: "Credit Card", date: "2025-09-30", status: "Failed" },
              ],
              totalAmount: 4500,
              remaining: 0,
            },
            {
              id: 2,
              name: "Neha Verma",
              email: "neha.verma@example.com",
              phone: "+91 9898989898",
              checkIn: "2025-09-26",
              checkOut: "2025-10-05",
              payments: [
                { id: 1, amount: 3000, method: "Cash", date: "2025-09-26", status: "Failed" },
              ],
              totalAmount: 4500,
              remaining: 1500,
            },
          ],
        },
        {
          room: {
            number: "B-202",
            type: "Standard Room",
            floor: 2,
          },
          guests: [
            {
              id: 3,
              name: "Anjali Gupta",
              email: "anjali.gupta@example.com",
              phone: "+91 9988776655",
              checkIn: "2025-09-30",
              checkOut: "2025-10-07",
              payments: [
                { id: 1, amount: 2000, method: "UPI", date: "2025-09-30", status: "Completed" },
              ],
              totalAmount: 3500,
              remaining: 1500,
            },
            {
              id: 4,
              name: "Rohit Desai",
              email: "rohit.desai@example.com",
              phone: "+91 9900990099",
              checkIn: "2025-10-01",
              checkOut: "2025-10-07",
              payments: [
                { id: 1, amount: 3500, method: "Credit Card", date: "2025-10-01", status: "Completed" },
              ],
              totalAmount: 3500,
              remaining: 0,
            },
          ],
        },
        {
          room: {
            number: "C-303",
            type: "Premium Suite",
            floor: 3,
          },
          guests: [
            {
              id: 5,
              name: "Rohan Mehta",
              email: "rohan.mehta@example.com",
              phone: "+91 9123456789",
              checkIn: "2025-09-28",
              checkOut: "2025-10-10",
              payments: [
                { id: 1, amount: 5200, method: "Debit Card", date: "2025-09-28", status: "Refund" },
              ],
              totalAmount: 5200,
              remaining: 0,
            },
            {
              id: 6,
              name: "Sneha Kapoor",
              email: "sneha.kapoor@example.com",
              phone: "+91 9876501234",
              checkIn: "2025-09-29",
              checkOut: "2025-10-10",
              payments: [
                { id: 1, amount: 3000, method: "Cash", date: "2025-09-29", status: "Refund" },
              ],
              totalAmount: 4800,
              remaining: 1800,
            },
          ],
        },
      ];
   
    const filteredPayments = payments
      .map(roomEntry => ({
        ...roomEntry,
        guests: roomEntry.guests.filter(guest => {
          // Filter by payment status
          const matchedStatus =
            status === "All Status" ||
            guest.payments.some(payment => payment.status === status);

          // Search filter
          const matchesSearch =
            guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.email.toLowerCase().includes(searchTerm.toLowerCase());

          return matchedStatus && matchesSearch;
        }),
      }))
      // Remove rooms that end up with zero guests after filtering
      .filter(roomEntry => roomEntry.guests.length > 0);
        
    
    
    console.log(filteredPayments);
    return (
    <div>
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
                                    {status}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setActiveStatus("All Status")}>
                                    All Status
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("Pending")}>
                                    Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("Completed")}>
                                    Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("Failed")}>
                                    Failed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("Refund")}>
                                    Refund
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                </div>
            </div>
            <div>
            <div className='grid grid-cols-1  bg-white p-6 my-6  shadow-sm rounded-md' >
                {filteredPayments.length > 0 ? (
                    filteredPayments.flatMap(roomEntry =>
                        roomEntry.guests.map(payment => (
                            <Card key={payment.id} className="mb-4">
                                <CardHeader>
                                    <div>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <Clock className='h-6 w-6' />
                                                <div>
                                                    <p className='text-md font-medium'>
                                                        Booking # {payment.id}
                                                    </p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        {payment.checkIn}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {payment.payments.map((pay, idx) => (
                                                    <Badge
                                                        key={pay.id || idx}
                                                        variant={
                                                            pay.status === "Pending"
                                                                ? "secondary"
                                                                : pay.status === "Completed"
                                                                ? "default"
                                                                : pay.status === "Refund"
                                                                ? "outline"
                                                                : pay.status === "Failed"
                                                                ? "destructive"
                                                                : "default"
                                                        }
                                                    >
                                                        {pay.status}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                            {/* Guest Section */}
                                            <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
                                                <div>
                                                    <p className="text-md font-medium flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        <span className="text-sm font-semibold text-gray-800">Guest</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-md font-medium text-gray-900">Guest: {payment.name}</p>
                                                    <p className="text-sm text-gray-600">{payment.email}</p>
                                                    <p className="text-sm text-gray-600">{payment.phone}</p>
                                                </div>
                                            </div>

                                            {/* Room Section */}
                                            <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
                                                <div>
                                                    <p className="text-md font-medium flex items-center gap-2">
                                                        <Bed className="w-4 h-4" />
                                                        <span className="text-sm font-semibold text-gray-800">Room</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-md font-medium text-gray-900">Room: {roomEntry.room.number}</p>
                                                    <p className="text-sm text-gray-600">{roomEntry.room.type}</p>
                                                    <p className="text-sm text-gray-600">Floor: {roomEntry.room.floor}</p>
                                                </div>
                                            </div>

                                            {/* Date Section */}
                                            <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
                                                <div>
                                                    <p className="text-md font-medium flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-sm font-semibold text-gray-800">Date</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-md font-medium text-gray-900">{payment.checkIn}</p>
                                                    <p className="text-sm text-gray-600">to {payment.checkOut}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {getDaysBetween(payment.checkIn, payment.checkOut)} nights • PKR{payment.totalAmount}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Payment Section */}
                                            <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
                                                <div>
                                                    <p className="text-md font-medium flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4" />
                                                        <span className="text-sm font-semibold text-gray-800">Payment</span>
                                                    </p>
                                                </div>
                                                {/* Details for payment, could be added here */}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <hr />
                            </Card>
                        ))
                    )
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No bookings found for "{status}"</p>
                    </div>
                )}
            </div>
</div>
    </div>
  )
}

export default page 