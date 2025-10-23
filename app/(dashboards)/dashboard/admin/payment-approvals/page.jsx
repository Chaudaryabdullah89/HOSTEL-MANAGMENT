'use client'

import { useState, useEffect, useContext } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton"
import { usePayments, useUnifiedApprovePayment, useUnifiedRejectPayment } from '@/hooks/usePayments'

export default function PaymentApprovalsPage() {
    const PreviewBooking = ({ booking }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PreviewItem label="Booking ID" value={`#${booking.id?.slice(-8)}`} />
            <PreviewItem label="Room" value={booking.room?.roomNumber || 'N/A'} />
            <PreviewItem label="Hostel" value={booking.hostel?.hostelName || 'N/A'} />
            <PreviewItem
                label="Dates"
                value={`${booking.checkin ? format(new Date(booking.checkin), 'MMM dd') : 'N/A'
                    } — ${booking.checkout
                        ? format(new Date(booking.checkout), 'MMM dd, yyyy')
                        : 'N/A'
                    }`}
            />
        </div>
    );

    const PreviewSalary = ({ salary }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PreviewItem label="Staff" value={salary.staff?.name || 'N/A'} />
            <PreviewItem label="Pay Period" value={salary.payPeriod || 'N/A'} />
            <PreviewItem
                label="Net Amount"
                value={`PKR ${salary.netAmount?.toLocaleString() || '0'}`}
            />
            <PreviewItem
                label="Base"
                value={`PKR ${salary.baseAmount?.toLocaleString() || '0'}`}
            />
        </div>
    );
    const PreviewItem = ({ label, value }) => (
        <div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
        </div>
    );

    const PreviewExpense = ({ expense }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PreviewItem label="Title" value={expense.title || 'N/A'} />
            <PreviewItem label="Category" value={expense.category || 'N/A'} />
            <PreviewItem
                label="Amount"
                value={`PKR ${expense.amount?.toLocaleString() || '0'}`}
            />
            {expense.hostel && (
                <PreviewItem
                    label="Hostel"
                    value={expense.hostel.hostelName || 'N/A'}
                />
            )}
        </div>
    );
    const session = useContext(SessionContext)
    const [searchTerm, setSearchTerm] = useState('')
    const [approvalStatus, setApprovalStatus] = useState('All Status')
    const [paymentType, setPaymentType] = useState('All Types')
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
    const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false)
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')

    const { data: payments = [], isLoading: loading, error, refetch } = usePayments()

    useEffect(() => {
        if (payments.length > 0) {
            console.log('Payments received:', payments.length);
            const bookingPayments = payments.filter(p => p.type === 'booking');
            console.log('Booking payments:', bookingPayments.length);
            if (bookingPayments.length > 0) {
                console.log('First booking payment:', JSON.stringify(bookingPayments[0], null, 2));
            }
        }
    }, [payments])
    const approvePaymentMutation = useUnifiedApprovePayment()
    const rejectPaymentMutation = useUnifiedRejectPayment()

    const handleApprove = async (payment) => {
        try {
            await approvePaymentMutation.mutateAsync({
                paymentId: payment.id,
                type: payment.type
            })
            setIsApprovalDialogOpen(false)
            setSelectedPayment(null)
        } catch (error) {
            // Error handling is done in the mutation hook
        }
    }

    const handleReject = async () => {
        if (!selectedPayment || !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }

        try {
            await rejectPaymentMutation.mutateAsync({
                paymentId: selectedPayment.id,
                type: selectedPayment.type,
                reason: rejectionReason
            })
            setIsRejectionDialogOpen(false)
            setSelectedPayment(null)
            setRejectionReason('')
            if (response.ok) {
                toast.success('Payment rejected successfully')
            } else {
                toast.error('Failed to reject payment')
            }
        } catch (error) {

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

    if (loading) {
        return (
            <PageLoadingSkeleton
                title={true}
                statsCards={0}
                filterTabs={3}
                searchBar={true}
                contentCards={5}
            />
        );
    }

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
                        onClick={() => {
                            refetch();
                            toast.success("Payments refreshed!");
                        }}
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
            <div className="grid grid-cols-1 bg-white p-6 my-6 shadow-sm rounded-md">
                {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                        <Card
                            key={payment.id}
                            className="mb-4 relative"
                        >
                            <CardHeader>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${payment.method === 'CASH' ? 'bg-green-100 text-green-700' :
                                                payment.method === 'CARD' ? 'bg-blue-100 text-blue-700' :
                                                    payment.method === 'UPI' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {getMethodIcon(payment.method)}
                                            </div>
                                            <div>
                                                <p className="text-md font-medium">
                                                    Payment #{payment.id.slice(-8)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {payment.createdAt ? format(new Date(payment.createdAt), "MMM dd, yyyy") : "Date N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {getApprovalStatusBadge(payment.approvalStatus)}
                                            {getPaymentStatusBadge(payment.status)}
                                        </div>
                                    </div>
                                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {/* User Section */}
                                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                                            <div>
                                                <p className="text-md font-medium flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        User
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {payment.user?.name ||
                                                        payment.booking?.user?.name ||
                                                        "Unknown User"}
                                                </p>
                                                <p className="text-xs text-gray-600 truncate">
                                                    {payment.user?.email ||
                                                        payment.booking?.user?.email ||
                                                        "No email"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Role: {payment.user?.role || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment Method Section */}
                                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                                            <div>
                                                <p className="text-md font-medium flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" />
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        Payment
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    PKR {payment.amount?.toLocaleString() || "0"}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Method: {payment.method || "N/A"}
                                                </p>
                                                {payment.transactionId && (
                                                    <p className="text-xs text-gray-500 font-mono">
                                                        Txn: #{payment.transactionId.slice(-8)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Type Section */}
                                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                                            <div>
                                                <p className="text-md font-medium flex items-center gap-2">
                                                    {payment.type === 'booking' ? <Calendar className="w-4 h-4" /> :
                                                        payment.type === 'salary' ? <DollarSign className="w-4 h-4" /> :
                                                            <FileText className="w-4 h-4" />}
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        Type
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-900 capitalize">
                                                    {payment.type || "N/A"}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Status: {payment.status || "N/A"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Approval: {payment.approvalStatus || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Details Section */}
                                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                                            <div>
                                                <p className="text-md font-medium flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        Details
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                {payment.type === "booking" && payment.booking ? (
                                                    <>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Room {payment.booking.room?.roomNumber || "N/A"}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {payment.booking.checkin ? format(new Date(payment.booking.checkin), 'MMM dd') : 'N/A'} — {payment.booking.checkout ? format(new Date(payment.booking.checkout), 'MMM dd, yyyy') : 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Hostel: {payment.booking.hostel?.hostelName || 'N/A'}
                                                        </p>
                                                    </>
                                                ) : payment.type === "salary" && payment.salary ? (
                                                    <>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {payment.salary.staff?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            Period: {payment.salary.payPeriod || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Net: PKR {payment.salary.netAmount?.toLocaleString() || '0'}
                                                        </p>
                                                    </>
                                                ) : payment.type === "expense" && payment.expense ? (
                                                    <>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {payment.expense.title || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            Category: {payment.expense.category || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Hostel: {payment.expense.hostel?.hostelName || 'N/A'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-gray-500">No details available</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions Section */}
                                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                                            <div>
                                                <p className="text-md font-medium flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        Actions
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-xs cursor-pointer "
                                                    onClick={() => { setSelectedPayment(payment); setIsDetailsDialogOpen(true); }}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View Details
                                                </Button>

                                                {payment.approvalStatus === "PENDING" && (
                                                    <div className="space-y-1">
                                                        <Button
                                                            size="sm"
                                                            className="w-full bg-green-500 hover:bg-green-600 cursor-pointer text-white text-xs"
                                                            onClick={() => { setSelectedPayment(payment); setIsApprovalDialogOpen(true); }}
                                                        >
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="w-full text-xs cursor-pointer "
                                                            onClick={() => { setSelectedPayment(payment); setIsRejectionDialogOpen(true); }}
                                                        >
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <hr />
                            <CardFooter>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                                    <div className="text-sm text-muted-foreground">
                                        {/* Payment ID: {payment.id} | Created: {payment.createdAt ? format(new Date(payment.createdAt), "MMM dd, yyyy 'at' h:mm a") : "N/A"} */}
                                        {payment.notes && (
                                            <div className="mt-1">
                                                <span className="font-medium">Notes:</span> {payment.notes}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge
                                            variant="outline"
                                            className="bg-white border-gray-200 text-gray-700 flex items-center gap-1"
                                        >
                                            {getMethodIcon(payment.method)}
                                            <span className="capitalize text-xs">{payment.method?.toLowerCase()}</span>
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={`capitalize text-xs cursor-pointer ${payment.type === 'booking' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                payment.type === 'salary' ? 'bg-green-50  text-green-500 border-green-200' :
                                                    'bg-orange-50 text-orange-500 border-orange-200'
                                                }`}
                                        >
                                            {payment.type}
                                        </Badge>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                    </div>
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
                                    <p><span className="font-medium">{selectedPayment.type === 'salary' ? 'Staff' : 'Guest'}:</span> {selectedPayment.user?.name || 'N/A'}</p>
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
                                    disabled={approvePaymentMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {approvePaymentMutation.isPending ? 'Approving...' : `Approve ${selectedPayment.type === 'salary' ? 'Salary' : 'Payment'}`}
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
                                    <p><span className="font-medium">{selectedPayment.type === 'salary' ? 'Staff' : 'Guest'}:</span> {selectedPayment.user?.name || 'N/A'}</p>
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
                                    disabled={rejectPaymentMutation.isPending || !rejectionReason.trim()}
                                >
                                    {rejectPaymentMutation.isPending ? 'Rejecting...' : `Reject ${selectedPayment.type === 'salary' ? 'Salary' : 'Payment'}`}
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
                                                    <span className="ml-2 text-gray-900">
                                                        {selectedPayment.type === 'booking'
                                                            ? (selectedPayment.booking?.user?.name || 'N/A')
                                                            : (selectedPayment.user?.name || 'N/A')
                                                        }
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 font-medium">Email:</span>
                                                    <span className="ml-2 text-gray-900">
                                                        {selectedPayment.user?.email || 'N/A'}
                                                    </span>
                                                </div>
                                                {selectedPayment.user?.phone && (
                                                    <div>
                                                        <span className="text-gray-600 font-medium">Phone:</span>
                                                        <span className="ml-2 text-gray-900">
                                                            {selectedPayment.user?.phone || 'N/A'}
                                                        </span>
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
