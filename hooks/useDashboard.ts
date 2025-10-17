import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
    summary: {
        totalRooms: number;
        occupiedRooms: number;
        availableRooms: number;
        maintenanceRooms: number;
        occupancyRate: number;
        totalUsers: number;
        totalGuests: number;
        totalStaff: number;
        totalBookings: number;
        activeBookings: number;
        pendingBookings: number;
        todayCheckIns: number;
        todayCheckOuts: number;
        totalPayments: number;
        completedPayments: number;
        pendingPayments: number;
        totalRevenue: number;
        monthlyRevenue: number;
        totalMaintenanceRequests: number;
        pendingMaintenanceRequests: number;
        inProgressMaintenanceRequests: number;
        completedMaintenanceRequests: number;
        totalExpenses: number;
        totalExpenseAmount: number;
    };
    bookingStatusDistribution: Array<{
        status: string;
        count: number;
    }>;
    paymentMethodDistribution: Array<{
        method: string;
        count: number;
        amount: number;
    }>;
    recentActivities: {
        bookings: Array<{
            id: string;
            type: string;
            message: string;
            user: {
                name: string;
                email: string;
            };
            timestamp: string;
            status: string;
        }>;
        payments: Array<{
            id: string;
            type: string;
            message: string;
            user: {
                name: string;
                email: string;
            };
            timestamp: string;
            status: string;
        }>;
        maintenance: Array<{
            id: string;
            type: string;
            message: string;
            user: {
                name: string;
                email: string;
            };
            timestamp: string;
            status: string;
        }>;
    };
    topPerformingRooms: Array<{
        roomNumber: string;
        floor: number;
        totalRevenue: number;
        bookingCount: number;
    }>;
    monthlyRevenueData: Array<{
        month: string;
        revenue: number;
        count: number;
    }>;
}

interface UseDashboardOptions {
    hostelId?: string;
    startDate?: string;
    endDate?: string;
    enabled?: boolean;
}

const fetchDashboardStats = async (options: UseDashboardOptions = {}): Promise<DashboardStats> => {
    const params = new URLSearchParams();
    
    if (options.hostelId) params.append('hostelId', options.hostelId);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const response = await fetch(`/api/dashboard/stats?${params.toString()}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
    }
    
    return response.json();
};

export const useDashboard = (options: UseDashboardOptions = {}) => {
    return useQuery({
        queryKey: ['dashboard', 'stats', options],
        queryFn: () => fetchDashboardStats(options),
        enabled: options.enabled !== false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

export const useDashboardStats = (options: UseDashboardOptions = {}) => {
    const { data, isLoading, error, refetch } = useDashboard(options);
    
    return {
        stats: data?.summary,
        bookingStatusDistribution: data?.bookingStatusDistribution || [],
        paymentMethodDistribution: data?.paymentMethodDistribution || [],
        recentActivities: data?.recentActivities || { bookings: [], payments: [], maintenance: [] },
        topPerformingRooms: data?.topPerformingRooms || [],
        monthlyRevenueData: data?.monthlyRevenueData || [],
        isLoading,
        error,
        refetch
    };
};
