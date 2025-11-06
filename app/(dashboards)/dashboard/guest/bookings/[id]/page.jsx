"use client";
import React, { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Bed,
    CreditCard,
    Download,
    ArrowLeft,
    MapPin,
    Users,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Wifi,
    Car,
    Coffee,
    Dumbbell,
    Shield,
    Home,
    Phone,
    Mail,
    Building,
    Image as ImageIcon,
    FileText,
    Receipt
} from "lucide-react";
import { PageLoadingSkeleton, LoadingSpinner } from "@/components/ui/loading-skeleton";
import { SessionContext } from "@/app/context/sessiondata";

// Helper functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const getBookingStatus = (checkIn, checkOut, status) => {
    if (status === 'CANCELLED') return 'Cancelled';
    if (status === 'CHECKED_OUT') return 'Completed';

    const now = new Date();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (now < checkInDate) return 'Upcoming';
    if (now >= checkInDate && now <= checkOutDate) return 'Active';
    return 'Completed';
};

const statusColor = (status) => {
    switch (status) {
        case "Active":
            return "bg-green-100 text-green-800 border-green-200";
        case "Upcoming":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "Completed":
            return "bg-gray-100 text-gray-800 border-gray-200";
        case "Cancelled":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-muted text-muted-foreground";
    }
};

const paymentColor = (status) => {
    switch (status) {
        case "Completed":
        case "COMPLETED":
            return "bg-green-100 text-green-800 border-green-200";
        case "Pending":
        case "PENDING":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "Failed":
        case "FAILED":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-muted text-muted-foreground";
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case "Active":
            return <CheckCircle className="w-4 h-4" />;
        case "Upcoming":
            return <Clock className="w-4 h-4" />;
        case "Completed":
            return <XCircle className="w-4 h-4" />;
        case "Cancelled":
            return <AlertCircle className="w-4 h-4" />;
        default:
            return <AlertCircle className="w-4 h-4" />;
    }
};

const getAmenityIcon = (amenity) => {
    const amenityLower = amenity?.toLowerCase() || '';
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
        return <Wifi className="w-4 h-4" />;
    }
    if (amenityLower.includes('parking') || amenityLower.includes('car')) {
        return <Car className="w-4 h-4" />;
    }
    if (amenityLower.includes('cafe') || amenityLower.includes('coffee')) {
        return <Coffee className="w-4 h-4" />;
    }
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) {
        return <Dumbbell className="w-4 h-4" />;
    }
    if (amenityLower.includes('security') || amenityLower.includes('safe')) {
        return <Shield className="w-4 h-4" />;
    }
    return <Star className="w-4 h-4" />;
};

const page = () => {
    const params = useParams();
    const router = useRouter();
    const bookingId = params?.id;

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [room, setRoom] = useState(null);
    const [hostel, setHostel] = useState(null);
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState(null);

    const { session } = useContext(SessionContext);
    const currentUserId = session?.user?.id;

    // Fetch booking details
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!bookingId) return;

            setLoading(true);
            setError(null);

            try {
                // Fetch booking with all related data
                const bookingResponse = await fetch(`/api/booking/getallbooking`);
                if (!bookingResponse.ok) {
                    throw new Error('Failed to fetch booking');
                }

                const allBookings = await bookingResponse.json();
                const foundBooking = allBookings.find(b => b.id === bookingId);

                if (!foundBooking) {
                    setError('Booking not found');
                    setLoading(false);
                    return;
                }

                // Verify this booking belongs to the current user
                if (foundBooking.userId !== currentUserId && foundBooking.user?.id !== currentUserId) {
                    setError('Unauthorized access');
                    setLoading(false);
                    return;
                }

                // Map API field names
                const checkIn = foundBooking.checkin || foundBooking.checkIn || foundBooking.checkInDate;
                const checkOut = foundBooking.checkout || foundBooking.checkOut || foundBooking.checkOutDate;
                const totalAmount = foundBooking.price || foundBooking.totalAmount || foundBooking.amount;

                const bookingStatus = getBookingStatus(checkIn, checkOut, foundBooking.status);

                // Fetch room details if roomId exists
                let roomData = foundBooking.room;
                if (foundBooking.roomId && !roomData) {
                    try {
                        const roomResponse = await fetch(`/api/room/getallrooms`);
                        if (roomResponse.ok) {
                            const allRooms = await roomResponse.json();
                            roomData = allRooms.find(r => r.id === foundBooking.roomId);
                        }
                    } catch (err) {
                        console.error('Error fetching room:', err);
                    }
                }

                // Fetch hostel details if hostelId exists
                let hostelData = foundBooking.hostel;
                if (foundBooking.hostelId && !hostelData) {
                    try {
                        const hostelResponse = await fetch(`/api/hostel/gethostels`);
                        if (hostelResponse.ok) {
                            const allHostels = await hostelResponse.json();
                            hostelData = allHostels.find(h => h.id === foundBooking.hostelId);
                        }
                    } catch (err) {
                        console.error('Error fetching hostel:', err);
                    }
                }

                // Fetch payments for this booking
                let paymentsData = foundBooking.payments || [];
                if (!paymentsData || paymentsData.length === 0) {
                    try {
                        const paymentsResponse = await fetch(`/api/payment/getallpayments`);
                        if (paymentsResponse.ok) {
                            const allPayments = await paymentsResponse.json();
                            paymentsData = allPayments.filter(p => p.bookingId === bookingId);
                        }
                    } catch (err) {
                        console.error('Error fetching payments:', err);
                    }
                }

                setBooking({
                    ...foundBooking,
                    checkIn,
                    checkOut,
                    totalAmount,
                    status: bookingStatus,
                    duration: calculateDuration(checkIn, checkOut)
                });
                setRoom(roomData);
                setHostel(hostelData);
                setPayments(paymentsData || []);

                // Debug: Log room image data
                console.log('Room data:', roomData);
                console.log('Room image:', roomData?.image);

            } catch (err) {
                console.error('Error fetching booking details:', err);
                setError(err.message || 'Failed to load booking details');
            } finally {
                setLoading(false);
            }
        };

        if (bookingId && currentUserId) {
            fetchBookingDetails();
        }
    }, [bookingId, currentUserId]);

    const handleDownloadInvoice = () => {
        // TODO: Implement invoice download
        console.log('Downloading invoice for booking:', bookingId);
        alert('Invoice download feature coming soon!');
    };

    if (loading) {
        return (
            <div className="p-4">
                <PageLoadingSkeleton
                    title={true}
                    statsCards={0}
                    filterTabs={0}
                    searchBar={false}
                    contentCards={3}
                />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="p-4">
                <Card>
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
                        <p className="text-muted-foreground mb-4">{error || 'The booking you are looking for does not exist or you do not have access to it.'}</p>
                        <Button onClick={() => router.push('/dashboard/guest/bookings')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Bookings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Handle room images - support both single image and array
    const getImageUrl = (img) => {
        if (!img) return null;

        // If it's already a full URL, return as is
        if (img.startsWith('http://') || img.startsWith('https://')) {
            return img;
        }

        // If it's a data URL (base64), return as is
        if (img.startsWith('data:')) {
            return img;
        }

        // If it already starts with /uploads/, return as is
        if (img.startsWith('/uploads/')) {
            return img;
        }

        // If it starts with /, it's a relative path from public folder
        if (img.startsWith('/')) {
            return img;
        }

        // If it's just a filename (like "1762455911687_0lnty8xyppek.jpg"), 
        // assume it's in the uploads folder
        // Check if it looks like a filename (has extension and matches upload pattern)
        const hasExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(img);
        const looksLikeUploadFilename = /^\d+_[a-z0-9]+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(img);

        if (hasExtension && (looksLikeUploadFilename || !img.includes('/'))) {
            return `/uploads/${img}`;
        }

        // Otherwise, assume it's a relative path from public folder
        return `/${img}`;
    };

    const roomImage = room?.image || room?.images?.[0];
    const roomImages = room?.images || (room?.image ? [room.image] : []);
    const mainImageUrl = getImageUrl(roomImage);

    // Debug logging
    console.log('Room:', room);
    console.log('Room Image:', roomImage);
    console.log('Main Image URL:', mainImageUrl);

    return (
        <div className="p-4 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/guest/bookings')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Bookings
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Booking Details</h1>
                        <p className="text-muted-foreground">Complete information about your booking</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadInvoice}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                        <FileText className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Room Image Section */}
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative w-full h-96 bg-gray-100">
                        {mainImageUrl ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={mainImageUrl}
                                    alt={`Room ${room?.roomNumber || 'N/A'}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                                <div className="w-full h-full items-center justify-center bg-gray-200 hidden">
                                    <ImageIcon className="w-16 h-16 text-gray-400" />
                                </div>
                                {roomImages.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                        {roomImages.length} images
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <ImageIcon className="w-16 h-16 text-gray-400" />
                                <p className="ml-2 text-gray-500">No room image available</p>
                            </div>
                        )}
                    </div>
                    {roomImages.length > 1 && (
                        <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                            {roomImages.slice(1, 5).map((img, index) => {
                                const imgUrl = getImageUrl(img);
                                return imgUrl ? (
                                    <div key={index} className="relative w-full h-24 bg-gray-200 rounded overflow-hidden">
                                        <img
                                            src={imgUrl}
                                            alt={`Room ${room?.roomNumber || 'N/A'} - Image ${index + 2}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ) : null;
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Booking Status and Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Booking Status</p>
                                <Badge className={`mt-2 ${statusColor(booking.status)} flex items-center gap-1 w-fit`}>
                                    {getStatusIcon(booking.status)}
                                    {booking.status}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Booking ID</p>
                                <p className="text-lg font-bold mt-1">#{booking.id?.slice(-8) || booking.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                <p className="text-lg font-bold mt-1">{booking.duration} night{booking.duration > 1 ? 's' : ''}</p>
                            </div>
                            <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                <p className="text-lg font-bold mt-1">{formatCurrency(booking.totalAmount)}</p>
                            </div>
                            <CreditCard className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Booking Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Booking Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Check-in Date</p>
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-semibold">{formatDate(booking.checkIn)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.checkIn ? new Date(booking.checkIn).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Check-out Date</p>
                                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-semibold">{formatDate(booking.checkOut)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.checkOut ? new Date(booking.checkOut).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Booking Type</p>
                                    <p className="font-semibold">{booking.bookingType || 'Standard'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Created At</p>
                                    <p className="font-semibold">{formatDateTime(booking.createdAt || booking.created)}</p>
                                </div>
                            </div>

                            {booking.notes && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Special Requests / Notes</p>
                                    <p className="text-sm bg-blue-50 p-3 rounded-lg">{booking.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Room Details */}
                    {room && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bed className="w-5 h-5" />
                                    Room Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Room Number:</span>
                                            <span className="font-semibold text-lg">{room.roomNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Room Type:</span>
                                            <Badge variant="outline">{room.type || 'N/A'}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Floor:</span>
                                            <span className="font-semibold">Floor {room.floor || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Capacity:</span>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-semibold">{room.capacity || 'N/A'} guests</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Price per Night:</span>
                                            <span className="font-semibold">{formatCurrency(room.pricePerNight || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Price per Month:</span>
                                            <span className="font-semibold">{formatCurrency(room.pricePerMonth || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Room Status:</span>
                                            <Badge variant={room.status === 'OCCUPIED' ? 'default' : 'secondary'}>
                                                {room.status || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Room Amenities */}
                                {room.amenities && room.amenities.length > 0 && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground mb-3">Room Amenities</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {room.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    {getAmenityIcon(amenity)}
                                                    <span className="text-sm">{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Room Notes */}
                                {room.notes && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Room Notes</p>
                                        <p className="text-sm bg-gray-50 p-3 rounded-lg">{room.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Hostel Information */}
                    {hostel && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Hostel Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Hostel Name:</span>
                                            <span className="font-semibold">{hostel.hostelName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-muted-foreground">Hostel Type:</span>
                                            <Badge variant="outline">{hostel.hostelType || 'N/A'}</Badge>
                                        </div>
                                        {hostel.contactNumber && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-muted-foreground">Contact:</span>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-semibold">{hostel.contactNumber}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {hostel.address && (
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                                                    <p className="text-sm">{hostel.address.street || 'N/A'}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {hostel.address.city || 'N/A'}, {hostel.address.state || 'N/A'}
                                                    </p>
                                                    {hostel.address.postalCode && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Postal Code: {hostel.address.postalCode}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Hostel Amenities */}
                                {hostel.amenities && hostel.amenities.length > 0 && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground mb-3">Hostel Amenities</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {hostel.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    {getAmenityIcon(amenity)}
                                                    <span className="text-sm">{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment History */}
                    {payments && payments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="w-5 h-5" />
                                    Payment History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-semibold">{formatCurrency(payment.amount || payment.paymentAmount || 0)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {payment.method || payment.paymentMethod || 'N/A'} • {formatDateTime(payment.createdAt || payment.paidAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={paymentColor(payment.status)}>
                                                {payment.status || 'Pending'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total Paid:</span>
                                        <span className="text-lg font-bold">
                                            {formatCurrency(payments.reduce((sum, p) => sum + (p.amount || p.paymentAmount || 0), 0))}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-6">
                    {/* Booking Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Room Price ({booking.duration} nights):</span>
                                <span className="font-semibold">
                                    {formatCurrency((room?.pricePerNight || 0) * booking.duration)}
                                </span>
                            </div>
                            {room?.securityDeposit && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Security Deposit:</span>
                                    <span className="font-semibold">{formatCurrency(room.securityDeposit)}</span>
                                </div>
                            )}
                            <div className="pt-3 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Total Amount:</span>
                                    <span className="text-xl font-bold">{formatCurrency(booking.totalAmount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push(`/dashboard/guest/payment?bookingId=${bookingId}`)}
                            >
                                <CreditCard className="w-4 h-4 mr-2" />
                                View Payments
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleDownloadInvoice}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Invoice
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push('/dashboard/guest/complaints')}
                            >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Report Issue
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    {hostel && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {hostel.contactNumber && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <a href={`tel:${hostel.contactNumber}`} className="text-sm hover:underline">
                                            {hostel.contactNumber}
                                        </a>
                                    </div>
                                )}
                                {hostel.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <a href={`mailto:${hostel.email}`} className="text-sm hover:underline">
                                            {hostel.email}
                                        </a>
                                    </div>
                                )}
                                {hostel.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                        <p className="text-sm">
                                            {hostel.address.street}, {hostel.address.city}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default page;

