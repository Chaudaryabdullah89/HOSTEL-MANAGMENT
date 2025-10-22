"use client"
import React, { useState, useEffect } from 'react'
import { Users, ChevronDown, Search, Calendar, Clock, User, Building, Save, DollarSign, FileText, Plus, Edit, Trash2, Eye, Filter, RefreshCw, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import ReceiptUpload from '@/components/receipt-upload'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
} from "@/components/ui/alert-dialog"
import { toast } from 'react-hot-toast'
import { useExpenses, useExpenseStats, useCreateExpense, useUpdateExpense, useDeleteExpense, useApproveExpense, useRejectExpense } from '@/hooks/useExpenses'
import { useHostels } from '@/hooks/useHostels'
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from '@/components/ui/loading-skeleton'

const page = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [categoryFilter, setCategoryFilter] = useState('All Category');
    const [hostelFilter, setHostelFilter] = useState('All Hostels');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [uploadError, setUploadError] = useState('');


    const { data: expenses = [], isLoading: expensesLoading, error: expensesError, refetch: refetchExpenses } = useExpenses({
        status: statusFilter !== 'All Status' ? statusFilter : undefined,
        category: categoryFilter !== 'All Category' ? categoryFilter : undefined,
        hostelId: hostelFilter !== 'All Hostels' ? hostelFilter : undefined,
        search: searchTerm || undefined
    });

    const { data: stats, isLoading: statsLoading } = useExpenseStats({
        hostelId: hostelFilter !== 'All Hostels' ? hostelFilter : undefined
    });

    const { data: hostels = [], isLoading: hostelsLoading } = useHostels();

    const createExpenseMutation = useCreateExpense();
    const updateExpenseMutation = useUpdateExpense();
    const deleteExpenseMutation = useDeleteExpense();
    const approveExpenseMutation = useApproveExpense();
    const rejectExpenseMutation = useRejectExpense();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        category: 'MAINTENANCE',
        hostelId: '',
        receiptUrl: '',
        notes: ''
    });


    const handleCreate = (e) => {
        e.preventDefault();

        createExpenseMutation.mutate({
            ...formData,
            amount: parseFloat(formData.amount)
        }, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                setFormData({
                    title: '',
                    description: '',
                    amount: '',
                    category: 'MAINTENANCE',
                    hostelId: '',
                    receiptUrl: '',
                    notes: ''
                });
            }
        });
    };

    // Update expense
    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const response = await fetch(`/api/expenses/${selectedExpense.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            });

            if (response.ok) {
                const updatedExpense = await response.json();
                toast.success('Expense updated successfully');
                setIsEditDialogOpen(false);
                setSelectedExpense(null);

                setExpenses(prev => prev.map(expense =>
                    expense.id === selectedExpense.id ? updatedExpense : expense
                ));

            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to update expense');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            toast.error('Failed to update expense');
        } finally {
            setIsUpdating(false);
        }
    };

    // Delete expense
    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await fetch(`/api/expenses/${selectedExpense.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Expense deleted successfully');
                setIsDeleteDialogOpen(false);
                setSelectedExpense(null);
                refetchExpenses();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Failed to delete expense');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReceiptUploadSuccess = (url, fileName) => {
        setFormData(prev => ({ ...prev, receiptUrl: url }));
        setUploadError('');
    };

    const handleReceiptUploadError = (error) => {
        setUploadError(error);
        toast.error(error);
    };

    const handleReceiptRemove = () => {
        setFormData(prev => ({ ...prev, receiptUrl: '' }));
        setUploadError('');
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesStatus = statusFilter === "All Status" || expense.status === statusFilter;
        const matchesCategory = categoryFilter === "All Category" || expense.category === categoryFilter;
        const matchesHostel = hostelFilter === "All Hostels" || expense.hostelId === hostelFilter;
        const matchesSearch = searchTerm === '' ||
            expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesCategory && matchesHostel && matchesSearch;
    });

    if (expensesLoading || statsLoading || hostelsLoading) {
        return (
            <PageLoadingSkeleton
                title={true}
                statsCards={4}
                filterTabs={4}
                searchBar={true}
                contentCards={5}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between px-4">
                <div className="mt-4">
                    <h1 className="text-2xl sm:text-3xl font-bold">Expense Management</h1>
                    <p className="text-muted-foreground leading-loose text-sm sm:text-base">Track and manage hostel expenses</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 lg:mt-0">
                    <Button
                        variant="outline"
                        className="text-sm sm:text-base"
                        onClick={() => {
                            refetchExpenses();
                            toast.success("Data refreshed!");
                        }}
                        disabled={expensesLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${expensesLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="text-sm sm:text-base"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">New Expense</span>
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-4 gap-3 sm:gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.summary?.totalExpenses || 0}</div>
                        <p className="text-xs text-muted-foreground">All expense requests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.statusBreakdown?.find(s => s.status === 'PENDING')?.count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.statusBreakdown?.find(s => s.status === 'APPROVED')?.count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Approved expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">PKR {stats?.summary?.totalAmount?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">Total expense amount</p>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            {/* {stats && (
                <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.statusBreakdown?.find(s => s.status === 'REJECTED')?.count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Rejected expenses</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                            <CardTitle className="text-sm font-medium">Avg Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">PKR {stats?.summary?.avgAmount?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">Average per expense</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                            <CardTitle className="text-sm font-medium">Recent</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.summary?.recentExpenses || 0}</div>
                            <p className="text-xs text-muted-foreground">Last 7 days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.topCategories?.[0]?.category || 'N/A'}</div>
                            <p className="text-xs text-muted-foreground">Highest spending</p>
                        </CardContent>
                    </Card>
                </div>
            )} */}

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 bg-white p-4 sm:p-6 shadow-sm rounded-md mx-4">
                <div className="sm:col-span-2 lg:col-span-2">
                    <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                    <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search"
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 text-sm sm:text-base"
                        />
                    </div>
                </div>
                <div className="sm:col-span-1 lg:col-span-1">
                    <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="mt-1 text-sm sm:text-base">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Status">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="sm:col-span-1 lg:col-span-1">
                    <Label htmlFor="category-filter" className="text-sm font-medium">Category</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="mt-1 text-sm sm:text-base">
                            <SelectValue placeholder="All Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Category">All Category</SelectItem>
                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                            <SelectItem value="UTILITIES">Utilities</SelectItem>
                            <SelectItem value="SUPPLIES">Supplies</SelectItem>
                            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                            <SelectItem value="MARKETING">Marketing</SelectItem>
                            <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="sm:col-span-1 lg:col-span-1">
                    <Label htmlFor="hostel-filter" className="text-sm font-medium">Hostel</Label>
                    <Select value={hostelFilter} onValueChange={setHostelFilter}>
                        <SelectTrigger className="mt-1 text-sm sm:text-base">
                            <SelectValue placeholder="All Hostels" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Hostels">All Hostels</SelectItem>
                            {hostels.map((hostel) => (
                                <SelectItem key={hostel.id} value={hostel.id}>
                                    <span className="truncate">{hostel.hostelName}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('All Status');
                            setCategoryFilter('All Category');
                            setHostelFilter('All Hostels');
                        }}
                        className="w-full text-sm sm:text-base"
                    >
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Expenses List */}
            <div className="p-4">
                <div className="space-y-4">
                    {filteredExpenses.length > 0 ? (
                        filteredExpenses.map((expense) => (
                            <Card key={expense.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3 mb-4">
                                                <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base sm:text-lg font-semibold break-words">{expense.title}</h3>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                                        Expense #{expense.id.slice(-8)} • {new Date(expense.submittedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 mb-4 text-sm sm:text-base break-words">{expense.description}</p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                                                <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                                                    <Building className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs sm:text-sm font-medium break-words">{expense.hostel?.hostelName}</p>
                                                        <p className="text-xs text-gray-500">Hostel</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                                                    <User className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs sm:text-sm font-medium break-words">{expense.user?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">Submitted by</p>
                                                        <p className="text-xs text-blue-600 break-words">{expense.user?.phone}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                                                    <DollarSign className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs sm:text-sm font-medium">PKR {expense.amount.toLocaleString()}</p>
                                                        <p className="text-xs text-gray-500">{expense.category}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                                                    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs sm:text-sm font-medium break-words">
                                                            {expense.approver ? expense.approver.name : 'Not Approved'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {expense.approver ? 'Approved by' : 'Pending Approval'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Receipt Section */}
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-start gap-2">
                                                        <FileText className={`h-4 w-4 flex-shrink-0 mt-0.5 ${expense.receiptUrl ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                                                                {expense.receiptUrl ? 'Receipt Available' : 'No Receipt Uploaded'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 break-words">
                                                                {expense.receiptUrl
                                                                    ? expense.receiptUrl.split('/').pop()
                                                                    : 'Receipt upload is optional'
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {expense.receiptUrl ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs sm:text-sm w-full sm:w-auto"
                                                            onClick={() => window.open(expense.receiptUrl, '_blank')}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Receipt
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">
                                                            Optional
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 w-full lg:w-auto">
                                            <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
                                                <Badge
                                                    variant={
                                                        expense.category === 'MAINTENANCE' ? 'default' :
                                                            expense.category === 'UTILITIES' ? 'secondary' :
                                                                expense.category === 'SUPPLIES' ? 'outline' :
                                                                    expense.category === 'EQUIPMENT' ? 'destructive' : 'default'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {expense.category}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        expense.status === 'APPROVED' ? 'default' :
                                                            expense.status === 'REJECTED' ? 'destructive' :
                                                                expense.status === 'PENDING' ? 'outline' : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {expense.status}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
                                                <Button
                                                    variant="outline"
                                                    disabled={expense.status !== 'APPROVED'}
                                                    size="sm"
                                                    className="text-xs sm:text-sm"
                                                    onClick={() => {
                                                        setSelectedExpense(expense);
                                                        setIsViewDialogOpen(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 mr-1 sm:mr-2" />
                                                    <span className="hidden sm:inline">View</span>
                                                </Button>
                                                <Button
                                                    disabled={expense.status !== 'APPROVED'}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs sm:text-sm"
                                                    onClick={() => {
                                                        setSelectedExpense(expense);
                                                        setFormData({
                                                            title: expense.title,
                                                            description: expense.description,
                                                            amount: expense.amount.toString(),
                                                            category: expense.category,
                                                            hostelId: expense.hostelId,
                                                            receiptUrl: expense.receiptUrl || '',
                                                            notes: expense.notes || ''
                                                        });
                                                        setIsEditDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs sm:text-sm"
                                                    onClick={() => {
                                                        setSelectedExpense(expense);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                                                    <span className="hidden sm:inline">Delete</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8 sm:py-12 px-4">
                            <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                            <p className="text-sm sm:text-base text-gray-500 mb-4 max-w-md mx-auto">
                                {searchTerm || statusFilter !== 'All Status' || categoryFilter !== 'All Category' || hostelFilter !== 'All Hostels'
                                    ? 'Try adjusting your filters to see more results.'
                                    : 'Get started by creating a new expense.'}
                            </p>
                            <Button
                                onClick={() => setIsCreateDialogOpen(true)}
                                className="text-sm sm:text-base"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Expense
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Expense Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col">
                    <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                        <DialogTitle className="text-lg sm:text-xl font-semibold">
                            Create New Expense
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 text-sm sm:text-base">
                            Submit a new expense request for approval.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 pt-2" style={{ maxHeight: '70vh' }}>
                        <form className="space-y-4" onSubmit={handleCreate}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                                        Title *
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Brief description of the expense"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                                        Amount (PKR) *
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                    Description *
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    placeholder="Detailed description of the expense"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                                        Category *
                                    </Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                            <SelectItem value="UTILITIES">Utilities</SelectItem>
                                            <SelectItem value="SUPPLIES">Supplies</SelectItem>
                                            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                            <SelectItem value="MARKETING">Marketing</SelectItem>
                                            <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hostel" className="text-sm font-medium text-gray-700">
                                        Hostel *
                                    </Label>
                                    <Select value={formData.hostelId} onValueChange={(value) => setFormData(prev => ({ ...prev, hostelId: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select hostel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hostels.map((hostel) => (
                                                <SelectItem key={hostel.id} value={hostel.id}>
                                                    {hostel.hostelName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Receipt Upload <span className="text-gray-400">(Optional)</span>
                                    </Label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Upload a receipt or supporting document for this expense (Optional)
                                    </p>
                                    <ReceiptUpload
                                        onUploadSuccess={handleReceiptUploadSuccess}
                                        onUploadError={handleReceiptUploadError}
                                        currentFile={formData.receiptUrl}
                                        onRemove={handleReceiptRemove}
                                    />
                                    {uploadError && (
                                        <p className="text-sm text-red-600">{uploadError}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                                        Additional Notes
                                    </Label>
                                    <Input
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Any additional notes..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createExpenseMutation.isPending}
                                >
                                    {createExpenseMutation.isPending ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Expense
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Expense Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col">
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle className="text-xl font-semibold">
                            Edit Expense
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Update the expense details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="overflow-y-auto px-6 pb-6 pt-2" style={{ maxHeight: '70vh' }}>
                        <form className="space-y-4" onSubmit={handleUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">
                                        Title *
                                    </Label>
                                    <Input
                                        id="edit-title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enter expense title"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-amount" className="text-sm font-medium text-gray-700">
                                        Amount (PKR) *
                                    </Label>
                                    <Input
                                        id="edit-amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
                                    Description *
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    placeholder="Describe the expense in detail..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-category" className="text-sm font-medium text-gray-700">
                                        Category *
                                    </Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                            <SelectItem value="UTILITIES">Utilities</SelectItem>
                                            <SelectItem value="SUPPLIES">Supplies</SelectItem>
                                            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                                            <SelectItem value="MARKETING">Marketing</SelectItem>
                                            <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-status" className="text-sm font-medium text-gray-700">
                                        Status
                                    </Label>
                                    <Select value={formData.status || 'PENDING'} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="APPROVED">Approved</SelectItem>
                                            <SelectItem value="REJECTED">Rejected</SelectItem>
                                            <SelectItem value="PAID">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-hostel" className="text-sm font-medium text-gray-700">
                                    Hostel *
                                </Label>
                                <Select value={formData.hostelId} onValueChange={(value) => setFormData(prev => ({ ...prev, hostelId: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select hostel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hostels.map((hostel) => (
                                            <SelectItem key={hostel.id} value={hostel.id}>
                                                {hostel.hostelName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Receipt Upload <span className="text-gray-400">(Optional)</span>
                                    </Label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Upload a receipt or supporting document for this expense
                                    </p>
                                    <ReceiptUpload
                                        onUploadSuccess={handleReceiptUploadSuccess}
                                        onUploadError={handleReceiptUploadError}
                                        currentFile={formData.receiptUrl}
                                        onRemove={handleReceiptRemove}
                                    />
                                    {uploadError && (
                                        <p className="text-sm text-red-600">{uploadError}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-notes" className="text-sm font-medium text-gray-700">
                                        Additional Notes
                                    </Label>
                                    <Input
                                        id="edit-notes"
                                        value={formData.notes || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Any additional notes..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Update Expense
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Expense Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Expense Details</DialogTitle>
                        <DialogDescription>
                            View detailed information about the expense.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedExpense && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Title</Label>
                                    <p className="text-sm text-gray-900">{selectedExpense.title}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Amount</Label>
                                    <p className="text-sm text-gray-900">PKR {selectedExpense.amount.toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-gray-900">{selectedExpense.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Category</Label>
                                    <Badge variant={
                                        selectedExpense.category === 'MAINTENANCE' ? 'default' :
                                            selectedExpense.category === 'UTILITIES' ? 'secondary' :
                                                selectedExpense.category === 'SUPPLIES' ? 'outline' :
                                                    selectedExpense.category === 'EQUIPMENT' ? 'destructive' : 'default'
                                    }>
                                        {selectedExpense.category}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Badge variant={
                                        selectedExpense.status === 'APPROVED' ? 'default' :
                                            selectedExpense.status === 'REJECTED' ? 'destructive' :
                                                selectedExpense.status === 'PENDING' ? 'outline' : 'secondary'
                                    }>
                                        {selectedExpense.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Hostel</Label>
                                    <p className="text-sm text-gray-900">{selectedExpense.hostel?.hostelName}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Submitted By</Label>
                                    <p className="text-sm text-gray-900">{selectedExpense.user?.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{selectedExpense.user?.phone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Submitted At</Label>
                                    <p className="text-sm text-gray-900">{new Date(selectedExpense.submittedAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Approved By</Label>
                                    <p className="text-sm text-gray-900">{selectedExpense.approver?.name || 'Not Approved'}</p>
                                    {selectedExpense.approver && (
                                        <p className="text-xs text-gray-500">{selectedExpense.approver.phone}</p>
                                    )}
                                </div>
                            </div>

                            {selectedExpense.approvedAt && (
                                <div>
                                    <Label className="text-sm font-medium">Approved At</Label>
                                    <p className="text-sm text-gray-900">{new Date(selectedExpense.approvedAt).toLocaleString()}</p>
                                </div>
                            )}

                            {selectedExpense.receiptUrl && (
                                <div>
                                    <Label className="text-sm font-medium">Receipt</Label>
                                    <a
                                        href={selectedExpense.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View Receipt
                                    </a>
                                </div>
                            )}

                            {selectedExpense.notes && (
                                <div>
                                    <Label className="text-sm font-medium">Notes</Label>
                                    <p className="text-sm text-gray-900">{selectedExpense.notes}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                                    Close
                                </Button>
                                <Button onClick={() => {
                                    setIsViewDialogOpen(false);
                                    setFormData({
                                        title: selectedExpense.title,
                                        description: selectedExpense.description,
                                        amount: selectedExpense.amount.toString(),
                                        category: selectedExpense.category,
                                        hostelId: selectedExpense.hostelId,
                                        receiptUrl: selectedExpense.receiptUrl || '',
                                        notes: selectedExpense.notes || '',
                                        status: selectedExpense.status
                                    });
                                    setIsEditDialogOpen(true);
                                }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Expense
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this expense? This action cannot be undone.
                            {selectedExpense && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                    <p className="font-medium">{selectedExpense.title}</p>
                                    <p className="text-sm text-gray-600">
                                        PKR {selectedExpense.amount.toLocaleString()} • {selectedExpense.category}
                                    </p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Expense
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default page