#!/bin/bash

# Script to create 5 hostels via API calls to localhost:3000
# Make sure the server is running before executing this script

echo "Creating 5 hostels..."

# Hostel 1: Budget Hostel
echo "Creating Hostel 1: Budget Hostel"
curl -X POST http://localhost:3000/api/hostel/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunset Budget Hostel",
    "hostelAddress": {
      "street": "456 Oak Avenue",
      "city": "Karachi",
      "state": "Sindh",
      "country": "Pakistan",
      "zipcode": "75000"
    },
    "hostelType": "BUDGET",
    "hostelStatus": "ACTIVE",
    "contact": "03001234567",
    "floors": "3",
    "description": "Affordable accommodation for budget-conscious travelers and students.",
    "amenities": ["WiFi", "Common Kitchen", "Laundry", "24/7 Security"],
    "capacity": "60",
    "occupiedRooms": "35",
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
    "revenue": "150000"
  }'

echo -e "\n\n"

# Hostel 2: Standard Hostel
echo "Creating Hostel 2: Standard Hostel"
curl -X POST http://localhost:3000/api/hostel/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Riverside Standard Hostel",
    "hostelAddress": {
      "street": "789 River Road",
      "city": "Islamabad",
      "state": "Federal",
      "country": "Pakistan",
      "zipcode": "44000"
    },
    "hostelType": "STANDARD",
    "hostelStatus": "ACTIVE",
    "contact": "03001234568",
    "floors": "4",
    "description": "Comfortable standard accommodation with modern amenities and great location.",
    "amenities": ["WiFi", "Air Conditioning", "Laundry", "Cafeteria", "Study Room", "Gym"],
    "capacity": "80",
    "occupiedRooms": "55",
    "image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500",
    "revenue": "200000"
  }'

echo -e "\n\n"

# Hostel 3: Premium Hostel
echo "Creating Hostel 3: Premium Hostel"
curl -X POST http://localhost:3000/api/hostel/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luxury Heights Premium Hostel",
    "hostelAddress": {
      "street": "321 Elite Boulevard",
      "city": "Lahore",
      "state": "Punjab",
      "country": "Pakistan",
      "zipcode": "54000"
    },
    "hostelType": "PREMIUM",
    "hostelStatus": "ACTIVE",
    "contact": "03001234569",
    "floors": "5",
    "description": "Luxury accommodation with premium amenities and exceptional service.",
    "amenities": ["WiFi", "Air Conditioning", "Laundry", "Restaurant", "Spa", "Gym", "Pool", "Concierge", "Room Service"],
    "capacity": "120",
    "occupiedRooms": "95",
    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500",
    "revenue": "400000"
  }'

echo -e "\n\n"

# Hostel 4: Budget Hostel
echo "Creating Hostel 4: Budget Hostel"
curl -X POST http://localhost:3000/api/hostel/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Student Central Hostel",
    "hostelAddress": {
      "street": "654 University Street",
      "city": "Peshawar",
      "state": "KPK",
      "country": "Pakistan",
      "zipcode": "25000"
    },
    "hostelType": "BUDGET",
    "hostelStatus": "ACTIVE",
    "contact": "03001234570",
    "floors": "3",
    "description": "Student-friendly budget accommodation near universities and colleges.",
    "amenities": ["WiFi", "Study Room", "Common Kitchen", "Laundry", "Library"],
    "capacity": "70",
    "occupiedRooms": "45",
    "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500",
    "revenue": "120000"
  }'

echo -e "\n\n"

# Hostel 5: Standard Hostel
echo "Creating Hostel 5: Standard Hostel"
curl -X POST http://localhost:3000/api/hostel/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Garden View Standard Hostel",
    "hostelAddress": {
      "street": "987 Garden Lane",
      "city": "Quetta",
      "state": "Balochistan",
      "country": "Pakistan",
      "zipcode": "87300"
    },
    "hostelType": "STANDARD",
    "hostelStatus": "ACTIVE",
    "contact": "03001234571",
    "floors": "4",
    "description": "Peaceful accommodation with beautiful garden views and comfortable rooms.",
    "amenities": ["WiFi", "Garden", "Laundry", "Cafeteria", "Parking", "Security"],
    "capacity": "90",
    "occupiedRooms": "60",
    "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
    "revenue": "180000"
  }'

echo -e "\n\n"
echo "All 5 hostels have been created successfully!"
echo "You can check the hostels at: http://localhost:3000/dashboard/admin/hostel"
