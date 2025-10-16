"use client";
export const dynamic = 'force-dynamic'
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from 'react-hot-toast';
import { useUsers, useUpdateUserRole } from '@/hooks/useUsers';
import {
  Plus,
  Filter,
  ChevronDown,
  Search,
  Edit,
  Trash,
  Loader,
  Loader2,
  Users,
  Eye,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Activity,
  Bed,
  Home,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  UserCheck,
  UserX,
  Crown,
  User,
  Settings,
  Mail,
  Phone,
  Building,
  Key,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const page = () => {
  // Filter logic
  const [activeRole, setActiveRole] = useState("All Roles");
  const [activeStatus, setActiveStatus] = useState("All Statuses");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Data management
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // React Query hooks
  const { data: users = [], isLoading: loading, error: queryError, refetch: refetchUsers } = useUsers();
  const updateUserRoleMutation = useUpdateUserRole();

  // Ensure this only runs on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Dialog states
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Form states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localError, setLocalError] = useState("");
  
  // Role update form
  const [formData, setFormData] = useState({
    newRole: "",
    reason: ""
  });

  // Available roles
  const roles = [
    { value: "GUEST", label: "Guest", icon: User, color: "bg-blue-100 text-blue-800", description: "Can book rooms and make payments" },
    { value: "STAFF", label: "Staff", icon: UserCheck, color: "bg-green-100 text-green-800", description: "Can manage hostel operations" },
    { value: "WARDEN", label: "Warden", icon: Shield, color: "bg-purple-100 text-purple-800", description: "Can manage specific hostel" },
    { value: "ADMIN", label: "Admin", icon: Crown, color: "bg-red-100 text-red-800", description: "Full system access" },
  ];

  // Fetch users
  // Remove fetchUsers - now handled by React Query

  // Calculate summary from React Query data
  useEffect(() => {
    if (users && users.length > 0) {
      const summaryData = {
        totalUsers: users.length,
        roleBreakdown: users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {}),
        activeUsers: users.filter(user => user.role !== "GUEST").length,
        guests: users.filter(user => user.role === "GUEST").length
      };
      setSummary(summaryData);
    } else {
      setSummary({
        totalUsers: 0,
        roleBreakdown: {},
        activeUsers: 0,
        guests: 0
      });
    }
  }, [users]);

  // Update user role
  const handleUpdateRole = (e) => {
    e.preventDefault();
    if (!selectedUser || !formData.newRole) {
      toast.localError("Please select a new role");
      return;
    }

    if (selectedUser.role === formData.newRole) {
      toast.localError("User already has this role");
      return;
    }

    updateUserRoleMutation.mutate({
      userId: selectedUser.id,
      newRole: formData.newRole,
      reason: formData.reason || "Role updated by admin"
    }, {
      onSuccess: () => {
        resetForm();
        setIsUpdateDialogOpen(false);
        setSelectedUser(null);
      }
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      newRole: "",
      reason: ""
    });
    setLocalError("");
  };

  // Handle edit
  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      newRole: user.role,
      reason: ""
    });
    setIsUpdateDialogOpen(true);
  };

  // Get role info
  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || { 
      value: role, 
      label: role, 
      icon: User, 
      color: "bg-gray-100 text-gray-800",
      description: "Unknown role"
    };
  };

  // Get role icon
  const getRoleIcon = (role) => {
    const roleInfo = getRoleInfo(role);
    const IconComponent = roleInfo.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  // Remove useEffect - data fetching now handled by React Query

  const filteredUsers = users.filter((user) => {
    const matchesRole = activeRole === "All Roles" || user.role === activeRole;
    const matchesStatus = activeStatus === "All Statuses" || 
      (activeStatus === "Active" && user.role !== "GUEST") ||
      (activeStatus === "Guests" && user.role === "GUEST");
    const matchesSearch =
      searchTerm === "" ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center flex flex-col items-center">
          <Loader className="h-4 w-4 animate-spin" />
          <p className="text-xl text-gray-600">Loading</p>
        </div>
      </div>
    );
  }

  // Only render on client side
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-2">
      {/* Global Error Display */}
      {localError && (
        <div className="mb-4 mx-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{localError}</p>
                </div>
                <div className="mt-3">
                  <Button
                    onClick={() => setLocalError("")}
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex md:flex-row flex-col justify-between px-4">
        <div className="mt-4">
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground leading-loose">
            Manage user roles and permissions across the system.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button 
            className="cursor-pointer p-4" 
            variant="outline"
            onClick={() => {
              setLocalError("");
              refetchUsers();
              toast.success("Data refreshed!");
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                All registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Staff, Wardens & Admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guests</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.guests || 0}</div>
              <p className="text-xs text-muted-foreground">
                Guest users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.roleBreakdown?.ADMIN || 0}</div>
              <p className="text-xs text-muted-foreground">
                System administrators
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Legend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Role Definitions</CardTitle>
          <CardDescription>Understanding different user roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <div key={role.value} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-full ${role.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{role.label}</p>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="w-full bg-white p-1 md:p-6 my-6 shadow-sm rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2 relative flex items-center">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <Input
              type="text"
              className="pl-12 py-3 pr-4 border rounded-md w-full text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="col-span-1 flex items-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="p-4 cursor-pointer w-full text-left" variant="outline">
                  {activeRole}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActiveRole("All Roles")}>
                  All Roles
                </DropdownMenuItem>
                {roles.map((role) => (
                  <DropdownMenuItem key={role.value} onClick={() => setActiveRole(role.value)}>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(role.value)}
                      <span>{role.label}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="col-span-1 flex items-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="p-4 cursor-pointer w-full text-left" variant="outline">
                  {activeStatus}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActiveStatus("All Statuses")}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveStatus("Active")}>
                  Active Staff
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveStatus("Guests")}>
                  Guests Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <Card className="flex flex-col mt-10 items-center justify-center py-12 mx-auto">
          <CardContent>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">
                No users match your current filters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 p-1 md:p-6 my-6 bg-gray-50 shadow-none rounded-md">
          {filteredUsers.map((user) => {
            const roleInfo = getRoleInfo(user.role);
            return (
              <Card key={user.id} className="mb-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${roleInfo.color}`}>
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {user.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <Badge className={roleInfo.color}>
                      {roleInfo.label}
                    </Badge>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* User Details */}
                    <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                      <div>
                        <p className="text-md font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="text-sm font-semibold text-gray-800">User Info</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Name</span>
                          <span className="text-xs text-gray-900 truncate">{user.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Email</span>
                          <span className="text-xs text-gray-900 truncate">{user.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Phone</span>
                          <span className="text-xs text-gray-900">{user.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Role Information */}
                    <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                      <div>
                        <p className="text-md font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-semibold text-gray-800">Current Role</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Role</span>
                          <span className="text-xs text-gray-900">{roleInfo.label}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Permissions</span>
                          <span className="text-xs text-gray-900 truncate">{roleInfo.description}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Status</span>
                          <span className="text-xs text-gray-900">
                            {user.role === "GUEST" ? "Guest" : "Active"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Account Details */}
                    <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                      <div>
                        <p className="text-md font-medium flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          <span className="text-sm font-semibold text-gray-800">Account</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">User ID</span>
                          <span className="text-xs text-gray-900 font-mono">{user.id?.substring(0, 8)}...</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Created</span>
                          <span className="text-xs text-gray-900">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Updated</span>
                          <span className="text-xs text-gray-900">
                            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                      <div>
                        <p className="text-md font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm font-semibold text-gray-800">Contact</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Email</span>
                          <span className="text-xs text-gray-900 truncate">{user.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Phone</span>
                          <span className="text-xs text-gray-900">{user.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Verified</span>
                          <span className="text-xs text-gray-900">
                            {user.emailVerified ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex gap-2 items-center justify-end mt-4 pt-4 border-t">
                    <Button
                      onClick={() => handleEdit(user)}
                      variant="outline"
                      className="px-3 py-2 cursor-pointer text-xs h-8 min-h-0 rounded-md flex items-center gap-1"
                      title="Update Role"
                    >
                      <Edit className="h-3 w-3" />
                      Update Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Update Role Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Update User Role
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Change the role for {selectedUser?.name || 'this user'}.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6" onSubmit={handleUpdateRole}>
            {/* Current User Info */}
            {selectedUser && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getRoleInfo(selectedUser.role).color}`}>
                    {getRoleIcon(selectedUser.role)}
                  </div>
                  <div>
                    <p className="font-medium">{selectedUser.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    <p className="text-xs text-gray-400">Current Role: {getRoleInfo(selectedUser.role).label}</p>
                  </div>
                </div>
              </div>
            )}

            {/* New Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Select New Role *
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    {formData.newRole ? getRoleInfo(formData.newRole).label : "Select New Role"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {roles.map((role) => (
                    <DropdownMenuItem
                      key={role.value}
                      onClick={() => setFormData({...formData, newRole: role.value})}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${role.color}`}>
                          {getRoleIcon(role.value)}
                        </div>
                        <div>
                          <span className="font-medium">{role.label}</span>
                          <p className="text-xs text-gray-500">{role.description}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reason for Change */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Reason for Role Change (Optional)
              </Label>
              <textarea
                className="w-full h-20 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Explain why this role change is necessary..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUpdateDialogOpen(false);
                  setSelectedUser(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 cursor-pointer hover:bg-blue-700"
                disabled={updateUserRoleMutation.isPending || !formData.newRole || formData.newRole === selectedUser?.role}
              >
                <Settings className="h-4 w-4 mr-2" />
                {updateUserRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          localError: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default page;
