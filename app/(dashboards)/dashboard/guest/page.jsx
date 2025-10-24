"use client"
import React, { useState, useEffect, useContext } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, User, Calendar, TrendingUp, BookIcon, Bed, RefreshCcw, Download, CreditCard, Wrench, AlertCircle, CheckCircle, Clock, DollarSign, Home, Settings, FileText, Bell, MapPin, Star, Activity, BarChart3, PieChart, TrendingDown, Eye, MessageSquare, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton";
import { useBookings } from "@/hooks/useBookings";
import { usePayments } from "@/hooks/usePayments";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useDashboard } from "@/hooks/useDashboard";
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
  const [complaints, setComplaints] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Get current user session
  const { session } = useContext(SessionContext);
  const currentUserId = session?.user?.id;

  // API hooks
  const { bookings, loading: bookingsLoading, fetchBookings } = useBookings();
  const { payments, loading: paymentsLoading, fetchPayments } = usePayments();
  const { maintenanceRequests, loading: maintenanceLoading, fetchMaintenance } = useMaintenance();
  const { dashboardStats, loading: statsLoading, fetchDashboardStats } = useDashboard();

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBookings(),
          fetchPayments(),
          fetchMaintenance(),
          fetchDashboardStats()
        ]);

        // Fetch additional data
        try {
          // Fetch complaints
          const complaintsResponse = await fetch('/api/complaints');
          if (complaintsResponse.ok) {
            const complaintsData = await complaintsResponse.json();
            setComplaints(complaintsData);
          }

          // Fetch hostels
          const hostelsResponse = await fetch('/api/hostel/gethostels');
          if (hostelsResponse.ok) {
            const hostelsData = await hostelsResponse.json();
            setHostels(hostelsData);
          }

          // Fetch rooms
          const roomsResponse = await fetch('/api/room/getallrooms');
          if (roomsResponse.ok) {
            const roomsData = await roomsResponse.json();
            setRooms(roomsData);
          }
        } catch (error) {
          console.error('Error fetching additional data:', error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [refreshKey]);

  // Refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Filter data for current user
  const userBookings = bookings?.filter(booking => booking.userId === currentUserId) || [];
  const userPayments = payments?.filter(payment =>
    payment.user?.id === currentUserId || payment.booking?.user?.id === currentUserId
  ) || [];
  const userMaintenanceRequests = maintenanceRequests?.filter(req => req.reportedBy === currentUserId) || [];
  const userComplaints = complaints?.filter(complaint => complaint.reportedBy === currentUserId) || [];

  // Calculate stats from user-specific data
  const totalBookings = userBookings?.length || 0;
  const activeBookings = userBookings?.filter(booking =>
    getBookingStatus(booking.checkIn, booking.checkOut) === 'Active'
  ).length || 0;
  const upcomingBookings = userBookings?.filter(booking =>
    getBookingStatus(booking.checkIn, booking.checkOut) === 'Upcoming'
  ).length || 0;
  const totalSpent = userPayments?.reduce((sum, payment) =>
    payment.status === 'Completed' ? sum + payment.amount : sum, 0
  ) || 0;

  // Additional stats (user-specific)
  const totalMaintenanceRequests = userMaintenanceRequests?.length || 0;
  const pendingMaintenance = userMaintenanceRequests?.filter(req => req.status === 'Pending').length || 0;
  const totalComplaints = userComplaints?.length || 0;
  const pendingComplaints = userComplaints?.filter(complaint => complaint.status === 'PENDING').length || 0;
  const availableRooms = rooms?.filter(room => room.status === 'AVAILABLE').length || 0;
  const totalHostels = hostels?.length || 0;

  // Get recent data (last 5 items) - user-specific
  const recentBookings = userBookings?.slice(0, 5) || [];
  const recentPayments = userPayments?.slice(0, 5) || [];
  const recentMaintenance = userMaintenanceRequests?.slice(0, 5) || [];
  const recentComplaints = userComplaints?.slice(0, 5) || [];

  // Stats cards data
  const guestStats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: <BookIcon className="h-4 w-4 text-muted-foreground" />,
      description: "All your bookings",
      trend: totalBookings > 0 ? "+" : "0",
      color: "text-blue-600"
    },
    {
      title: "Active Stay",
      value: activeBookings,
      icon: <Bed className="h-4 w-4 text-muted-foreground" />,
      description: "Currently checked in",
      trend: activeBookings > 0 ? "+" : "0",
      color: "text-green-600"
    },
    {
      title: "Upcoming Bookings",
      value: upcomingBookings,
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      description: "Future stays",
      trend: upcomingBookings > 0 ? "+" : "0",
      color: "text-blue-600"
    },
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent),
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      description: "Total amount paid",
      trend: totalSpent > 0 ? "+" : "0",
      color: "text-green-600"
    },
  ];

  // Additional stats for expanded dashboard
  const additionalStats = [
    {
      title: "Maintenance Requests",
      value: totalMaintenanceRequests,
      icon: <Wrench className="h-4 w-4 text-muted-foreground" />,
      description: "Total requests",
      pending: pendingMaintenance,
      color: "text-orange-600"
    },
    {
      title: "Complaints",
      value: totalComplaints,
      icon: <MessageSquare className="h-4 w-4 text-muted-foreground" />,
      description: "Total complaints",
      pending: pendingComplaints,
      color: "text-red-600"
    },
    {
      title: "Available Rooms",
      value: availableRooms,
      icon: <Home className="h-4 w-4 text-muted-foreground" />,
      description: "Rooms available",
      color: "text-green-600"
    },
    {
      title: "Total Hostels",
      value: totalHostels,
      icon: <MapPin className="h-4 w-4 text-muted-foreground" />,
      description: "Hostels in system",
      color: "text-purple-600"
    },
  ];

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <PageLoadingSkeleton
        title={true}
        statsCards={4}
        filterTabs={0}
        searchBar={false}
        contentCards={4}
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
          <Button className="flex items-center gap-1">
            <Download className="w-4 h-4" /> Download Summary
          </Button>
        </div>
      </div>

      {/* Debug Panel */}
      <Card className="bg-blue-50 border-blue-200 mb-4">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Dashboard Debug Information</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Current User ID: {currentUserId || 'Not logged in'}</p>
            <p>Raw bookings from API: {bookings?.length || 0}</p>
            <p>User bookings (filtered): {userBookings?.length || 0}</p>
            <p>Raw payments from API: {payments?.length || 0}</p>
            <p>User payments (filtered): {userPayments?.length || 0}</p>
            <p>Raw maintenance from API: {maintenanceRequests?.length || 0}</p>
            <p>User maintenance (filtered): {userMaintenanceRequests?.length || 0}</p>
            <p>Raw complaints from API: {complaints?.length || 0}</p>
            <p>User complaints (filtered): {userComplaints?.length || 0}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {guestStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && (
                  <Badge variant="outline" className={`text-xs ${stat.color}`}>
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {additionalStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.pending !== undefined && stat.pending > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {stat.pending} pending
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
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

      {/* Main Sections: Bookings, Payments, Maintenance */}
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
                  const status = getBookingStatus(booking.checkIn, booking.checkOut);
                  return (
                    <div
                      key={booking.id}
                      className="flex justify-between items-center border-b pb-2 last:border-b-0"
                    >
                      <div>
                        <span className="font-medium">Room {booking.roomNumber}</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${status === "Active" ? "bg-green-100 text-green-800" :
                          status === "Upcoming" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                          {status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {status === "Active" && (
                          <>
                            Checked in: {formatDate(booking.checkIn)}
                            <span className="ml-2">| Out: {formatDate(booking.checkOut)}</span>
                          </>
                        )}
                        {status === "Upcoming" && (
                          <>
                            Upcoming: {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </>
                        )}
                        {status === "Completed" && (
                          <>
                            Past: {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </>
                        )}
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
                      <span className="font-medium">{formatCurrency(payment.amount)}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {payment.method}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(payment.date)}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${payment.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {payment.status}
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
                      <span className="font-medium">{req.title}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        Room {req.roomNumber}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(req.createdAt)}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${req.status === "Resolved"
                          ? "bg-green-100 text-green-800"
                          : req.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {req.status}
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

      {/* Notifications and Alerts */}
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

            {userMaintenanceRequests.filter(req => req.status === 'Pending').length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Pending Maintenance</p>
                  <p className="text-sm text-yellow-700">You have {userMaintenanceRequests.filter(req => req.status === 'Pending').length} pending maintenance request{userMaintenanceRequests.filter(req => req.status === 'Pending').length > 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {userPayments.filter(payment => payment.status === 'Pending').length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Pending Payments</p>
                  <p className="text-sm text-orange-700">You have {userPayments.filter(payment => payment.status === 'Pending').length} pending payment{userPayments.filter(payment => payment.status === 'Pending').length > 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {upcomingBookings === 0 && activeBookings === 0 && userMaintenanceRequests.filter(req => req.status === 'Pending').length === 0 && userPayments.filter(payment => payment.status === 'Pending').length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications at this time</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              Booking Analytics
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your booking patterns and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Booking Success Rate</span>
                <span className="text-sm font-bold text-green-600">95%</span>
              </div>
              <Progress value={95} className="h-2" />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Stay Duration</span>
                <span className="text-sm font-bold">7 days</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Preferred Room Type</span>
                <span className="text-sm font-bold">Single Room</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Nights Booked</span>
                <span className="text-sm font-bold">{totalBookings * 7}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-muted-foreground" />
              Payment Analytics
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your payment history and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Success Rate</span>
                <span className="text-sm font-bold text-green-600">98%</span>
              </div>
              <Progress value={98} className="h-2" />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Payment</span>
                <span className="text-sm font-bold">{formatCurrency(totalSpent / Math.max(totalBookings, 1))}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Preferred Payment Method</span>
                <span className="text-sm font-bold">Credit Card</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">On-time Payments</span>
                <span className="text-sm font-bold text-green-600">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Recent Activity Timeline
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Your recent activities and interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.length > 0 && recentBookings.map((booking, index) => (
              <div key={booking.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New booking created</p>
                  <p className="text-xs text-muted-foreground">Room {booking.roomNumber} • {formatDate(booking.checkIn)}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getBookingStatus(booking.checkIn, booking.checkOut)}
                </Badge>
              </div>
            ))}

            {recentPayments.length > 0 && recentPayments.slice(0, 3).map((payment, index) => (
              <div key={payment.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment {payment.status.toLowerCase()}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(payment.amount)} • {formatDate(payment.date)}</p>
                </div>
                <Badge variant={payment.status === 'Completed' ? 'default' : 'secondary'} className="text-xs">
                  {payment.status}
                </Badge>
              </div>
            ))}

            {recentMaintenance.length > 0 && recentMaintenance.slice(0, 2).map((request, index) => (
              <div key={request.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Maintenance request submitted</p>
                  <p className="text-xs text-muted-foreground">{request.title} • {formatDate(request.createdAt)}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {request.status}
                </Badge>
              </div>
            ))}

            {recentComplaints.length > 0 && recentComplaints.slice(0, 2).map((complaint, index) => (
              <div key={complaint.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Complaint submitted</p>
                  <p className="text-xs text-muted-foreground">{complaint.title} • {formatDate(complaint.createdAt)}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {complaint.status}
                </Badge>
              </div>
            ))}

            {recentBookings.length === 0 && recentPayments.length === 0 && recentMaintenance.length === 0 && recentComplaints.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status and Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              Account Health
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your account status and security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Verified</span>
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Phone Verified</span>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Login</span>
                <span className="text-sm text-muted-foreground">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              Quick Stats
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-sm text-muted-foreground">6 months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Loyalty Points</span>
                <span className="text-sm font-bold text-blue-600">1,250</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Preferred Hostel</span>
                <span className="text-sm text-muted-foreground">Downtown Hostel</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Satisfaction Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold">4.8/5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;