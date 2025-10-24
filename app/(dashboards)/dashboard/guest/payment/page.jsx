"use client"
import React, { useState, useEffect, useContext } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Bed, CreditCard, Search, Download, Eye, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton";
import { SessionContext } from "@/app/context/sessiondata";

const statusOptions = ["All Payments", "COMPLETED", "PENDING", "FAILED", "REFUNDED"];

const statusColor = (status) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-200";
    case "REFUNDED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="w-4 h-4" />;
    case "PENDING":
      return <Clock className="w-4 h-4" />;
    case "FAILED":
      return <XCircle className="w-4 h-4" />;
    case "REFUNDED":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const page = () => {
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("All Payments");
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [bookingFilter, setBookingFilter] = useState(null);

  // Get current user session
  const { session } = useContext(SessionContext);
  const currentUserId = session?.user?.id;

  // Check for booking filter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    if (bookingId) {
      setBookingFilter(bookingId);
    }
  }, []);

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/payments/getpayments');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched payments:', data);
          setPayments(data);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Filter payments by current user and optionally by booking
  const userPayments = payments?.filter(payment => {
    const isUserPayment = payment.user?.id === currentUserId || payment.booking?.user?.id === currentUserId;
    const matchesBooking = !bookingFilter || payment.bookingId === bookingFilter;
    return isUserPayment && matchesBooking;
  }) || [];

  console.log('Current user ID:', currentUserId);
  console.log('User payments:', userPayments);

  const filteredPayments = userPayments.filter((payment) => {
    const matchesStatus =
      activeStatus === "All Payments" || payment.status === activeStatus;
    const matchesSearch =
      payment.booking?.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.booking?.hostel?.hostelName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/getpayments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error refreshing payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Payments</h2>
          <p className="text-muted-foreground">
            {bookingFilter ? `Payments for Booking #${bookingFilter}` : 'View and manage your payment history'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {bookingFilter && (
            <Button
              variant="outline"
              onClick={() => {
                setBookingFilter(null);
                window.history.replaceState({}, '', '/dashboard/guest/payment');
              }}
            >
              Clear Filter
            </Button>
          )}
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Debug Panel */}
      <Card className="bg-blue-50 border-blue-200 mb-4">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Debug Information</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Current User ID: {currentUserId || 'Not logged in'}</p>
            <p>Total payments from API: {payments?.length || 0}</p>
            <p>User payments (filtered): {userPayments?.length || 0}</p>
            <p>Filtered payments: {filteredPayments.length}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold">{userPayments.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{userPayments.filter(p => p.status === 'COMPLETED').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{userPayments.filter(p => p.status === 'PENDING').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(userPayments.reduce((sum, p) => p.status === 'COMPLETED' ? sum + p.amount : sum, 0))}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No payments found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              {userPayments.length === 0 ? 'You have no payment history yet.' : 'Try adjusting your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">
                    {payment.booking?.room?.roomNumber ? `Room ${payment.booking.room.roomNumber}` : 'Payment'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    {payment.booking?.checkin && payment.booking?.checkout ?
                      `${formatDate(payment.booking.checkin)} → ${formatDate(payment.booking.checkout)}` :
                      formatDate(payment.createdAt)
                    }
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${statusColor(payment.status)} flex items-center gap-1`}>
                    {getStatusIcon(payment.status)}
                    {payment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-sm text-muted-foreground">{payment.method}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Amount</p>
                      <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                    </div>
                  </div>
                </div>

                {payment.booking && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-sm font-medium">Hostel</p>
                      <p className="text-sm text-muted-foreground">{payment.booking.hostel?.hostelName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Booking Type</p>
                      <p className="text-sm text-muted-foreground">{payment.booking.bookingType || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {payment.transactionId && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Transaction ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{payment.transactionId}</p>
                  </div>
                )}

                {payment.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">{payment.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(payment)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download Invoice
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Payment Details</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Payment Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Payment ID:</span> #{selectedPayment.id}</p>
                    <p><span className="font-medium">Amount:</span> {formatCurrency(selectedPayment.amount)}</p>
                    <p><span className="font-medium">Method:</span> {selectedPayment.method}</p>
                    <p><span className="font-medium">Status:</span>
                      <Badge className={`ml-2 ${statusColor(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Dates</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Created:</span> {formatDate(selectedPayment.createdAt)}</p>
                    <p><span className="font-medium">Updated:</span> {formatDate(selectedPayment.updatedAt)}</p>
                    {selectedPayment.transactionId && (
                      <p><span className="font-medium">Transaction ID:</span> {selectedPayment.transactionId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              {selectedPayment.booking && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p><span className="font-medium">Room:</span> {selectedPayment.booking.room?.roomNumber || 'N/A'}</p>
                      <p><span className="font-medium">Hostel:</span> {selectedPayment.booking.hostel?.hostelName || 'N/A'}</p>
                      <p><span className="font-medium">Type:</span> {selectedPayment.booking.bookingType || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <p><span className="font-medium">Check-in:</span> {selectedPayment.booking.checkin ? formatDate(selectedPayment.booking.checkin) : 'N/A'}</p>
                      <p><span className="font-medium">Check-out:</span> {selectedPayment.booking.checkout ? formatDate(selectedPayment.booking.checkout) : 'N/A'}</p>
                      <p><span className="font-medium">Booking Status:</span> {selectedPayment.booking.status || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedPayment.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedPayment.notes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Close
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default page;
