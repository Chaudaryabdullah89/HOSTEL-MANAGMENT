import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';

export function useMaintenance(filters?: {
  status?: string;
  priority?: string;
  hostelId?: string;
  roomId?: string;
  assignedTo?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.maintenanceList(), filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);
      if (filters?.roomId) params.append('roomId', filters.roomId);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/maintenance?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance requests');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useMaintenanceStats(filters?: {
  hostelId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.maintenanceStats(), filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/maintenance/stats?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance statistics');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useMaintenanceById(id: string) {
  return useQuery({
    queryKey: queryKeys.maintenanceById(id),
    queryFn: async () => {
      const response = await fetch(`/api/maintenance/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance request');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (maintenanceData: any) => {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create maintenance request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance });
      toast.success('Maintenance request created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update maintenance request');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance });
      queryClient.setQueryData(
        queryKeys.maintenanceById(variables.id),
        data
      );
      toast.success('Maintenance request updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete maintenance request');
      }
      
      return response.json();
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance });
      queryClient.removeQueries({
        queryKey: queryKeys.maintenanceById(id)
      });
      toast.success('Maintenance request deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAssignMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, assignedTo }: { id: string; assignedTo: string | null }) => {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign maintenance request');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance });
      queryClient.setQueryData(
        queryKeys.maintenanceById(variables.id),
        data
      );
      toast.success('Maintenance request assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update maintenance status');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance });
      queryClient.setQueryData(
        queryKeys.maintenanceById(variables.id),
        data
      );
      toast.success('Maintenance status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
