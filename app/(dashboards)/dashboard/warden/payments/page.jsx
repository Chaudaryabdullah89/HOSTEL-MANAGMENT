"use client"
import React, { useState, useEffect } from 'react'
// import { Users,Calendar,TrendingUp, CheckCircle, AlertTriangle, Wrench} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { Plus, Filter, Users ,TrendingUp , ChevronDown, Search, Edit, Wifi, Tv, Wind, Delete, Bin, Trash, Clock, User, Bed, Calendar, CardSim, CreditCard, BookIcon, MoreVertical, RefreshCw, AlertTriangle,DollarSign, CheckCircle2, XCircle } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDaysBetween } from '@/lib/dateUtils'
import BookingTabs from '@/components/menu'
import { format } from 'date-fns';
import { Phone, MapPin, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast'
import { usePayments, useUpdatePaymentStatus, useDeletePayment, useApprovePayment, useRejectPayment } from '@/hooks/usePayments'
import { PageLoadingSkeleton } from '@/components/ui/loading-skeleton'




const page = () => {
    const [searchTerm ,setSearchTerm] = useState('')
    const [status ,setActiveStatus] = useState('All Status')
    const [paymentType, setPaymentType] = useState('All Types')
    
    // Month/Year filtering states - default to current month/year
    const currentDate = new Date()
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
    const currentYear = currentDate.getFullYear().toString()
    
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [showAllPayments, setShowAllPayments] = useState(false)
    const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false)
    
    // Payment management states
    const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [newStatus, setNewStatus] = useState('')
    
    // Approval states
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
    const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [loading, setLoading] = useState(false)

    const { data: allPayments = [], isLoading, error, refetch } = usePayments({
        showAll: true
    });

    // Mutations
    const updateStatusMutation = useUpdatePaymentStatus();
    const deletePaymentMutation = useDeletePayment();
    const approvePaymentMutation = useApprovePayment();
    const rejectPaymentMutation = useRejectPayment();


  const getMonthOptions = () => {
    const months = [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ]
    return months
  }

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []    
    for (let i = 0; i < 3; i++) {
      years.push(currentYear - i)
    }
    return years
  }

  const handleDateFilterChange = (month, year) => {
    setSelectedMonth(month)
    setSelectedYear(year)
    setShowAllPayments(!month || !year)
  }

    const handleShowAllToggle = () => {
    setShowAllPayments(!showAllPayments)
    if (!showAllPayments) {
      setSelectedMonth('')
      setSelectedYear('')
    } else {
      setSelectedMonth(currentMonth)
      setSelectedYear(currentYear)
    }
  }


  const handleUpdateStatus = () => {
    if (!selectedPayment || !newStatus) return
    
    updateStatusMutation.mutate(
      { id: selectedPayment.id, status: newStatus },
      {
        onSuccess: () => {
          setIsUpdateStatusOpen(false)
          setSelectedPayment(null)
          setNewStatus('')
        }
      }
    )
  }

  const handleDeletePayment = (paymentId) => {
    deletePaymentMutation.mutate(paymentId)
  }

  // Approval functions
  const handleApprove = (paymentId) => {
    approvePaymentMutation.mutate(
      { id: paymentId },
      {
        onSuccess: () => {
          setIsApprovalDialogOpen(false)
          setSelectedPayment(null)
        }
      }
    )
  }

  const handleReject = () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    rejectPaymentMutation.mutate(
      { id: selectedPayment.id, reason: rejectionReason },
      {
        onSuccess: () => {
          setIsRejectionDialogOpen(false)
          setSelectedPayment(null)
          setRejectionReason('')
        }
      }
    )
  }

  const handleAutoCreatePayments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments/auto-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Auto-payment creation completed! Created ${data.summary.paymentsCreated} payments, skipped ${data.summary.bookingsSkipped} bookings.`)
        refetch()
        
        if (data.createdPayments.length > 0) {
          console.log('Created payments:', data.createdPayments)
        }
        if (data.skippedBookings.length > 0) {
          console.log('Skipped bookings:', data.skippedBookings)
        }
      } else {
        toast.error(data.error || 'Failed to create automated payments')
      }
    } catch (error) {
      console.error('Error creating automated payments:', error)
      toast.error('Error creating automated payments')
    } finally {
      setLoading(false)
    }
  }

    // Frontend filtering logic
    const filteredPayments = allPayments.filter(payment => {
      // Status filter
      const matchedStatus = status === "All Status" || payment.status === status;
      
      // Payment type filter
      const matchedType = paymentType === "All Types" || payment.type === paymentType.toLowerCase();
      
      // Search filter
      const matchedSearch = searchTerm === '' || 
                           payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.booking?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.salary?.staff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.salary?.staff?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filter
      let matchedDate = true;
      if (!showAllPayments && selectedMonth && selectedYear) {
        const paymentDate = new Date(payment.createdAt);
        const paymentMonth = String(paymentDate.getMonth() + 1).padStart(2, '0');
        const paymentYear = paymentDate.getFullYear().toString();
        matchedDate = paymentMonth === selectedMonth && paymentYear === selectedYear;
      }
      
      return matchedStatus && matchedType && matchedSearch && matchedDate;
    });

    // Calculate stats from filtered payments
    const totalPayments = filteredPayments.length;
    const pendingPayments = filteredPayments.filter(payment => payment.status === "PENDING").length;
    const completedPayments = filteredPayments.filter(payment => payment.status === "COMPLETED").length;
    const totalRevenue = filteredPayments
      .filter(payment => payment.status === "COMPLETED")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    // Reset filters when switching to "Show All"
    useEffect(() => {
        if (showAllPayments) {
            setSelectedMonth(currentMonth);
            setSelectedYear(currentYear);
        }
    }, [showAllPayments, currentMonth, currentYear]);
        
    
    
    console.log(filteredPayments);
    
    // Show loading state while data is being fetched
    if (isLoading) {
        return (
            <PageLoadingSkeleton 
                title={true}
                statsCards={4}
                filterTabs={3}
                searchBar={true}
                contentCards={5}
            />
        );
    }

    // Show error state if there's an error
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <XCircle className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading payments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {error.message || "Unable to load payments"}
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

    return (
    <div>
         <div className="flex md:flex-row flex-col justify-between px-4">
                 <div className="mt-4 ">
                     <h1 className="text-3xl font-bold">Payments</h1>
                     <p className="text-muted-foreground leading-loose" >Manage all payment transactions and records here.</p>
 
                 </div>
                 <div className="flex items-center overflow-visible gap-2 mt-4 md:mt-0">
                     <Button 
                         className='cursor-pointer p-4' 
                         variant="outline"
                         onClick={() => {
                             refetch();
                             toast.success("Payments refreshed!");
                         }}
                         disabled={isLoading}
                     >
                         <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
                         {isLoading ? 'Refreshing...' : 'Refresh'}
                     </Button>
                     <Button 
                         className='cursor-pointer p-4' 
                         variant="outline"
                         onClick={handleAutoCreatePayments}
                         disabled={isLoading}
                     >
                         <Calendar className="h-4 w-4 mr-2" />
                         {isLoading ? 'Creating...' : 'Auto Create Monthly Payments'}
                     </Button>
                </div>
            </div>
        <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
     <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              All payments
            </p>
          </CardContent>
        </Card>
        <Card>  
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Pending payments
            </p>  
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments}</div>
            <p className="text-xs text-muted-foreground">
                Completed payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent> 
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString()} PKR
            </div>
            <p className="text-xs text-muted-foreground">
           Revenue from completed payments
            </p>
          </CardContent>
        </Card>
     </div>
     {/* Date Filter Section */}
     <div className='bg-white p-6 my-6 shadow-sm rounded-md'>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                        <p className="text-sm text-gray-600">
                            {showAllPayments 
                                ? "Showing all payments" 
                                : `Showing payments for ${getMonthOptions().find(m => m.value === selectedMonth)?.label} ${selectedYear}`
                            }
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={showAllPayments ? "default" : "outline"}
                            size="sm"
                            onClick={handleShowAllToggle}
                        >
                            {showAllPayments ? "Show All Payments" : "Filter by Month"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Month Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Select Month</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {selectedMonth ? getMonthOptions().find(m => m.value === selectedMonth)?.label : "Select Month"}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {getMonthOptions().map((month) => (
                                    <DropdownMenuItem 
                                        key={month.value}
                                        onClick={() => handleDateFilterChange(month.value, selectedYear)}
                                        className={month.value === selectedMonth ? "bg-blue-50 text-blue-700" : ""}
                                    >
                                        {month.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Year Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Select Year</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {selectedYear || "Select Year"}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {getYearOptions().map((year) => (
                                    <DropdownMenuItem 
                                        key={year}
                                        onClick={() => handleDateFilterChange(selectedMonth, year.toString())}
                                        className={year.toString() === selectedYear ? "bg-blue-50 text-blue-700" : ""}
                                    >
                                        {year}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Search */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Search Payments</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                className="pl-10"
                                placeholder="Search by name, email, or ID"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Payment Type Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Payment Type</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {paymentType}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                <DropdownMenuItem onClick={() => setPaymentType("All Types")}>
                                    All Types
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPaymentType("booking")}>
                                    Booking Payments
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPaymentType("salary")}>
                                    Salary Payments
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Filter by Status</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {status}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                <DropdownMenuItem onClick={() => setActiveStatus("All Status")}>
                                    All Status
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("PENDING")}>
                                    Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("COMPLETED")}>
                                    Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("FAILED")}>
                                    Failed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveStatus("REFUND")}>
                                    Refund
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Current Filter Display */}
                {!showAllPayments && selectedMonth && selectedYear && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                                Showing payments for: {getMonthOptions().find(m => m.value === selectedMonth)?.label} {selectedYear}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleShowAllToggle}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Show All
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <div>
            <div className='grid grid-cols-1  bg-white p-6 my-6  shadow-sm rounded-md' >
                {filteredPayments.length > 0 ? (
                    filteredPayments.map(payment => (
                        <Card key={payment.id} className="mb-6 border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <CardHeader className="pb-4">
                                {/* Header Section */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Payment #{payment.id.slice(-8)}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {payment.createdAt ? format(new Date(payment.createdAt), "MMM dd, yyyy 'at' hh:mm a") : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={`px-3 py-1 text-xs font-medium ${
                                                payment.type === 'salary' 
                                                    ? "bg-blue-50 text-blue-700 border-blue-200" 
                                                    : "bg-green-50 text-green-700 border-green-200"
                                            }`}
                                        >
                                            {payment.type === 'salary' ? 'Salary' : 'Booking'}
                                        </Badge>
                                        <Badge
                                            className={`px-3 py-1 text-xs font-medium ${
                                                payment.status === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                    : payment.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                    : payment.status === "FAILED"
                                                    ? "bg-red-100 text-red-800 border-red-200"
                                                    : payment.status === "REFUND"
                                                    ? "bg-purple-100 text-purple-800 border-purple-200"
                                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                            }`}
                                        >
                                            {payment.status}
                                        </Badge>
                                        
                                        {/* Action Menu */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => {
                                                        setSelectedPayment(payment)
                                                        setNewStatus(payment.status)
                                                        setIsUpdateStatusOpen(true)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Update Status
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeletePayment(payment.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash className="h-4 w-4 mr-2" />
                                                    Delete Payment
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        {/* Guest Information */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <User className="h-4 w-4 text-gray-600" />
                                                <h4 className="font-medium text-gray-900">Guest Information</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-sm text-gray-500">Name</p>
                                                    <p className="font-medium text-gray-900">{payment.user.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="text-gray-700">{payment.user.email}</p>
                                                </div>
                                                {payment.user.phone && (
                                                    <div>
                                                        <p className="text-sm text-gray-500">Phone</p>
                                                        <p className="text-gray-700">{payment.user.phone}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Room/Salary Information */}
                                        {payment.type === 'booking' && payment.booking ? (
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Bed className="h-4 w-4 text-gray-600" />
                                                    <h4 className="font-medium text-gray-900">Room Details</h4>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Room Number</p>
                                                        <p className="font-medium text-gray-900">{payment.booking.room?.roomNumber || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Floor</p>
                                                        <p className="text-gray-700">Floor {payment.booking.room?.floor || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Hostel</p>
                                                        <p className="text-gray-700">{payment.booking.hostel?.hostelName || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : payment.type === 'salary' && payment.salary ? (
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <DollarSign className="h-4 w-4 text-gray-600" />
                                                    <h4 className="font-medium text-gray-900">Salary Details</h4>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Pay Period</p>
                                                        <p className="font-medium text-gray-900">{payment.salary.payPeriod || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Pay Date</p>
                                                        <p className="text-gray-700">
                                                            {payment.salary.payDate ? format(new Date(payment.salary.payDate), "MMM dd, yyyy") : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Position</p>
                                                        <p className="text-gray-700">{payment.salary.staff?.position || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        {/* Booking Dates */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Calendar className="h-4 w-4 text-gray-600" />
                                                <h4 className="font-medium text-gray-900">Booking Period</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-sm text-gray-500">Check-in</p>
                                                    <p className="text-gray-700">
                                                        {payment.booking?.checkin
                                                            ? format(new Date(payment.booking.checkin), "MMM dd, yyyy")
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Check-out</p>
                                                    <p className="text-gray-700">
                                                        {payment.booking?.checkout
                                                            ? format(new Date(payment.booking.checkout), "MMM dd, yyyy")
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                                {/* <div>
                                                    <p className="text-sm text-gray-500">Duration</p>
                                                    <p className="text-gray-700">
                                                        {payment.booking.checkin && payment.booking.checkout
                                                            ? `${getDaysBetween(payment.booking.checkin, payment.booking.checkout)} nights`
                                                            : "N/A"}
                                                    </p>
                                                </div> */}
                                            </div>
                                        </div>

                                        {/* Payment Details */}
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CreditCard className="h-4 w-4 text-green-600" />
                                                <h4 className="font-medium text-gray-900">Payment Details</h4>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Amount</span>
                                                    <span className="text-lg font-bold text-green-700">{payment.amount}PKR</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Method</span>
                                                    <span className="px-2 py-1 bg-white rounded text-sm font-medium text-gray-700">
                                                        {payment.method || "N/A"}
                                                    </span>
                                                </div>
                                                {payment.transactionId && (
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                                                        <p className="text-xs font-mono bg-white  p-3 rounded text-gray-700">
                                                            {payment.transactionId}
                                                        </p>
                                                    </div>
                                                )}
                                                {/* {payment.notes && (
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Notes</p>
                                                        <p className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                                                            {payment.notes}
                                                        </p>
                                                    </div>
                                                )} */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Status:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                payment.status === 'COMPLETED' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : payment.status === 'FAILED'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {payment.status}
                                            </span>
                                            <span className="text-sm text-gray-500">Approval:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                payment.approvalStatus === 'APPROVED' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : payment.approvalStatus === 'REJECTED'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {payment.approvalStatus}
                                            </span>
                                        </div>
                                        
                                        {/* {payment.approvalStatus === 'PENDING' && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedPayment(payment)
                                                        setIsApprovalDialogOpen(true)
                                                    }}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setSelectedPayment(payment)
                                                        setIsRejectionDialogOpen(true)
                                                    }}
                                                >
                                                  
                                                    Reject
                                                </Button>
                                            </div>
                                        )} */}
                                        
                                        {payment.approvalStatus === 'APPROVED' && (
                                            <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Approved
                                            </div>
                                        )}
                                        
                                        {payment.approvalStatus === 'REJECTED' && (
                                            <div className="text-sm text-red-600 font-medium flex items-center gap-1">
                                                {/* <XCircle className="h-4 w-4" /> */}
                                                Rejected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            {searchTerm ? `No payments found matching "${searchTerm}"` : 
                             status !== "All Status" ? `No ${status.toLowerCase()} payments found` :
                             paymentType !== "All Types" ? `No ${paymentType.toLowerCase()} payments found` :
                             "No payments found"}
                        </p>
                    </div>
                )}
            </div>
</div>


            {/* Update Status Dialog */}
            <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Update Payment Status</DialogTitle>
                        <DialogDescription>
                            Change the status of payment #{selectedPayment?.id?.slice(-8)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>New Status</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        {newStatus || "Select Status"}
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setNewStatus("PENDING")}>PENDING</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setNewStatus("COMPLETED")}>COMPLETED</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setNewStatus("FAILED")}>FAILED</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setNewStatus("REFUND")}>REFUND</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsUpdateStatusOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending || !newStatus}>
                                {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Approval Dialog */}
            <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this payment? This action will confirm the payment.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Payment Details</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Amount:</span> PKR{selectedPayment.amount}</p>
                                    <p><span className="font-medium">Method:</span> {selectedPayment.method}</p>
                                    <p><span className="font-medium">Guest:</span> {selectedPayment.user?.name}</p>
                                    <p><span className="font-medium">Booking:</span> #{selectedPayment.booking?.id?.slice(-8)}</p>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={() => handleApprove(selectedPayment.id)}
                                    disabled={approvePaymentMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {approvePaymentMutation.isPending ? 'Approving...' : 'Approve Payment'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Payment</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this payment.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Payment Details</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Amount:</span> PKR{selectedPayment.amount}</p>
                                    <p><span className="font-medium">Method:</span> {selectedPayment.method}</p>
                                    <p><span className="font-medium">Guest:</span> {selectedPayment.user?.name}</p>
                                    <p><span className="font-medium">Booking:</span> #{selectedPayment.booking?.id?.slice(-8)}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                                <textarea
                                    id="rejection-reason"
                                    placeholder="Enter reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => {
                                    setIsRejectionDialogOpen(false)
                                    setRejectionReason('')
                                }}>
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive"
                                    onClick={handleReject}
                                    disabled={rejectPaymentMutation.isPending || !rejectionReason.trim()}
                                >
                                    {rejectPaymentMutation.isPending ? 'Rejecting...' : 'Reject Payment'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
    </div>
  )
}

export default page 