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
  hostels: ['hostels'],
  hostelsList: function () { return [...this.hostels, 'list']; },

  // Rooms
  rooms: ['rooms'],
  roomsList: function () { return [...this.rooms, 'list']; },
  roomsByHostel: function (hostelId) { return [...this.rooms, 'byHostel', hostelId]; },

  // Users/Staff
  users: ['users'],
  usersList: function () { return [...this.users, 'list']; },
  usersByRole: function (role) { return [...this.users, 'byRole', role]; },
  updatetheuser : function (userId) {return [...this.users, "update", userId];},
  // Maintenance
  maintenance: ['maintenance'],
  maintenanceList: function () { return [...this.maintenance, 'list']; },
  maintenanceStats: function () { return [...this.maintenance, 'stats']; },
  maintenanceById: function (id) { return [...this.maintenance, 'detail', id]; },

  bookings: ['bookings'],
  bookingsList: function () { return [...this.bookings, 'list']; },

  // Payments
  payments: ['payments'],
  paymentsList: function () { return [...this.payments, 'list']; },
  paymentsUnified: function () { return [...this.payments, 'unified']; },

  // Expenses
  expenses: ['expenses'],
  expensesList: function () { return [...this.expenses, 'list']; },
  expensesStats: function () { return [...this.expenses, 'stats']; },

  // Reports
  reports: ['reports'],
  reportsList: function () { return [...this.reports, 'list']; },
  reportsDashboard: function () { return [...this.reports, 'dashboard']; },
  reportsFinancial: function () { return [...this.reports, 'financial']; },
  reportsOccupancy: function () { return [...this.reports, 'occupancy']; },
};

// Cache invalidation utilities
export const invalidateQueries = {
  // Invalidate all hostels-related queries
  hostels: () => queryClient.invalidateQueries({ queryKey: queryKeys.hostels }),

  // Invalidate all rooms-related queries
  rooms: () => queryClient.invalidateQueries({ queryKey: queryKeys.rooms }),

  // Invalidate rooms for specific hostel
  roomsByHostel: (hostelId) =>
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
      if (!response.ok) throw new Error('Failed to fetch hostels  ');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  }),

  // Prefetch rooms for a specific hostel
  roomsByHostel: (hostelId) => queryClient.prefetchQuery({
    queryKey: queryKeys.roomsByHostel(hostelId),
    queryFn: async () => {
      const response = await fetch(`/api/room/gethostelrooms?hostelId=${hostelId}`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      return response.json();
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  }),
};
