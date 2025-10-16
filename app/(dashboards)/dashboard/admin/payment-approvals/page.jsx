'use client'

import { useState, useEffect, useContext } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle, 
  XCircle, 
  XCircle2,
  Clock, 
  Eye, 
  MoreVertical, 
  RefreshCw, 
  Search,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Bed,
  Home,
  MapPin
} from 'lucide-react'
import { toast } from "react-hot-toast"
import { format } from 'date-fns'
import { SessionContext } from '../../../../context/sessiondata'

export default function PaymentApprovalsPage() {
    const session = useContext(SessionContext)
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [approvalStatus, setApprovalStatus] = useState('All Status')
    const [paymentType, setPaymentType] = useState('All Types')
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
    const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    const fetchPayments = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/payments/unified')
            const data = await response.json()
            setPayments(Array.isArray(data) ? data : [])
            console.log("payments fetched successfully", { count: data.length })
        } catch (error) {
            console.error('Error fetching payments:', error)
            toast.error('Error fetching payments')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (payment) => {
        setActionLoading(true)
        try {
            const response = await fetch(`/api/payments/unified/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    paymentId: payment.id, 
                    type: payment.type 
                })
            })

            if (response.ok) {
                const successMessage = payment.type === 'booking' 
                    ? 'Payment approved and booking confirmed successfully!'
                    : payment.type === 'salary' 
                    ? 'Salary payment approved successfully!'
                    : 'Payment approved successfully!'
                toast.success(successMessage)
                await fetchPayments()
                setIsApprovalDialogOpen(false)
                setSelectedPayment(null)
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to approve payment')
            }
        } catch (error) {
            console.error('Error approving payment:', error)
            toast.error('Error approving payment')
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async () => {
        if (!selectedPayment || !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }

        setActionLoading(true)
        try {
            const response = await fetch(`/api/payments/unified/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    paymentId: selectedPayment.id, 
                    type: selectedPayment.type,
                    reason: rejectionReason 
                })
            })

            if (response.ok) {
                const successMessage = selectedPayment.type === 'booking' 
                    ? 'Payment rejected and booking cancelled successfully!'
                    : selectedPayment.type === 'salary' 
                    ? 'Salary payment rejected successfully!'
                    : 'Payment rejected successfully!'
                toast.success(successMessage)
                await fetchPayments()
                setIsRejectionDialogOpen(false)
                setSelectedPayment(null)
                setRejectionReason('')
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to reject payment')
            }
        } catch (error) {
            console.error('Error rejecting payment:', error)
            toast.error('Error rejecting payment')
        } finally {
            setActionLoading(false)
        }
    }

    const getApprovalStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
            case 'APPROVED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
            case 'REJECTED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const getPaymentStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
            case 'COMPLETED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
            case 'FAILED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>
            case 'REFUNDED':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Refunded</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const getMethodIcon = (method) => {
        switch (method) {
            case 'CASH':
                return <DollarSign className="h-4 w-4" />
            case 'CARD':
                return <CreditCard className="h-4 w-4" />
            case 'UPI':
                return <CreditCard className="h-4 w-4" />
            case 'BANK_TRANSFER':
                return <CreditCard className="h-4 w-4" />
            default:
                return <DollarSign className="h-4 w-4" />
        }
    }

    useEffect(() => {
        fetchPayments()
    }, [])

    const filteredPayments = payments.filter(payment => {
        const matchedStatus = approvalStatus === "All Status" || payment.approvalStatus === approvalStatus;
        const matchedType = paymentType === "All Types" || payment.type === paymentType.toLowerCase();
        const matchedSearch = searchTerm === '' || (
            payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.booking?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.salary?.staff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.salary?.staff?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.expense?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.expense?.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchedStatus && matchedType && matchedSearch;
    });


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment Approvals</h1>
                    <p className="text-gray-600">Review and approve payment requests</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={fetchPayments}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{payments.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {payments.filter(p => p.approvalStatus === 'PENDING').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {payments.filter(p => p.approvalStatus === 'APPROVED').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {payments.filter(p => p.approvalStatus === 'REJECTED').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Search Payments</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search by name, email, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Payment Type</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        {paymentType}
                                        <MoreVertical className="h-4 w-4" />
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
                                    <DropdownMenuItem onClick={() => setPaymentType("expense")}>
                                        Expense Payments
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Approval Status</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        {approvalStatus}
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full">
                                    <DropdownMenuItem onClick={() => setApprovalStatus("All Status")}>
                                        All Status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setApprovalStatus("PENDING")}>
                                        Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setApprovalStatus("APPROVED")}>
                                        Approved
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setApprovalStatus("REJECTED")}>
                                        Rejected
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments List */}
            <div className="space-y-4">
                {filteredPayments.length > 0 ? (
                    filteredPayments.map(payment => (
                        <Card key={payment.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                {getMethodIcon(payment.method)}
                                                <span className="font-medium text-lg">PKR{payment.amount}</span>
                                                <Badge variant="outline" className={
                                                    payment.type === 'salary' 
                                                        ? "bg-blue-50 text-blue-700 border-blue-200" 
                                                        : "bg-green-50 text-green-700 border-green-200"
                                                }>
                                                    {payment.type === 'salary' ? 'Salary' : 'Booking'}
                                                </Badge>
                                            </div>
                                            {getApprovalStatusBadge(payment.approvalStatus)}
                                            {getPaymentStatusBadge(payment.status)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* User Info */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium">{payment.user?.name || 'N/A'}</p>
                                                        <p className="text-sm text-gray-500">{payment.user?.email || 'N/A'}</p>
                                                        {payment.type === 'salary' && (
                                                            <p className="text-xs text-blue-600">
                                                                {payment.salary?.staff?.position || 'Staff Member'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Booking/Salary/Expense Info */}
                                            <div className="space-y-2">
                                                {payment.type === 'booking' ? (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-sm font-medium">Booking #{payment.booking?.id?.slice(-8) || 'N/A'}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {payment.booking?.room?.roomNumber ? `Room ${payment.booking.room.roomNumber}` : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : payment.type === 'salary' ? (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-sm font-medium">Salary Payment</p>
                                                            <p className="text-sm text-gray-500">
                                                                {payment.salary?.payPeriod || 'N/A'} • {payment.salary?.payDate ? format(new Date(payment.salary.payDate), 'MMM dd, yyyy') : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-sm font-medium">{payment.expense?.title || 'Expense Payment'}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {payment.expense?.category || 'N/A'} • {payment.expense?.hostel?.hostelName || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment Details */}
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Method:</span>
                                                    <span className="ml-2 font-medium">{payment.method || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Transaction ID:</span>
                                                    <span className="ml-2 font-medium">{payment.transactionId || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Created:</span>
                                                    <span className="ml-2 font-medium">
                                                        {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
                                                    </span>
                                                </div>
                                                
                                            </div>
                                            {payment.notes && (
                                                <div className="mt-2">
                                                    <span className="text-gray-500">Notes:</span>
                                                    <p className="text-sm text-gray-700 mt-1">{payment.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                      
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedPayment(payment)
                                                setIsDetailsDialogOpen(true)
                                            }}
                                            className="text-black border-blue-200 cursor-pointer hover:bg-blue-100"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            {payment.type === 'salary' ? 'Salary Details' : 
                                             payment.type === 'expense' ? 'Expense Details' : 'Booking Details'}
                                        </Button>

                                        {payment.approvalStatus === 'PENDING' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedPayment(payment)
                                                        setIsApprovalDialogOpen(true)
                                                    }}
                                                    className="bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer"
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
                                                    className="cursor-pointer bg-red-100 hover:bg-red-200 text-red-800"
                                                >
                                                    {/* <XCircle2 className="h-4 w-4 mr-1" /> */}
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {payment.approvalStatus === 'APPROVED' && (
                                            <div className="text-sm bg-green-100 p-2 rounded-md text-green-800 font-medium flex items-center gap-1">
                                                {/* <CheckCircle2 className="h-4 w-4" /> */}
                                                Approved
                                            </div>
                                        )}
                                        {payment.approvalStatus === 'REJECTED' && (
                                            <div className="text-sm bg-red-100 p-2 rounded-md   text-red-800 font-medium flex items-center gap-1">
                                                {/* <XCircle2 className="h-4 w-4" /> */}
                                                Rejected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                            <p className="text-gray-500">No payments match your current filters.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Approval Dialog */}
            <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve {selectedPayment?.type === 'salary' ? 'Salary' : 'Payment'}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this {selectedPayment?.type === 'salary' ? 'salary payment' : 'payment'}? This action will confirm the {selectedPayment?.type === 'salary' ? 'salary' : 'payment'}.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">{selectedPayment.type === 'salary' ? 'Salary' : 'Payment'} Details</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Amount:</span> PKR{selectedPayment.amount}</p>
                                    <p><span className="font-medium">Method:</span> {selectedPayment.method}</p>
                                    <p><span className="font-medium">{selectedPayment.type === 'salary' ? 'Staff' : 'Guest'}:</span> {selectedPayment.user?.name}</p>
                                    {selectedPayment.type === 'booking' ? (
                                        <p><span className="font-medium">Booking:</span> #{selectedPayment.booking?.id?.slice(-8)}</p>
                                    ) : (
                                        <p><span className="font-medium">Pay Period:</span> {selectedPayment.salary?.payPeriod}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={() => handleApprove(selectedPayment)}
                                    disabled={actionLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {actionLoading ? 'Approving...' : `Approve ${selectedPayment.type === 'salary' ? 'Salary' : 'Payment'}`}
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
                        <DialogTitle>Reject {selectedPayment?.type === 'salary' ? 'Salary' : 'Payment'}</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this {selectedPayment?.type === 'salary' ? 'salary payment' : 'payment'}.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">{selectedPayment.type === 'salary' ? 'Salary' : 'Payment'} Details</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Amount:</span> PKR{selectedPayment.amount}</p>
                                    <p><span className="font-medium">Method:</span> {selectedPayment.method}</p>
                                    <p><span className="font-medium">{selectedPayment.type === 'salary' ? 'Staff' : 'Guest'}:</span> {selectedPayment.user?.name}</p>
                                    {selectedPayment.type === 'booking' ? (
                                        <p><span className="font-medium">Booking:</span> #{selectedPayment.booking?.id?.slice(-8)}</p>
                                    ) : (
                                        <p><span className="font-medium">Pay Period:</span> {selectedPayment.salary?.payPeriod}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                                <Textarea
                                    id="rejection-reason"
                                    placeholder="Enter reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
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
                                    disabled={actionLoading || !rejectionReason.trim()}
                                >
                                    {actionLoading ? 'Rejecting...' : `Reject ${selectedPayment.type === 'salary' ? 'Salary' : 'Payment'}`}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] ">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            {selectedPayment?.type === 'salary' ? (
                                <>
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                    Salary Details
                                </>
                            ) : selectedPayment?.type === 'expense' ? (
                                <>
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Expense Details
                                </>
                            ) : (
                                <>
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    Booking Details
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            {selectedPayment?.type === 'salary' 
                                ? "Complete information about the salary payment."
                                : selectedPayment?.type === 'expense'
                                ? "Complete information about the expense payment."
                                : "Complete information about the booking associated with this payment."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedPayment && (
                        <div className="mt-6 space-y-6 overflow-y-auto max-h-[70vh]">
                            {selectedPayment.type === 'booking' && selectedPayment.booking ? (
                                <>
                                    {/* Booking Overview */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-600" />
                                    Booking Overview
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 font-medium">Booking ID:</span>
                                        <span className="ml-2 text-gray-900 font-mono">#{selectedPayment.booking.id?.slice(-8)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Type:</span>
                                        <span className="ml-2 text-gray-900">{selectedPayment.booking.bookingType}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Check-in:</span>
                                        <span className="ml-2 text-gray-900">
                                            {selectedPayment.booking.checkin ? format(new Date(selectedPayment.booking.checkin), 'MMM dd, yyyy') : 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Check-out:</span>
                                        <span className="ml-2 text-gray-900">
                                            {selectedPayment.booking.checkout ? format(new Date(selectedPayment.booking.checkout), 'MMM dd, yyyy') : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Room Information */}
                            {selectedPayment.booking.room && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Bed className="h-4 w-4 text-gray-600" />
                                        Room Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 font-medium">Room Number:</span>
                                            <span className="ml-2 text-gray-900">{selectedPayment.booking.room.roomNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Floor:</span>
                                            <span className="ml-2 text-gray-900">{selectedPayment.booking.room.floor}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Status:</span>
                                            <span className="ml-2 text-gray-900">{selectedPayment.booking.room.status}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Hostel Information */}
                            {selectedPayment.booking.hostel && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Home className="h-4 w-4 text-gray-600" />
                                        Hostel Information
                                    </h4>
                                    <div className="text-sm">
                                        <div>
                                            <span className="text-gray-600 font-medium">Hostel Name:</span>
                                            <span className="ml-2 text-gray-900">{selectedPayment.booking.hostel.hostelName}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Guest Information */}
                            {selectedPayment.user && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-600" />
                                        Guest Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 font-medium">Name:</span>
                                            <span className="ml-2 text-gray-900">{selectedPayment.user.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Email:</span>
                                            <span className="ml-2 text-gray-900">{selectedPayment.user.email}</span>
                                        </div>
                                        {selectedPayment.user.phone && (
                                            <div>
                                                <span className="text-gray-600 font-medium">Phone:</span>
                                                <span className="ml-2 text-gray-900">{selectedPayment.user.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Information */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-gray-600" />
                                    Payment Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 font-medium">Amount:</span>
                                        <span className="ml-2 text-gray-900 font-semibold">PKR{selectedPayment.amount?.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Method:</span>
                                        <span className="ml-2 text-gray-900">{selectedPayment.method}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Status:</span>
                                        <span className="ml-2 text-gray-900">{selectedPayment.status}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Approval Status:</span>
                                        <span className="ml-2 text-gray-900">{selectedPayment.approvalStatus}</span>
                                    </div>
                                    {selectedPayment.transactionId && (
                                        <div className="md:col-span-2">
                                            <span className="text-gray-600 font-medium">Transaction ID:</span>
                                            <span className="ml-2 text-gray-900 font-mono">{selectedPayment.transactionId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                                </>
                            ) : selectedPayment.type === 'salary' && selectedPayment.salary ? (
                                /* Salary Details */
                                <>
                                {/* Salary Overview */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-600" />
                                        Salary Overview
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 font-medium">Pay Period:</span>
                                            <span className="ml-2 text-gray-900">{selectedPayment.salary.payPeriod}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Pay Date:</span>
                                            <span className="ml-2 text-gray-900">
                                                {selectedPayment.salary.payDate ? format(new Date(selectedPayment.salary.payDate), 'MMM dd, yyyy') : 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Base Amount:</span>
                                            <span className="ml-2 text-gray-900">PKR{selectedPayment.salary.baseAmount?.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Net Amount:</span>
                                            <span className="ml-2 text-gray-900 font-semibold">PKR{selectedPayment.salary.netAmount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Staff Information */}
                                {selectedPayment.salary.staff && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-600" />
                                            Staff Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600 font-medium">Name:</span>
                                                <span className="ml-2 text-gray-900">{selectedPayment.salary.staff.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 font-medium">Email:</span>
                                                <span className="ml-2 text-gray-900">{selectedPayment.salary.staff.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 font-medium">Position:</span>
                                                <span className="ml-2 text-gray-900">{selectedPayment.salary.staff.position}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 font-medium">Department:</span>
                                                <span className="ml-2 text-gray-900">{selectedPayment.salary.staff.department}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Salary Breakdown */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-gray-600" />
                                        Salary Breakdown
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 font-medium">Base Amount:</span>
                                            <span className="ml-2 text-gray-900">PKR{selectedPayment.salary.baseAmount?.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Overtime:</span>
                                            <span className="ml-2 text-gray-900">PKR{selectedPayment.salary.overtimeAmount?.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Bonus:</span>
                                            <span className="ml-2 text-gray-900">PKR{selectedPayment.salary.bonusAmount?.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Deductions:</span>
                                            <span className="ml-2 text-gray-900">PKR{selectedPayment.salary.deductions?.toLocaleString()}</span>
                                        </div>
                                        <div className="md:col-span-2 pt-2 border-t">
                                            <span className="text-gray-600 font-medium">Net Amount:</span>
                                            <span className="ml-2 text-gray-900 font-semibold text-lg">PKR{selectedPayment.salary.netAmount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                </>
                            ) : selectedPayment.type === 'expense' && selectedPayment.expense ? (
                                /* Expense Details */
                                <>
                                {/* Expense Overview */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-600" />
                                        Expense Overview
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 font-medium">Title:</span>
                                            <span className="ml-2 text-gray-900">{selectedPayment.expense.title}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Category:</span>
                                            <span className="ml-2 text-gray-900">{selectedPayment.expense.category}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Amount:</span>
                                            <span className="ml-2 text-gray-900 font-semibold">PKR {selectedPayment.expense.amount?.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">Hostel:</span>
                                            <span className="ml-2 text-gray-900">{selectedPayment.expense.hostel?.hostelName || 'N/A'}</span>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-gray-600 font-medium">Description:</span>
                                            <p className="ml-2 text-gray-900 mt-1">{selectedPayment.expense.description}</p>
                                        </div>
                                        {selectedPayment.expense.receiptUrl && (
                                            <div className="md:col-span-2">
                                                <span className="text-gray-600 font-medium">Receipt:</span>
                                                <a 
                                                    href={selectedPayment.expense.receiptUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-blue-600 hover:underline"
                                                >
                                                    View Receipt
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </>
                            ) : null}
                            
                            <div className="flex justify-start pt-4 border-t">
                                <Button
                                    onClick={() => setIsDetailsDialogOpen(false)}
                                    variant="outline"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}

                </DialogContent>
            </Dialog>
        </div>
    )
}
