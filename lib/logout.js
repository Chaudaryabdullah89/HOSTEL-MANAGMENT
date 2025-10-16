"use client";

export const logout = async () => {
  try {
    // Clear the token cookie by setting it to expire
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Optionally call a logout API endpoint if you have one
    // await fetch('/api/auth/logout', { method: 'POST' });
    
    // Reload the page to reset all state
    window.location.href = '/auth/signin';
  } catch (error) {
    console.error('Logout failed:', error);
    // Force reload even if logout fails
    window.location.href = '/auth/signin';
  }
};

export default logout;

