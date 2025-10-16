"use client";

import { useEffect, useState } from "react";
import logout from "@/lib/logout";

export default function AuthTestPage() {
  const [session, setSession] = useState<{
    loggedIn: boolean;
    user?: any;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const fetchSession = async () => {
    try {
      setLoading(true);
      addTestResult("🔄 Fetching session...");

      const res = await fetch("/api/auth/sessions", {
        method: "GET",
        credentials: "include", // Important: includes cookies!
      });

      const data = await res.json();
      addTestResult(`📡 Response status: ${res.status}`);
      addTestResult(`📦 Response data: ${JSON.stringify(data, null, 2)}`);

      setSession(data);

      if (data.loggedIn) {
        addTestResult("✅ Login test PASSED - User is authenticated");
      } else {
        addTestResult("❌ Login test FAILED - User is not authenticated");
      }
    } catch (error) {
      console.error("Session fetch error:", error);
      addTestResult(`❌ Network error: ${error}`);
      setSession({ loggedIn: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    addTestResult("🚪 Testing logout...");
    await logout();
  };

  const runFullTest = async () => {
    setTestResults([]);
    addTestResult("🧪 Starting full authentication test...");
    await fetchSession();
  };

  useEffect(() => {
    fetchSession();
  }, []);

  if (loading && session === null) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-2">Loading authentication test...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔐 Authentication Test Page</h1>

      {/* Test Controls */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={fetchSession}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🔄 Refresh Session
          </button>
          <button
            onClick={runFullTest}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            🧪 Run Full Test
          </button>
          <button
            onClick={testLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            🚪 Test Logout
          </button>
        </div>
      </div>

      {/* Authentication Status */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>

        {session?.loggedIn ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">✅</span>
              <span className="font-bold">LOGGED IN</span>
            </div>
            <div className="ml-8">
              <p>
                <strong>Email:</strong> {session.user?.email}
              </p>
              <p>
                <strong>Name:</strong> {session.user?.name}
              </p>
              <p>
                <strong>Role:</strong> {session.user?.role}
              </p>
              <p>
                <strong>User ID:</strong> {session.user?.id}
              </p>
              {session.user?.address && (
                <div className="mt-2">
                  <p>
                    <strong>Address:</strong>
                  </p>
                  <p className="ml-4">
                    {session.user.address.street}, {session.user.address.city},{" "}
                    {session.user.address.state}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">❌</span>
              <span className="font-bold">NOT LOGGED IN</span>
            </div>
            {session?.error && (
              <p className="ml-8">
                <strong>Error:</strong> {session.error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Test Results */}
      <div className="bg-gray-50 border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">
              No test results yet. Click "Run Full Test" to start.
            </p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-4">Quick Navigation:</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/auth/signin" className="text-blue-600 hover:underline">
            🔑 Go to Sign In
          </a>
          <a href="/auth/signup" className="text-green-600 hover:underline">
            📝 Go to Sign Up
          </a>
          <a href="/dashboard" className="text-purple-600 hover:underline">
            🏠 Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
