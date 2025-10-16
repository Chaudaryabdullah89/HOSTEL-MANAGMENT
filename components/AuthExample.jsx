"use client";
import useIsUserLoggedIn from "@/lib/isloogedin";

export default function AuthExample() {
  const { isLoggedIn, user, loading, error, refetch } = useIsUserLoggedIn();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Authentication Error: {error}</p>
        <button 
          onClick={refetch}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoggedIn && user) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <h3 className="font-bold">Welcome, {user.name}!</h3>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <button 
          onClick={refetch}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Refresh User Data
        </button>
      </div>
    );
  }

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      <p>You are not logged in.</p>
      <button 
        onClick={refetch}
        className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
      >
        Check Again
      </button>
    </div>
  );
}

