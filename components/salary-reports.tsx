"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  Calendar,
  Users,
  DollarSign
} from "lucide-react";

interface ReportData {
  type: string;
  data: any[];
  summary?: {
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    averageSalary: number;
    averageSalaryPerStaff: number;
    totalStaff: number;
  };
}

export function SalaryReports() {
  const [reportType, setReportType] = useState("summary");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchReport();
  }, [reportType, year, month]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        year,
        month
      });

      const response = await fetch(`/api/salaries/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting report...");
  };

  const renderSummaryReport = () => {
    if (!reportData?.summary) return null;

    const { summary } = reportData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalPaid.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalStaff}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.averageSalaryPerStaff.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${summary.totalPending.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Payroll Trend</CardTitle>
            <CardDescription>Payroll amounts by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(reportData.summary.payrollByMonth || {}).map(([month, amount]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month}</span>
                  <span className="text-sm">${(amount as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMonthlyReport = () => {
    if (!reportData?.data) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Payroll Report</CardTitle>
          <CardDescription>Payroll data by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.data.map((month: any) => (
              <div key={month.month} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{month.month}</h3>
                  <span className="text-sm text-gray-500">{month.staffCount} staff</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Amount:</span>
                    <div className="font-medium">${month.totalAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Average Salary:</span>
                    <div className="font-medium">${month.averageSalary.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Staff Count:</span>
                    <div className="font-medium">{month.staffCount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDepartmentReport = () => {
    if (!reportData?.data) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Payroll Report</CardTitle>
          <CardDescription>Payroll data by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.data.map((dept: any) => (
              <div key={dept.department} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{dept.department}</h3>
                  <span className="text-sm text-gray-500">{dept.staffCount} staff</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Amount:</span>
                    <div className="font-medium">${dept.totalAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Average Salary:</span>
                    <div className="font-medium">${dept.averageSalary.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Staff Count:</span>
                    <div className="font-medium">{dept.staffCount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStaffReport = () => {
    if (!reportData?.data) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Payroll Report</CardTitle>
          <CardDescription>Individual staff payroll data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.data.map((staff: any) => (
              <div key={staff.staff.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{staff.staff.name}</h3>
                  <span className="text-sm text-gray-500">{staff.salaryCount} payments</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Amount:</span>
                    <div className="font-medium">${staff.totalAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Average Salary:</span>
                    <div className="font-medium">${staff.averageSalary.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Position:</span>
                    <div className="font-medium">{staff.staff.position}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Pay:</span>
                    <div className="font-medium">
                      {staff.lastPayDate ? new Date(staff.lastPayDate).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>Configure report parameters and filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2020"
                max="2030"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthNum = i + 1;
                    const monthName = new Date(2024, i).toLocaleString('default', { month: 'long' });
                    return (
                      <SelectItem key={monthNum} value={monthNum.toString()}>
                        {monthName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex space-x-2">
                <Button onClick={fetchReport} disabled={loading}>
                  {loading ? "Loading..." : "Refresh"}
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading report...</p>
        </div>
      ) : (
        <>
          {reportType === "summary" && renderSummaryReport()}
          {reportType === "monthly" && renderMonthlyReport()}
          {reportType === "department" && renderDepartmentReport()}
          {reportType === "staff" && renderStaffReport()}
        </>
      )}
    </div>
  );
}
