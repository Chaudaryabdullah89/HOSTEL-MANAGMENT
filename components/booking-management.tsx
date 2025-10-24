"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Calendar,
    User,
    MapPin,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Edit,
    Filter,
    Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Booking {
    id: string;
    userId: string;
    hostelId: string;
    roomId: string;
    checkin: string;
    checkout: string;
    price: number;
    bookingType: string;
    status: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    room: {
        roomNumber: string;
        type: string;
    };
    hostel: {
        hostelName: string;
    };
    payments: Array<{
        id: string;
        amount: number;
        method: string;
        status: string;
    }>;
}

export function BookingManagement() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [bookings, searchTerm, statusFilter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/booking/getallbooking');
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = () => {
        let filtered = bookings;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(booking =>
                booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.hostel.hostelName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(booking => booking.status === statusFilter);
        }

        setFilteredBookings(filtered);
    };

    const updateBookingStatus = async (bookingId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/booking/updatestatus', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingId,
                    status: newStatus
                }),
            });

            if (response.ok) {
                toast.success(`Booking status updated to ${newStatus}`);
                fetchBookings(); // Refresh the list
            } else {
                toast.error('Failed to update booking status');
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
            toast.error('Failed to update booking status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'CHECKED_OUT':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="w-4 h-4" />;
            case 'CONFIRMED':
                return <CheckCircle className="w-4 h-4" />;
            case 'CHECKED_OUT':
                return <Calendar className="w-4 h-4" />;
            case 'CANCELLED':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">Loading bookings...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Booking Management</h2>
                    <p className="text-muted-foreground">Manage all guest bookings</p>
                </div>
                <Button onClick={fetchBookings} variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by name, room, or hostel..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('ALL')}
                                size="sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('PENDING')}
                                size="sm"
                            >
                                Pending
                            </Button>
                            <Button
                                variant={statusFilter === 'CONFIRMED' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('CONFIRMED')}
                                size="sm"
                            >
                                Confirmed
                            </Button>
                            <Button
                                variant={statusFilter === 'CHECKED_OUT' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('CHECKED_OUT')}
                                size="sm"
                            >
                                Checked Out
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings List */}
            <div className="grid gap-4">
                {filteredBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            Created by {booking.user.name} ({booking.user.role})
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Room {booking.room.roomNumber}</p>
                                                <p className="text-sm text-muted-foreground">{booking.hostel.hostelName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm">
                                                    {formatDate(booking.checkin)} - {formatDate(booking.checkout)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.bookingType} booking
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{formatCurrency(booking.price)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.payments.length > 0 ?
                                                        `${booking.payments[0].status} payment` :
                                                        'No payment'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    {booking.status === 'PENDING' && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Confirm
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Cancel
                                            </Button>
                                        </>
                                    )}

                                    {booking.status === 'CONFIRMED' && (
                                        <Button
                                            size="sm"
                                            onClick={() => updateBookingStatus(booking.id, 'CHECKED_OUT')}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Check Out
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedBooking(booking)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredBookings.length === 0 && (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No bookings found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
