import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';

// Fetch all rooms
export function useRooms() {
  return useQuery({
    queryKey: queryKeys.roomsList(),
    queryFn: async () => {
      const response = await fetch('/api/room/getallrooms');
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      return response.json();
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, 
  });
}

// Fetch rooms by hostel
export function useRoomsByHostel(hostelId: string | null) {
  return useQuery({
    queryKey: queryKeys.roomsByHostel(hostelId || ''),
    queryFn: async () => {
      if (!hostelId) return [];
      
      const response = await fetch(`/api/room/gethostelrooms?hostelId=${hostelId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rooms for hostel');
      }
      return response.json();
    },
    enabled: !!hostelId, // Only run query if hostelId is provided
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Create room mutation
export function useCreateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roomData: any) => {
      const response = await fetch('/api/room/createroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create room');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate all rooms queries
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
      // Also invalidate specific hostel rooms
      if (variables.hostelId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.roomsByHostel(variables.hostelId) });
      }
      toast.success('Room created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update room mutation
export function useUpdateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/room/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update room');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
      // Invalidate specific hostel rooms if hostelId changed
      if (variables.data.hostelId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.roomsByHostel(variables.data.hostelId) });
      }
      toast.success('Room updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete room mutation
export function useDeleteRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(`/api/room/${roomId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete room');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
      toast.success('Room deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update room status mutation (for bookings)
export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/room/updatestatuses', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update room statuses');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all rooms to get updated statuses
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
    },
    onError: (error: Error) => {
      console.error('Error updating room statuses:', error);
    },
  });
}
