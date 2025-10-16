// Test Authentication Script
// Run this in your browser console to test the authentication system

async function testAuth() {
  console.log("🧪 Starting Authentication Test...");
  
  // Test 1: Check if not logged in
  console.log("\n1️⃣ Testing unauthenticated state...");
  try {
    const response = await fetch('/api/auth/sessions', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();
    console.log("Response:", data);
    
    if (!data.loggedIn) {
      console.log("✅ PASS: Correctly shows not logged in");
    } else {
      console.log("❌ FAIL: Should show not logged in");
    }
  } catch (error) {
    console.log("❌ ERROR:", error);
  }
  
  // Test 2: Try to sign in with test credentials
  console.log("\n2️⃣ Testing signin...");
  try {
    const signinResponse = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Replace with your test email
        password: 'password123'    // Replace with your test password
      })
    });
    
    const signinData = await signinResponse.json();
    console.log("Signin Response:", signinData);
    
    if (signinResponse.ok) {
      console.log("✅ PASS: Signin successful");
    } else {
      console.log("❌ FAIL: Signin failed -", signinData.error);
    }
  } catch (error) {
    console.log("❌ ERROR:", error);
  }
  
  // Test 3: Check if now logged in
  console.log("\n3️⃣ Testing authenticated state...");
  try {
    const response = await fetch('/api/auth/sessions', {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();
    console.log("Response:", data);
    
    if (data.loggedIn) {
      console.log("✅ PASS: Correctly shows logged in");
      console.log("User:", data.user);
    } else {
      console.log("❌ FAIL: Should show logged in");
    }
  } catch (error) {
    console.log("❌ ERROR:", error);
  }
  
  console.log("\n🏁 Test completed!");
}

// Run the test
testAuth();
