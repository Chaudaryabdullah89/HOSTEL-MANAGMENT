"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Wrench, 
  Bed, 
  Building,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  FileText
} from "lucide-react";
import { PageLoadingSkeleton, LoadingSpinner } from "@/components/ui/loading-skeleton";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

export default function UserRecordsPage() {
  const [email, setEmail] = useState("");
  const [userRecords, setUserRecords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  const handleSearch = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUserRecords(null);

    try {
      const response = await fetch(`/api/users/records?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user records");
      }

      setUserRecords(data);
      
      // Debug logging
      console.log('User Records Data:', data);
      console.log('Bookings count:', data.bookings?.length || 0);
      console.log('Payments count:', data.payments?.length || 0);
      console.log('Maintenances count:', data.maintenances?.length || 0);
      
      // Add to search history
      const newSearch = {
        email: email,
        name: data.user.name || data.user.email,
        timestamp: new Date().toISOString(),
        result: 'success'
      };
      setSearchHistory(prev => [newSearch, ...prev.slice(0, 4)]); // Keep last 5 searches
      
      toast.success(`User records loaded successfully for ${data.user.name || data.user.email}`);
    } catch (error) {
      console.error("Error fetching user records:", error);
      setError(error.message);
      
      // Add failed search to history
      const newSearch = {
        email: email,
        name: email,
        timestamp: new Date().toISOString(),
        result: 'error'
      };
      setSearchHistory(prev => [newSearch, ...prev.slice(0, 4)]);
      
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!userRecords) return;
    
    const dataStr = JSON.stringify(userRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-records-${userRecords.user.email}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Records exported successfully");
  };

  const handleClear = () => {
    setEmail("");
    setUserRecords(null);
    setError(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      case 'in_progress':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading user records..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Records</h1>
          <p className="text-muted-foreground">
            Search and view complete user records including bookings, payments, and maintenance requests
          </p>
        </div>
        {userRecords && (
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Records
          </Button>
        )}
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search User Records
          </CardTitle>
          <CardDescription>
            Enter the user's email address to fetch their complete records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter user email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading || !email.trim()}>
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            {userRecords && (
              <Button onClick={handleClear} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
          
          {/* Search History */}
          {/* {searchHistory.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Recent Searches:</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setEmail(search.email)}
                    className={`text-xs ${
                      search.result === 'success' 
                        ? 'border-green-200 text-green-700 hover:bg-green-50' 
                        : 'border-red-200 text-red-700 hover:bg-red-50'
                    }`}
                  >
                    {search.name}
                    {search.result === 'success' ? (
                      <CheckCircle className="h-3 w-3 ml-1" />
                    ) : (
                      <XCircle className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Records */}
      {userRecords && (
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span>{userRecords.user.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{userRecords.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span>{userRecords.user.phone || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{userRecords.user.role}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Joined:</span>
                    <span>{format(new Date(userRecords.user.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  {userRecords.user.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Address:</span>
                      <span>{userRecords.user.address.city}, {userRecords.user.address.state}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {userRecords.user.guestInfo && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Hostel:</span>
                      <span>{userRecords.user.guestInfo.Hostel?.hostelName || 'N/A'}</span>
                    </div>
                  )}
                  {userRecords.user.wardenInfo && userRecords.user.wardenInfo.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Manages:</span>
                      <span>{userRecords.user.wardenInfo[0].hostel?.hostelName || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{userRecords.summary.totalBookings}</p>
                    <p className="text-xs text-muted-foreground">
                      {userRecords.summary.activeBookings} active, {userRecords.summary.completedBookings} completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                    <p className="text-2xl font-bold">{userRecords.summary.totalPayments}</p>
                    <p className="text-xs text-muted-foreground">
                      {userRecords.summary.completedPayments} completed, {userRecords.summary.pendingPayments} pending
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Amount Paid</p>
                    <p className="text-2xl font-bold">PKR {userRecords.summary.totalAmountPaid.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Average: PKR {userRecords.summary.totalPayments > 0 ? Math.round(userRecords.summary.totalAmountPaid / userRecords.summary.totalPayments).toLocaleString() : '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Maintenance Requests</p>
                    <p className="text-2xl font-bold">{userRecords.summary.totalMaintenanceRequests}</p>
                    <p className="text-xs text-muted-foreground">
                      {userRecords.summary.pendingMaintenance} pending
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Records Tabs */}
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    Booking History ({userRecords.bookings.length})
                  </CardTitle>
                  <CardDescription>
                    All bookings made by this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userRecords.bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No bookings found</p>
                      <p className="text-sm text-muted-foreground mt-2">This user hasn't made any bookings yet</p>
                      {/* Debug info */}
                      <details className="mt-4 text-left">
                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                          Debug Info (Click to expand)
                        </summary>
                        <pre className="mt-2 p-2 bg-muted text-xs overflow-auto max-h-32">
                          {JSON.stringify({
                            bookingsCount: userRecords.bookings?.length || 0,
                            bookingsData: userRecords.bookings || [],
                            userRole: userRecords.user?.role,
                            userId: userRecords.user?.id
                          }, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userRecords.bookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-lg">Room {booking.room?.roomNumber || 'TBD'}</h4>
                                <Badge variant="outline" className="text-xs">
                                  Floor {booking.room?.floor || 'N/A'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {booking.hostel.hostelName} - {booking.room?.type || 'Standard'}
                              </p>
                              {booking.room?.pricePerNight && (
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <span>PKR {booking.room.pricePerNight}/night</span>
                                  <span>PKR {booking.room.pricePerMonth}/month</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={getStatusColor(booking.status)} className="text-sm">
                                {booking.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Booking #{booking.id.slice(-8)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                            <div className="space-y-1">
                              <span className="font-medium text-muted-foreground">Check-in Date</span>
                              <p className="font-medium">{format(new Date(booking.checkin), 'MMM dd, yyyy')}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(booking.checkin), 'EEEE')}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="font-medium text-muted-foreground">Check-out Date</span>
                              <p className="font-medium">{format(new Date(booking.checkout), 'MMM dd, yyyy')}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(booking.checkout), 'EEEE')}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="font-medium text-muted-foreground">Total Price</span>
                              <p className="font-medium text-lg">PKR {booking.price?.toLocaleString() || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">
                                {booking.room?.pricePerNight && booking.price ? 
                                  `${Math.ceil(booking.price / booking.room.pricePerNight)} nights` : 
                                  'Duration unknown'
                                }
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="font-medium text-muted-foreground">Booking Type</span>
                              <p className="font-medium capitalize">{booking.bookingType || 'Standard'}</p>
                              <p className="text-xs text-muted-foreground">
                                Created {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>

                          {booking.notes && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <span className="font-medium text-sm text-muted-foreground">Notes:</span>
                              <p className="text-sm mt-1">{booking.notes}</p>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
                            <span>Booking ID: {booking.id}</span>
                            <span>Last updated: {format(new Date(booking.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment History ({userRecords.payments.length})
                  </CardTitle>
                  <CardDescription>
                    All payments made by this user with detailed information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userRecords.payments.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No payments found</p>
                      <p className="text-sm text-muted-foreground mt-2">This user hasn't made any payments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userRecords.payments.map((payment) => (
                        <div key={payment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-lg">Payment #{payment.id.slice(-8)}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {payment.method}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {payment.description || 'Payment for booking'}
                              </p>
                              {payment.booking && (
                                <p className="text-xs text-muted-foreground">
                                  Room {payment.booking.room?.roomNumber || 'TBD'} • 
                                  {payment.booking.checkin && payment.booking.checkout && (
                                    <> {format(new Date(payment.booking.checkin), 'MMM dd')} - {format(new Date(payment.booking.checkout), 'MMM dd, yyyy')}</>
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={getStatusColor(payment.status)} className="text-sm">
                                {payment.status}
                              </Badge>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">
                                  PKR {payment.amount?.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">Total Amount</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-3">
                            <div className="space-y-1">
                              <span className="font-medium text-muted-foreground">Payment Method</span>
                              <p className="font-medium capitalize flex items-center gap-2">
                                {payment.method === 'Credit Card' && <CreditCard className="h-4 w-4" />}
                                {payment.method === 'UPI' && <DollarSign className="h-4 w-4" />}
                                {payment.method === 'Bank Transfer' && <Building className="h-4 w-4" />}
                                {payment.method}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {payment.method === 'Credit Card' ? 'Card payment' : 
                                 payment.method === 'UPI' ? 'UPI transfer' : 
                                 payment.method === 'Bank Transfer' ? 'Bank transfer' : 'Other method'}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="font-medium text-muted-foreground">Payment Date</span>
                              <p className="font-medium">{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(payment.createdAt), 'EEEE, HH:mm')}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="font-medium text-muted-foreground">Transaction Status</span>
                              <div className="flex items-center gap-2">
                                {payment.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                {payment.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                                {payment.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                                <p className="font-medium capitalize">{payment.status}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {payment.status === 'completed' ? 'Successfully processed' :
                                 payment.status === 'pending' ? 'Awaiting confirmation' :
                                 payment.status === 'failed' ? 'Transaction failed' : 'Unknown status'}
                              </p>
                            </div>
                          </div>

                          {/* Additional Payment Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                            <div className="space-y-1">
                              <span className="font-medium text-muted-foreground">Payment Description</span>
                              <p className="text-sm">{payment.description || 'No description provided'}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="font-medium text-muted-foreground">Receipt</span>
                              <div className="flex items-center gap-2">
                                {payment.receiptUrl ? (
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-green-600" />
                                    <a 
                                      href={payment.receiptUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm"
                                    >
                                      View Receipt
                                    </a>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground text-sm">No receipt uploaded</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Booking Details if available */}
                          {payment.booking && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <span className="font-medium text-sm text-muted-foreground mb-2 block">Related Booking:</span>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-muted-foreground">Room:</span>
                                  <p>Room {payment.booking.room?.roomNumber || 'TBD'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">Check-in:</span>
                                  <p>{payment.booking.checkin ? format(new Date(payment.booking.checkin), 'MMM dd, yyyy') : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">Check-out:</span>
                                  <p>{payment.booking.checkout ? format(new Date(payment.booking.checkout), 'MMM dd, yyyy') : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">Booking ID:</span>
                                  <p className="font-mono text-xs">{payment.bookingId}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
                            <span>Payment ID: {payment.id}</span>
                            <span>Last updated: {format(new Date(payment.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Requests</CardTitle>
                  <CardDescription>
                    All maintenance requests submitted by this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userRecords.maintenances.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No maintenance requests found</p>
                  ) : (
                    <div className="space-y-4">
                      {userRecords.maintenances.map((maintenance) => (
                        <div key={maintenance.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{maintenance.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Room {maintenance.room?.roomNumber || 'N/A'} - Floor {maintenance.room?.floor || 'N/A'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={getStatusColor(maintenance.status)}>
                                {maintenance.status}
                              </Badge>
                              <Badge variant={getPriorityColor(maintenance.priority)}>
                                {maintenance.priority}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{maintenance.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Created:</span>
                              <p>{format(new Date(maintenance.createdAt), 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                              <span className="font-medium">Assigned To:</span>
                              <p>{maintenance.assignee?.name || 'Unassigned'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Updated:</span>
                              <p>{format(new Date(maintenance.updatedAt), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          {maintenance.notes && (
                            <div className="mt-2">
                              <span className="font-medium text-sm">Notes:</span>
                              <p className="text-sm text-muted-foreground">{maintenance.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest activities across all categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!userRecords.recentActivity || userRecords.recentActivity.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No recent activity found</p>
                  ) : (
                    <div className="space-y-4">
                      {userRecords.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            {activity.type === 'booking' && <Bed className="h-5 w-5 text-blue-600" />}
                            {activity.type === 'payment' && <CreditCard className="h-5 w-5 text-green-600" />}
                            {activity.type === 'maintenance' && <Wrench className="h-5 w-5 text-orange-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{activity.title}</h4>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant={getStatusColor(activity.status)}>
                                  {activity.status}
                                </Badge>
                                {activity.priority && (
                                  <Badge variant={getPriorityColor(activity.priority)}>
                                    {activity.priority}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(activity.date), 'MMM dd, yyyy HH:mm')}
                              </span>
                              {activity.amount && (
                                <span className="text-sm font-medium">
                                  PKR {activity.amount.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
