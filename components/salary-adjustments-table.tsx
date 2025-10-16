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
  TrendingUp,
  TrendingDown,
  Calendar,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SalaryAdjustment {
  id: string;
  type: string;
  amount: number;
  reason: string;
  effectiveDate: string;
  isActive: boolean;
  approvedBy: string;
  approvedAt: string;
  notes: string;
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

interface SalaryAdjustmentsTableProps {
  adjustments: SalaryAdjustment[];
  onRefresh: () => void;
}

export function SalaryAdjustmentsTable({ 
  adjustments, 
  onRefresh 
}: SalaryAdjustmentsTableProps) {
  const [selectedAdjustment, setSelectedAdjustment] = useState<SalaryAdjustment | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "RAISE":
      case "BONUS":
      case "COMMISSION":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "DEDUCTION":
      case "PENALTY":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "RAISE":
        return "bg-green-100 text-green-800";
      case "BONUS":
        return "bg-blue-100 text-blue-800";
      case "COMMISSION":
        return "bg-purple-100 text-purple-800";
      case "DEDUCTION":
        return "bg-red-100 text-red-800";
      case "PENALTY":
        return "bg-orange-100 text-orange-800";
      case "OVERTIME":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleToggleActive = async (adjustmentId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/salaries/adjustments/${adjustmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating adjustment:", error);
    }
  };

  const handleDelete = async (adjustmentId: string) => {
    if (!confirm("Are you sure you want to delete this adjustment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/salaries/adjustments/${adjustmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting adjustment:", error);
    }
  };

  if (adjustments.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No adjustments found</h3>
        <p className="text-gray-600">
          No salary adjustments have been created yet
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
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map((adjustment) => (
              <TableRow key={adjustment.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{adjustment.staff.name}</div>
                      <div className="text-sm text-gray-500">{adjustment.staff.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(adjustment.type)}
                    <Badge className={getTypeColor(adjustment.type)}>
                      {adjustment.type}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`font-medium ${
                    adjustment.type === "DEDUCTION" || adjustment.type === "PENALTY" 
                      ? "text-red-600" 
                      : "text-green-600"
                  }`}>
                    {adjustment.type === "DEDUCTION" || adjustment.type === "PENALTY" ? "-" : "+"}
                    ${adjustment.amount.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate" title={adjustment.reason}>
                    {adjustment.reason}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(adjustment.effectiveDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={adjustment.isActive ? "default" : "secondary"}>
                    {adjustment.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedAdjustment(adjustment)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleActive(adjustment.id, !adjustment.isActive)}
                      >
                        {adjustment.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(adjustment.id)}
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

      {/* Adjustment Details Modal */}
      {selectedAdjustment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Adjustment Details</h3>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedAdjustment(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Staff Member</label>
                  <p className="text-sm">{selectedAdjustment.staff.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-sm">{selectedAdjustment.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-sm font-medium">
                    {selectedAdjustment.type === "DEDUCTION" || selectedAdjustment.type === "PENALTY" ? "-" : "+"}
                    ${selectedAdjustment.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Effective Date</label>
                  <p className="text-sm">{new Date(selectedAdjustment.effectiveDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Reason</label>
                <p className="text-sm mt-1">{selectedAdjustment.reason}</p>
              </div>

              {selectedAdjustment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-sm mt-1">{selectedAdjustment.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm">
                    <Badge variant={selectedAdjustment.isActive ? "default" : "secondary"}>
                      {selectedAdjustment.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Approved At</label>
                  <p className="text-sm">{new Date(selectedAdjustment.approvedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
