import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';

// Fetch all expenses with optional filters
export function useExpenses(filters?: {
  status?: string;
  category?: string;
  hostelId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.expensesList(), filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/expenses?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch expense statistics
export function useExpenseStats(filters?: {
  hostelId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.expensesList(), 'stats', filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/expenses/stats?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expense statistics');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch single expense by ID
export function useExpenseById(id: string) {
  return useQuery({
    queryKey: [...queryKeys.expensesList(), 'detail', id],
    queryFn: async () => {
      const response = await fetch(`/api/expenses/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expense');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Create expense mutation
export function useCreateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expenseData: any) => {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create expense');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate expenses list and stats
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      toast.success('Expense created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create expense');
    },
  });
}

// Update expense mutation
export function useUpdateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update expense');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate expenses list and stats
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      // Update specific expense in cache
      queryClient.setQueryData(
        [...queryKeys.expensesList(), 'detail', variables.id],
        data
      );
      toast.success('Expense updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update expense');
    },
  });
}

// Delete expense mutation
export function useDeleteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete expense');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate expenses list and stats
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      toast.success('Expense deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete expense');
    },
  });
}

// Approve expense mutation
export function useApproveExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await fetch(`/api/expenses/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve expense');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      toast.success('Expense approved successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve expense');
    },
  });
}

// Reject expense mutation
export function useRejectExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/expenses/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject expense');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      toast.success('Expense rejected successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject expense');
    },
  });
}
