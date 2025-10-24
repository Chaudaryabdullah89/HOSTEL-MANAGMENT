"use client"
import React, { useState, useEffect, useContext } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    Clock,
    Search,
    Plus,
    Eye,
    RefreshCw,
    Calendar,
    MapPin,
    User,
    Image,
    Send,
    XCircle,
    Flag,
    Star
} from "lucide-react";
import { PageLoadingSkeleton, LoadingSpinner } from "@/components/ui/loading-skeleton";
import { SessionContext } from "@/app/context/sessiondata";

const statusOptions = ["All Status", "PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const categoryOptions = ["GENERAL", "MAINTENANCE", "NOISE", "CLEANLINESS", "SECURITY", "OTHER"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const statusColor = (status) => {
    switch (status) {
        case "PENDING":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "IN_PROGRESS":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "RESOLVED":
            return "bg-green-100 text-green-800 border-green-200";
        case "CLOSED":
            return "bg-gray-100 text-gray-800 border-gray-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const priorityColor = (priority) => {
    switch (priority) {
        case "LOW":
            return "bg-green-100 text-green-800 border-green-200";
        case "MEDIUM":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "HIGH":
            return "bg-orange-100 text-orange-800 border-orange-200";
        case "URGENT":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const categoryColor = (category) => {
    switch (category) {
        case "GENERAL":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "MAINTENANCE":
            return "bg-orange-100 text-orange-800 border-orange-200";
        case "NOISE":
            return "bg-red-100 text-red-800 border-red-200";
        case "CLEANLINESS":
            return "bg-green-100 text-green-800 border-green-200";
        case "SECURITY":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "OTHER":
            return "bg-gray-100 text-gray-800 border-gray-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case "PENDING":
            return <Clock className="w-4 h-4" />;
        case "IN_PROGRESS":
            return <MessageSquare className="w-4 h-4" />;
        case "RESOLVED":
            return <CheckCircle className="w-4 h-4" />;
        case "CLOSED":
            return <XCircle className="w-4 h-4" />;
        default:
            return <Clock className="w-4 h-4" />;
    }
};

const getPriorityIcon = (priority) => {
    switch (priority) {
        case "LOW":
            return <CheckCircle className="w-4 h-4" />;
        case "MEDIUM":
            return <Clock className="w-4 h-4" />;
        case "HIGH":
            return <AlertTriangle className="w-4 h-4" />;
        case "URGENT":
            return <Flag className="w-4 h-4" />;
        default:
            return <Clock className="w-4 h-4" />;
    }
};

const getCategoryIcon = (category) => {
    switch (category) {
        case "GENERAL":
            return <MessageSquare className="w-4 h-4" />;
        case "MAINTENANCE":
            return <AlertTriangle className="w-4 h-4" />;
        case "NOISE":
            return <Flag className="w-4 h-4" />;
        case "CLEANLINESS":
            return <Star className="w-4 h-4" />;
        case "SECURITY":
            return <User className="w-4 h-4" />;
        case "OTHER":
            return <MessageSquare className="w-4 h-4" />;
        default:
            return <MessageSquare className="w-4 h-4" />;
    }
};

const page = () => {
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState("All Status");
    const [searchTerm, setSearchTerm] = useState("");
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Get current user session
    const { session } = useContext(SessionContext);
    const currentUserId = session?.user?.id;

    // Create complaint form state
    const [createForm, setCreateForm] = useState({
        title: "",
        description: "",
        category: "GENERAL",
        priority: "MEDIUM",
        roomId: "",
        hostelId: "",
        images: []
    });

    // Get user's bookings to populate room and hostel options
    const [userBookings, setUserBookings] = useState([]);

    // Fetch complaints and user bookings
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch complaints
                const complaintsResponse = await fetch('/api/complaints');
                if (complaintsResponse.ok) {
                    const complaintsData = await complaintsResponse.json();
                    console.log('Fetched complaints:', complaintsData);
                    setComplaints(complaintsData.complaints || complaintsData);
                }

                // Fetch user bookings to get room and hostel options
                const bookingsResponse = await fetch('/api/booking/getallbooking');
                if (bookingsResponse.ok) {
                    const bookingsData = await bookingsResponse.json();
                    const userBookingsData = bookingsData.filter(booking => booking.userId === currentUserId);
                    console.log('Fetched user bookings:', userBookingsData);
                    setUserBookings(userBookingsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUserId]);

    // Filter complaints by current user
    const userComplaints = complaints?.filter(complaint =>
        complaint.user?.id === currentUserId || complaint.reportedBy === currentUserId
    ) || [];

    console.log('Current user ID:', currentUserId);
    console.log('User complaints:', userComplaints);

    const filteredComplaints = userComplaints.filter((complaint) => {
        const matchesStatus =
            activeStatus === "All Status" || complaint.status === activeStatus;
        const matchesSearch =
            complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.hostel?.hostelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.category?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            // Fetch complaints
            const complaintsResponse = await fetch('/api/complaints');
            if (complaintsResponse.ok) {
                const complaintsData = await complaintsResponse.json();
                setComplaints(complaintsData.complaints || complaintsData);
            }

            // Fetch user bookings
            const bookingsResponse = await fetch('/api/booking/getallbooking');
            if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json();
                const userBookingsData = bookingsData.filter(booking => booking.userId === currentUserId);
                setUserBookings(userBookingsData);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (complaint) => {
        setSelectedComplaint(complaint);
        setShowDetails(true);
    };

    const handleCreateComplaint = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/complaints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(createForm),
            });

            if (response.ok) {
                const newComplaint = await response.json();
                setComplaints(prev => [newComplaint, ...prev]);
                setShowCreateForm(false);
                setCreateForm({
                    title: "",
                    description: "",
                    category: "GENERAL",
                    priority: "MEDIUM",
                    roomId: "",
                    hostelId: "",
                    images: []
                });
                alert('Complaint submitted successfully!');
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error creating complaint:', error);
            alert('Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    // Show loading state while data is being fetched
    if (loading) {
        return (
            <PageLoadingSkeleton
                title={true}
                statsCards={4}
                filterTabs={4}
                searchBar={true}
                contentCards={4}
            />
        );
    }

    return (
        <div className="w-full p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Complaints & Feedback</h2>
                    <p className="text-muted-foreground">Report issues and provide feedback</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Complaint
                    </Button>
                </div>
            </div>

            {/* Debug Panel */}
            <Card className="bg-blue-50 border-blue-200 mb-4">
                <CardContent className="p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Debug Information</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                        <p>Current User ID: {currentUserId || 'Not logged in'}</p>
                        <p>Total complaints from API: {complaints?.length || 0}</p>
                        <p>User complaints (filtered): {userComplaints?.length || 0}</p>
                        <p>Filtered complaints: {filteredComplaints.length}</p>
                        <p>User bookings: {userBookings?.length || 0}</p>
                        <p>Loading: {loading ? 'Yes' : 'No'}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                                <p className="text-2xl font-bold">{userComplaints.length}</p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold">{userComplaints.filter(c => c.status === 'PENDING').length}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold">{userComplaints.filter(c => c.status === 'IN_PROGRESS').length}</p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                                <p className="text-2xl font-bold">{userComplaints.filter(c => c.status === 'RESOLVED').length}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex gap-2">
                    {statusOptions.map((status) => (
                        <Button
                            key={status}
                            variant={activeStatus === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveStatus(status)}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search by title, description, room, or hostel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <Search className="w-4 h-4 text-muted-foreground" />
                </div>
            </div>

            {/* Complaints List */}
            {filteredComplaints.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No complaints found.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            {userComplaints.length === 0 ? 'You have no complaints yet.' : 'Try adjusting your filters.'}
                        </p>
                        {userComplaints.length === 0 && (
                            <div className="mt-4">
                                {userBookings.length === 0 ? (
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            You need to have bookings to submit complaints.
                                        </p>
                                        <Button
                                            onClick={() => window.location.href = '/dashboard/guest/bookings'}
                                            variant="outline"
                                        >
                                            View My Bookings
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => setShowCreateForm(true)}
                                        className="mt-4"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Submit Your First Complaint
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredComplaints.map((complaint) => (
                        <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-lg">{complaint.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(complaint.createdAt)}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className={`${statusColor(complaint.status)} flex items-center gap-1`}>
                                        {getStatusIcon(complaint.status)}
                                        {complaint.status}
                                    </Badge>
                                    <Badge className={`${priorityColor(complaint.priority)} flex items-center gap-1`}>
                                        {getPriorityIcon(complaint.priority)}
                                        {complaint.priority}
                                    </Badge>
                                    <Badge className={`${categoryColor(complaint.category)} flex items-center gap-1`}>
                                        {getCategoryIcon(complaint.category)}
                                        {complaint.category}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">{complaint.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Location</p>
                                            <p className="text-sm text-muted-foreground">
                                                {complaint.room?.roomNumber || 'N/A'} - {complaint.hostel?.hostelName || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Assigned To</p>
                                            <p className="text-sm text-muted-foreground">
                                                {complaint.assignee?.name || 'Not assigned'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Response</p>
                                            <p className="text-sm text-muted-foreground">
                                                {complaint.adminReply ? 'Replied' : 'No response yet'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {complaint.images && complaint.images.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-sm font-medium mb-2">Images</p>
                                        <div className="flex gap-2">
                                            {complaint.images.map((image, index) => (
                                                <div key={index} className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                                    <Image className="w-6 h-6 text-gray-400" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {complaint.adminReply && (
                                    <div className="pt-2 border-t">
                                        <p className="text-sm font-medium mb-2">Admin Response</p>
                                        <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                                            {complaint.adminReply}
                                        </p>
                                        {complaint.repliedAt && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Replied on: {formatDate(complaint.repliedAt)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewDetails(complaint)}
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Details
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Complaint Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl">Submit Complaint</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCreateForm(false)}
                            >
                                ✕
                            </Button>
                        </CardHeader>
                        <form onSubmit={handleCreateComplaint}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={createForm.title}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Brief description of the issue"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <select
                                            id="category"
                                            value={createForm.category}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            {categoryOptions.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={createForm.description}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Detailed description of the complaint"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <select
                                            id="priority"
                                            value={createForm.priority}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value }))}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            {priorityOptions.map(priority => (
                                                <option key={priority} value={priority}>{priority}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hostelId">Select Hostel *</Label>
                                        <select
                                            id="hostelId"
                                            value={createForm.hostelId}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, hostelId: e.target.value }))}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        >
                                            <option value="">Choose a hostel...</option>
                                            {userBookings.map((booking) => (
                                                <option key={booking.hostelId} value={booking.hostelId}>
                                                    {booking.hostel?.hostelName || `Hostel ${booking.hostelId}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="roomId">Select Room (Optional)</Label>
                                    <select
                                        id="roomId"
                                        value={createForm.roomId}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, roomId: e.target.value }))}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="">Choose a room...</option>
                                        {userBookings
                                            .filter(booking => !createForm.hostelId || booking.hostelId === createForm.hostelId)
                                            .map((booking) => (
                                                <option key={booking.roomId} value={booking.roomId}>
                                                    Room {booking.room?.roomNumber || booking.roomId}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <LoadingSpinner className="w-4 h-4 mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Complaint
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}

            {/* Complaint Details Modal */}
            {showDetails && selectedComplaint && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl">Complaint Details</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDetails(false)}
                            >
                                ✕
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Complaint Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Complaint Information</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Title:</span> {selectedComplaint.title}</p>
                                        <p><span className="font-medium">Status:</span>
                                            <Badge className={`ml-2 ${statusColor(selectedComplaint.status)}`}>
                                                {selectedComplaint.status}
                                            </Badge>
                                        </p>
                                        <p><span className="font-medium">Priority:</span>
                                            <Badge className={`ml-2 ${priorityColor(selectedComplaint.priority)}`}>
                                                {selectedComplaint.priority}
                                            </Badge>
                                        </p>
                                        <p><span className="font-medium">Category:</span>
                                            <Badge className={`ml-2 ${categoryColor(selectedComplaint.category)}`}>
                                                {selectedComplaint.category}
                                            </Badge>
                                        </p>
                                        <p><span className="font-medium">Created:</span> {formatDate(selectedComplaint.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Location & Assignment</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Room:</span> {selectedComplaint.room?.roomNumber || 'N/A'}</p>
                                        <p><span className="font-medium">Hostel:</span> {selectedComplaint.hostel?.hostelName || 'N/A'}</p>
                                        <p><span className="font-medium">Assigned To:</span> {selectedComplaint.assignee?.name || 'Not assigned'}</p>
                                        <p><span className="font-medium">Response:</span> {selectedComplaint.adminReply ? 'Replied' : 'No response yet'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="font-semibold">Description</h3>
                                <p className="text-sm text-muted-foreground">{selectedComplaint.description}</p>
                            </div>

                            {/* Admin Response */}
                            {selectedComplaint.adminReply && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Admin Response</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground">{selectedComplaint.adminReply}</p>
                                        {selectedComplaint.repliedAt && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Replied on: {formatDate(selectedComplaint.repliedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Images */}
                            {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Images</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {selectedComplaint.images.map((image, index) => (
                                            <div key={index} className="w-full h-24 bg-gray-100 rounded border flex items-center justify-center">
                                                <Image className="w-8 h-8 text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant="outline" onClick={() => setShowDetails(false)}>
                                Close
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default page;
