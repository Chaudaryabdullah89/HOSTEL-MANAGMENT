const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createHostels() {
  try {
    console.log('Creating 5 hostels...');

    // First, get or create a user to be the owner
    let user = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!user) {
      // Create a default admin user
      user = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@hostel.com',
          password: 'hashedpassword', // In real app, this would be properly hashed
          role: 'ADMIN'
        }
      });
      console.log('Created admin user:', user.email);
    }

    const hostels = [
      {
        name: "Sunset Budget Hostel",
        address: {
          street: "456 Oak Avenue",
          city: "Karachi",
          state: "Sindh",
          country: "Pakistan",
          zipcode: "75000"
        },
        type: "BUDGET",
        status: "ACTIVE",
        contact: 300123456,
        floors: 3,
        description: "Affordable accommodation for budget-conscious travelers and students.",
        amenities: ["WiFi", "Common Kitchen", "Laundry", "24/7 Security"],
        capacity: 60,
        occupiedRooms: 35,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
        revenue: 150000
      },
      {
        name: "Riverside Standard Hostel",
        address: {
          street: "789 River Road",
          city: "Islamabad",
          state: "Federal",
          country: "Pakistan",
          zipcode: "44000"
        },
        type: "STANDARD",
        status: "ACTIVE",
        contact: 300123457,
        floors: 4,
        description: "Comfortable standard accommodation with modern amenities and great location.",
        amenities: ["WiFi", "Air Conditioning", "Laundry", "Cafeteria", "Study Room", "Gym"],
        capacity: 80,
        occupiedRooms: 55,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500",
        revenue: 200000
      },
      {
        name: "Luxury Heights Premium Hostel",
        address: {
          street: "321 Elite Boulevard",
          city: "Lahore",
          state: "Punjab",
          country: "Pakistan",
          zipcode: "54000"
        },
        type: "PREMIUM",
        status: "ACTIVE",
        contact: 300123458,
        floors: 5,
        description: "Luxury accommodation with premium amenities and exceptional service.",
        amenities: ["WiFi", "Air Conditioning", "Laundry", "Restaurant", "Spa", "Gym", "Pool", "Concierge", "Room Service"],
        capacity: 120,
        occupiedRooms: 95,
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500",
        revenue: 400000
      },
      {
        name: "Student Central Hostel",
        address: {
          street: "654 University Street",
          city: "Peshawar",
          state: "KPK",
          country: "Pakistan",
          zipcode: "25000"
        },
        type: "BUDGET",
        status: "ACTIVE",
        contact: 300123459,
        floors: 3,
        description: "Student-friendly budget accommodation near universities and colleges.",
        amenities: ["WiFi", "Study Room", "Common Kitchen", "Laundry", "Library"],
        capacity: 70,
        occupiedRooms: 45,
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500",
        revenue: 120000
      },
      {
        name: "Garden View Standard Hostel",
        address: {
          street: "987 Garden Lane",
          city: "Quetta",
          state: "Balochistan",
          country: "Pakistan",
          zipcode: "87300"
        },
        type: "STANDARD",
        status: "ACTIVE",
        contact: 300123460,
        floors: 4,
        description: "Peaceful accommodation with beautiful garden views and comfortable rooms.",
        amenities: ["WiFi", "Garden", "Laundry", "Cafeteria", "Parking", "Security"],
        capacity: 90,
        occupiedRooms: 60,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
        revenue: 180000
      }
    ];

    for (let i = 0; i < hostels.length; i++) {
      const hostelData = hostels[i];
      console.log(`Creating Hostel ${i + 1}: ${hostelData.name}`);

      // Create address first
      const address = await prisma.hostelAddress.create({
        data: {
          street: hostelData.address.street,
          city: hostelData.address.city,
          state: hostelData.address.state,
          country: hostelData.address.country,
          zipcode: hostelData.address.zipcode,
        }
      });

      // Create hostel
      const hostel = await prisma.hostel.create({
        data: {
          hostelName: hostelData.name,
          description: hostelData.description,
          hostelType: hostelData.type,
          hostelsStatus: hostelData.status,
          contact: hostelData.contact,
          floors: hostelData.floors,
          amenities: hostelData.amenities,
          capacity: hostelData.capacity,
          occupiedRooms: hostelData.occupiedRooms,
          image: hostelData.image,
          revenue: hostelData.revenue,
          userId: user.id,
          addressId: address.id,
        }
      });

      console.log(`✅ Created: ${hostel.hostelName} (ID: ${hostel.id})`);
    }

    console.log('\n🎉 All 5 hostels have been created successfully!');
    console.log('You can check the hostels at: http://localhost:3000/dashboard/admin/hostel');

  } catch (error) {
    console.error('Error creating hostels:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createHostels();
