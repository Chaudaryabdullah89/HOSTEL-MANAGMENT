const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleComplaints() {
  try {
    console.log('Adding sample complaints...');
    
    // First, let's check if we have any users and hostels
    const users = await prisma.user.findMany();
    const hostels = await prisma.hostel.findMany();
    
    console.log(`Found ${users.length} users and ${hostels.length} hostels`);
    
    if (users.length === 0) {
      console.log('No users found. Creating a sample user...');
      const sampleUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          role: 'GUEST',
          password: 'hashedpassword', // In real app, this would be properly hashed
        }
      });
      users.push(sampleUser);
    }
    
    if (hostels.length === 0) {
      console.log('No hostels found. Creating a sample hostel...');
      const sampleHostel = await prisma.hostel.create({
        data: {
          hostelName: 'Sample Hostel',
          description: 'A sample hostel for testing',
          contact: 1234567890,
          floors: 3,
          amenities: ['WiFi', 'Gym'],
          hostelType: 'STANDARD',
          hostelsStatus: 'ACTIVE',
          userId: users[0].id,
          addressId: 'sample-address-id', // This would need a proper address
        }
      });
      hostels.push(sampleHostel);
    }
    
    // Create sample complaints
    const sampleComplaints = [
      {
        title: 'WiFi Not Working',
        description: 'The WiFi in my room is not working properly. It keeps disconnecting.',
        category: 'TECHNICAL',
        priority: 'HIGH',
        status: 'SUBMITTED',
        reportedBy: users[0].id,
        hostelId: hostels[0].id,
      },
      {
        title: 'Noisy Neighbors',
        description: 'The neighbors in the next room are very loud at night.',
        category: 'NOISE',
        priority: 'MEDIUM',
        status: 'UNDER_REVIEW',
        reportedBy: users[0].id,
        hostelId: hostels[0].id,
      },
      {
        title: 'Broken Door Lock',
        description: 'The door lock in my room is broken and needs repair.',
        category: 'MAINTENANCE',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        reportedBy: users[0].id,
        hostelId: hostels[0].id,
      },
      {
        title: 'Cleanliness Issue',
        description: 'The common area is not being cleaned regularly.',
        category: 'CLEANLINESS',
        priority: 'LOW',
        status: 'RESOLVED',
        reportedBy: users[0].id,
        hostelId: hostels[0].id,
      }
    ];
    
    for (const complaintData of sampleComplaints) {
      const complaint = await prisma.complaint.create({
        data: complaintData
      });
      console.log(`Created complaint: ${complaint.title}`);
    }
    
    console.log('Sample complaints added successfully!');
    
  } catch (error) {
    console.error('Error adding sample complaints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleComplaints();





