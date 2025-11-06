"use client"
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Bed, CreditCard, Search, Download, Eye, Clock, MapPin, Users, Wifi, Car, Coffee, Dumbbell, Shield, Star, AlertCircle, CheckCircle, XCircle, RefreshCcw, Filter, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton";
import { useBookings } from "@/hooks/useBookings";
import { usePayments } from "@/hooks/usePayments";
import { useRooms } from "@/hooks/useRooms";
import { useHostels } from "@/hooks/useHostels";
import { SessionContext } from "@/app/context/sessiondata";

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getBookingStatus = (checkIn, checkOut) => {
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (now < checkInDate) return 'Upcoming';
  if (now >= checkInDate && now <= checkOutDate) return 'Active';
  return 'Completed';
};

const calculateDuration = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const statusOptions = ["All Bookings", "Active", "Upcoming", "Completed"];

const statusColor = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 border-green-200";
    case "Upcoming":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Completed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const paymentColor = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Failed":
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
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("All Bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Get current user session
  const { session } = useContext(SessionContext);
  const currentUserId = session?.user?.id;

  // State for data
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch bookings directly
        setBookingsLoading(true);
        const bookingsResponse = await fetch('/api/booking/getallbooking');
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData);
          console.log('Fetched bookings:', bookingsData);
        }

        // Fetch other data
        const [paymentsRes, roomsRes, hostelsRes] = await Promise.all([
          fetch('/api/payment/getallpayments'),
          fetch('/api/room/getallrooms'),
          fetch('/api/hostel/gethostels')
        ]);

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData);
        }

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData);
        }

        if (hostelsRes.ok) {
          const hostelsData = await hostelsRes.json();
          setHostels(hostelsData);
        }

      } catch (error) {
        console.error('Error fetching bookings data:', error);
      } finally {
        setLoading(false);
        setBookingsLoading(false);
        setPaymentsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Filter bookings by current user
  const userBookings = bookings?.filter(booking => booking.userId === currentUserId) || [];

  // Enhanced booking data with room and hostel details
  const enhancedBookings = userBookings?.map(booking => {
    const room = rooms?.find(r => r.id === booking.roomId);
    const hostel = hostels?.find(h => h.id === booking.hostelId);
    const payment = payments?.find(p => p.bookingId === booking.id);

    // Map API field names to frontend expected names
    const checkIn = booking.checkin || booking.checkIn;
    const checkOut = booking.checkout || booking.checkOut;
    const totalAmount = booking.price || booking.totalAmount;

    // Map API status to frontend status
    let mappedStatus = booking.status;
    if (booking.status === 'PENDING') {
      mappedStatus = 'Upcoming';
    } else if (booking.status === 'CONFIRMED') {
      mappedStatus = 'Active';
    } else if (booking.status === 'CHECKED_OUT') {
      mappedStatus = 'Completed';
    } else if (booking.status === 'CANCELLED') {
      mappedStatus = 'Cancelled';
    }

    const status = getBookingStatus(checkIn, checkOut) || mappedStatus;
    const duration = calculateDuration(checkIn, checkOut);

    return {
      ...booking,
      checkIn,
      checkOut,
      totalAmount,
      room,
      hostel,
      payment,
      status,
      duration
    };
  }) || [];


  // Filter and sort bookings
  const filteredBookings = enhancedBookings
    .filter((booking) => {
      const matchesStatus = activeStatus === "All Bookings" || booking.status === activeStatus;
      const matchesSearch =
        booking.room?.roomNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.hostel?.hostelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.hostel?.address?.city?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.checkIn) - new Date(b.checkIn);
          break;
        case "amount":
          comparison = (a.totalAmount || 0) - (b.totalAmount || 0);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

  // Refresh function
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Fetch bookings directly
      const bookingsResponse = await fetch('/api/booking/getallbooking');
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }

      // Fetch other data
      const [paymentsRes, roomsRes, hostelsRes] = await Promise.all([
        fetch('/api/payment/getallpayments'),
        fetch('/api/room/getallrooms'),
        fetch('/api/hostel/gethostels')
      ]);

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
      }

      if (hostelsRes.ok) {
        const hostelsData = await hostelsRes.json();
        setHostels(hostelsData);
      }

    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // View booking details - navigate to detail page
  const handleViewDetails = (booking) => {
    router.push(`/dashboard/guest/bookings/${booking.id}`);
  };

  // Download invoice
  const handleDownloadInvoice = (booking) => {
    // Implement invoice download logic
    console.log('Downloading invoice for booking:', booking.id);
  };

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
    <div className="w-full p-4 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Manage and track your hostel bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{enhancedBookings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Stays</p>
                <p className="text-2xl font-bold">{enhancedBookings.filter(b => b.status === 'Active').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{enhancedBookings.filter(b => b.status === 'Upcoming').length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(enhancedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0))}</p>
              </div>
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
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
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="status">Sort by Status</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || activeStatus !== "All Bookings"
                ? "Try adjusting your search or filter criteria"
                : "You haven't made any bookings yet"}
            </p>
            <Button variant="outline">
              Browse Available Rooms
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Bed className="w-5 h-5 text-muted-foreground" />
                      Room {booking.room?.roomNumber || 'N/A'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {booking.hostel?.hostelName || 'Unknown Hostel'}
                      {booking.hostel?.address?.city && (
                        <span className="text-muted-foreground">• {booking.hostel.address.city}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`${statusColor(booking.status)} flex items-center gap-1`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </Badge>
                    <Badge className={`${paymentColor(booking.payment?.status || 'Pending')} flex items-center gap-1`}>
                      <CreditCard className="w-3 h-3" />
                      {booking.payment?.status || 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Booking Dates */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Check-in</p>
                      <p className="text-sm text-muted-foreground">{formatDate(booking.checkIn)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Check-out</p>
                      <p className="text-sm text-muted-foreground">{formatDate(booking.checkOut)}</p>
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                {booking.room && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Capacity</p>
                        <p className="text-sm text-muted-foreground">{booking.room.capacity} guests</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Type</p>
                        <p className="text-sm text-muted-foreground">{booking.room.type}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {booking.room?.amenities && booking.room.amenities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-1">
                      {booking.room.amenities.slice(0, 4).map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {booking.room.amenities.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{booking.room.amenities.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing and Duration */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{booking.duration} night{booking.duration > 1 ? 's' : ''}</p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(booking.totalAmount || 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between items-center pt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Redirect to payments page with booking filter
                      window.location.href = `/dashboard/guest/payment?bookingId=${booking.id}`;
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    View Payments
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(booking)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Invoice
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Booking ID: #{booking.id}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default page;
