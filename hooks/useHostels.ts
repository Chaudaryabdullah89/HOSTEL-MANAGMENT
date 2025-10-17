import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';

// Fetch all hostels
export function useHostels() {
  return useQuery({
    queryKey: queryKeys.hostelsList(),
    queryFn: async () => {
      const response = await fetch('/api/hostel/gethostels');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hostels: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// Fetch single hostel by ID
export function useHostel(hostelId: string | null) {
  return useQuery({
    queryKey: queryKeys.hostel(hostelId || ''),
    queryFn: async () => {
      if (!hostelId) return null;
      
      const response = await fetch(`/api/hostel/${hostelId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hostel: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!hostelId, // Only run query if hostelId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Create hostel mutation
export function useCreateHostel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hostelData: any) => {
      const response = await fetch('/api/hostel/createhostel', {
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
      // Invalidate all hostels queries
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
    onSuccess: (data, variables) => {
      // Invalidate all hostels queries
      queryClient.invalidateQueries({ queryKey: queryKeys.hostels });
      // Invalidate specific hostel query
      queryClient.invalidateQueries({ queryKey: queryKeys.hostel(variables.id) });
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
      const response = await fetch(`/api/hostel/${hostelId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete hostel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all hostels queries
      queryClient.invalidateQueries({ queryKey: queryKeys.hostels });
      toast.success('Hostel deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}