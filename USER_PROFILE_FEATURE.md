# User Profile Feature - Admin Only

## Overview
Created a dynamic user profile page that allows admins to view detailed information about any user in the system.

## Features Implemented

### 1. API Endpoint
**Location:** `/sama-hostel/app/api/users/profile/[id]/route.ts`

- **Route:** `GET /api/users/profile/[id]`
- **Access:** Admin only (checked via middleware and session validation)
- **Returns:**
  - Complete user information (excluding password)
  - Booking history with hostel and room details
  - Payment history with transaction details
  - Maintenance requests
  - Statistics (totals, active, completed, etc.)

### 2. Dynamic Page
**Location:** `/sama-hostel/app/(dashboards)/dashboard/admin/user/[name]/page.jsx`

- **Route:** `/dashboard/admin/user/[id]`
- **Access:** Admin only (protected by middleware + client-side check)
- **Features:**
  - User avatar with initial
  - Role badges (Admin, Warden, Guest, Staff)
  - Contact information display
  - Four statistics cards:
    - Total Bookings
    - Total Payments
    - Completed Bookings  
    - Maintenance Requests
  - Tabbed interface:
    - **Overview:** Basic user information
    - **Bookings:** Complete booking history with details
    - **Payments:** Payment history with transaction IDs
    - **Maintenance:** Maintenance requests

### 3. Users List Enhancement
**Updated:** `/sama-hostel/app/(dashboards)/dashboard/admin/users/page.jsx`

- Added "View Full Profile" button to each user card
- Clicking the button navigates to `/dashboard/admin/user/[userId]`
- Added Eye icon for better UX

### 4. Roles Page Enhancement
**Updated:** `/sama-hostel/app/(dashboards)/dashboard/admin/roles/page.jsx`

- Added "View Profile" button next to "Update Role" button
- Clicking the button navigates to `/dashboard/admin/user/[userId]`
- Allows quick access to detailed user information while managing roles

## Security

### Route Protection
1. **Middleware Level:** 
   - All `/dashboard/admin/*` routes require ADMIN role (existing middleware)
   - Automatic redirect if user is not admin

2. **API Level:**
   - Session validation using `getServerSession`
   - Explicit role check for ADMIN
   - Returns 401 Unauthorized if not logged in
   - Returns 403 Forbidden if not admin

3. **Client Level:**
   - Session context check on page load
   - Automatic redirect if non-admin tries to access

## Usage

### From Users Page:
1. Navigate to `/dashboard/admin/users`
2. Find a user card
3. Click "View Full Profile" button
4. View complete user information across tabs

### From Roles Page:
1. Navigate to `/dashboard/admin/roles`
2. Find a user card
3. Click "View Profile" button (next to "Update Role")
4. View complete user information across tabs

## Data Displayed

### Overview Tab
- User ID (UUID)
- Email
- Phone number
- Role
- Account creation date
- Last update date

### Bookings Tab
- Hostel name and location
- Room number and floor
- Check-in/Check-out dates
- Booking duration
- Room type and price
- Booking status (Checked In, Checked Out, Confirmed, Cancelled)
- Payment information (if available)
- Notes

### Payments Tab
- Payment amount
- Payment method
- Transaction ID
- Payment status
- Payment date
- Related booking information

### Maintenance Tab
- Request title and description
- Hostel and room
- Priority level
- Status (Pending, Resolved, etc.)
- Report date

## Technical Details

- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS with shadcn/ui components
- **Data Fetching:** Client-side fetch with React hooks
- **Date Formatting:** date-fns library
- **Authentication:** JWT-based with server-side session validation
- **Database:** Prisma ORM

## Files Created/Modified

### Created:
1. `/sama-hostel/app/api/users/profile/[id]/route.ts` - API endpoint
2. `/sama-hostel/app/(dashboards)/dashboard/admin/user/[name]/page.jsx` - Dynamic page

### Modified:
1. `/sama-hostel/app/(dashboards)/dashboard/admin/users/page.jsx` - Added view profile button
2. `/sama-hostel/app/(dashboards)/dashboard/admin/roles/page.jsx` - Added view profile button

## Future Enhancements (Optional)
- Add user editing capability
- Add user deletion with confirmation
- Export user data to PDF/CSV
- Add user activity timeline
- Add email/notification functionality
- Add user role management from profile page

