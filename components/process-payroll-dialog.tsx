"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Staff {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  baseSalary: number;
  hourlyRate: number;
  isActive: boolean;
}

interface ProcessPayrollDialogProps {
  onSuccess: () => void;
}

export function ProcessPayrollDialog({ onSuccess }: ProcessPayrollDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    payPeriod: "MONTHLY",
    payDate: new Date(),
    includeAdjustments: true,
  });

  useEffect(() => {
    if (open) {
      fetchStaff();
    }
  }, [open]);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      if (response.ok) {
        const data = await response.json();
        setStaff(data.filter((s: Staff) => s.isActive));
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/salaries/process-payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          payDate: formData.payDate.toISOString(),
          staffIds: selectedStaff.length > 0 ? selectedStaff : undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Payroll processed successfully! ${result.processedCount} salaries created.`);
        setOpen(false);
        onSuccess();
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error processing payroll:", error);
      alert("Error processing payroll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedStaff([]);
    setFormData({
      payPeriod: "MONTHLY",
      payDate: new Date(),
      includeAdjustments: true,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStaff(staff.map(s => s.id));
    } else {
      setSelectedStaff([]);
    }
  };

  const handleStaffToggle = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaff(prev => [...prev, staffId]);
    } else {
      setSelectedStaff(prev => prev.filter(id => id !== staffId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Process Payroll
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Payroll</DialogTitle>
          <DialogDescription>
            Generate salary payments for staff members for the selected period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payPeriod">Pay Period</Label>
              <Select
                value={formData.payPeriod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, payPeriod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pay period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payDate">Pay Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.payDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.payDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, payDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeAdjustments"
                checked={formData.includeAdjustments}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, includeAdjustments: checked as boolean }))
                }
              />
              <Label htmlFor="includeAdjustments">
                Include salary adjustments (bonuses, deductions, etc.)
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Staff Members</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectAll"
                  checked={selectedStaff.length === staff.length && staff.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="selectAll">Select All</Label>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-md">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center space-x-2 p-3 border-b last:border-b-0">
                  <Checkbox
                    id={member.id}
                    checked={selectedStaff.includes(member.id)}
                    onCheckedChange={(checked) => handleStaffToggle(member.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-500">
                      {member.position} • {member.department}
                    </div>
                    <div className="text-sm text-gray-500">
                      Base: ${member.baseSalary?.toLocaleString() || 0} | 
                      Hourly: ${member.hourlyRate?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {staff.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No active staff members found.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || staff.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Process Payroll
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
