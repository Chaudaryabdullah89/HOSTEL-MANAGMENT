"use client"
import React, { useState, useEffect } from 'react'
import { Users, ChevronDown, Search, Calendar, Clock, User, Bed, Wrench, AlertTriangle, CheckCircle, Plus, Edit, Trash2, Eye, Filter, RefreshCw, DollarSign, TrendingUp } from 'lucide-react'
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
import { useMaintenance, useMaintenanceStats, useCreateMaintenance, useUpdateMaintenance, useDeleteMaintenance } from '@/hooks/useMaintenance'
import { useHostelsData, useStaffData, useRoomsByHostel } from '@/lib/contexts/AppDataContext'
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from '@/components/ui/loading-skeleton'

const page = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [priorityFilter, setPriorityFilter] = useState('All Priority');
    const [hostelFilter, setHostelFilter] = useState('All Hostels');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        roomId: 'general',
        hostelId: '',
        estimatedCost: '',
        assignedTo: 'unassigned',
        status: 'PENDING',
        actualCost: '',
        notes: ''
    });

    const { data: maintenanceRequests = [], isLoading: maintenanceLoading, error: maintenanceError, refetch: refetchMaintenance } = useMaintenance({
        status: statusFilter !== 'All Status' ? statusFilter : undefined,
        priority: priorityFilter !== 'All Priority' ? priorityFilter : undefined,
        hostelId: hostelFilter !== 'All Hostels' ? hostelFilter : undefined,
        search: searchTerm || undefined
    });

    const { data: stats, isLoading: statsLoading, error: statsError } = useMaintenanceStats({
        hostelId: hostelFilter !== 'All Hostels' ? hostelFilter : undefined
    });

    const { data: hostels = [], isLoading: hostelsLoading, error: hostelsError } = useHostelsData();
    const { data: staff = [], isLoading: staffLoading, error: staffError } = useStaffData();

    // Set loading state based on any loading query
    const isLoading = maintenanceLoading || statsLoading || hostelsLoading || staffLoading;

    const fetchData = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetchMaintenance(),
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
            toast.error('Failed to refresh data');
        } finally {
            setRefreshing(false);
        }
    };

    const { data: rooms = [], isLoading: roomsLoading } = useRoomsByHostel(
        formData.hostelId && formData.hostelId !== 'All Hostels' ? formData.hostelId : null
    );

    const createMaintenanceMutation = useCreateMaintenance();
    const updateMaintenanceMutation = useUpdateMaintenance();
    const deleteMaintenanceMutation = useDeleteMaintenance();


    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteMaintenanceMutation.mutateAsync(selectedMaintenance.id);
            setIsDeleteDialogOpen(false);
            setSelectedMaintenance(null);
        } catch (error) {
            console.error('Error deleting maintenance request:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredRequests = maintenanceRequests.filter(req => {
        const matchesStatus = statusFilter === "All Status" || req.status === statusFilter;
        const matchesPriority = priorityFilter === "All Priority" || req.priority === priorityFilter;
        const matchesHostel = hostelFilter === "All Hostels" || req.hostelId === hostelFilter;
        const matchesSearch = searchTerm === '' ||
            req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.room?.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesPriority && matchesHostel && matchesSearch;
    });

    if (isLoading) {
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
            {/* Header */}
            <div className="flex md:flex-row flex-col justify-between px-4">
                <div className="mt-4">
                    <h1 className="text-3xl font-bold">Maintenance Management</h1>
                    <p className="text-muted-foreground leading-loose">Manage maintenance requests and track repairs</p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Button 
                        variant="outline" 
                        onClick={() => fetchData()}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Request
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.summary?.totalRequests || 0}</div>
                        <p className="text-xs text-muted-foreground">All maintenance requests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.statusBreakdown?.find(s => s.status === 'PENDING')?.count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Pending requests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.statusBreakdown?.find(s => s.status === 'COMPLETED')?.count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Resolved requests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.statusBreakdown?.find(s => s.status === 'IN_PROGRESS')?.count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently being fixed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            {/* {stats && (
                <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.summary.avgResolutionTime || 0} days</div>
                            <p className="text-xs text-muted-foreground">Average resolution time</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">PKR {stats.summary.totalCost?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">Total maintenance cost</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                            <CardTitle className="text-sm font-medium">Recent Requests</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.summary.recentRequests || 0}</div>
                            <p className="text-xs text-muted-foreground">Last 7 days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                            <CardTitle className="text-sm font-medium">Avg Cost</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">PKR {stats.summary.avgCost?.toLocaleString() || 0}</div>
                            <p className="text-xs text-muted-foreground">Per request</p>
                        </CardContent>
                    </Card>
                </div>
            )} */}

            {/* Filters */}
            <div className="bg-white p-6 shadow-sm rounded-md mx-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {/* Search */}
                    <div className="md:col-span-3 flex flex-col justify-end">
                        <Label htmlFor="search" className="mb-1">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Search requests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    {/* Status */}
                    <div className="flex flex-col justify-end">
                        <Label htmlFor="status-filter" className="mb-1">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All Status">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Priority */}
                    <div className="flex flex-col justify-end">
                        <Label htmlFor="priority-filter" className="mb-1">Priority</Label>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All Priority">All Priority</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Hostel */}
                    <div className="flex flex-col justify-end">
                        <Label htmlFor="hostel-filter" className="mb-1">Hostel</Label>
                        <Select value={hostelFilter} onValueChange={setHostelFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Hostels" />
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
                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('All Status');
                                setPriorityFilter('All Priority');
                                setHostelFilter('All Hostels');
                            }}
                            className="w-full"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Maintenance Requests List */}
            <div className="p-4">
                <div className="space-y-4">
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map((req) => (
                            <Card key={req.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Wrench className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <h3 className="text-lg font-semibold">{req.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Request #{req.id} • {new Date(req.reportedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-700 mb-4">{req.description}</p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Bed className="h-4 w-4 text-gray-500" />
                                                <div>
                                                        <p className="text-sm font-medium">
                                                            {req.room ? `Room ${req.room.roomNumber}` : 'General'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {req.room ? `${req.room.type} • Floor ${req.room.floor}` : req.hostel?.hostelName}
                                                    </p>
                                                </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">{req.user?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">Reported by</p>
                                            </div>
                                                </div>
                                                
                                                {req.assignee && (
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                <div>
                                                            <p className="text-sm font-medium">{req.assignee.name}</p>
                                                            <p className="text-xs text-gray-500">Assigned to</p>
                                                </div>
                                            </div>
                                                )}
                                                
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                                <div>
                                                        <p className="text-sm font-medium">
                                                            {req.actualCost ? `PKR ${req.actualCost.toLocaleString()}` : 
                                                             req.estimatedCost ? `Est. PKR ${req.estimatedCost.toLocaleString()}` : 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Cost</p>
                                                </div>
                                                </div>
                                            </div>
                                                </div>
                                        
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <Badge 
                                                    variant={
                                                        req.priority === 'URGENT' ? 'destructive' :
                                                        req.priority === 'HIGH' ? 'default' :
                                                        req.priority === 'MEDIUM' ? 'secondary' : 'outline'
                                                    }
                                                >
                                                    {req.priority}
                                                </Badge>
                                                <Badge 
                                                    variant={
                                                        req.status === 'COMPLETED' ? 'default' :
                                                        req.status === 'IN_PROGRESS' ? 'secondary' :
                                                        req.status === 'PENDING' ? 'outline' : 'destructive'
                                                    }
                                                >
                                                    {req.status.replace('_', ' ')}
                                                </Badge>
                                                </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedMaintenance(req);
                                                        setIsViewDialogOpen(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedMaintenance(req);
                                                         setFormData({
                                                             title: req.title,
                                                             description: req.description,
                                                             priority: req.priority,
                                                             roomId: req.roomId || 'general',
                                                             hostelId: req.hostelId,
                                                             estimatedCost: req.estimatedCost?.toString() || '',
                                                             assignedTo: req.assignedTo || 'unassigned',
                                                             status: req.status,
                                                             actualCost: req.actualCost?.toString() || '',
                                                             notes: req.notes || ''
                                                         });
                                                        setIsEditDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedMaintenance(req);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || statusFilter !== 'All Status' || priorityFilter !== 'All Priority' || hostelFilter !== 'All Hostels'
                                    ? 'Try adjusting your filters to see more results.'
                                    : 'Get started by creating a new maintenance request.'}
                            </p>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Request
                            </Button>
                        </div>
                    )}
                </div>
            </div>


            

            {/* View Maintenance Request Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Maintenance Request Details</DialogTitle>
                        <DialogDescription>
                            View detailed information about the maintenance request.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedMaintenance && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Title</Label>
                                    <p className="text-sm text-gray-900">{selectedMaintenance.title}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Priority</Label>
                                    <Badge variant={
                                        selectedMaintenance.priority === 'URGENT' ? 'destructive' :
                                        selectedMaintenance.priority === 'HIGH' ? 'default' :
                                        selectedMaintenance.priority === 'MEDIUM' ? 'secondary' : 'outline'
                                    }>
                                        {selectedMaintenance.priority}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-gray-900">{selectedMaintenance.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Room</Label>
                                    <p className="text-sm text-gray-900">
                                        {selectedMaintenance.room ? 
                                            `Room ${selectedMaintenance.room.roomNumber} - ${selectedMaintenance.room.type}` : 
                                            'General Area'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Hostel</Label>
                                    <p className="text-sm text-gray-900">{selectedMaintenance.hostel?.hostelName}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Reported By</Label>
                                    <p className="text-sm text-gray-900">{selectedMaintenance.user?.name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Assigned To</Label>
                                    <p className="text-sm text-gray-900">{selectedMaintenance.assignee?.name || 'Unassigned'}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Reported At</Label>
                                    <p className="text-sm text-gray-900">{new Date(selectedMaintenance.reportedAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Badge variant={
                                        selectedMaintenance.status === 'COMPLETED' ? 'default' :
                                        selectedMaintenance.status === 'IN_PROGRESS' ? 'secondary' :
                                        selectedMaintenance.status === 'PENDING' ? 'outline' : 'destructive'
                                    }>
                                        {selectedMaintenance.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            
                            {selectedMaintenance.startedAt && (
                                <div>
                                    <Label className="text-sm font-medium">Started At</Label>
                                    <p className="text-sm text-gray-900">{new Date(selectedMaintenance.startedAt).toLocaleString()}</p>
                                </div>
                            )}
                            
                            {selectedMaintenance.completedAt && (
                                <div>
                                    <Label className="text-sm font-medium">Completed At</Label>
                                    <p className="text-sm text-gray-900">{new Date(selectedMaintenance.completedAt).toLocaleString()}</p>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Estimated Cost</Label>
                                    <p className="text-sm text-gray-900">
                                        {selectedMaintenance.estimatedCost ? `PKR ${selectedMaintenance.estimatedCost.toLocaleString()}` : 'Not specified'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Actual Cost</Label>
                                    <p className="text-sm text-gray-900">
                                        {selectedMaintenance.actualCost ? `PKR ${selectedMaintenance.actualCost.toLocaleString()}` : 'Not recorded'}
                                    </p>
                                </div>
                            </div>
                            
                            {selectedMaintenance.notes && (
                                <div>
                                    <Label className="text-sm font-medium">Notes</Label>
                                    <p className="text-sm text-gray-900">{selectedMaintenance.notes}</p>
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                                    Close
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
                        <AlertDialogTitle>Delete Maintenance Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this maintenance request? This action cannot be undone.
                            {selectedMaintenance && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                    <p className="font-medium">{selectedMaintenance.title}</p>
                                    <p className="text-sm text-gray-600">
                                        Request #{selectedMaintenance.id} • {selectedMaintenance.room ? `Room ${selectedMaintenance.room.roomNumber}` : 'General Area'}
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
                                    Delete Request
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