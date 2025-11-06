import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// No filters needed - all filtering is done on frontend

interface CreateComplaintData {
  title: string;
  description: string;
  category?: string;
  priority?: string;
  roomId?: string;
  hostelId: string;
  images?: string[];
}

interface UpdateComplaintData {
  status?: string;
  priority?: string;
  assignedTo?: string;
  adminReply?: string;
}

// Fetch complaints
export const useComplaints = () => {
  return useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const response = await fetch('/api/complaints');
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      const data = await response.json();
      // Normalize: accept either an array or an object { complaints }
      if (Array.isArray(data)) {
        return { complaints: data };
      }
      if (data && Array.isArray(data.complaints)) {
        return data;
      }
      return { complaints: [] };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single complaint
export const useComplaint = (id: string) => {
  return useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const response = await fetch(`/api/complaints/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch complaint');
      }
      return response.json();
    },
    enabled: !!id,
  });
};

// Fetch complaint stats
export const useComplaintStats = () => {
  return useQuery({
    queryKey: ['complaint-stats'],
    queryFn: async () => {
      const response = await fetch('/api/complaints/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch complaint stats');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create complaint mutation
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateComplaintData) => {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create complaint');
      }

      return response.json();
    },
    onSuccess: (newComplaint) => {
      // Optimistically update the complaints list
      queryClient.setQueryData(['complaints'], (oldData: any) => {
        if (!oldData) return { complaints: [newComplaint] };
        return {
          ...oldData,
          complaints: [newComplaint, ...(oldData.complaints || [])],
        };
      });
      // Update stats
      queryClient.setQueryData(['complaint-stats'], (oldStats: any) => {
        if (!oldStats) return oldStats;
        return {
          ...oldStats,
          summary: {
            ...oldStats.summary,
            totalComplaints: (oldStats.summary?.totalComplaints || 0) + 1,
          },
          statusBreakdown: oldStats.statusBreakdown?.map((s: any) =>
            s.status === newComplaint.status
              ? { ...s, count: (s.count || 0) + 1 }
              : s
          ) || [],
        };
      });
      toast.success('Complaint submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update complaint mutation
export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateComplaintData }) => {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update complaint');
      }

      return response.json();
    },
    onSuccess: (updatedComplaint, { id, data }) => {
      // Get old complaint to check status change
      const oldData = queryClient.getQueryData(['complaints']) as any;
      const oldComplaint = oldData?.complaints?.find((c: any) => c.id === id);

      // Optimistically update the complaints list
      queryClient.setQueryData(['complaints'], (oldData: any) => {
        if (!oldData || !oldData.complaints) return oldData;
        return {
          ...oldData,
          complaints: oldData.complaints.map((complaint: any) =>
            complaint.id === id ? updatedComplaint : complaint
          ),
        };
      });
      // Update single complaint cache
      queryClient.setQueryData(['complaint', id], updatedComplaint);

      // Update stats if status changed
      if (oldComplaint && data.status && oldComplaint.status !== data.status) {
        queryClient.setQueryData(['complaint-stats'], (oldStats: any) => {
          if (!oldStats) return oldStats;
          return {
            ...oldStats,
            statusBreakdown: oldStats.statusBreakdown?.map((s: any) => {
              if (s.status === oldComplaint.status) {
                return { ...s, count: Math.max((s.count || 0) - 1, 0) };
              }
              if (s.status === data.status) {
                return { ...s, count: (s.count || 0) + 1 };
              }
              return s;
            }) || [],
          };
        });
      }

      toast.success('Complaint updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Delete complaint mutation
export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete complaint');
      }

      return { id };
    },
    onSuccess: (_, deletedId) => {
      // Get old data to find deleted complaint status
      const oldData = queryClient.getQueryData(['complaints']) as any;
      const deletedComplaint = oldData?.complaints?.find((c: any) => c.id === deletedId);

      // Optimistically remove from complaints list
      queryClient.setQueryData(['complaints'], (oldData: any) => {
        if (!oldData || !oldData.complaints) return oldData;
        return {
          ...oldData,
          complaints: oldData.complaints.filter((complaint: any) => complaint.id !== deletedId),
        };
      });
      // Remove from single complaint cache
      queryClient.removeQueries({ queryKey: ['complaint', deletedId] });
      // Update stats
      queryClient.setQueryData(['complaint-stats'], (oldStats: any) => {
        if (!oldStats) return oldStats;
        return {
          ...oldStats,
          summary: {
            ...oldStats.summary,
            totalComplaints: Math.max((oldStats.summary?.totalComplaints || 0) - 1, 0),
          },
          statusBreakdown: oldStats.statusBreakdown?.map((s: any) =>
            deletedComplaint && s.status === deletedComplaint.status
              ? { ...s, count: Math.max((s.count || 0) - 1, 0) }
              : s
          ) || [],
        };
      });
      toast.success('Complaint deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Reply to complaint mutation
export const useReplyToComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, adminReply }: { id: string; adminReply: string }) => {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminReply }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reply to complaint');
      }

      return response.json();
    },
    onSuccess: (updatedComplaint, { id }) => {
      // Optimistically update the complaints list
      queryClient.setQueryData(['complaints'], (oldData: any) => {
        if (!oldData || !oldData.complaints) return oldData;
        return {
          ...oldData,
          complaints: oldData.complaints.map((complaint: any) =>
            complaint.id === id ? updatedComplaint : complaint
          ),
        };
      });
      // Update single complaint cache
      queryClient.setQueryData(['complaint', id], updatedComplaint);
      toast.success('Reply sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
