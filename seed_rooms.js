const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createRooms() {
  try {
    console.log('Creating rooms for hostels...');

    // Get the first hostel
    const hostels = await prisma.hostel.findMany({
      take: 1
    });

    if (hostels.length === 0) {
      console.log('No hostels found. Please create hostels first.');
      return;
    }

    const hostel = hostels[0];
    console.log(`Creating rooms for hostel: ${hostel.hostelName}`);

    const rooms = [
      {
        roomNumber: "101",
        floor: 1,
        capacity: 2,
        pricePerNight: 2000,
        pricePerMonth: 50000,
        type: "DOUBLE",
        status: "AVAILABLE",
        amenities: ["WiFi", "AC", "TV"],
        notes: "Comfortable double room with city view"
      },
      {
        roomNumber: "102",
        floor: 1,
        capacity: 1,
        pricePerNight: 1500,
        pricePerMonth: 40000,
        type: "SINGLE",
        status: "AVAILABLE",
        amenities: ["WiFi", "AC"],
        notes: "Cozy single room"
      },
      {
        roomNumber: "201",
        floor: 2,
        capacity: 3,
        pricePerNight: 3000,
        pricePerMonth: 75000,
        type: "TRIPLE",
        status: "AVAILABLE",
        amenities: ["WiFi", "AC", "TV", "Mini Fridge"],
        notes: "Spacious triple room"
      },
      {
        roomNumber: "202",
        floor: 2,
        capacity: 4,
        pricePerNight: 4000,
        pricePerMonth: 100000,
        type: "QUAD",
        status: "AVAILABLE",
        amenities: ["WiFi", "AC", "TV", "Mini Fridge", "Balcony"],
        notes: "Large quad room with balcony"
      },
      {
        roomNumber: "301",
        floor: 3,
        capacity: 6,
        pricePerNight: 5000,
        pricePerMonth: 120000,
        type: "DORMITORY",
        status: "AVAILABLE",
        amenities: ["WiFi", "AC", "TV", "Common Area"],
        notes: "Dormitory style room for groups"
      }
    ];

    for (let i = 0; i < rooms.length; i++) {
      const roomData = rooms[i];
      console.log(`Creating Room ${i + 1}: ${roomData.roomNumber}`);

      const room = await prisma.room.create({
        data: {
          roomNumber: roomData.roomNumber,
          floor: roomData.floor,
          capacity: roomData.capacity,
          pricePerNight: roomData.pricePerNight,
          pricePerMonth: roomData.pricePerMonth,
          type: roomData.type,
          status: roomData.status,
          amenities: roomData.amenities,
          notes: roomData.notes,
          hostelId: hostel.id,
        }
      });

      console.log(`✅ Created: Room ${room.roomNumber} (ID: ${room.id})`);
    }

    console.log('\n🎉 All rooms have been created successfully!');
    console.log('You can check the rooms at: http://localhost:3000/dashboard/admin/rooms');

  } catch (error) {
    console.error('Error creating rooms:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRooms();
