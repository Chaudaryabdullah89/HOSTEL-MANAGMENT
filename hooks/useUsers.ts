import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient, queryKeys } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';
import { error } from 'console';

export function useUsers(filters?: {
  role?: string;
  search?: string;
  status?: string;
  hostelId?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.usersList(), filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);

      const response = await fetch(`/api/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch users by role
export function useUsersByRole(roles: string[]) {
  return useQuery({
    queryKey: [...queryKeys.usersList(), 'byRole', roles],
    queryFn: async () => {
      const params = new URLSearchParams();
      roles.forEach(role => params.append('role', role));

      const response = await fetch(`/api/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users by role');
      }
      return response.json();
    },
    enabled: roles.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Fetch single user by ID
export function useUserById(id: string) {
  return useQuery({
    queryKey: [...queryKeys.usersList(), 'detail', id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Fetch user statistics
export function useUserStats() {
  return useQuery({
    queryKey: [...queryKeys.usersList(), 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/users/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate users list and stats
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('User created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      // Update specific user in cache with the user data from the response
      queryClient.setQueryData(
        [...queryKeys.usersList(), 'detail', variables.id],
        { user: data.user }
      );
      // Don't show toast here - let the component handle it
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
}

export function useUpdateTheUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ updateddata }: { updateddata: any }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateddata)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.usersList(), 'detail', userId] });
      toast.success('User updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    }
  });
}

// Update user role mutation
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newRole, reason, hostelId }: {
      userId: string;
      newRole: string;
      reason?: string;
      hostelId?: string | null;
    }) => {
      const response = await fetch('/api/users/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole, reason, hostelId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user role');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      // Update specific user in cache
      queryClient.setQueryData(
        [...queryKeys.usersList(), 'detail', variables.userId],
        data
      );
      toast.success(`User role updated to ${variables.newRole} successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate users list and stats
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('User deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
}

// Toggle user status mutation (activate/deactivate)
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const response = await fetch(`/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user status');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      // Update specific user in cache
      queryClient.setQueryData(
        [...queryKeys.usersList(), 'detail', variables.id],
        data
      );
      toast.success(`User ${variables.status === 'active' ? 'activated' : 'deactivated'} successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user status');
    },
  });
}
