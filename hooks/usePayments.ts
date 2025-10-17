import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';

// Fetch unified payments
export function usePayments(filters?: {
  status?: string;
  paymentType?: string;
  month?: string;
  year?: string;
  showAll?: boolean;
}) {
  return useQuery({
    queryKey: [...queryKeys.paymentsUnified(), filters || {}],
    queryFn: async () => {
      const response = await fetch('/api/payments/unified');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute - payments change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch payments by status
export function usePaymentsByStatus(status: string) {
  return useQuery({
    queryKey: [...queryKeys.paymentsList(), 'byStatus', status],
    queryFn: async () => {
      const response = await fetch(`/api/payments/getpayments?status=${status}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments by status');
      }
      return response.json();
    },
    enabled: !!status,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Fetch single payment
export function usePaymentById(id: string) {
  return useQuery({
    queryKey: [...queryKeys.paymentsList(), 'detail', id],
    queryFn: async () => {
      const response = await fetch(`/api/payments/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Create payment mutation
export function useCreatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await fetch('/api/payments/createpayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      toast.success('Payment created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update payment status mutation
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payment status');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.setQueryData(
        [...queryKeys.paymentsList(), 'detail', variables.id],
        data
      );
      toast.success('Payment status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Approve payment mutation
export function useApprovePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await fetch(`/api/payments/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve payment');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.setQueryData(
        [...queryKeys.paymentsList(), 'detail', variables.id],
        data
      );
      toast.success('Payment approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Reject payment mutation
export function useRejectPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/payments/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject payment');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.setQueryData(
        [...queryKeys.paymentsList(), 'detail', variables.id],
        data
      );
      toast.success('Payment rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete payment mutation
export function useDeletePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete payment');
      }
      
      return response.json();
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.removeQueries({
        queryKey: [...queryKeys.paymentsList(), 'detail', id]
      });
      toast.success('Payment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Unified payment approval mutation
export function useUnifiedApprovePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ paymentId, type }: { paymentId: string; type: string }) => {
      const response = await fetch('/api/payments/unified/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, type }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve payment');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate all payment-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentsUnified() });
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentsList() });
      
      // Update specific payment in cache if it exists
      queryClient.setQueryData(
        [...queryKeys.paymentsList(), 'detail', variables.paymentId],
        data
      );
      
      const successMessage = variables.type === 'booking' 
        ? 'Payment approved and booking confirmed successfully!'
        : variables.type === 'salary' 
        ? 'Salary payment approved successfully!'
        : 'Payment approved successfully!';
      toast.success(successMessage);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Unified payment rejection mutation
export function useUnifiedRejectPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ paymentId, type, reason }: { paymentId: string; type: string; reason: string }) => {
      const response = await fetch('/api/payments/unified/reject', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, type, reason }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject payment');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate all payment-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentsUnified() });
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentsList() });
      
      // Update specific payment in cache if it exists
      queryClient.setQueryData(
        [...queryKeys.paymentsList(), 'detail', variables.paymentId],
        data
      );
      
      const successMessage = variables.type === 'booking' 
        ? 'Payment rejected and booking cancelled successfully!'
        : variables.type === 'salary' 
        ? 'Salary payment rejected successfully!'
        : 'Payment rejected successfully!';
      toast.success(successMessage);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
