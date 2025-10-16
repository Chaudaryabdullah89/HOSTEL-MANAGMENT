"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  DollarSign,
  Calendar,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Salary {
  id: string;
  amount: number;
  status: string;
  payDate: string;
  payPeriod: string;
  baseAmount: number;
  overtimeAmount: number;
  bonusAmount: number;
  deductions: number;
  netAmount: number;
  staff: {
    id: string;
    name: string;
    email: string;
    position: string;
    department: string;
    hostel: {
      hostelName: string;
    };
  };
}

interface SalaryManagementTableProps {
  salaries: Salary[];
  searchTerm: string;
  onRefresh: () => void;
}

export function SalaryManagementTable({ 
  salaries, 
  searchTerm, 
  onRefresh 
}: SalaryManagementTableProps) {
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);

  const filteredSalaries = salaries.filter(salary =>
    salary.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.staff.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getPayPeriodColor = (period: string) => {
    switch (period) {
      case "WEEKLY":
        return "bg-blue-100 text-blue-800";
      case "BIWEEKLY":
        return "bg-green-100 text-green-800";
      case "MONTHLY":
        return "bg-purple-100 text-purple-800";
      case "QUARTERLY":
        return "bg-orange-100 text-orange-800";
      case "ANNUAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = async (salaryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/salaries/${salaryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating salary status:", error);
    }
  };

  const handleDelete = async (salaryId: string) => {
    if (!confirm("Are you sure you want to delete this salary record?")) {
      return;
    }

    try {
      const response = await fetch(`/api/salaries/${salaryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting salary:", error);
    }
  };

  if (filteredSalaries.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No salaries found</h3>
        <p className="text-gray-600">
          {searchTerm ? "Try adjusting your search criteria" : "No salary records have been created yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pay Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSalaries.map((salary) => (
              <TableRow key={salary.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{salary.staff.name}</div>
                      <div className="text-sm text-gray-500">{salary.staff.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{salary.staff.position}</div>
                    <div className="text-sm text-gray-500">{salary.staff.department}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getPayPeriodColor(salary.payPeriod)}>
                    {salary.payPeriod}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-right">
                    <div className="font-medium">${salary.netAmount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">
                      Base: ${salary.baseAmount.toLocaleString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(salary.status)}>
                    {salary.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(salary.payDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedSalary(salary)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {salary.status === "PENDING" && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(salary.id, "PAID")}
                        >
                          Mark as Paid
                        </DropdownMenuItem>
                      )}
                      {salary.status === "PENDING" && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(salary.id, "CANCELLED")}
                        >
                          Cancel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(salary.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Salary Details Modal */}
      {selectedSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Salary Details</h3>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedSalary(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Staff Member</label>
                  <p className="text-sm">{selectedSalary.staff.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-sm">{selectedSalary.staff.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pay Period</label>
                  <p className="text-sm">{selectedSalary.payPeriod}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pay Date</label>
                  <p className="text-sm">{new Date(selectedSalary.payDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Salary Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Base Amount:</span>
                    <span className="text-sm">${selectedSalary.baseAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Overtime:</span>
                    <span className="text-sm">${selectedSalary.overtimeAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Bonus:</span>
                    <span className="text-sm">${selectedSalary.bonusAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Deductions:</span>
                    <span className="text-sm text-red-600">-${selectedSalary.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Net Amount:</span>
                    <span>${selectedSalary.netAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
