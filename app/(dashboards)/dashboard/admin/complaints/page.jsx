"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  ChevronDown,
  Search,
  Calendar,
  Clock,
  User,
  Bed,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  Reply,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";
import {
  useComplaints,
  useComplaintStats,
  useCreateComplaint,
  useUpdateComplaint,
  useDeleteComplaint,
  useReplyToComplaint,
} from "@/hooks/useComplaints";
import {
  useHostelsData,
  useStaffData,
  useRoomsByHostel,
} from "@/lib/contexts/AppDataContext";
import {
  PageLoadingSkeleton,
  LoadingSpinner,
  ItemLoadingOverlay,
} from "@/components/ui/loading-skeleton";

const page = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [hostelFilter, setHostelFilter] = useState("All Hostels");
  const [replyFilter, setReplyFilter] = useState("All Replies");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [sortBy, setSortBy] = useState("newest");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "GENERAL",
    priority: "MEDIUM",
    status: "SUBMITTED",
    roomId: "general",
    hostelId: "",
    images: [],
  });

  const {
    data: complaintsData = {},
    isLoading: complaintsLoading,
    error: complaintsError,
    refetch: refetchComplaints,
  } = useComplaints();
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useComplaintStats();

  const {
    data: hostels = [],
    isLoading: hostelsLoading,
    error: hostelsError,
  } = useHostelsData();
  const {
    data: staff = [],
    isLoading: staffLoading,
    error: staffError,
  } = useStaffData();

  // Set loading state based on any loading query
  const isLoading =
    complaintsLoading || statsLoading || hostelsLoading || staffLoading;

  // Client-side filtering
  const filteredComplaints = React.useMemo(() => {
    if (!complaintsData.complaints) return [];

    let filtered = [...complaintsData.complaints];

    // Filter by status
    if (statusFilter !== "All Status") {
      filtered = filtered.filter(
        (complaint) => complaint.status === statusFilter,
      );
    }

    // Filter by priority
    if (priorityFilter !== "All Priority") {
      filtered = filtered.filter(
        (complaint) => complaint.priority === priorityFilter,
      );
    }

    // Filter by hostel
    if (hostelFilter !== "All Hostels") {
      filtered = filtered.filter(
        (complaint) => complaint.hostelId === hostelFilter,
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (complaint) =>
          complaint.title.toLowerCase().includes(searchLower) ||
          complaint.description.toLowerCase().includes(searchLower) ||
          complaint.user?.name?.toLowerCase().includes(searchLower) ||
          complaint.user?.email?.toLowerCase().includes(searchLower) ||
          complaint.room?.roomNumber?.toLowerCase().includes(searchLower) ||
          (complaint.adminReply &&
            complaint.adminReply.toLowerCase().includes(searchLower)),
      );
    }

    // Filter by date

    return filtered;
  }, [
    complaintsData.complaints,
    statusFilter,
    priorityFilter,
    categoryFilter,
    hostelFilter,
    replyFilter,
    searchTerm,
    dateFilter,
  ]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchComplaints()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const { data: rooms = [], isLoading: roomsLoading } = useRoomsByHostel(
    formData.hostelId && formData.hostelId !== "All Hostels"
      ? formData.hostelId
      : null,
  );

  const createComplaintMutation = useCreateComplaint();
  const updateComplaintMutation = useUpdateComplaint();
  const deleteComplaintMutation = useDeleteComplaint();
  const replyToComplaintMutation = useReplyToComplaint();

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      await createComplaintMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "GENERAL",
        priority: "MEDIUM",
        roomId: "general",
        hostelId: "",
        images: [],
      });
    } catch (error) {
      console.error("Error creating complaint:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateComplaintMutation.mutateAsync({
        id: selectedComplaint.id,
        data: {
          status: formData.status,
          priority: formData.priority,
          assignedTo: formData.roomId !== "unassigned" ? formData.roomId : null,
        },
      });
      setIsEditDialogOpen(false);
      setSelectedComplaint(null);
    } catch (error) {
      console.error("Error updating complaint:", error);
    }
  };

  const handleReply = async () => {
    try {
      await replyToComplaintMutation.mutateAsync({
        id: selectedComplaint.id,
        adminReply: replyText,
      });
      setIsReplyDialogOpen(false);
      setReplyText("");
      setSelectedComplaint(null);
    } catch (error) {
      console.error("Error replying to complaint:", error);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteComplaintMutation.mutateAsync(selectedComplaint.id);
      setIsDeleteDialogOpen(false);
      setSelectedComplaint(null);
    } catch (error) {
      console.error("Error deleting complaint:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const complaints = filteredComplaints.sort((a, b) => {
    // Sorting logic
    if (sortBy === "newest") {
      return new Date(b.reportedAt) - new Date(a.reportedAt);
    } else if (sortBy === "oldest") {
      return new Date(a.reportedAt) - new Date(b.reportedAt);
    } else if (sortBy === "priority") {
      const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (
        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      );
    } else if (sortBy === "status") {
      const statusOrder = {
        SUBMITTED: 1,
        UNDER_REVIEW: 2,
        IN_PROGRESS: 3,
        RESOLVED: 4,
        CLOSED: 5,
        REJECTED: 6,
      };
      return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
    } else if (sortBy === "category") {
      return a.category.localeCompare(b.category);
    }
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "outline";
      case "UNDER_REVIEW":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "RESOLVED":
        return "default";
      case "CLOSED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "default";
      case "MEDIUM":
        return "secondary";
      case "LOW":
        return "outline";
      default:
        return "outline";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "FACILITY":
        return "default";
      case "STAFF":
        return "secondary";
      case "ROOM":
        return "outline";
      case "PAYMENT":
        return "destructive";
      case "SECURITY":
        return "destructive";
      default:
        return "outline";
    }
  };

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
          <h1 className="text-3xl font-bold">Complaints Management</h1>
          <p className="text-muted-foreground leading-loose">
            Manage and respond to guest complaints
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={() => fetchData()}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Complaint
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">
              Total Complaints
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.summary?.totalComplaints || 0}
            </div>
            <p className="text-xs text-muted-foreground">All complaints</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.statusBreakdown?.find((s) => s.status === "PENDING")
                ?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">New complaints</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.statusBreakdown?.find((s) => s.status === "RESOLVED")
                ?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">Resolved complaints</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.statusBreakdown?.find((s) => s.status === "IN_PROGRESS")
                ?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being handled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 shadow-sm rounded-md mx-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 w-full"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex-1 min-w-0">
            <Label
              htmlFor="status-filter"
              className="text-sm font-medium mb-2 block"
            >
              Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="flex-1 min-w-0">
            <Label
              htmlFor="priority-filter"
              className="text-sm font-medium mb-2 block"
            >
              Priority
            </Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-10 w-full">
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
          <div className="flex-1 min-w-0">
            <Label
              htmlFor="hostel-filter"
              className="text-sm font-medium mb-2 block"
            >
              Hostel
            </Label>
            <Select value={hostelFilter} onValueChange={setHostelFilter}>
              <SelectTrigger className="h-10 w-full">
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

          {/* Clear Filters Button */}
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All Status");
                setPriorityFilter("All Priority");
                setCategoryFilter("All Categories");
                setHostelFilter("All Hostels");
                setReplyFilter("All Replies");
                setDateFilter("All Time");
                setSortBy("newest");
              }}
              className="h-10 px-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Complaints</h3>
            <Badge variant="outline" className="text-sm">
              {filteredComplaints.length} of {complaints.length}
            </Badge>
            {(statusFilter !== "All Status" ||
              priorityFilter !== "All Priority" ||
              categoryFilter !== "All Categories" ||
              hostelFilter !== "All Hostels" ||
              replyFilter !== "All Replies" ||
              dateFilter !== "All Time" ||
              sortBy !== "newest" ||
              searchTerm) && (
                <Badge variant="secondary" className="text-sm">
                  Filtered
                </Badge>
              )}
          </div>
          <div className="text-sm text-muted-foreground">
            {sortBy === "newest" && "Sorted by newest first"}
            {sortBy === "oldest" && "Sorted by oldest first"}
            {sortBy === "priority" && "Sorted by priority"}
            {sortBy === "status" && "Sorted by status"}
            {sortBy === "category" && "Sorted by category"}
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="p-4">
        <div className="space-y-4">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">
                            {complaint.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Complaint #{complaint.id.slice(-8)} •{" "}
                            {new Date(
                              complaint.reportedAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">
                        {complaint.description}
                      </p>

                      {/* Admin Reply Preview */}
                      {complaint.adminReply && (
                        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Admin Response:
                              </p>
                              <p className="text-sm text-blue-800 line-clamp-2">
                                {complaint.adminReply.length > 100
                                  ? `${complaint.adminReply.substring(0, 100)}...`
                                  : complaint.adminReply}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                {complaint.repliedAt
                                  ? `Replied on ${new Date(complaint.repliedAt).toLocaleDateString()}`
                                  : "Replied recently"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Bed className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">
                              {complaint.room
                                ? `Room ${complaint.room.roomNumber}`
                                : "General"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {complaint.room
                                ? `${complaint.room.type} • Floor ${complaint.room.floor}`
                                : complaint.hostel?.hostelName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">
                              {complaint.user?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">Reported by</p>
                          </div>
                        </div>

                        {complaint.assignee && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">
                                {complaint.assignee.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Assigned to
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">
                              {complaint.adminReply ? "Replied" : "No Reply"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {complaint.adminReply
                                ? `Replied ${complaint.repliedAt ? new Date(complaint.repliedAt).toLocaleDateString() : ""}`
                                : "Awaiting response"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getCategoryColor(complaint.category)}>
                          {complaint.category}
                        </Badge>
                        <Badge variant={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                        <Badge variant={getStatusColor(complaint.status)}>
                          {complaint.status.replace("_", " ")}
                        </Badge>
                        {complaint.adminReply && (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Replied
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setFormData({
                              title: complaint.title,
                              description: complaint.description,
                              category: complaint.category,
                              priority: complaint.priority,
                              status: complaint.status,
                              roomId: complaint.assignedTo || "unassigned",
                              hostelId: complaint.hostelId,
                              images: complaint.images || [],
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
                            setSelectedComplaint(complaint);
                            setReplyText("");
                            setIsReplyDialogOpen(true);
                          }}
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(complaint);
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
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No complaints found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ||
                  statusFilter !== "All Status" ||
                  priorityFilter !== "All Priority" ||
                  categoryFilter !== "All Categories" ||
                  hostelFilter !== "All Hostels"
                  ? "Try adjusting your filters to see more results."
                  : "No complaints have been submitted yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Complaint Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              View detailed information about the complaint.
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-gray-900">
                    {selectedComplaint.title}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Badge variant={getCategoryColor(selectedComplaint.category)}>
                    {selectedComplaint.category}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-900">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Room</Label>
                  <p className="text-sm text-gray-900">
                    {selectedComplaint.room
                      ? `Room ${selectedComplaint.room.roomNumber} - ${selectedComplaint.room.type}`
                      : "General Area"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Hostel</Label>
                  <p className="text-sm text-gray-900">
                    {selectedComplaint.hostel?.hostelName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Reported By</Label>
                  <p className="text-sm text-gray-900">
                    {selectedComplaint.user?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-gray-900">
                    {selectedComplaint.assignee?.name || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Reported At</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedComplaint.reportedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={getStatusColor(selectedComplaint.status)}>
                    {selectedComplaint.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {selectedComplaint.adminReply && (
                <div>
                  <Label className="text-sm font-medium">Admin Reply</Label>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-900">
                      {selectedComplaint.adminReply}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Replied by {selectedComplaint.replier?.name || "Admin"} on{" "}
                      {new Date(selectedComplaint.repliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Complaint Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Complaint</DialogTitle>
            <DialogDescription>
              Update the complaint status, priority, and assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div> */}

            {/* <div>
                            <Label htmlFor="assignedTo">Assign To</Label>
                            <Select value={formData.roomId} onValueChange={(value) => setFormData({...formData, roomId: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {staff.map((staffMember) => (
                                        <SelectItem key={staffMember.id} value={staffMember.id}>
                                            {staffMember.name}
                                            {staffMember.role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateComplaintMutation.isPending}
              >
                {updateComplaintMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Complaint"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to Complaint</DialogTitle>
            <DialogDescription>
              Send a response to the complainant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                placeholder="Enter your response to the complaint..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReplyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                disabled={
                  !replyText.trim() || replyToComplaintMutation.isPending
                }
              >
                {replyToComplaintMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Reply className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this complaint? This action cannot
              be undone.
              {selectedComplaint && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedComplaint.title}</p>
                  <p className="text-sm text-gray-600">
                    Complaint #{selectedComplaint.id.slice(-8)} •{" "}
                    {selectedComplaint.room
                      ? `Room ${selectedComplaint.room.roomNumber}`
                      : "General Area"}
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
                  Delete Complaint
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default page;
