import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized configuration for hostel management
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes (hostels rarely change)
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Keep data in cache for 30 minutes after component unmounts
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && 'status' in error && 
            typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus for critical data
      refetchOnWindowFocus: true,
      
      // Refetch on network reconnect
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: 'always',
      
      // Background refetch interval (disabled by default, enable per query if needed)
      refetchInterval: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  // Hostels
  hostels: ['hostels'] as const,
  hostelsList: () => [...queryKeys.hostels, 'list'] as const,
  
  // Rooms
  rooms: ['rooms'] as const,
  roomsList: () => [...queryKeys.rooms, 'list'] as const,
  roomsByHostel: (hostelId: string) => [...queryKeys.rooms, 'byHostel', hostelId] as const,
  
  // Users/Staff
  users: ['users'] as const,
  usersList: () => [...queryKeys.users, 'list'] as const,
  usersByRole: (role: string) => [...queryKeys.users, 'byRole', role] as const,
  
  // Maintenance
  maintenance: ['maintenance'] as const,
  maintenanceList: () => [...queryKeys.maintenance, 'list'] as const,
  maintenanceStats: () => [...queryKeys.maintenance, 'stats'] as const,
  maintenanceById: (id: string) => [...queryKeys.maintenance, 'detail', id] as const,
  
  // Bookings
  bookings: ['bookings'] as const,
  bookingsList: () => [...queryKeys.bookings, 'list'] as const,
  
  // Payments
  payments: ['payments'] as const,
  paymentsList: () => [...queryKeys.payments, 'list'] as const,
  paymentsUnified: () => [...queryKeys.payments, 'unified'] as const,
  
  // Expenses
  expenses: ['expenses'] as const,
  expensesList: () => [...queryKeys.expenses, 'list'] as const,
  expensesStats: () => [...queryKeys.expenses, 'stats'] as const,
  
  // Reports
  reports: ['reports'] as const,
  reportsList: () => [...queryKeys.reports, 'list'] as const,
  reportsDashboard: () => [...queryKeys.reports, 'dashboard'] as const,
  reportsFinancial: () => [...queryKeys.reports, 'financial'] as const,
  reportsOccupancy: () => [...queryKeys.reports, 'occupancy'] as const,
};

// Cache invalidation utilities
export const invalidateQueries = {
  // Invalidate all hostels-related queries
  hostels: () => queryClient.invalidateQueries({ queryKey: queryKeys.hostels }),
  
  // Invalidate all rooms-related queries
  rooms: () => queryClient.invalidateQueries({ queryKey: queryKeys.rooms }),
  
  // Invalidate rooms for specific hostel
  roomsByHostel: (hostelId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.roomsByHostel(hostelId) }),
  
  // Invalidate all users-related queries
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users }),
  
  // Invalidate all maintenance-related queries
  maintenance: () => queryClient.invalidateQueries({ queryKey: queryKeys.maintenance }),
  
  // Invalidate all bookings-related queries
  bookings: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings }),
  
  // Invalidate all payments-related queries
  payments: () => queryClient.invalidateQueries({ queryKey: queryKeys.payments }),
  
  // Invalidate all expenses-related queries
  expenses: () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses }),
  
  // Invalidate all reports-related queries
  reports: () => queryClient.invalidateQueries({ queryKey: queryKeys.reports }),
};

// Prefetch utilities for better UX
export const prefetchQueries = {
  // Prefetch hostels (most commonly used)
  hostels: () => queryClient.prefetchQuery({
    queryKey: queryKeys.hostelsList(),
    queryFn: async () => {
      const response = await fetch('/api/hostel/gethostels');
      if (!response.ok) throw new Error('Failed to fetch hostels');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  }),
  
  // Prefetch rooms for a specific hostel
  roomsByHostel: (hostelId: string) => queryClient.prefetchQuery({
    queryKey: queryKeys.roomsByHostel(hostelId),
    queryFn: async () => {
      const response = await fetch(`/api/room/gethostelrooms?hostelId=${hostelId}`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      return response.json();
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  }),
};
