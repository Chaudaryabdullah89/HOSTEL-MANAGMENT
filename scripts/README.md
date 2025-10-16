# Automated Payment System

This directory contains scripts for automated monthly payment creation.

## Overview

The automated payment system creates payments for all active bookings on the 1st of each month, but only for bookings that don't already have payments in the current month.

## Files

- `auto-payments.js` - Main script for creating automated payments
- `README.md` - This documentation file

## How It Works

1. **Fetches Active Bookings**: Gets all bookings with status `CONFIRMED` or `CHECKED_IN`
2. **Checks Existing Payments**: Skips bookings that already have payments in the current month
3. **Calculates Amounts**: 
   - Monthly bookings: Uses `pricePerMonth`
   - Daily bookings: Calculates `pricePerNight × duration`
4. **Creates Payments**: Generates payments with status `PENDING` and method `AUTO_GENERATED`

## Usage

### Manual Execution

```bash
# Run the script manually
node scripts/auto-payments.js

# Or using npm script (if added to package.json)
npm run auto-payments
```

### Scheduled Execution (Cron Job)

Add this to your crontab to run on the 1st of each month at 9 AM:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path as needed)
0 9 1 * * cd /path/to/sama-hostel && node scripts/auto-payments.js
```

### Environment Variables

- `API_BASE_URL`: Base URL for the API (default: http://localhost:3003)

## API Endpoint

The script calls the `/api/payments/auto-create` endpoint which:

- Requires authentication
- Returns detailed results including created payments and skipped bookings
- Handles errors gracefully

## Output

The script provides detailed console output including:

- Summary of total bookings processed
- Number of payments created
- Number of bookings skipped (with reasons)
- List of created payments with details
- List of skipped bookings with reasons

## Error Handling

- Network errors are caught and reported
- Database errors are logged
- Invalid bookings are skipped with reasons
- Script exits with appropriate status codes

## Security

- Requires valid session authentication
- Only processes active bookings
- Prevents duplicate payments for the same month
- Validates payment amounts before creation

## Monitoring

Check the console output or application logs to monitor:

- Successful payment creation
- Skipped bookings and reasons
- Any errors or issues
- Performance metrics

## Troubleshooting

### Common Issues

1. **Authentication Error**: Ensure the API is running and accessible
2. **No Bookings Found**: Check if there are active bookings in the system
3. **Database Errors**: Verify database connection and schema
4. **Network Issues**: Check API_BASE_URL configuration

### Debug Mode

For debugging, you can modify the script to include more verbose logging or run it in a development environment first.

## Integration

This system integrates with:

- Payment management UI (manual trigger button)
- Booking system (fetches active bookings)
- User management (associates payments with users)
- Room management (calculates amounts based on room prices)
