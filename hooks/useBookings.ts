import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';

export function useBookings(filters?: {
  status?: string;
  hostelId?: string;
  userId?: string;
  roomId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.bookingsList(), filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.roomId) params.append('roomId', filters.roomId);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/booking/getallbooking?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds - bookings change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}


export function useBookingById(id: string) {
  return useQuery({
    queryKey: [...queryKeys.bookingsList(), 'detail', id],
    queryFn: async () => {
      const response = await fetch(`/api/booking/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Create booking mutation
export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      // Also invalidate rooms to update availability
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
      toast.success('Booking created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });
}

// Update booking mutation
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      const response = await fetch(`/api/booking/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update booking');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate bookings list
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      // Update specific booking in cache
      queryClient.setQueryData(
        [...queryKeys.bookingsList(), 'detail', variables.id],
        data
      );
      toast.success('Booking updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update booking');
    },
  });
}

// Delete booking mutation
export function useDeleteBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/booking/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate bookings and rooms
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
      toast.success('Booking deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete booking');
    },
  });
}

// Update booking status mutation
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch('/api/booking/changebookingstatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update booking status');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate bookings list
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      // Update specific booking in cache
      queryClient.setQueryData(
        [...queryKeys.bookingsList(), 'detail', variables.id],
        data
      );
      toast.success('Booking status updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update booking status');
    },
  });
}

// Confirm booking mutation
export function useConfirmBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch('/api/booking/confirmbooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      toast.success('Booking confirmed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm booking');
    },
  });
}
