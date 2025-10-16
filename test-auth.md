# 🔐 Authentication Test Guide

## How to Test the Login System

### 1. **Start the Development Server**
```bash
cd sama-hostel
npm run dev
```

### 2. **Navigate to Test Page**
Go to: `http://localhost:3000/auth`

### 3. **Test Scenarios**

#### **Scenario A: Not Logged In**
1. Open browser in incognito/private mode
2. Go to `http://localhost:3000/auth`
3. **Expected Result**: 
   - ❌ NOT LOGGED IN status
   - Error message about no token
   - Test results show "Login test FAILED"

#### **Scenario B: Sign Up & Login**
1. Go to `http://localhost:3000/auth/signup`
2. Fill out the registration form
3. **Expected Result**: 
   - Success message
   - Automatic redirect or login
   - Cookie should be set

4. Go to `http://localhost:3000/auth`
5. **Expected Result**:
   - ✅ LOGGED IN status
   - User details displayed
   - Test results show "Login test PASSED"

#### **Scenario C: Sign In**
1. Go to `http://localhost:3000/auth/signin`
2. Use existing credentials
3. **Expected Result**: 
   - Success message
   - Cookie should be set

4. Go to `http://localhost:3000/auth`
5. **Expected Result**:
   - ✅ LOGGED IN status
   - User details displayed

#### **Scenario D: Logout Test**
1. While logged in, go to `http://localhost:3000/auth`
2. Click "🚪 Test Logout" button
3. **Expected Result**:
   - Redirected to signin page
   - Cookie cleared

### 4. **What to Look For**

#### **✅ Success Indicators:**
- Green "LOGGED IN" status
- User email, name, role displayed
- Test results show "PASSED"
- No error messages

#### **❌ Failure Indicators:**
- Red "NOT LOGGED IN" status
- Error messages in test results
- Network errors
- Missing user data

### 5. **Debugging Steps**

If login is not working:

1. **Check Browser Console**:
   - Look for JavaScript errors
   - Check network tab for failed requests

2. **Check Server Console**:
   - Look for API errors
   - Check database connection

3. **Check Environment Variables**:
   - Ensure `JWT_SECRET` is set
   - Check database connection string

4. **Test API Directly**:
   - Go to `http://localhost:3000/api/auth/sessions`
   - Should return JSON response

### 6. **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| "No token provided" | User not logged in, need to sign in first |
| "Invalid or expired token" | Token expired, need to sign in again |
| "User not found" | Database issue, check user exists |
| Network error | Check if server is running |
| Cookie not set | Check if signin/signup is working |

### 7. **Test Results Interpretation**

- **🔄 Fetching session...** - API call started
- **📡 Response status: 200** - Success
- **📡 Response status: 401** - Unauthorized (not logged in)
- **📦 Response data: {...}** - Full API response
- **✅ Login test PASSED** - Authentication working
- **❌ Login test FAILED** - Authentication not working

