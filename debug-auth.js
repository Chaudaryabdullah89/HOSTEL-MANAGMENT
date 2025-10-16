// Debug Authentication Issues
// Run this in browser console at http://localhost:3000/auth

async function debugAuth() {
  console.log("🔍 DEBUGGING AUTHENTICATION...");
  
  // Check cookies
  console.log("\n1️⃣ Checking cookies:");
  const cookies = document.cookie;
  console.log("All cookies:", cookies);
  
  const tokenCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='));
  console.log("Token cookie:", tokenCookie);
  
  if (tokenCookie) {
    const token = tokenCookie.split('=')[1];
    console.log("Token value:", token);
    
    // Decode token to check expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("Token payload:", payload);
      console.log("Token expires at:", new Date(payload.exp * 1000));
      console.log("Current time:", new Date());
      console.log("Token expired?", payload.exp * 1000 < Date.now());
    } catch (e) {
      console.log("Error decoding token:", e);
    }
  } else {
    console.log("❌ No token cookie found!");
  }
  
  // Test sessions API
  console.log("\n2️⃣ Testing sessions API:");
  try {
    const response = await fetch('/api/auth/sessions', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);
    
    const data = await response.json();
    console.log("Response data:", data);
    
    if (data.loggedIn) {
      console.log("✅ Sessions API says: LOGGED IN");
      console.log("User:", data.user);
    } else {
      console.log("❌ Sessions API says: NOT LOGGED IN");
      console.log("Error:", data.error);
    }
  } catch (error) {
    console.log("❌ Sessions API error:", error);
  }
  
  // Test with explicit token
  console.log("\n3️⃣ Testing with explicit token:");
  if (tokenCookie) {
    const token = tokenCookie.split('=')[1];
    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cookie': `token=${token}`
        }
      });
      
      const data = await response.json();
      console.log("Explicit token response:", data);
    } catch (error) {
      console.log("Explicit token error:", error);
    }
  }
  
  console.log("\n🏁 Debug complete!");
}

// Run the debug
debugAuth();

