"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from 'react-hot-toast';
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
  const [activeStatus, setActiveStatus] = useState("All Statuses");
  const [activePeriod, setActivePeriod] = useState("All Periods");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Data management
  const [salaries, setSalaries] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [salaryToDelete, setSalaryToDelete] = useState(null);
  
  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  
  // Create salary form
  const [formData, setFormData] = useState({
    staffId: "",
    amount: "",
    currency: "PKR",
    payPeriod: "MONTHLY",
    payDate: "",
    baseAmount: "",
    overtimeAmount: "0",
    bonusAmount: "0",
    deductions: "0",
    netAmount: "",
    notes: ""
  });

  // Fetch staff members
  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      const data = await response.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to fetch staff members");
    }
  };

  // Fetch salaries
  const fetchSalaries = async (forceRefresh = false) => {
    if (isRefreshing && !forceRefresh) return;
    
    setIsRefreshing(true);
    setLoading(true);
    try {
      const response = await fetch("/api/salaries");
      const data = await response.json();
      setSalaries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      setError(error.message || "An error occurred while fetching salaries");
      toast.error(error.message || "An error occurred while fetching salaries");
      setSalaries([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await fetch("/api/salaries/reports?type=summary");
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  // Create salary
  const handleCreateSalary = async (e) => {
    e.preventDefault();
    if (!formData.staffId) {
      toast.error("Please select a staff member");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/salaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          baseAmount: parseFloat(formData.baseAmount),
          overtimeAmount: parseFloat(formData.overtimeAmount),
          bonusAmount: parseFloat(formData.bonusAmount),
          deductions: parseFloat(formData.deductions),
          netAmount: parseFloat(formData.netAmount),
          payDate: new Date(formData.payDate).toISOString()
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Salary created successfully!");
        setSalaries(prev => [data, ...prev]);
        resetForm();
        setIsCreateDialogOpen(false);
        fetchSummary();
      } else {
        toast.error(data.error || "Failed to create salary");
      }
    } catch (error) {
      console.error("Error creating salary:", error);
      toast.error("An error occurred while creating the salary");
    } finally {
      setIsCreating(false);
    }
  };

  // Update salary
  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    if (!selectedSalary) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/salaries/${selectedSalary.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          overtimeAmount: parseFloat(formData.overtimeAmount),
          bonusAmount: parseFloat(formData.bonusAmount),
          deductions: parseFloat(formData.deductions),
          netAmount: parseFloat(formData.netAmount),
          notes: formData.notes
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Salary updated successfully!");
        setSalaries(prev => 
          prev.map(salary => 
            salary.id === selectedSalary.id ? data : salary
          )
        );
        setIsEditDialogOpen(false);
        setSelectedSalary(null);
        fetchSummary();
      } else {
        toast.error(data.error || "Failed to update salary");
      }
    } catch (error) {
      console.error("Error updating salary:", error);
      toast.error("An error occurred while updating the salary");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete salary
  const handleDeleteSalary = async () => {
    if (!salaryToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/salaries/${salaryToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Salary deleted successfully!");
        setSalaries(prev => 
          prev.filter(salary => salary.id !== salaryToDelete.id)
        );
        setIsDeleteDialogOpen(false);
        setSalaryToDelete(null);
        fetchSummary();
      } else {
        toast.error(data.error || "Failed to delete salary");
      }
    } catch (error) {
      console.error("Error deleting salary:", error);
      toast.error("An error occurred while deleting the salary");
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      staffId: "",
      amount: "",
      currency: "PKR",
      payPeriod: "MONTHLY",
      payDate: "",
      baseAmount: "",
      overtimeAmount: "0",
      bonusAmount: "0",
      deductions: "0",
      netAmount: "",
      notes: ""
    });
    setError("");
  };

  // Handle edit
  const handleEdit = (salary) => {
    setSelectedSalary(salary);
    setFormData({
      staffId: salary.staffId,
      amount: salary.amount.toString(),
      currency: salary.currency,
      payPeriod: salary.payPeriod,
      payDate: new Date(salary.payDate).toISOString().split('T')[0],
      baseAmount: salary.baseAmount.toString(),
      overtimeAmount: salary.overtimeAmount.toString(),
      bonusAmount: salary.bonusAmount.toString(),
      deductions: salary.deductions.toString(),
      netAmount: salary.netAmount.toString(),
      notes: salary.notes || ""
    });
    setIsEditDialogOpen(true);
  };

  // Calculate net amount
  const calculateNetAmount = () => {
    const base = parseFloat(formData.baseAmount) || 0;
    const overtime = parseFloat(formData.overtimeAmount) || 0;
    const bonus = parseFloat(formData.bonusAmount) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const net = base + overtime + bonus - deductions;
    setFormData(prev => ({ ...prev, netAmount: net.toString(), amount: net.toString() }));
  };

  useEffect(() => {
    fetchStaff();
    fetchSalaries();
    fetchSummary();
  }, []);

  useEffect(() => {
    calculateNetAmount();
  }, [formData.baseAmount, formData.overtimeAmount, formData.bonusAmount, formData.deductions]);

  const filteredSalaries = salaries.filter((salary) => {
    const matchesStatus = activeStatus === "All Statuses" || salary.status === activeStatus;
    const matchesPeriod = activePeriod === "All Periods" || salary.payPeriod === activePeriod;
    const matchesSearch =
      searchTerm === "" ||
      salary.staff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.staff?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.staff?.position?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPeriod && matchesSearch;
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

  return (
    <div className="p-2">
      {/* Global Error Display */}
      {error && (
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
                  <p>{error}</p>
                </div>
                <div className="mt-3">
                  <Button
                    onClick={() => setError("")}
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
          <h1 className="text-3xl font-bold">Salary Management</h1>
          <p className="text-muted-foreground leading-loose">
            Manage staff salaries and payroll.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button 
            className="cursor-pointer p-4" 
            variant="outline"
            onClick={() => {
              setError("");
              fetchSalaries(true);
              fetchSummary();
            }}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="cursor-pointer p-4" 
                variant="outline"
                onClick={() => {
                  setError("");
                  resetForm();
                  setIsCreateDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Salary
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-xl font-semibold">
                  Add New Salary
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a new salary record for a staff member.
                </DialogDescription>
              </DialogHeader>

              <div className="overflow-y-auto px-6 pb-6 pt-2" style={{ maxHeight: '70vh' }}>
                <form className="space-y-6" onSubmit={handleCreateSalary}>
                  {/* Staff Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Select Staff Member *
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between text-left font-normal"
                        >
                          {staff.find(s => s.id === formData.staffId)?.name || "Select Staff Member"}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        {staff.map((staffMember) => (
                          <DropdownMenuItem
                            key={staffMember.id}
                            onClick={() => setFormData({...formData, staffId: staffMember.id})}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{staffMember.name}</span>
                              <span className="text-sm text-gray-500">{staffMember.email} - {staffMember.position}</span>
                              <span className="text-xs text-gray-400">{staffMember.department} • {staffMember.hostel?.hostelName || 'No Hostel'}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Pay Period *
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-normal"
                          >
                            {formData.payPeriod}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem onClick={() => setFormData({...formData, payPeriod: "WEEKLY"})}>
                            Weekly
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFormData({...formData, payPeriod: "BIWEEKLY"})}>
                            Bi-weekly
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFormData({...formData, payPeriod: "MONTHLY"})}>
                            Monthly
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFormData({...formData, payPeriod: "QUARTERLY"})}>
                            Quarterly
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFormData({...formData, payPeriod: "ANNUAL"})}>
                            Annual
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Pay Date *
                      </Label>
                      <Input
                        type="date"
                        value={formData.payDate}
                        onChange={(e) => setFormData({...formData, payDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Base Amount *
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.baseAmount}
                        onChange={(e) => setFormData({...formData, baseAmount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Overtime Amount
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.overtimeAmount}
                        onChange={(e) => setFormData({...formData, overtimeAmount: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Bonus Amount
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.bonusAmount}
                        onChange={(e) => setFormData({...formData, bonusAmount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Deductions
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.deductions}
                        onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Net Amount (Calculated)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.netAmount}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Notes
                    </Label>
                    <textarea
                      className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes about this salary payment..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 cursor-pointer hover:bg-blue-700"
                      disabled={isCreating}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isCreating ? "Creating..." : "Create Salary"}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PKR {summary.totalPaid?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Average: PKR {summary.averageSalaryPerStaff?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PKR {summary.totalPending?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {summary.statusBreakdown?.PENDING || 0} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalStaff || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active employees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">PKR {summary.totalFailed?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {summary.statusBreakdown?.FAILED || 0} payments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
              placeholder="Search salaries by staff name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                <DropdownMenuItem onClick={() => setActiveStatus("PENDING")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveStatus("PAID")}>
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveStatus("FAILED")}>
                  Failed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveStatus("CANCELLED")}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="col-span-1 flex items-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="p-4 cursor-pointer w-full text-left" variant="outline">
                  {activePeriod}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActivePeriod("All Periods")}>
                  All Periods
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivePeriod("WEEKLY")}>
                  Weekly
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivePeriod("BIWEEKLY")}>
                  Bi-weekly
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivePeriod("MONTHLY")}>
                  Monthly
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivePeriod("QUARTERLY")}>
                  Quarterly
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivePeriod("ANNUAL")}>
                  Annual
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Salary List */}
      {filteredSalaries.length === 0 ? (
        <Card className="flex flex-col mt-10 items-center justify-center py-12 mx-auto">
          <CardContent>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No salaries found</h3>
              <p className="text-gray-600 mb-4">
                No salary records match your current filters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 p-1 md:p-6 my-6 bg-gray-50 shadow-none rounded-md">
          {filteredSalaries.map((salary) => (
            <Card key={salary.id} className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    <div>
                      <p className="text-md font-medium">
                        {salary.staff?.name || 'Unknown Staff'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {salary.staff?.position || 'No Position'} • {salary.payPeriod}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {salary.staff?.department || 'No Department'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    salary.status === "PAID" ? "default" :
                    salary.status === "PENDING" ? "secondary" :
                    salary.status === "FAILED" ? "destructive" : "outline"
                  }>
                    {salary.status}
                  </Badge>
                </div>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Salary Details */}
                  <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                    <div>
                      <p className="text-md font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-semibold text-gray-800">Amount</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Base</span>
                        <span className="text-xs text-gray-900">PKR {salary.baseAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Overtime</span>
                        <span className="text-xs text-gray-900">PKR {salary.overtimeAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Bonus</span>
                        <span className="text-xs text-gray-900">PKR {salary.bonusAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Deductions</span>
                        <span className="text-xs text-gray-900">PKR {salary.deductions?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Amount */}
                  <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                    <div>
                      <p className="text-md font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold text-gray-800">Net Amount</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="">
                        <div className="text-xl font-bold text-green-600">PKR {salary.netAmount?.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">PKR</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                    <div>
                      <p className="text-md font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-semibold text-gray-800">Payment</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Pay Date</span>
                        <span className="text-xs text-gray-900">{new Date(salary.payDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Period</span>
                        <span className="text-xs text-gray-900">{salary.payPeriod}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Status</span>
                        <span className="text-xs text-gray-900">{salary.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Staff Info */}
                  <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                    <div>
                      <p className="text-md font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-semibold text-gray-800">Staff</span>
                      </p>
                    </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Name</span>
                          <span className="text-xs text-gray-900 truncate">{salary.staff?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Email</span>
                          <span className="text-xs text-gray-900 truncate">{salary.staff?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Position</span>
                          <span className="text-xs text-gray-900 truncate">{salary.staff?.position || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Department</span>
                          <span className="text-xs text-gray-900 truncate">{salary.staff?.department || 'N/A'}</span>
                        </div>
                      </div>
                  </div>
                </div>

                {/* Notes */}
                {salary.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">Notes</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-3">{salary.notes}</p>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <div className="flex gap-2 items-center justify-end mt-4 pt-4 border-t">
                  <Button
                    onClick={() => handleEdit(salary)}
                    variant="outline"
                    className="px-3 py-2 cursor-pointer text-xs h-8 min-h-0 rounded-md flex items-center gap-1"
                    title="Edit Salary"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  
                  <AlertDialog open={isDeleteDialogOpen && salaryToDelete?.id === salary.id} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setSalaryToDelete(salary);
                          setIsDeleteDialogOpen(true);
                        }}
                        variant="outline"
                        className="px-3 py-2 cursor-pointer text-xs h-8 min-h-0 rounded-md flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                        title="Delete Salary"
                        disabled={salary.status !== "PENDING"}
                      >
                        <Trash className="h-3 w-3" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to delete this salary?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the salary record for {salary.staff?.name || 'Unknown Staff'} and remove all its data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel 
                          className="cursor-pointer"
                          onClick={() => {
                            setIsDeleteDialogOpen(false);
                            setSalaryToDelete(null);
                          }}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          className="cursor-pointer bg-red-600 hover:bg-red-700"
                          onClick={handleDeleteSalary}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Salary"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
          error: {
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
