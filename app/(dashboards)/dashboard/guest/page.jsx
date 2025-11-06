"use client";
import React, { useState, useEffect, useContext } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, User, Calendar, TrendingUp, BookIcon, Bed, RefreshCcw, CreditCard, Wrench, AlertCircle, CheckCircle, Clock, Home, Settings, Bell, MapPin, Star, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageLoadingSkeleton, LoadingSpinner } from "@/components/ui/loading-skeleton";
import { useBookings } from "@/hooks/useBookings";
import { usePayments } from "@/hooks/usePayments";
import { useMaintenance } from "@/hooks/useMaintenance";
import { SessionContext } from "@/app/context/sessiondata";

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get booking status
const getBookingStatus = (checkIn, checkOut) => {
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (now < checkInDate) return 'Upcoming';
  if (now >= checkInDate && now <= checkOutDate) return 'Active';
  return 'Completed';
};

const page = () => {
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get current user session
  const { session } = useContext(SessionContext);
  const currentUserId = session?.user?.id;

  // API hooks - React Query automatically fetches data
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useBookings({
    userId: currentUserId
  });
  const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments } = usePayments();
  const { data: maintenanceData, isLoading: maintenanceLoading, refetch: refetchMaintenance } = useMaintenance();

  // Refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchBookings();
    refetchPayments();
    refetchMaintenance();
  };

  // Extract data from React Query responses
  const bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData?.bookings || [];
  const payments = Array.isArray(paymentsData) ? paymentsData : paymentsData?.payments || [];
  const maintenanceRequests = Array.isArray(maintenanceData) ? maintenanceData : maintenanceData?.maintenance || [];

  // Filter data for current user
  const userBookings = bookings?.filter(booking => 
    booking.userId === currentUserId || 
    booking.user?.id === currentUserId ||
    booking.userId === session?.user?.id
  ) || [];
  
  const userPayments = payments?.filter(payment =>
    payment.userId === currentUserId ||
    payment.user?.id === currentUserId ||
    payment.userId === session?.user?.id ||
    payment.booking?.userId === currentUserId ||
    payment.booking?.user?.id === currentUserId
  ) || [];
  
  const userMaintenanceRequests = maintenanceRequests?.filter(req => 
    req.reportedBy === currentUserId ||
    req.userId === currentUserId ||
    req.user?.id === currentUserId ||
    req.userId === session?.user?.id
  ) || [];

  // Update loading state
  useEffect(() => {
    setLoading(bookingsLoading || paymentsLoading || maintenanceLoading);
  }, [bookingsLoading, paymentsLoading, maintenanceLoading]);

  // Calculate stats from user-specific data
  const totalBookings = userBookings?.length || 0;
  const activeBookings = userBookings?.filter(booking => {
    const checkIn = booking.checkIn || booking.checkInDate;
    const checkOut = booking.checkOut || booking.checkOutDate;
    return getBookingStatus(checkIn, checkOut) === 'Active';
  }).length || 0;
  const upcomingBookings = userBookings?.filter(booking => {
    const checkIn = booking.checkIn || booking.checkInDate;
    const checkOut = booking.checkOut || booking.checkOutDate;
    return getBookingStatus(checkIn, checkOut) === 'Upcoming';
  }).length || 0;
  const totalSpent = userPayments?.reduce((sum, payment) => {
    const isCompleted = payment.status === 'Completed' || payment.status === 'COMPLETED';
    const amount = payment.amount || payment.paymentAmount || 0;
    return isCompleted ? sum + amount : sum;
  }, 0) || 0;

  // Get recent data (last 3 items) - user-specific
  const recentBookings = userBookings?.slice(0, 3) || [];
  const recentPayments = userPayments?.slice(0, 3) || [];
  const recentMaintenance = userMaintenanceRequests?.slice(0, 3) || [];

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <PageLoadingSkeleton
        title={true}
        statsCards={4}
        filterTabs={0}
        searchBar={false}
        contentCards={3}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Welcome, Guest!</h1>
          <p className="text-muted-foreground leading-loose">
            Here's a quick overview of your hostel activity.
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">All your bookings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Active Stay</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">Currently checked in</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">Future stays</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">Total amount paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/dashboard/guest/rooms">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                <span className="text-xs">Browse Rooms</span>
              </Button>
            </Link>
            <Link href="/dashboard/guest/bookings">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <BookIcon className="w-5 h-5" />
                <span className="text-xs">My Bookings</span>
              </Button>
            </Link>
            <Link href="/dashboard/guest/payment">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Payments</span>
              </Button>
            </Link>
            <Link href="/dashboard/guest/maintenance">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Wrench className="w-5 h-5" />
                <span className="text-xs">Maintenance</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your latest hostel bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => {
                  const checkIn = booking.checkIn || booking.checkInDate;
                  const checkOut = booking.checkOut || booking.checkOutDate;
                  const status = getBookingStatus(checkIn, checkOut);
                  return (
                    <div
                      key={booking.id}
                      className="flex justify-between items-center border-b pb-2 last:border-b-0"
                    >
                      <div>
                        <span className="font-medium">
                          {booking.room?.roomNumber ? `Room ${booking.room.roomNumber}` : 
                           booking.roomNumber ? `Room ${booking.roomNumber}` : 
                           booking.roomId ? `Room ${booking.roomId}` : 'Room N/A'}
                        </span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${status === "Active" ? "bg-green-100 text-green-800" :
                          status === "Upcoming" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                          {status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(booking.checkIn || booking.checkInDate || booking.createdAt)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <BookIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No bookings found</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/dashboard/guest/bookings">
                <Button variant="outline" size="sm">
                  View All Bookings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              Recent Payments
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your latest payment activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center border-b pb-2 last:border-b-0"
                  >
                    <div>
                      <span className="font-medium">{formatCurrency(payment.amount || payment.paymentAmount || 0)}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {payment.method || payment.paymentMethod || 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(payment.date || payment.paymentDate || payment.createdAt || payment.paidAt)}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${payment.status === "Completed" || payment.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "Pending" || payment.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {payment.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No payments found</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/dashboard/guest/payment">
                <Button variant="outline" size="sm">
                  View All Payments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Maintenance Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-muted-foreground" />
              Maintenance Requests
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your recent maintenance requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentMaintenance.length > 0 ? (
                recentMaintenance.map((req) => (
                  <div
                    key={req.id}
                    className="flex justify-between items-center border-b pb-2 last:border-b-0"
                  >
                    <div>
                      <span className="font-medium">{req.title || 'Maintenance Request'}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {req.room?.roomNumber ? `Room ${req.room.roomNumber}` :
                         req.roomNumber ? `Room ${req.roomNumber}` :
                         req.roomId ? `Room ${req.roomId}` : 'General'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(req.createdAt || req.reportedAt || req.createdAt)}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${req.status === "Resolved" || req.status === "COMPLETED" || req.status === "RESOLVED"
                          ? "bg-green-100 text-green-800"
                          : req.status === "In Progress" || req.status === "IN_PROGRESS" || req.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : req.status === "PENDING" || req.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {req.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No maintenance requests</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/dashboard/guest/maintenance">
                <Button variant="outline" size="sm">
                  View All Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            Notifications & Alerts
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Important updates and reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingBookings > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Upcoming Bookings</p>
                  <p className="text-sm text-blue-700">You have {upcomingBookings} upcoming booking{upcomingBookings > 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {activeBookings > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Active Stay</p>
                  <p className="text-sm text-green-700">You are currently checked in</p>
                </div>
              </div>
            )}

            {userMaintenanceRequests.filter(req => 
              req.status === 'Pending' || 
              req.status === 'PENDING' || 
              req.status === 'SUBMITTED' ||
              req.status === 'UNDER_REVIEW'
            ).length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Pending Maintenance</p>
                  <p className="text-sm text-yellow-700">You have {userMaintenanceRequests.filter(req => 
                    req.status === 'Pending' || 
                    req.status === 'PENDING' || 
                    req.status === 'SUBMITTED' ||
                    req.status === 'UNDER_REVIEW'
                  ).length} pending maintenance request{userMaintenanceRequests.filter(req => 
                    req.status === 'Pending' || 
                    req.status === 'PENDING' || 
                    req.status === 'SUBMITTED' ||
                    req.status === 'UNDER_REVIEW'
                  ).length > 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {userPayments.filter(payment => 
              payment.status === 'Pending' || 
              payment.status === 'PENDING'
            ).length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Pending Payments</p>
                  <p className="text-sm text-orange-700">You have {userPayments.filter(payment => 
                    payment.status === 'Pending' || 
                    payment.status === 'PENDING'
                  ).length} pending payment{userPayments.filter(payment => 
                    payment.status === 'Pending' || 
                    payment.status === 'PENDING'
                  ).length > 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {upcomingBookings === 0 && activeBookings === 0 && userMaintenanceRequests.filter(req => 
              req.status === 'Pending' || 
              req.status === 'PENDING' || 
              req.status === 'SUBMITTED' ||
              req.status === 'UNDER_REVIEW'
            ).length === 0 && userPayments.filter(payment => 
              payment.status === 'Pending' || 
              payment.status === 'PENDING'
            ).length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications at this time</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;