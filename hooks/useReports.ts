import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'react-hot-toast';

// Fetch reports data with optional filters
export function useReports(filters?: {
  type?: string;
  hostelId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.reportsList(), filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.period) params.append('period', filters.period);

      const response = await fetch(`/api/reports?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - reports don't change frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Fetch report statistics
export function useReportStats(filters?: {
  hostelId?: string;
  period?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.reportsList(), 'stats', filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);
      if (filters?.period) params.append('period', filters.period);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/reports/stats?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch report statistics');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Fetch dashboard statistics
export function useDashboardStats(filters?: {
  hostelId?: string;
  period?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.reportsList(), 'dashboard', filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);
      if (filters?.period) params.append('period', filters.period);

      const response = await fetch(`/api/reports/dashboard?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch financial reports
export function useFinancialReports(filters?: {
  hostelId?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: 'revenue' | 'expenses' | 'profit';
}) {
  return useQuery({
    queryKey: [...queryKeys.reportsList(), 'financial', filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.type) params.append('type', filters.type);

      const response = await fetch(`/api/reports/financial?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch financial reports');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Fetch occupancy reports
export function useOccupancyReports(filters?: {
  hostelId?: string;
  dateFrom?: string;
  dateTo?: string;
  roomType?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.reportsList(), 'occupancy', filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.hostelId) params.append('hostelId', filters.hostelId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.roomType) params.append('roomType', filters.roomType);

      const response = await fetch(`/api/reports/occupancy?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch occupancy reports');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Generate custom report mutation
export function useGenerateReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportData: {
      type: string;
      filters: any;
      format?: 'pdf' | 'excel' | 'csv';
    }) => {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate report');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate reports cache
      queryClient.invalidateQueries({ queryKey: queryKeys.reports });
      toast.success('Report generated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate report');
    },
  });
}

// Export report mutation
export function useExportReport() {
  return useMutation({
    mutationFn: async (exportData: {
      type: string;
      filters: any;
      format: 'pdf' | 'excel' | 'csv';
    }) => {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export report');
      }
      
      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${exportData.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Report exported successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export report');
    },
  });
}
