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
      return response.json();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
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

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', id] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
      toast.success('Reply sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
