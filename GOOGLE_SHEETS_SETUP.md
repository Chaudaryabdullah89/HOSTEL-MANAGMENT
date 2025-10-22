# Google Sheets Integration Setup

This guide will help you set up automatic data synchronization to Google Sheets.

## Prerequisites

1. A Google Cloud Project
2. Google Sheets API enabled
3. Service account credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your Project ID

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

## Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Name: `hostel-management-service`
   - Description: `Service account for hostel management system`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 4: Generate Service Account Key

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file
<!-- AIzaSyD8BbQq2JHxpbmxKIpA8kKOwgGkenYvn9A -->

## Step 5: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it "Hostel Management Data"
4. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

## Step 6: Share Spreadsheet with Service Account

1. In your Google Spreadsheet, click "Share"
2. Add the service account email (from the JSON file) as an editor
3. The email format is: `your-service-account@your-project-id.iam.gserviceaccount.com`

## Step 7: Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Google Sheets Integration
GOOGLE_SHEETS_ID="your-spreadsheet-id-here"
GOOGLE_PROJECT_ID="your-project-id-here"
GOOGLE_PRIVATE_KEY_ID="from-json-file"
GOOGLE_PRIVATE_KEY="from-json-file"
GOOGLE_CLIENT_EMAIL="from-json-file"
GOOGLE_CLIENT_ID="from-json-file"
```

## Step 8: Initialize Spreadsheet

The system will automatically create the following sheets:
- Bookings
- Payments
- Rooms
- Maintenance
- Users
- Expenses
- Salaries

## How It Works

Once configured, the system will automatically:
1. Add new records to Google Sheets when created
2. Update existing records when modified
3. Maintain real-time synchronization

## Data Structure

Each sheet will have appropriate headers and will be populated with:
- Booking details (guest info, dates, room, etc.)
- Payment transactions (amount, method, status, etc.)
- Room information (number, type, pricing, etc.)
- Maintenance requests (title, priority, status, etc.)
- User accounts (name, email, role, etc.)
- Expense records (amount, category, status, etc.)
- Salary records (staff info, amounts, dates, etc.)

## Troubleshooting

1. **Permission denied**: Make sure the service account has editor access to the spreadsheet
2. **API not enabled**: Ensure Google Sheets API is enabled in your Google Cloud project
3. **Invalid credentials**: Double-check all environment variables are correctly set
4. **Spreadsheet not found**: Verify the GOOGLE_SHEETS_ID is correct

## Security Notes

- Keep your service account JSON file secure
- Never commit the JSON file to version control
- Use environment variables for all sensitive data
- Regularly rotate service account keys
