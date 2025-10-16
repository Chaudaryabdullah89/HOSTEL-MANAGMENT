import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';

// Fetch hostels with React Query
export function useHostels() {
  return useQuery({
    queryKey: queryKeys.hostelsList(),
    queryFn: async () => {
      const response = await fetch('/api/hostel/gethostels');
      if (!response.ok) {
        throw new Error('Failed to fetch hostels');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - hostels rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Create hostel mutation
export function useCreateHostel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hostelData: any) => {
      const response = await fetch('/api/hostel/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hostelData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create hostel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch hostels
      queryClient.invalidateQueries({ queryKey: queryKeys.hostels });
      toast.success('Hostel created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update hostel mutation
export function useUpdateHostel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/hostel/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update hostel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hostels });
      toast.success('Hostel updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete hostel mutation
export function useDeleteHostel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hostelId: string) => {
      const response = await fetch('/api/hostel/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostelId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete hostel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hostels });
      toast.success('Hostel deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
