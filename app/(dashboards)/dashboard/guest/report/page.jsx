// This file is a guest version, copied from admin. Adjust logic as needed for guest role.
"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, ChevronDown, Search, Download,Users ,User ,  Calendar , RefreshCcw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Avatar } from '@radix-ui/react-avatar'

const avaibleroom = [
    { id: 1, number: "A-101", floor: 1, type: "Single Room", status: "Available", revenue: 12000 },
    { id: 2, number: "B-202", floor: 2, type: "Double Room", status: "Available", revenue: 18000 },
    { id: 3, number: "C-303", floor: 3, type: "Triple Room", status: "Available", revenue: 15000 },
    { id: 4, number: "D-404", floor: 4, type: "Dormitory", status: "Available", revenue: 8000 }
];

const page = () => {
    const [activeStatus, setActiveStatus] = useState("All Bookings")
    const [searchTerm, setSearchTerm] = useState('')
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

    const handleStatusChange = (status) => setActiveStatus(status);

    return (
        <div>
            <div className="flex md:flex-row flex-col justify-between px-4">
                <div className="mt-4 ">
                    <h1 className="text-3xl font-bold">Report!</h1>
                    <p className="text-muted-foreground leading-loose">Insights into your hostel's performance</p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Button variant={'outline'} className='cursor-pointer'  ><RefreshCcw/>Refresh</Button>
                    <Button className='cursor-pointer' > <Download /> Report</Button>
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
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Top Performing Rooms</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Rooms with the most bookings
                </CardDescription>
            </CardHeader>
            <CardContent>
                {avaibleroom.map(room => (
                  <div key={room.id} className="flex justify-between items-center gap-4 mb-4 p-2 border-b last:border-b-0">
                    <div className='flex gap-4' >

                    <div className='bg-blue-100 p-2 rounded-full flex justify-center items-center w-8 h-8'>
                      {room.number.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-semibold">{room.number}</p>
                      <p className="text-xs text-muted-foreground">{room.status}</p>
                    </div>
                    </div>
                    <div className='flex flex-col' >
                    
                     <CardTitle>{room.revenue}</CardTitle>
                     <CardDescription>
                     Revenue
                     </CardDescription>

                    </div>
                  </div>
                ))}
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Booking Status Distribution</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Current Booking Status
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                  {/* Example static data for booking status distribution */}
                  <div className="flex justify-between items-center p-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="font-medium">Pending</span>
                    </div>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-medium">Completed</span>
                    </div>
                    <span className="font-semibold">34</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="font-medium">Confirmed</span>
                    </div>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="font-medium">Cancelled</span>
                    </div>
                    <span className="font-semibold">3</span>
                  </div>
                </div>
            </CardContent>
        {/* Section: Occupancy Rate */}
      
        </Card>
        </div>
        <div  className='grid grid-cols-1 md:grid-cols-2 gap-4' >
        <Card className="mt-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Occupancy Rate</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Percentage of rooms currently occupied
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Example static calculation */}
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-3xl font-bold text-black">78%</span>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Occupied Rooms: <span className="font-semibold">39</span> / 50</div>
                        <div className="text-xs text-gray-500 mt-1">Last updated: 2 hours ago</div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Section: Recent Bookings */}
        <Card className="mt-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Latest bookings in the hostel
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3">
                    {/* Example static recent bookings */}
                    <div className="flex justify-between items-center border-b pb-2">
                        <div>
                            <span className="font-medium">John Doe</span>
                            <span className="ml-2 text-xs text-gray-500">A-101</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Checked in: 2024-06-10</div>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                        <div>
                            <span className="font-medium">Jane Smith</span>
                            <span className="ml-2 text-xs text-gray-500">B-202</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Checked in: 2024-06-09</div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="font-medium">Alex Lee</span>
                            <span className="ml-2 text-xs text-gray-500">C-303</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Checked in: 2024-06-08</div>
                    </div>
                </div>
            </CardContent>
        </Card>
        </div>
        </div>
    )
}

export default page
