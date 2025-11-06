"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  RefreshCw,
  Users,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Bed,
  Wrench,
  CreditCard,
  Building,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

const ReportsPage = () => {
  const [reportData, setReportData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    hostelId: ''
  })

  // Set default date range to last 30 days
  useEffect(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    setFilters({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      hostelId: ''
    })
  }, [])

  const fetchReportData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.hostelId) params.append('hostelId', filters.hostelId)

      const response = await fetch(`/api/reports/comprehensive?${params.toString()}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch report data' }))
        throw new Error(errorData.error || 'Failed to fetch report data')
      }

      const data = await response.json()
      console.log('Report data received:', data)

      // Validate and normalize data structure
      const normalizedData = {
        summary: {
          totalUsers: data.summary?.totalUsers || 0,
          guestsCount: data.summary?.guestsCount || 0,
          staffCount: data.summary?.staffCount || 0,
          totalRevenue: data.summary?.totalRevenue || 0,
          pendingRevenue: data.summary?.pendingRevenue || 0,
          netProfit: data.summary?.netProfit || 0,
          profitMargin: data.summary?.profitMargin || 0,
          occupancyRate: data.summary?.occupancyRate || 0,
          totalRooms: data.summary?.totalRooms || 0,
          occupiedRooms: data.summary?.occupiedRooms || 0,
        },
        financial: {
          summary: data.financial?.summary || {},
          revenueByMethod: data.financial?.revenueByMethod || [],
          revenueByRoomType: data.financial?.revenueByRoomType || [],
        },
        bookings: data.bookings || [],
        payments: data.payments || [],
        rooms: data.rooms || [],
        maintenance: {
          summary: data.maintenance?.summary || {},
          details: data.maintenance?.details || [],
        },
        salary: {
          summary: data.salary?.summary || {},
          details: data.salary?.details || [],
        },
        expenses: data.expenses || {},
        users: data.users || [],
      }

      setReportData(normalizedData)
      toast.success('Report data loaded successfully!')
    } catch (error) {
      console.error('Error fetching report data:', error)
      setError(error.message || 'Failed to load report data')
      toast.error(error.message || 'Failed to load report data')
    } finally {
      setIsLoading(false)
    }
  }



  const handleDownloadExcel = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.hostelId) params.append('hostelId', filters.hostelId)

      const response = await fetch(`/api/reports/export?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to generate Excel report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const startDateStr = filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : 'all'
      const endDateStr = filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : 'all'
      link.download = `hostel-report-${startDateStr}-to-${endDateStr}.xlsx`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Excel report downloaded successfully!')
    } catch (error) {
      console.error('Error downloading Excel report:', error)
      toast.error('Failed to download Excel report')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
      case 'failed':
        return 'destructive'
      case 'checked_in':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading reports</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchReportData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Comprehensive Reports</h1>
          <p className="text-muted-foreground">
            Detailed insights into your hostel's performance and operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchReportData}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleDownloadExcel}
            disabled={!reportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>
            Select date range and hostel to generate customized reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostelId">Hostel ID (Optional)</Label>
              <Input
                id="hostelId"
                placeholder="Enter hostel ID"
                value={filters.hostelId}
                onChange={(e) => setFilters(prev => ({ ...prev, hostelId: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={fetchReportData} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Data */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {reportData.summary?.guestsCount || 0} guests, {reportData.summary?.staffCount || 0} staff
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  PKR {(reportData.summary?.totalRevenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.summary?.pendingRevenue ? `PKR ${reportData.summary.pendingRevenue.toLocaleString()} pending` : 'No pending revenue'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  PKR {(reportData.summary?.netProfit || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.summary?.profitMargin || 0}% profit margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary?.occupancyRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {reportData.summary?.occupiedRooms || 0} of {reportData.summary?.totalRooms || 0} rooms
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tabs */}
          <Tabs defaultValue="financial" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="salaries">Salaries</TabsTrigger>
            </TabsList>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reportData.financial?.revenueByMethod && reportData.financial.revenueByMethod.length > 0 ? (
                        reportData.financial.revenueByMethod.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium">{item.method || 'Unknown'}</span>
                            <div className="text-right">
                              <div className="font-bold">PKR {(item.amount || 0).toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">{item.count || 0} transactions</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No revenue data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Room Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reportData.financial?.revenueByRoomType && reportData.financial.revenueByRoomType.length > 0 ? (
                        reportData.financial.revenueByRoomType.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium">{item.roomType || 'Unknown'}</span>
                            <div className="text-right">
                              <div className="font-bold">PKR {(item.amount || 0).toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">{item.count || 0} bookings</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No revenue data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings ({reportData.bookings?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.bookings && reportData.bookings.length > 0 ? (
                      reportData.bookings.slice(0, 10).map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{booking.guestName || 'Unknown Guest'}</h4>
                              <p className="text-sm text-muted-foreground">{booking.guestEmail || 'N/A'}</p>
                              <p className="text-sm">Room {booking.roomNumber || 'N/A'} - {booking.roomType || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={getStatusColor(booking.status)}>
                                {booking.status || 'N/A'}
                              </Badge>
                              <div className="text-sm font-bold mt-1">
                                PKR {(booking.price || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Check-in:</span>
                              <p>{booking.checkin ? format(new Date(booking.checkin), 'MMM dd, yyyy') : 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Check-out:</span>
                              <p>{booking.checkout ? format(new Date(booking.checkout), 'MMM dd, yyyy') : 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Hostel:</span>
                              <p>{booking.hostelName || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>
                              <p>{booking.createdAt ? format(new Date(booking.createdAt), 'MMM dd, yyyy') : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No bookings found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Transactions ({reportData.payments?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.payments && reportData.payments.length > 0 ? (
                      reportData.payments.slice(0, 10).map((payment) => (
                        <div key={payment.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">Payment #{payment.id ? payment.id.slice(-8) : 'N/A'}</h4>
                              <p className="text-sm text-muted-foreground">{payment.guestName || 'Unknown'} - Room {payment.roomNumber || 'N/A'}</p>
                              <p className="text-sm">{payment.description || 'Payment for booking'}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                {getStatusIcon(payment.status)}
                                <Badge variant={getStatusColor(payment.status)}>
                                  {payment.status || 'N/A'}
                                </Badge>
                              </div>
                              <div className="text-lg font-bold text-green-600">
                                PKR {(payment.amount || 0).toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">{payment.method || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payment.createdAt ? format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No payments found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rooms Tab */}
            <TabsContent value="rooms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Room Performance ({reportData.rooms?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.rooms && reportData.rooms.length > 0 ? (
                      reportData.rooms.slice(0, 10).map((room) => (
                        <div key={room.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">Room {room.roomNumber || 'N/A'}</h4>
                              <p className="text-sm text-muted-foreground">Floor {room.floor || 'N/A'} - {room.type || 'N/A'}</p>
                              <Badge variant={room.status === 'OCCUPIED' ? 'default' : 'secondary'}>
                                {room.status || 'N/A'}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                PKR {(room.totalRevenue || 0).toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {room.bookingCount || 0} bookings
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {room.occupancyRate || 0}% occupancy
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Price/Night:</span>
                              <p>PKR {(room.pricePerNight || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="font-medium">Price/Month:</span>
                              <p>PKR {(room.pricePerMonth || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No rooms found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Requests ({reportData.maintenance?.details?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.maintenance?.details && reportData.maintenance.details.length > 0 ? (
                      reportData.maintenance.details.slice(0, 10).map((req) => (
                        <div key={req.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{req.title || 'Untitled Request'}</h4>
                              <p className="text-sm text-muted-foreground">{req.description || 'No description'}</p>
                              <p className="text-sm">Room {req.roomNumber || 'N/A'} - Floor {req.floor || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex gap-2 mb-1">
                                <Badge variant={getStatusColor(req.status)}>
                                  {req.status || 'N/A'}
                                </Badge>
                                <Badge variant={req.priority === 'HIGH' ? 'destructive' :
                                  req.priority === 'MEDIUM' ? 'warning' : 'success'}>
                                  {req.priority || 'N/A'}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Assigned to: {req.assignee || 'Unassigned'}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Reported: {req.reportedAt ? format(new Date(req.reportedAt), 'MMM dd, yyyy') : 'N/A'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No maintenance requests found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Salaries Tab */}
            <TabsContent value="salaries" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        PKR {(reportData.salary?.summary?.totalPaid || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Paid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        PKR {(reportData.salary?.summary?.totalPending || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        PKR {Math.round(reportData.salary?.summary?.averageSalary || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Average Salary</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Recent Salary Records ({reportData.salary?.details?.length || 0})</h4>
                    {reportData.salary?.details && reportData.salary.details.length > 0 ? (
                      reportData.salary.details.slice(0, 10).map((salary) => (
                        <div key={salary.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{salary.staffName || 'Unknown Staff'}</h4>
                              <p className="text-sm text-muted-foreground">{salary.position || 'N/A'} - {salary.department || 'N/A'}</p>
                              <p className="text-sm">Pay Date: {salary.payDate ? format(new Date(salary.payDate), 'MMM dd, yyyy') : 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={getStatusColor(salary.status)}>
                                {salary.status || 'N/A'}
                              </Badge>
                              <div className="text-lg font-bold mt-1">
                                PKR {(salary.netAmount || 0).toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Base: PKR {(salary.baseAmount || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No salary records found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* No Data State */}
      {!reportData && !isLoading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Report Data</h3>
            <p className="text-muted-foreground text-center mb-4">
              Click "Generate Report" to load comprehensive data for the selected period.
            </p>
            <Button onClick={fetchReportData}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ReportsPage
