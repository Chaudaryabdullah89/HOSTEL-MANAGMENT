import { cache, CACHE_KEYS, debounce } from './cache';

// Base API configuration
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://localhost:3001/api';

// Default fetch options
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies for authentication
};

// Enhanced fetch with caching and error handling
export async function fetchWithCache(url, options = {}, cacheKey = null, ttl = 5 * 60 * 1000) {
  // Check cache first
  if (cacheKey && cache.has(cacheKey)) {
    console.log('Cache hit for:', cacheKey);
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the result
    if (cacheKey) {
      cache.set(cacheKey, data, ttl);
      console.log('Cached data for:', cacheKey);
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// API functions with caching
export const api = {
  // Hostels
  async getHostels() {
    return fetchWithCache(
      `${API_BASE}/hostel/gethostels`,
      { method: 'GET' },
      CACHE_KEYS.HOSTELS,
      5 * 60 * 1000 // 5 minutes
    );
  },

  async createHostel(hostelData) {
    const response = await fetch(`${API_BASE}/hostel/create`, {
      method: 'POST',
      ...defaultOptions,
      body: JSON.stringify(hostelData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create hostel');
    }

    // Invalidate hostels cache
    cache.delete(CACHE_KEYS.HOSTELS);
    
    return response.json();
  },

  async deleteHostel(hostelId) {
    const response = await fetch(`${API_BASE}/hostel/delete`, {
      method: 'DELETE',
      ...defaultOptions,
      body: JSON.stringify({ hostelId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete hostel');
    }

    // Invalidate hostels cache
    cache.delete(CACHE_KEYS.HOSTELS);
    
    return response.json();
  },

  // Rooms
  async getHostelRooms(hostelId) {
    if (!hostelId) return [];
    
    return fetchWithCache(
      `${API_BASE}/room/gethostelrooms?hostelId=${hostelId}`,
      { method: 'GET' },
      CACHE_KEYS.HOSTEL_ROOMS(hostelId),
      3 * 60 * 1000 // 3 minutes
    );
  },

  async createRoom(roomData) {
    const response = await fetch(`${API_BASE}/room/createroom`, {
      method: 'POST',
      ...defaultOptions,
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create room');
    }

    // Invalidate rooms cache for this hostel
    cache.delete(CACHE_KEYS.HOSTEL_ROOMS(roomData.hostelId));
    
    return response.json();
  },

  // Debounced search function
  searchRooms: debounce(async (hostelId, searchTerm) => {
    if (!searchTerm.trim()) return [];
    
    const rooms = await api.getHostelRooms(hostelId);
    return rooms.filter(room => 
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.amenities?.some(amenity => 
        amenity.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, 300), // 300ms debounce
};

// Cache management utilities
export const cacheUtils = {
  // Clear all caches
  clearAll() {
    cache.clear();
  },

  // Clear specific cache
  clearHostels() {
    cache.delete(CACHE_KEYS.HOSTELS);
  },

  clearHostelRooms(hostelId) {
    cache.delete(CACHE_KEYS.HOSTEL_ROOMS(hostelId));
  },

  // Preload data
  async preloadHostels() {
    try {
      await api.getHostels();
      console.log('Hostels preloaded');
    } catch (error) {
      console.error('Failed to preload hostels:', error);
    }
  },

  // Get cache stats
  getStats() {
    return {
      size: cache.cache.size,
      keys: Array.from(cache.cache.keys())
    };
  }
};
