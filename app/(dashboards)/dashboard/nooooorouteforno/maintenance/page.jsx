"use client"
import React, { useState } from 'react'
import { Users, ChevronDown, Search, Calendar, Clock, User, Bed, Wrench, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const page = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setActiveStatus] = useState('All Status');

    // Example maintenance requests data
    const maintenanceRequests = [
        {
            id: 1,
            room: { number: "A-101", type: "Deluxe Room", floor: 1 },
            reportedBy: "Aarav Sharma",
            issue: "AC not working",
            dateReported: "2025-10-01",
            status: "Pending",
            resolvedDate: null,
        },
        {
            id: 2,
            room: { number: "B-202", type: "Standard Room", floor: 2 },
            reportedBy: "Neha Verma",
            issue: "Leaking tap",
            dateReported: "2025-10-02",
            status: "Completed",
            resolvedDate: "2025-10-03",
        },
        {
            id: 3,
            room: { number: "C-303", type: "Premium Suite", floor: 3 },
            reportedBy: "Rohan Mehta",
            issue: "Broken window",
            dateReported: "2025-10-04",
            status: "In Progress",
            resolvedDate: null,
        },
    ];

    const filteredRequests = maintenanceRequests.filter(req => {
        const matchesStatus = status === "All Status" || req.status === status;
        const matchesSearch =
            req.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.room.number.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div>
            <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{maintenanceRequests.length}</div>
                        <p className="text-xs text-muted-foreground">All maintenance requests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{maintenanceRequests.filter(r => r.status === "Pending").length}</div>
                        <p className="text-xs text-muted-foreground">Pending requests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{maintenanceRequests.filter(r => r.status === "Completed").length}</div>
                        <p className="text-xs text-muted-foreground">Resolved requests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{maintenanceRequests.filter(r => r.status === "In Progress").length}</div>
                        <p className="text-xs text-muted-foreground">Currently being fixed</p>
                    </CardContent>
                </Card>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 my-6 shadow-sm rounded-md'>
                <div className='col-span-4 items-center gap-2 relative'>
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search className="h-4 w-4" />
                    </span>
                    <Input
                        type="text"
                        className="p-4 rounded-sm pl-12"
                        placeholder="Search maintenance requests"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className='flex items-center gap-2'>
                    <div className='col-span-1 cursor-pointer items-center gap-2'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className='p-4 px-10' variant="outline">
                                    {status}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setActiveStatus("All Status")}>All Status</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("Pending")}>Pending</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("In Progress")}>In Progress</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("Completed")}>Completed</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <div>
                <div className='grid grid-cols-1 bg-white p-6 my-6 shadow-sm rounded-md'>
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map(req => (
                            <Card key={req.id} className="mb-4">
                                <CardHeader>
                                    <div>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <Wrench className='h-6 w-6' />
                                                <div>
                                                    <p className='text-md font-medium'>
                                                        Request #{req.id}
                                                    </p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        {req.dateReported}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={
                                                    req.status === "Pending"
                                                        ? "secondary"
                                                        : req.status === "Completed"
                                                        ? "default"
                                                        : req.status === "In Progress"
                                                        ? "outline"
                                                        : "default"
                                                }
                                            >
                                                {req.status}
                                            </Badge>
                                        </div>
                                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                            {/* Issue Section */}
                                            <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
                                                <div>
                                                    <p className="text-md font-medium flex items-center gap-2">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span className="text-sm font-semibold text-gray-800">Issue</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-md font-medium text-gray-900">{req.issue}</p>
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
                                                    <p className="text-md font-medium text-gray-900">Room: {req.room.number}</p>
                                                    <p className="text-sm text-gray-600">{req.room.type}</p>
                                                    <p className="text-sm text-gray-600">Floor: {req.room.floor}</p>
                                                </div>
                                            </div>
                                            {/* Reported By Section */}
                                            <div className="flex flex-col gap-2 bg-white rounded-xl p-4">
                                                <div>
                                                    <p className="text-md font-medium flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        <span className="text-sm font-semibold text-gray-800">Reported By</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-md font-medium text-gray-900">{req.reportedBy}</p>
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
                                                    <p className="text-md font-medium text-gray-900">{req.dateReported}</p>
                                                    {req.resolvedDate && (
                                                        <p className="text-sm text-gray-600">Resolved: {req.resolvedDate}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <hr />
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No maintenance requests found for "{status}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default page