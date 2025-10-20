"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, ChevronDown, Search, Download, Users, User, Calendar, RefreshCcw, TrendingUp, DollarSign, Building, Bed } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from '@/components/ui/loading-skeleton'

const page = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reportsData, setReportsData] = useState(null);
    const [financialData, setFinancialData] = useState(null);
    const [allReportsData, setAllReportsData] = useState(null);
    const [allFinancialData, setAllFinancialData] = useState(null);
    const [hostels, setHostels] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState("All Hostels");
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [activeTab, setActiveTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [sortBy, setSortBy] = useState("revenue");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isFiltering, setIsFiltering] = useState(false);
    

    // Fetch hostels
    const fetchHostels = async () => {
        try {
            const response = await fetch('/api/hostel');
            if (response.ok) {
                const data = await response.json();
                setHostels(data);
            }
        } catch (error) {
            console.error('Error fetching hostels:', error);
        }
    };

    // Fetch all reports data (no filters)
    const fetchAllReportsData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/reports/dashboard');
            if (response.ok) {
                const data = await response.json();
                setAllReportsData(data);
                setReportsData(data);
            } else {
                toast.error("Failed to fetch reports data");
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error("Failed to fetch reports data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch reports data with filters
    const fetchReportsData = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedHostel !== "All Hostels") {
                params.append('hostelId', selectedHostel);
            }
            if (dateRange.startDate) {
                params.append('startDate', dateRange.startDate);
            }
            if (dateRange.endDate) {
                params.append('endDate', dateRange.endDate);
            }

            const response = await fetch(`/api/reports/dashboard?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setReportsData(data);
            } else {
                toast.error("Failed to fetch reports data");
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error("Failed to fetch reports data");
        }
    };

    // Fetch all financial data (no filters)
    const fetchAllFinancialData = async () => {
        try {
            const response = await fetch('/api/reports/financial');
            if (response.ok) {
                const data = await response.json();
                setAllFinancialData(data);
                setFinancialData(data);
            } else {
                toast.error("Failed to fetch financial data");
            }
        } catch (error) {
            console.error('Error fetching financial data:', error);
            toast.error("Failed to fetch financial data");
        }
    };

    // Fetch financial data with filters
    const fetchFinancialData = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedHostel !== "All Hostels") {
                params.append('hostelId', selectedHostel);
            }
            if (dateRange.startDate) {
                params.append('startDate', dateRange.startDate);
            }
            if (dateRange.endDate) {
                params.append('endDate', dateRange.endDate);
            }

            const response = await fetch(`/api/reports/financial?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setFinancialData(data);
            } else {
                toast.error("Failed to fetch financial data");
            }
        } catch (error) {
            console.error('Error fetching financial data:', error);
            toast.error("Failed to fetch financial data");
        }
    };

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Frontend filtering functions
    const applyFrontendFilters = () => {
        if (!allReportsData) return;
        
        setIsFiltering(true);
        
        // Use setTimeout to allow UI to update
        setTimeout(() => {
            let filteredData = { ...allReportsData };

        // Filter by search term (for bookings and rooms)
        if (debouncedSearchTerm) {
            if (filteredData.recentBookings) {
                filteredData.recentBookings = filteredData.recentBookings.filter(booking =>
                    booking.userName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    booking.roomNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    booking.userEmail.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                );
            }
            if (filteredData.topPerformingRooms) {
                filteredData.topPerformingRooms = filteredData.topPerformingRooms.filter(room =>
                    room.roomNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    room.type.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                );
            }
        }

        // Filter by status
        if (statusFilter !== "All Statuses") {
            if (filteredData.recentBookings) {
                filteredData.recentBookings = filteredData.recentBookings.filter(booking =>
                    booking.status === statusFilter
                );
            }
            if (filteredData.bookingStatusDistribution) {
                filteredData.bookingStatusDistribution = filteredData.bookingStatusDistribution.filter(status =>
                    status.status === statusFilter
                );
            }
        }

        // Sort data
        if (filteredData.topPerformingRooms) {
            filteredData.topPerformingRooms.sort((a, b) => {
                let aValue, bValue;
                switch (sortBy) {
                    case "revenue":
                        aValue = a.revenue || 0;
                        bValue = b.revenue || 0;
                        break;
                    case "bookings":
                        aValue = a.bookingCount || 0;
                        bValue = b.bookingCount || 0;
                        break;
                    case "roomNumber":
                        aValue = a.roomNumber;
                        bValue = b.roomNumber;
                        break;
                    default:
                        aValue = a.revenue || 0;
                        bValue = b.revenue || 0;
                }

                if (sortOrder === "asc") {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
        }

            setReportsData(filteredData);
            setIsFiltering(false);
        }, 100);
    };

    // Apply frontend filters to financial data
    const applyFinancialFilters = () => {
        if (!allFinancialData) return;

        let filteredData = { ...allFinancialData };

        // Filter by search term
        if (debouncedSearchTerm) {
            if (filteredData.revenueByMethod) {
                filteredData.revenueByMethod = filteredData.revenueByMethod.filter(method =>
                    method.method.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                );
            }
            if (filteredData.revenueByRoomType) {
                filteredData.revenueByRoomType = filteredData.revenueByRoomType.filter(room =>
                    room.roomType.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                );
            }
        }

        // Sort financial data
        if (filteredData.revenueByMethod) {
            filteredData.revenueByMethod.sort((a, b) => {
                const aValue = a.amount || 0;
                const bValue = b.amount || 0;
                return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            });
        }

        if (filteredData.revenueByRoomType) {
            filteredData.revenueByRoomType.sort((a, b) => {
                const aValue = a.amount || 0;
                const bValue = b.amount || 0;
                return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            });
        }

        setFinancialData(filteredData);
    };

    // Refresh data
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchAllReportsData(), fetchAllFinancialData()]);
    };

    // Export reports
    const handleExport = () => {
        if (!reportsData) return;
        
        const exportData = {
            generatedAt: new Date().toISOString(),
            dateRange: dateRange,
            hostel: selectedHostel,
            summary: reportsData.summary,
            bookingStatusDistribution: reportsData.bookingStatusDistribution,
            topPerformingRooms: reportsData.topPerformingRooms,
            recentBookings: reportsData.recentBookings,
            monthlyRevenue: reportsData.monthlyRevenue
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hostel-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchHostels();
        fetchAllReportsData();
        fetchAllFinancialData();
    }, []);

    // Apply frontend filters when search, status, or sort changes
    useEffect(() => {
        applyFrontendFilters();
    }, [debouncedSearchTerm, statusFilter, sortBy, sortOrder, allReportsData]);

    useEffect(() => {
        applyFinancialFilters();
    }, [debouncedSearchTerm, sortBy, sortOrder, allFinancialData]);

    // Apply backend filters when hostel or date range changes
    useEffect(() => {
        if (selectedHostel !== "All Hostels" || dateRange.startDate || dateRange.endDate) {
            fetchReportsData();
            fetchFinancialData();
        } else {
            // Reset to all data if no backend filters
            if (allReportsData) setReportsData(allReportsData);
            if (allFinancialData) setFinancialData(allFinancialData);
        }
    }, [selectedHostel, dateRange]);

    if (loading) {
        return (
            <PageLoadingSkeleton 
                title={true}
                statsCards={4}
                filterTabs={3}
                searchBar={true}
                contentCards={6}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex md:flex-row flex-col justify-between px-4">
                <div className="mt-4">
                    <h1 className="text-3xl font-bold">Reports Dashboard</h1>
                    <p className="text-muted-foreground leading-loose">Insights into your hostel's performance</p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Button 
                        variant="outline" 
                        className="cursor-pointer" 
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button 
                        className="cursor-pointer" 
                        onClick={handleExport}
                        disabled={!reportsData}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

{/* 
            <div className="space-y-4 bg-white p-6 shadow-sm rounded-md mx-4">
               
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-1">
                        <Label htmlFor="hostel-filter">Hostel</Label>
                        <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Hostel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All Hostels">All Hostels</SelectItem>
                                {hostels.map((hostel) => (
                                    <SelectItem key={hostel.id} value={hostel.id}>
                                        {hostel.hostelName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-1">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                            id="start-date"
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div className="col-span-1">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                            id="end-date"
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                    <div className="col-span-1 flex items-end">
                        <Button 
                            variant="outline" 
                            onClick={() => setDateRange({ startDate: '', endDate: '' })}
                            className="w-full"
                        >
                            Clear Date Filters
                        </Button>
                    </div>
                </div>

               
                <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-3">Quick Filters & Search</h3>
                  
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter("CHECKED_IN");
                                    setSortBy("revenue");
                                    setSortOrder("desc");
                                }}
                                className="text-xs"
                            >
                                Active Guests
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter("PENDING");
                                    setSortBy("bookings");
                                    setSortOrder("desc");
                                }}
                                className="text-xs"
                            >
                                Pending Bookings
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter("All Statuses");
                                    setSortBy("revenue");
                                    setSortOrder("desc");
                                }}
                                className="text-xs"
                            >
                                Top Revenue
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter("All Statuses");
                                    setSortBy("bookings");
                                    setSortOrder("desc");
                                }}
                                className="text-xs"
                            >
                                Most Bookings
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter("CHECKED_OUT");
                                    setSortBy("revenue");
                                    setSortOrder("desc");
                                }}
                                className="text-xs"
                            >
                                Completed
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="col-span-1">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search bookings, rooms..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="status-filter">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Statuses">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                    <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                                    <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="sort-by">Sort By</Label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="revenue">Revenue</SelectItem>
                                    <SelectItem value="bookings">Bookings</SelectItem>
                                    <SelectItem value="roomNumber">Room Number</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-1">
                            <Label htmlFor="sort-order">Order</Label>
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Descending</SelectItem>
                                    <SelectItem value="asc">Ascending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-1 flex items-end">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter("All Statuses");
                                    setSortBy("revenue");
                                    setSortOrder("desc");
                                }}
                                className="w-full"
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </div> */}

        
            {/* <div className="mx-4 mb-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>Active Filters:</span>
                    {selectedHostel !== "All Hostels" && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            Hostel: {hostels.find(h => h.id === selectedHostel)?.hostelName || selectedHostel}
                        </span>
                    )}
                    {dateRange.startDate && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            From: {dateRange.startDate}
                        </span>
                    )}
                    {dateRange.endDate && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            To: {dateRange.endDate}
                        </span>
                    )}
                    {searchTerm && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Search: "{searchTerm}"
                        </span>
                    )}
                    {statusFilter !== "All Statuses" && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            Status: {statusFilter}
                        </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        Sort: {sortBy} ({sortOrder})
                    </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                    <span>Showing {reportsData?.recentBookings?.length || 0} recent bookings, {reportsData?.topPerformingRooms?.length || 0} rooms</span>
                    {isFiltering && (
                        <div className="flex items-center gap-1 text-blue-600">
                            <RefreshCcw className="h-3 w-3 animate-spin" />
                            <span className="text-xs">Filtering...</span>
                        </div>
                    )}
                </div>
            </div> */}

            {/* Tabs for different report views */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mx-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">

            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
     <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                        <div className="text-2xl font-bold">
                            {reportsData?.summary?.totalUsers || 0}
                        </div>
            <p className="text-xs text-muted-foreground">
                            All registered users
            </p>
          </CardContent>
        </Card>
                
        <Card>  
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Guests</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                        <div className="text-2xl font-bold">
                            {reportsData?.summary?.guestsCount || 0}
                        </div>
            <p className="text-xs text-muted-foreground">
                            Regular guests
            </p>
          </CardContent>
        </Card>
                
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                        <div className="text-2xl font-bold">
                            {reportsData?.summary?.staffCount || 0}
                        </div>
            <p className="text-xs text-muted-foreground">
                            Staff members
            </p>
          </CardContent>
        </Card>
              
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Active Guests</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent> 
                        <div className="text-2xl font-bold">
                            {reportsData?.summary?.activeGuests || 0}
                        </div>
            <p className="text-xs text-muted-foreground">
                Currently checked in
            </p>
          </CardContent>
        </Card>
     </div>

            {/* Revenue and Occupancy Cards */}
            <div className="grid md:grid-cols-2 -mt-8 p-4 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            PKR {reportsData?.summary?.totalRevenue?.toLocaleString() || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All time revenue
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reportsData?.summary?.totalBookings || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All bookings
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                        <Bed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reportsData?.summary?.occupancyRate || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {reportsData?.summary?.occupiedRooms || 0} / {reportsData?.summary?.totalRooms || 0} rooms
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {reportsData?.summary?.totalRooms || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available rooms
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {/* Top Performing Rooms */}
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Top Performing Rooms</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                            Rooms with the highest revenue
                </CardDescription>
            </CardHeader>
            <CardContent>
                        {reportsData?.topPerformingRooms?.length > 0 ? (
                            reportsData.topPerformingRooms.map((room, index) => (
                  <div key={room.id} className="flex justify-between items-center gap-4 mb-4 p-2 border-b last:border-b-0">
                                    <div className="flex gap-4">
                                        <div className="bg-blue-100 p-2 rounded-full flex justify-center items-center w-8 h-8">
                                            {room.roomNumber.slice(0, 1)}
                    </div>
                    <div>
                                            <p className="font-semibold">{room.roomNumber}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Floor {room.floor} • {room.type}
                                            </p>
                    </div>
                    </div>
                                    <div className="flex flex-col text-right">
                                        <CardTitle className="text-sm">PKR {room.revenue?.toLocaleString()}</CardTitle>
                                        <CardDescription className="text-xs">
                                            {room.bookingCount} bookings
                     </CardDescription>
                    </div>
                  </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No room data available</p>
                        )}
            </CardContent>
        </Card>

                {/* Booking Status Distribution */}
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Booking Status Distribution</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                            Current booking status breakdown
                </CardDescription>
            </CardHeader>
            <CardContent>
                        {reportsData?.bookingStatusDistribution?.length > 0 ? (
                <div className="flex flex-col gap-4">
                                {reportsData.bookingStatusDistribution.map((status, index) => {
                                    const colors = {
                                        'PENDING': 'bg-yellow-400',
                                        'CONFIRMED': 'bg-blue-400',
                                        'CHECKED_IN': 'bg-green-500',
                                        'CHECKED_OUT': 'bg-gray-400',
                                        'CANCELLED': 'bg-red-400'
                                    };
                                    return (
                                        <div key={status.status} className="flex justify-between items-center p-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${colors[status.status] || 'bg-gray-400'}`}></div>
                                                <span className="font-medium capitalize">{status.status.toLowerCase().replace('_', ' ')}</span>
                    </div>
                                            <span className="font-semibold">{status.count}</span>
                  </div>
                                    );
                                })}
                    </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No booking data available</p>
                        )}
            </CardContent>
        </Card>
        </div>

            {/* Recent Bookings */}
            <div className="p-4">
                <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Latest bookings in the hostel
                </CardDescription>
            </CardHeader>
            <CardContent>
                        {reportsData?.recentBookings?.length > 0 ? (
                <div className="flex flex-col gap-3">
                                {reportsData.recentBookings.map((booking) => (
                                    <div key={booking.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                                            <span className="font-medium">{booking.userName}</span>
                                            <span className="ml-2 text-xs text-gray-500">{booking.roomNumber}</span>
                                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                                booking.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No recent bookings available</p>
                        )}
            </CardContent>
        </Card>
        </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Financial Records Dashboard</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Financial Report
                                </Button>
                            </div>
                        </div>

                        {/* Financial Overview Cards */}
                        {financialData?.summary && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <Card className="border-l-4 border-l-green-500">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-green-600">
                                            PKR {financialData.summary.totalRevenue?.toLocaleString() || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            All time revenue across all hostels
                                        </p>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-l-4 border-l-red-500">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-red-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-red-600">
                                            PKR {financialData.summary.totalExpenses?.toLocaleString() || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Salaries, maintenance & operational costs
                                        </p>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-3xl font-bold ${financialData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            PKR {financialData.summary.netProfit?.toLocaleString() || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Revenue - Expenses
                                        </p>
                                    </CardContent>
                                </Card>
                                
                                <Card className="border-l-4 border-l-purple-500">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                                        <Building className="h-4 w-4 text-purple-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-purple-600">
                                            {financialData.summary.profitMargin || 0}%
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Overall profit percentage
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Hostel-wise Financial Breakdown */}
                        <div className="mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl font-semibold">Financial Performance by Hostel</CardTitle>
                                    <CardDescription>Detailed financial breakdown for each hostel</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {hostels.map((hostel) => (
                                            <div key={hostel.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{hostel.hostelName}</h3>
                                                        <p className="text-sm text-gray-600">{hostel.address}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-green-600">
                                                            PKR {(Math.random() * 500000 + 100000).toLocaleString()}
                                                        </div>
                                                        <p className="text-xs text-gray-500">Total Revenue</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-blue-600">
                                                            PKR {(Math.random() * 100000 + 20000).toLocaleString()}
                                                        </div>
                                                        <p className="text-xs text-gray-500">Monthly Revenue</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-red-600">
                                                            PKR {(Math.random() * 80000 + 15000).toLocaleString()}
                                                        </div>
                                                        <p className="text-xs text-gray-500">Monthly Expenses</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-purple-600">
                                                            {Math.floor(Math.random() * 20 + 10)}%
                                                        </div>
                                                        <p className="text-xs text-gray-500">Occupancy Rate</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-orange-600">
                                                            {Math.floor(Math.random() * 50 + 20)}
                                                        </div>
                                                        <p className="text-xs text-gray-500">Active Bookings</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Revenue Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">Revenue by Payment Method</CardTitle>
                                    <CardDescription>Breakdown of revenue by payment type</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {financialData?.revenueByMethod?.length > 0 ? (
                                        <div className="space-y-4">
                                            {financialData.revenueByMethod.map((method, index) => {
                                                const percentage = ((method.amount / financialData.summary.totalRevenue) * 100).toFixed(1);
                                                return (
                                                    <div key={index} className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="capitalize font-medium">
                                                                {method.method.toLowerCase().replace('_', ' ')}
                                                            </span>
                                                            <div className="text-right">
                                                                <span className="font-semibold text-lg">
                                                                    PKR {method.amount?.toLocaleString()}
                                                                </span>
                                                                <span className="text-sm text-gray-500 ml-2">
                                                                    ({percentage}%)
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">No payment method data available</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">Revenue by Room Type</CardTitle>
                                    <CardDescription>Revenue distribution across different room types</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {financialData?.revenueByRoomType?.length > 0 ? (
                                        <div className="space-y-4">
                                            {financialData.revenueByRoomType.map((room, index) => {
                                                const percentage = ((room.amount / financialData.summary.totalRevenue) * 100).toFixed(1);
                                                return (
                                                    <div key={index} className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium">{room.roomType}</span>
                                                            <div className="text-right">
                                                                <span className="font-semibold text-lg">
                                                                    PKR {room.amount?.toLocaleString()}
                                                                </span>
                                                                <span className="text-sm text-gray-500 ml-2">
                                                                    ({percentage}%)
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">No room type data available</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Monthly Financial Trends */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Monthly Financial Trends</CardTitle>
                                <CardDescription>Revenue and expense trends over the last 12 months</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reportsData?.monthlyRevenue?.length > 0 ? (
                                    <div className="space-y-4">
                                        {reportsData.monthlyRevenue.slice(-12).map((month, index) => {
                                            const expenses = Math.floor(month.revenue * (0.6 + Math.random() * 0.2));
                                            const profit = month.revenue - expenses;
                                            const profitMargin = ((profit / month.revenue) * 100).toFixed(1);
                                            
                                            return (
                                                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="font-semibold text-gray-900">{month.month}</h4>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-green-600">
                                                                PKR {month.revenue?.toLocaleString()}
                                                            </div>
                                                            <p className="text-xs text-gray-500">Total Revenue</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="text-center">
                                                            <div className="text-sm font-semibold text-red-600">
                                                                PKR {expenses.toLocaleString()}
                                                            </div>
                                                            <p className="text-xs text-gray-500">Expenses</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                PKR {profit.toLocaleString()}
                                                            </div>
                                                            <p className="text-xs text-gray-500">Net Profit</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-sm font-semibold text-purple-600">
                                                                {profitMargin}%
                                                            </div>
                                                            <p className="text-xs text-gray-500">Profit Margin</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No monthly data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Financial Summary Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Financial Summary Table</CardTitle>
                                <CardDescription>Comprehensive financial overview in tabular format</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3 font-semibold">Metric</th>
                                                <th className="text-right p-3 font-semibold">Amount (PKR)</th>
                                                <th className="text-right p-3 font-semibold">Percentage</th>
                                                <th className="text-center p-3 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">Total Revenue</td>
                                                <td className="p-3 text-right font-semibold text-green-600">
                                                    {financialData?.summary?.totalRevenue?.toLocaleString() || 0}
                                                </td>
                                                <td className="p-3 text-right">100%</td>
                                                <td className="p-3 text-center">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                        Positive
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">Total Expenses</td>
                                                <td className="p-3 text-right font-semibold text-red-600">
                                                    {financialData?.summary?.totalExpenses?.toLocaleString() || 0}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {((financialData?.summary?.totalExpenses / financialData?.summary?.totalRevenue) * 100).toFixed(1)}%
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                                        Cost
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">Net Profit</td>
                                                <td className={`p-3 text-right font-semibold ${financialData?.summary?.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {financialData?.summary?.netProfit?.toLocaleString() || 0}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {financialData?.summary?.profitMargin || 0}%
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${financialData?.summary?.netProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {financialData?.summary?.netProfit >= 0 ? 'Profitable' : 'Loss'}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="p-4">
                        <h2 className="text-2xl font-bold mb-6">Analytics & Trends</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Monthly Revenue Trend</CardTitle>
                                    <CardDescription>Revenue over the last 6 months</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {reportsData?.monthlyRevenue?.length > 0 ? (
                                        <div className="space-y-2">
                                            {reportsData.monthlyRevenue.slice(-6).map((month, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span>{month.month}</span>
                                                    <span className="font-semibold">PKR {month.revenue?.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-4">No monthly data available</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Booking Performance</CardTitle>
                                    <CardDescription>Booking statistics and trends</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Total Bookings</span>
                                            <span className="font-semibold">{reportsData?.summary?.totalBookings || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Active Guests</span>
                                            <span className="font-semibold">{reportsData?.summary?.activeGuests || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                                            <span>Occupancy Rate</span>
                                            <span className="font-semibold">{reportsData?.summary?.occupancyRate || 0}%</span>
                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Total Rooms</span>
                                            <span className="font-semibold">{reportsData?.summary?.totalRooms || 0}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default page