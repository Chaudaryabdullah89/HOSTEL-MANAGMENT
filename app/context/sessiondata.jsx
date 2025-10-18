"use client";

import React, { createContext, useState, useEffect } from "react";

// Create context
export const SessionContext = createContext();

// Provider component
export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error("Error fetching session:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchSession();
  }, []);

  const refreshSession = async () => {
    setLoading(true);
    await fetchSession();
  };

  return (
    <SessionContext.Provider value={{ session, setSession, loading, isClient, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
};
