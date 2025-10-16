// Fetches the session (logged-in user info) from /api/auth/sessions
export async function fetchSession() {
  try {
    const res = await fetch('/api/auth/sessions', {
      method: 'GET',
      credentials: 'include', // send cookies
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      // Could handle 401 for unauthenticated
      return { loggedIn: false, user: null, error: 'Could not fetch session' };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    return { loggedIn: false, user: null, error: error?.message || "Network error" };
  }
}
