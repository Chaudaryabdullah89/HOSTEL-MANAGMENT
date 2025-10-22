# Warden Schema Migration Guide

## Overview
The Warden model has been updated to support multiple hostel assignments per warden using an array-based approach instead of creating multiple records.

## Changes Made

### Schema Changes (`prisma/schema.prisma`)

**Before:**
```prisma
model Warden {
  id       String  @id @default(uuid())
  userId   String
  hostelId String?
  hostel   Hostel? @relation(fields: [hostelId], references: [id])
  user     User    @relation(fields: [userId], references: [id])

  @@unique([userId, hostelId])
}
```

**After:**
```prisma
model Warden {
  id        String   @id @default(uuid())
  userId    String   @unique
  hostelIds String[]
  user      User     @relation(fields: [userId], references: [id])
}
```

### Key Differences:
1. **One record per user**: Each warden now has ONE record instead of multiple
2. **Array of hostelIds**: `hostelIds String[]` stores all hostel assignments
3. **Unique constraint**: Changed from `[userId, hostelId]` to just `userId`
4. **No hostel relation**: Removed the back-relation to Hostel model

## Migration Steps

### 1. Run Database Migration

```bash
cd sama-hostel
npx prisma migrate dev --name warden_schema_update
```

### 2. Consolidate Existing Data

Run the consolidation script to merge duplicate warden records:

```bash
node scripts/cleanup-duplicate-wardens.js
```

This script will:
- Find all warden records grouped by userId
- Consolidate multiple records into one per user
- Combine all hostelIds into the array
- Delete duplicate records

### 3. Verify Data

Check that the migration was successful:

```sql
-- Count warden records (should equal number of unique wardens)
SELECT COUNT(*) FROM "Warden";

-- View warden assignments
SELECT 
  u.name,
  u.email,
  array_length(w."hostelIds", 1) as hostel_count,
  w."hostelIds"
FROM "Warden" w
JOIN "User" u ON u.id = w."userId";
```

## API Changes

### Create Hostel API (`/api/hostel/create`)
- Creates or updates ONE Warden record per user
- Adds hostelId to the `hostelIds` array using Prisma's `push` operator
- Prevents duplicate hostelIds in the array

### Update Hostel API (`/api/hostel/updatehosteldata`)
- Smart sync: Adds new hostelIds, removes unassigned ones
- Deletes Warden record if no hostels remain

### Get Wardens API (`/api/hostel/getwardens`)
- Returns list of users with WARDEN role
- Shows all hostelIds and hostel names for each warden

## Frontend Changes

No changes required to the frontend. The warden selection continues to work the same way.

## Benefits

1. **No Duplicates**: Impossible to create duplicate warden records
2. **Better Performance**: One query instead of multiple for warden info
3. **Cleaner Data**: One record per user is more intuitive
4. **Easier Management**: Simple array operations for hostel assignments

## Rollback (if needed)

If you need to rollback to the old schema:

1. Create a migration to revert the schema
2. Run the reverse migration
3. Restore old API code from git history

## Testing Checklist

- [ ] Create new hostel with wardens
- [ ] Edit hostel and add/remove wardens
- [ ] Verify warden can manage multiple hostels
- [ ] Check warden list displays correctly
- [ ] Verify no duplicate records are created
- [ ] Test removing all hostels from a warden
- [ ] Verify console logs show correct hostel counts

