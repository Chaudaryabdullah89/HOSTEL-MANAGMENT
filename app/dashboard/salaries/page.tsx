"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Users, 
  Calendar,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";
import { SalaryManagementTable } from "@/components/salary-management-table";
import { SalaryAdjustmentsTable } from "@/components/salary-adjustments-table";
import { ProcessPayrollDialog } from "@/components/process-payroll-dialog";
import { SalaryReports } from "@/components/salary-reports";

interface SalarySummary {
  totalPaid: number;
  totalPending: number;
  totalFailed: number;
  averageSalary: number;
  averageSalaryPerStaff: number;
  totalStaff: number;
  statusBreakdown: Record<string, number>;
}

export default function SalariesPage() {
  const [salaries, setSalaries] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [summary, setSummary] = useState<SalarySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("salaries");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch salaries
      const salariesResponse = await fetch("/api/salaries");
      if (salariesResponse.ok) {
        const salariesData = await salariesResponse.json();
        setSalaries(salariesData);
      }

      // Fetch adjustments
      const adjustmentsResponse = await fetch("/api/salaries/adjustments");
      if (adjustmentsResponse.ok) {
        const adjustmentsData = await adjustmentsResponse.json();
        setAdjustments(adjustmentsData);
      }

      // Fetch summary report
      const summaryResponse = await fetch("/api/salaries/reports?type=summary");
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.summary);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "default";
      case "PENDING":
        return "secondary";
      case "FAILED":
        return "destructive";
      case "CANCELLED":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
            <p className="text-gray-600">Manage staff salaries and payroll</p>
          </div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
          <p className="text-gray-600">Manage staff salaries and payroll</p>
        </div>
        <div className="flex items-center space-x-2">
          <ProcessPayrollDialog onSuccess={fetchData} />
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Average: ${summary.averageSalaryPerStaff.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalPending.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {summary.statusBreakdown.PENDING || 0} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalStaff}</div>
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
              <div className="text-2xl font-bold text-red-600">${summary.totalFailed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {summary.statusBreakdown.FAILED || 0} payments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="salaries">Salaries</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="salaries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Salary Records</CardTitle>
                  <CardDescription>View and manage staff salary payments</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search salaries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SalaryManagementTable 
                salaries={salaries} 
                searchTerm={searchTerm}
                onRefresh={fetchData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Salary Adjustments</CardTitle>
                  <CardDescription>Manage salary raises, bonuses, and deductions</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Adjustment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SalaryAdjustmentsTable 
                adjustments={adjustments}
                onRefresh={fetchData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <SalaryReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
