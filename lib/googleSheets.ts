import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Google Sheets configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '';

// Service account credentials (you'll need to set these in your .env file)
const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
};

class GoogleSheetsService {
    private auth: JWT;
    private sheets: any;

    constructor() {
        this.auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: SCOPES,
        });

        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    }

    // Helper method to ensure a sheet exists
    async ensureSheetExists(sheetName: string, headers: string[]) {
        try {
            // Check if sheet exists
            const spreadsheet = await this.sheets.spreadsheets.get({
                spreadsheetId: SPREADSHEET_ID
            });
            const sheetExists = spreadsheet.data.sheets?.some((sheet: any) =>
                sheet.properties?.title === sheetName
            );

            if (!sheetExists) {
                // Create the sheet
                await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: SPREADSHEET_ID,
                    requestBody: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: sheetName
                                }
                            }
                        }]
                    }
                });

                // Add headers
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${sheetName}!A1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [headers]
                    }
                });
            }
        } catch (error) {
            console.error(`Error ensuring sheet ${sheetName} exists:`, error);
        }
    }

    // Initialize spreadsheet with headers
    async initializeSpreadsheet() {
        try {
            // Create sheets for different data types
            const sheets = [
                { name: 'Bookings', headers: ['ID', 'Guest Name', 'Email', 'Room Number', 'Check-in', 'Check-out', 'Status', 'Price', 'Created At'] },
                { name: 'Payments', headers: ['ID', 'Booking ID', 'Amount', 'Method', 'Status', 'Description', 'Created At'] },
                { name: 'Rooms', headers: ['ID', 'Room Number', 'Floor', 'Type', 'Status', 'Price/Night', 'Price/Month', 'Created At'] },
                { name: 'Maintenance', headers: ['ID', 'Title', 'Description', 'Status', 'Priority', 'Room Number', 'Assigned To', 'Created At'] },
                { name: 'Users', headers: ['ID', 'Name', 'Email', 'Role', 'Phone', 'Created At'] },
                { name: 'Expenses', headers: ['ID', 'Title', 'Description', 'Amount', 'Category', 'Status', 'Submitted By', 'Created At'] },
                { name: 'Salaries', headers: ['ID', 'Staff Name', 'Position', 'Base Amount', 'Net Amount', 'Status', 'Pay Date', 'Created At'] }
            ];

            for (const sheet of sheets) {
                try {
                    // Try to add the sheet
                    await this.sheets.spreadsheets.batchUpdate({
                        spreadsheetId: SPREADSHEET_ID,
                        requestBody: {
                            requests: [{
                                addSheet: {
                                    properties: {
                                        title: sheet.name
                                    }
                                }
                            }]
                        }
                    });
                } catch (error) {
                    // Sheet might already exist, continue
                    console.log(`Sheet ${sheet.name} might already exist`);
                }

                // Add headers
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${sheet.name}!A1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [sheet.headers]
                    }
                });
            }

            console.log('Spreadsheet initialized successfully');
        } catch (error) {
            console.error('Error initializing spreadsheet:', error);
        }
    }

    // Add booking to Google Sheets
    async addBooking(booking: any) {
        try {
            // Check if Google Sheets is configured
            if (!SPREADSHEET_ID || !credentials.client_email) {
                console.log('Google Sheets not configured, skipping sync');
                return;
            }

            // First, ensure the sheet exists
            await this.ensureSheetExists('Bookings', ['ID', 'Guest Name', 'Email', 'Room Number', 'Check-in', 'Check-out', 'Status', 'Price', 'Created At']);

            const values = [[e
                booking.id,
                booking.guestName || 'N/A',
                booking.guestEmail || 'N/A',
                booking.roomNumber || 'N/A',
                booking.checkin ? new Date(booking.checkin).toLocaleDateString() : 'N/A',
                booking.checkout ? new Date(booking.checkout).toLocaleDateString() : 'N/A',
                booking.status || 'N/A',
                booking.price || 0,
                new Date(booking.createdAt).toLocaleString()
            ]];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Bookings!A:I',
                valueInputOption: 'RAW',
                requestBody: { values }
            });

            console.log('Booking added to Google Sheets');
        } catch (error) {
            console.error('Error adding booking to Google Sheets:', error);
            // Don't throw error to prevent breaking the main flow
        }
    }

    // Add payment to Google Sheets
    async addPayment(payment: any) {
        try {
            // Check if Google Sheets is configured
            if (!SPREADSHEET_ID || !credentials.client_email) {
                console.log('Google Sheets not configured, skipping sync');
                return;
            }

            // First, ensure the sheet exists
            await this.ensureSheetExists('Payments', ['ID', 'Booking ID', 'Amount', 'Method', 'Status', 'Description', 'Created At']);

            const values = [[
                payment.id,
                payment.bookingId || 'N/A',
                payment.amount || 0,
                payment.method || 'N/A',
                payment.status || 'N/A',
                payment.description || 'N/A',
                new Date(payment.createdAt).toLocaleString()
            ]];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Payments!A:G',
                valueInputOption: 'RAW',
                requestBody: { values }
            });

            console.log('Payment added to Google Sheets');
        } catch (error) {
            console.error('Error adding payment to Google Sheets:', error);
            // Don't throw error to prevent breaking the main flow
        }
    }

    // Add room to Google Sheets
    async addRoom(room: any) {
        try {
            // Check if Google Sheets is configured
            if (!SPREADSHEET_ID || !credentials.client_email) {
                console.log('Google Sheets not configured, skipping sync');
                return;
            }

            // First, ensure the sheet exists
            await this.ensureSheetExists('Rooms', ['ID', 'Room Number', 'Floor', 'Type', 'Status', 'Price/Night', 'Price/Month', 'Created At']);

            const values = [[
                room.id,
                room.roomNumber || 'N/A',
                room.floor || 'N/A',
                room.type || 'N/A',
                room.status || 'N/A',
                room.pricePerNight || 0,
                room.pricePerMonth || 0,
                new Date(room.createdAt).toLocaleString()
            ]];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Rooms!A:H',
                valueInputOption: 'RAW',
                requestBody: { values }
            });

            console.log('Room added to Google Sheets');
        } catch (error) {
            console.error('Error adding room to Google Sheets:', error);
            // Don't throw error to prevent breaking the main flow
        }
    }

    // Add maintenance request to Google Sheets
    async addMaintenance(maintenance: any) {
        try {
            const values = [[
                maintenance.id,
                maintenance.title || 'N/A',
                maintenance.description || 'N/A',
                maintenance.status || 'N/A',
                maintenance.priority || 'N/A',
                maintenance.roomNumber || 'N/A',
                maintenance.assignee || 'Unassigned',
                new Date(maintenance.createdAt).toLocaleString()
            ]];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Maintenance!A:H',
                valueInputOption: 'RAW',
                requestBody: { values }
            });

            console.log('Maintenance request added to Google Sheets');
        } catch (error) {
            console.error('Error adding maintenance to Google Sheets:', error);
        }
    }

    // Add user to Google Sheets
    async addUser(user: any) {
        try {
            const values = [[
                user.id,
                user.name || 'N/A',
                user.email || 'N/A',
                user.role || 'N/A',
                user.phone || 'N/A',
                new Date(user.createdAt).toLocaleString()
            ]];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Users!A:F',
                valueInputOption: 'RAW',
                requestBody: { values }
            });

            console.log('User added to Google Sheets');
        } catch (error) {
            console.error('Error adding user to Google Sheets:', error);
        }
    }

    // Add expense to Google Sheets
    async addExpense(expense: any) {
        try {
            const values = [[
                expense.id,
                expense.title || 'N/A',
                expense.description || 'N/A',
                expense.amount || 0,
                expense.category || 'N/A',
                expense.status || 'N/A',
                expense.submittedBy || 'N/A',
                new Date(expense.createdAt).toLocaleString()
            ]];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Expenses!A:H',
                valueInputOption: 'RAW',
                requestBody: { values }
            });

            console.log('Expense added to Google Sheets');
        } catch (error) {
            console.error('Error adding expense to Google Sheets:', error);
        }
    }

    // Add salary to Google Sheets
    async addSalary(salary: any) {
        try {
            const values = [[
                salary.id,
                salary.staffName || 'N/A',
                salary.position || 'N/A',
                salary.baseAmount || 0,
                salary.netAmount || 0,
                salary.status || 'N/A',
                salary.payDate ? new Date(salary.payDate).toLocaleDateString() : 'N/A',
                new Date(salary.createdAt).toLocaleString()
            ]];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Salaries!A:H',
                valueInputOption: 'RAW',
                requestBody: { values }
            });

            console.log('Salary added to Google Sheets');
        } catch (error) {
            console.error('Error adding salary to Google Sheets:', error);
        }
    }

    // Update existing record in Google Sheets
    async updateRecord(sheetName: string, recordId: string, updatedData: any) {
        try {
            // First, find the row with the matching ID
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${sheetName}!A:A`
            });

            const rows = response.data.values || [];
            const rowIndex = rows.findIndex((row: any) => row[0] === recordId);

            if (rowIndex !== -1) {
                // Update the row (rowIndex + 1 because sheets are 1-indexed)
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${sheetName}!A${rowIndex + 1}`,
                    valueInputOption: 'RAW',
                    requestBody: { values: [updatedData] }
                });

                console.log(`Record ${recordId} updated in Google Sheets`);
            }
        } catch (error) {
            console.error('Error updating record in Google Sheets:', error);
        }
    }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
