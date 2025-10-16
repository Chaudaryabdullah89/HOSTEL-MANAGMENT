"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      const info: any = {};
      
      // 1. Check cookies
      info.cookies = document.cookie;
      const tokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='));
      info.tokenCookie = tokenCookie;
      
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        info.token = token;
        
        // Decode token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          info.tokenPayload = payload;
          info.tokenExpired = payload.exp * 1000 < Date.now();
          info.tokenExpiresAt = new Date(payload.exp * 1000).toLocaleString();
        } catch (e) {
          info.tokenDecodeError = e.message;
        }
      }
      
      // 2. Test sessions API
      try {
        const response = await fetch('/api/auth/sessions', {
          method: 'GET',
          credentials: 'include'
        });
        
        info.sessionsResponse = {
          status: response.status,
          statusText: response.statusText,
          headers: [...response.headers.entries()],
          data: await response.json()
        };
      } catch (error) {
        info.sessionsError = error.message;
      }
      
      setDebugInfo(info);
      setLoading(false);
    };
    
    runDebug();
  }, []);

  if (loading) {
    return <div className="p-6">Loading debug info...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Authentication Debug</h1>
      
      <div className="space-y-6">
        {/* Cookies */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">🍪 Cookies</h2>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
            {JSON.stringify(debugInfo.cookies, null, 2)}
          </pre>
        </div>
        
        {/* Token */}
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">🔑 Token</h2>
          <p><strong>Token Cookie:</strong> {debugInfo.tokenCookie || 'Not found'}</p>
          <p><strong>Token Value:</strong> {debugInfo.token || 'Not found'}</p>
          {debugInfo.tokenPayload && (
            <>
              <p><strong>Token Expires:</strong> {debugInfo.tokenExpiresAt}</p>
              <p><strong>Token Expired:</strong> {debugInfo.tokenExpired ? 'Yes' : 'No'}</p>
            </>
          )}
          {debugInfo.tokenDecodeError && (
            <p className="text-red-600"><strong>Decode Error:</strong> {debugInfo.tokenDecodeError}</p>
          )}
        </div>
        
        {/* Sessions API */}
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">📡 Sessions API</h2>
          <p><strong>Status:</strong> {debugInfo.sessionsResponse?.status}</p>
          <p><strong>Status Text:</strong> {debugInfo.sessionsResponse?.statusText}</p>
          {debugInfo.sessionsError && (
            <p className="text-red-600"><strong>Error:</strong> {debugInfo.sessionsError}</p>
          )}
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto mt-2">
            {JSON.stringify(debugInfo.sessionsResponse?.data, null, 2)}
          </pre>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">🚀 Quick Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔑 Go to Sign In
            </button>
            <button
              onClick={() => window.location.href = '/auth'}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              🧪 Go to Auth Test
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



