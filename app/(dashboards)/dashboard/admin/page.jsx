"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Users, Calendar, TrendingUp, CheckCircle, AlertTriangle, Wrench, Clock, DollarSign, RefreshCw, Download, Eye, Plus, Settings, BarChart3, PieChart, Activity, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Chart as ChartJS } from "chart.js";
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton";
import { useState, useEffect } from "react";
import { useDashboardStats } from "@/hooks/useDashboard";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link";
import Chart from "@/components/chart"
export default function Home() {
  const {
    stats,
    recentActivities,
    topPerformingRooms,
    monthlyRevenueData,
    isLoading,
    error,
    refetch
  } = useDashboardStats();

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed!");
  };

  const handleGenerateReport = () => {
    window.location.href = '/dashboard/admin/reports';
  };

  const handleInitializeGoogleSheets = async () => {
    try {
      const response = await fetch('/api/google-sheets/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Google Sheets initialized successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to initialize Google Sheets');
      }
    } catch (error) {
      console.error('Error initializing Google Sheets:', error);
      toast.error('Failed to initialize Google Sheets');
    }
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <PageLoadingSkeleton
        title={true}
        statsCards={4}
        filterTabs={0}
        searchBar={false}
        contentCards={6}
      />
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error.message || "Unable to load dashboard data"}
          </p>
          <Button
            className="mt-4"
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Combine all recent activities
  const allRecentActivities = [
    ...recentActivities.bookings,
    ...recentActivities.payments,
    ...recentActivities.maintenance
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  // Get pending items count
  const pendingBookingsCount = stats?.pendingBookings || 0;
  const pendingMaintenanceCount = stats?.pendingMaintenanceRequests || 0;
  const pendingPaymentsCount = stats?.pendingPayments || 0;

  return (
    <div className="px-2">
      {/* Welcome Header */}
      <div className="flex md:flex-row flex-col justify-between px-4">
        <div className="mt-4">
          <h1 className="text-4xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground leading-loose">
            Here's what's happening at your hostel today.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Badge variant="secondary" className="flex items-center p-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            All Systems Operational
          </Badge>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleGenerateReport}>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRooms || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.availableRooms || 0} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Active Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalGuests || 0} total guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.occupancyRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.occupiedRooms || 0} occupied rooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              PKR {stats?.monthlyRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: PKR {stats?.totalRevenue?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.todayCheckIns || 0}</div>
            <p className="text-xs text-muted-foreground">
              Check-outs: {stats?.todayCheckOuts || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingPaymentsCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedPayments || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingMaintenanceCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedMaintenanceRequests || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              PKR {stats?.totalExpenseAmount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalExpenses || 0} total expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview and Recent Activities */}
      <div className="grid md:grid-cols-1 lg:grid-cols-7 gap-4 p-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Payment Approvals</CardTitle>
            <CardDescription>
              Latest payment requests requiring approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Payment Status Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg border">
                  <div className="text-2xl font-bold text-gray-900">{stats?.pendingPayments || 0}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border">
                  <div className="text-2xl font-bold text-gray-900">{stats?.completedPayments || 0}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border">
                  <div className="text-2xl font-bold text-gray-900">{stats?.totalPayments || 0}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>

              {/* Recent Payment Requests */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900">
                  Recent Payment Requests
                </h4>
                <div className="space-y-2">
                  {recentActivities.payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{payment?.user?.name || "undefined"}</div>
                          <div className="text-sm text-gray-500">{payment.message}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(payment.timestamp), 'MMM dd, HH:mm')}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{payment.status}</div>
                      </div>
                    </div>
                  ))}
                  {recentActivities.payments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent payment requests</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/admin/payment-approvals">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Review Payments
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/dashboard/admin/payments">
                    <DollarSign className="h-4 w-4 mr-2" />
                    View All Payments
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-col gap-4">
                {allRecentActivities.length > 0 ? (
                  allRecentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {activity.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.user?.name || 'Unknown User'} • {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          activity.type === 'booking' ? 'bg-green-50 text-green-700' :
                            activity.type === 'payment' ? 'bg-blue-50 text-blue-700' :
                              'bg-orange-50 text-orange-700'
                        }
                      >
                        {activity.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions and Pending Tasks */}
      <div className="grid gap-4 md:grid-cols-2 p-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/admin/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Bookings
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/admin/rooms">
                <Bed className="mr-2 h-4 w-4" />
                Manage Rooms
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/admin/payments">
                <DollarSign className="mr-2 h-4 w-4" />
                View Payments
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/admin/maintenance">
                <Wrench className="mr-2 h-4 w-4" />
                Maintenance
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/admin/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleInitializeGoogleSheets}
            >
              <FileText className="mr-2 h-4 w-4" />
              Setup Google Sheets
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>
              Items requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingBookingsCount > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Pending Bookings</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {pendingBookingsCount}
                  </Badge>
                </div>
              )}

              {pendingMaintenanceCount > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Maintenance Requests</span>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {pendingMaintenanceCount}
                  </Badge>
                </div>
              )}

              {pendingPaymentsCount > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Pending Payments</span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {pendingPaymentsCount}
                  </Badge>
                </div>
              )}

              {pendingBookingsCount === 0 && pendingMaintenanceCount === 0 && pendingPaymentsCount === 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">All caught up!</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>
              Key metrics for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Check-ins Today</p>
                  <p className="text-xs text-muted-foreground">New arrivals</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {stats?.todayCheckIns || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Check-outs Today</p>
                  <p className="text-xs text-muted-foreground">Departures</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {stats?.todayCheckOuts || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Revenue Today</p>
                  <p className="text-xs text-muted-foreground">From payments</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  PKR {stats?.monthlyRevenue?.toLocaleString() || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Occupancy Rate</p>
                  <p className="text-xs text-muted-foreground">Current status</p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    (stats?.occupancyRate || 0) > 80 ? 'bg-green-100 text-green-800' :
                      (stats?.occupancyRate || 0) > 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                  }
                >
                  {stats?.occupancyRate || 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}