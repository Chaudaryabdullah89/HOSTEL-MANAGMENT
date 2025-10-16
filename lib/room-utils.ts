import { prisma } from "@/lib/prisma";
import { RoomStatus } from "@prisma/client";

// Function to check and update room status based on capacity
export async function updateRoomStatusBasedOnCapacity(roomId: string) {
    try {
        // Get room with current bookings
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                bookings: {
                    where: {
                        status: {
                            in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
                        }
                    }
                }
            }
        });

        if (!room) {
            console.log("Room not found:", roomId);
            return;
        }

        const activeBookingsCount = room.bookings.length;
        const roomCapacity = room.capacity;

        console.log(`Room ${room.roomNumber}: ${activeBookingsCount}/${roomCapacity} capacity used`);
        console.log(`Current room status: ${room.status}`);

        // Update room status based on capacity
        let newStatus: RoomStatus;
        if (activeBookingsCount >= roomCapacity) {
            newStatus = RoomStatus.OCCUPIED;
        } else {
            newStatus = RoomStatus.AVAILABLE;
        }

        console.log(`Calculated new status: ${newStatus}`);

        // Only update if status has changed
        if (room.status !== newStatus) {
            console.log(`Status changed from ${room.status} to ${newStatus}, updating...`);
            await prisma.room.update({
                where: { id: roomId },
                data: { status: newStatus }
            });
            console.log(`Room ${room.roomNumber} status updated to: ${newStatus}`);
        } else {
            console.log(`Room ${room.roomNumber} status unchanged: ${room.status}`);
        }
    } catch (error) {
        console.error("Error updating room status:", error);
    }
}

// Function to check if room is available for booking
export async function isRoomAvailableForBooking(roomId: string): Promise<{ available: boolean; reason?: string }> {
    try {
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                bookings: {
                    where: {
                        status: {
                            in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
                        }
                    }
                }
            }
        });

        if (!room) {
            return { available: false, reason: "Room not found" };
        }

        // Check if room is in maintenance or out of order
        if (room.status === 'MAINTENANCE' || room.status === 'OUT_OF_ORDER') {
            return { 
                available: false, 
                reason: `Room ${room.roomNumber} is currently ${room.status.toLowerCase().replace('_', ' ')}` 
            };
        }

        // Check if room is at capacity
        const activeBookingsCount = room.bookings.length;
        if (activeBookingsCount >= room.capacity) {
            return { 
                available: false, 
                reason: `Room ${room.roomNumber} is at full capacity (${room.capacity}/${room.capacity})` 
            };
        }

        return { available: true };
    } catch (error) {
        console.error("Error checking room availability:", error);
        return { available: false, reason: "Error checking room availability" };
    }
}

// Function to update all room statuses based on their current bookings
export async function updateAllRoomStatuses() {
    try {
        console.log("Starting bulk room status update...");
        
        // Get all rooms with their bookings
        const rooms = await prisma.room.findMany({
            include: {
                bookings: {
                    where: {
                        status: {
                            in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
                        }
                    }
                }
            }
        });

        console.log(`Found ${rooms.length} rooms to check`);

        for (const room of rooms) {
            const activeBookingsCount = room.bookings.length;
            const roomCapacity = room.capacity;

            console.log(`Room ${room.roomNumber}: ${activeBookingsCount}/${roomCapacity} capacity used, current status: ${room.status}`);

            // Determine new status
            let newStatus: RoomStatus;
            if (activeBookingsCount >= roomCapacity) {
                newStatus = RoomStatus.OCCUPIED;
            } else {
                newStatus = RoomStatus.AVAILABLE;
            }

            // Only update if status has changed
            if (room.status !== newStatus) {
                console.log(`Updating room ${room.roomNumber} from ${room.status} to ${newStatus}`);
                await prisma.room.update({
                    where: { id: room.id },
                    data: { status: newStatus }
                });
            }
        }

        console.log("Bulk room status update completed");
    } catch (error) {
        console.error("Error updating all room statuses:", error);
    }
}
