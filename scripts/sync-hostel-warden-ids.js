/**
 * Sync script to populate Hostel.wardensIds from Warden.hostelIds
 * This ensures the many-to-many relation works correctly
 * 
 * Run with: node scripts/sync-hostel-warden-ids.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncHostelWardenIds() {
    try {
        console.log('🔄 Syncing Hostel.wardensIds with Warden.hostelIds...\n');

        // Get all wardens with their hostelIds
        const allWardens = await prisma.warden.findMany({
            select: {
                userId: true,
                hostelIds: true
            }
        });

        console.log(`Found ${allWardens.length} warden records\n`);

        // Build a map of hostelId -> [userIds]
        const hostelToWardens = new Map();

        for (const warden of allWardens) {
            for (const hostelId of warden.hostelIds) {
                if (!hostelToWardens.has(hostelId)) {
                    hostelToWardens.set(hostelId, []);
                }
                hostelToWardens.get(hostelId).push(warden.userId);
            }
        }

        console.log(`Found ${hostelToWardens.size} hostels with warden assignments\n`);

        // Update each hostel's wardensIds
        let updatedCount = 0;
        for (const [hostelId, userIds] of hostelToWardens.entries()) {
            try {
                const hostel = await prisma.hostel.findUnique({
                    where: { id: hostelId },
                    select: {
                        id: true,
                        hostelName: true,
                        wardensIds: true
                    }
                });

                if (!hostel) {
                    console.warn(`⚠️  Hostel ${hostelId} not found (orphaned warden reference)`);
                    continue;
                }

                // Check if update is needed
                const currentIds = hostel.wardensIds || [];
                const newIds = [...new Set(userIds)]; // Remove duplicates

                if (JSON.stringify(currentIds.sort()) !== JSON.stringify(newIds.sort())) {
                    await prisma.hostel.update({
                        where: { id: hostelId },
                        data: { wardensIds: newIds }
                    });

                    console.log(`✅ Updated ${hostel.hostelName}:`);
                    console.log(`   Old: [${currentIds.join(', ')}]`);
                    console.log(`   New: [${newIds.join(', ')}]`);
                    updatedCount++;
                } else {
                    console.log(`✓ ${hostel.hostelName} already in sync`);
                }
            } catch (error) {
                console.error(`❌ Error updating hostel ${hostelId}:`, error.message);
            }
        }

        console.log(`\n📊 SYNC SUMMARY:`);
        console.log(`✅ Processed ${hostelToWardens.size} hostels`);
        console.log(`✅ Updated ${updatedCount} hostels`);
        console.log(`✅ Skipped ${hostelToWardens.size - updatedCount} (already in sync)`);
        console.log('\n✨ Sync complete!\n');

    } catch (error) {
        console.error('❌ Error during sync:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the sync
syncHostelWardenIds();

