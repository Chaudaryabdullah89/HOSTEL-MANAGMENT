'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useHostels } from '@/hooks/useHostels';
import { useRooms } from '@/hooks/useRooms';
import { useUsersByRole } from '@/hooks/useStaff';

interface AppDataContextType {
  // Hostels
  hostels: {
    data: any[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  
  // Rooms
  rooms: {
    data: any[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  
  // Staff/Users
  staff: {
    data: any[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  
  // Helper functions
  getHostelById: (id: string) => any | undefined;
  getRoomsByHostel: (hostelId: string) => any[];
  getStaffByRole: (role: string) => any[];
  isLoading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
}

export function AppDataProvider({ children }: AppDataProviderProps) {
  // Fetch commonly used data
  const hostelsQuery = useHostels();
  const roomsQuery = useRooms();
  const staffQuery = useUsersByRole(['STAFF', 'WARDEN', 'ADMIN']);

  // Helper functions
  const getHostelById = (id: string) => {
    return hostelsQuery.data?.find((hostel: any) => hostel.id === id);
  };

  const getRoomsByHostel = (hostelId: string) => {
    return roomsQuery.data?.filter((room: any) => room.hostelId === hostelId) || [];
  };

  const getStaffByRole = (role: string) => {
    return staffQuery.data?.filter((user: any) => user.role === role) || [];
  };

  const isLoading = hostelsQuery.isLoading || roomsQuery.isLoading || staffQuery.isLoading;

  const value: AppDataContextType = {
    hostels: {
      data: hostelsQuery.data,
      isLoading: hostelsQuery.isLoading,
      error: hostelsQuery.error,
      refetch: hostelsQuery.refetch,
    },
    rooms: {
      data: roomsQuery.data,
      isLoading: roomsQuery.isLoading,
      error: roomsQuery.error,
      refetch: roomsQuery.refetch,
    },
    staff: {
      data: staffQuery.data,
      isLoading: staffQuery.isLoading,
      error: staffQuery.error,
      refetch: staffQuery.refetch,
    },
    getHostelById,
    getRoomsByHostel,
    getStaffByRole,
    isLoading,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

// Convenience hooks for specific data
export function useHostelsData() {
  const { hostels } = useAppData();
  return hostels;
}

export function useRoomsData() {
  const { rooms } = useAppData();
  return rooms;
}

export function useStaffData() {
  const { staff } = useAppData();
  return staff;
}

// Hook for getting filtered rooms by hostel
export function useRoomsByHostel(hostelId: string) {
  const { rooms, getRoomsByHostel } = useAppData();
  return {
    data: getRoomsByHostel(hostelId),
    isLoading: rooms.isLoading,
    error: rooms.error,
    refetch: rooms.refetch,
  };
}

// Hook for getting staff by specific role
export function useStaffByRole(role: string) {
  const { staff, getStaffByRole } = useAppData();
  return {
    data: getStaffByRole(role),
    isLoading: staff.isLoading,
    error: staff.error,
    refetch: staff.refetch,
  };
}
