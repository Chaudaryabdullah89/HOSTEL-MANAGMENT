"use client"
import React, { useState, useEffect, useContext } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Bed,
    Wifi,
    Tv,
    Wind,
    Users,
    MapPin,
    Calendar,
    Search,
    Filter,
    Star,
    Eye,
    BookOpen,
    RefreshCw
} from "lucide-react";
import { PageLoadingSkeleton, LoadingSpinner } from "@/components/ui/loading-skeleton";
import { SessionContext } from "@/app/context/sessiondata";

const statusOptions = ["All Status", "AVAILABLE", "OCCUPIED", "MAINTENANCE", "OUT_OF_ORDER"];
const typeOptions = ["All Types", "SINGLE", "DOUBLE", "TRIPLE", "QUAD", "DORMITORY"];

const statusColor = (status) => {
    switch (status) {
        case "AVAILABLE":
            return "bg-green-100 text-green-800 border-green-200";
        case "OCCUPIED":
            return "bg-red-100 text-red-800 border-red-200";
        case "MAINTENANCE":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "OUT_OF_ORDER":
            return "bg-gray-100 text-gray-800 border-gray-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const typeColor = (type) => {
    switch (type) {
        case "SINGLE":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "DOUBLE":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "TRIPLE":
            return "bg-orange-100 text-orange-800 border-orange-200";
        case "QUAD":
            return "bg-pink-100 text-pink-800 border-pink-200";
        case "DORMITORY":
            return "bg-indigo-100 text-indigo-800 border-indigo-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
        case "wifi":
            return <Wifi className="w-4 h-4" />;
        case "tv":
            return <Tv className="w-4 h-4" />;
        case "ac":
        case "air conditioning":
            return <Wind className="w-4 h-4" />;
        default:
            return <Star className="w-4 h-4" />;
    }
};

const page = () => {
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState("All Status");
    const [activeType, setActiveType] = useState("All Types");
    const [searchTerm, setSearchTerm] = useState("");
    const [rooms, setRooms] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Get current user session
    const { session } = useContext(SessionContext);
    const currentUserId = session?.user?.id;

    // Fetch rooms and hostels data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch rooms
                const roomsResponse = await fetch('/api/room/getallrooms');
                if (roomsResponse.ok) {
                    const roomsData = await roomsResponse.json();
                    console.log('Fetched rooms:', roomsData);
                    setRooms(roomsData);
                }

                // Fetch hostels
                const hostelsResponse = await fetch('/api/hostel/gethostels');
                if (hostelsResponse.ok) {
                    const hostelsData = await hostelsResponse.json();
                    console.log('Fetched hostels:', hostelsData);
                    setHostels(hostelsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredRooms = rooms.filter((room) => {
        const matchesStatus =
            activeStatus === "All Status" || room.status === activeStatus;
        const matchesType =
            activeType === "All Types" || room.type === activeType;
        const matchesSearch =
            room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.amenities?.some(amenity =>
                amenity.toLowerCase().includes(searchTerm.toLowerCase())
            );
        return matchesStatus && matchesType && matchesSearch;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            // Fetch rooms
            const roomsResponse = await fetch('/api/room/getallrooms');
            if (roomsResponse.ok) {
                const roomsData = await roomsResponse.json();
                setRooms(roomsData);
            }

            // Fetch hostels
            const hostelsResponse = await fetch('/api/hostel/gethostels');
            if (hostelsResponse.ok) {
                const hostelsData = await hostelsResponse.json();
                setHostels(hostelsData);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (room) => {
        setSelectedRoom(room);
        setShowDetails(true);
    };

    const handleBookRoom = (room) => {
        // Redirect to booking page with room pre-selected
        window.location.href = `/dashboard/guest/bookings?roomId=${room.id}`;
    };

    // Show loading state while data is being fetched
    if (loading) {
        return (
            <PageLoadingSkeleton
                title={true}
                statsCards={4}
                filterTabs={2}
                searchBar={true}
                contentCards={6}
            />
        );
    }

    return (
        <div className="w-full p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Available Rooms</h2>
                    <p className="text-muted-foreground">Browse and book available rooms</p>
                </div>
                <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {/* Debug Panel */}
            <Card className="bg-blue-50 border-blue-200 mb-4">
                <CardContent className="p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Debug Information</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                        <p>Total rooms from API: {rooms?.length || 0}</p>
                        <p>Filtered rooms: {filteredRooms.length}</p>
                        <p>Hostels count: {hostels?.length || 0}</p>
                        <p>Loading: {loading ? 'Yes' : 'No'}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                                <p className="text-2xl font-bold">{rooms.length}</p>
                            </div>
                            <Bed className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Available</p>
                                <p className="text-2xl font-bold">{rooms.filter(r => r.status === 'AVAILABLE').length}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                                <p className="text-2xl font-bold">{rooms.filter(r => r.status === 'OCCUPIED').length}</p>
                            </div>
                            <Users className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Under Maintenance</p>
                                <p className="text-2xl font-bold">{rooms.filter(r => r.status === 'MAINTENANCE').length}</p>
                            </div>
                            <Wind className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex gap-2">
                    {statusOptions.map((status) => (
                        <Button
                            key={status}
                            variant={activeStatus === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveStatus(status)}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {typeOptions.map((type) => (
                        <Button
                            key={type}
                            variant={activeType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveType(type)}
                        >
                            {type}
                        </Button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search by room number, type, or amenities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <Search className="w-4 h-4 text-muted-foreground" />
                </div>
            </div>

            {/* Rooms List */}
            {filteredRooms.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No rooms found.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Try adjusting your filters or check back later for new rooms.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.map((room) => {
                        const hostel = hostels.find(h => h.id === room.hostelId);
                        return (
                            <Card key={room.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <MapPin className="w-4 h-4" />
                                            {hostel?.hostelName || 'Unknown Hostel'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge className={`${statusColor(room.status)} flex items-center gap-1`}>
                                            {room.status}
                                        </Badge>
                                        <Badge className={`${typeColor(room.type)} flex items-center gap-1`}>
                                            {room.type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Capacity</p>
                                                <p className="text-sm text-muted-foreground">{room.capacity} guests</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Bed className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Floor</p>
                                                <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Pricing</p>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Per Night:</span>
                                            <span className="font-semibold">{formatCurrency(room.pricePerNight)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Per Month:</span>
                                            <span className="font-semibold">{formatCurrency(room.pricePerMonth)}</span>
                                        </div>
                                    </div>

                                    {room.amenities && room.amenities.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Amenities</p>
                                            <div className="flex flex-wrap gap-2">
                                                {room.amenities.slice(0, 3).map((amenity, index) => (
                                                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                                                        {getAmenityIcon(amenity)}
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                                {room.amenities.length > 3 && (
                                                    <Badge variant="outline">
                                                        +{room.amenities.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewDetails(room)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View Details
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleBookRoom(room)}
                                        disabled={room.status !== 'AVAILABLE'}
                                    >
                                        <BookOpen className="w-4 h-4 mr-1" />
                                        {room.status === 'AVAILABLE' ? 'Book Now' : 'Not Available'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Room Details Modal */}
            {showDetails && selectedRoom && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl">Room Details</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDetails(false)}
                            >
                                ✕
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Room Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Room Information</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Room Number:</span> {selectedRoom.roomNumber}</p>
                                        <p><span className="font-medium">Type:</span>
                                            <Badge className={`ml-2 ${typeColor(selectedRoom.type)}`}>
                                                {selectedRoom.type}
                                            </Badge>
                                        </p>
                                        <p><span className="font-medium">Status:</span>
                                            <Badge className={`ml-2 ${statusColor(selectedRoom.status)}`}>
                                                {selectedRoom.status}
                                            </Badge>
                                        </p>
                                        <p><span className="font-medium">Floor:</span> {selectedRoom.floor}</p>
                                        <p><span className="font-medium">Capacity:</span> {selectedRoom.capacity} guests</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Pricing</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Per Night:</span> {formatCurrency(selectedRoom.pricePerNight)}</p>
                                        <p><span className="font-medium">Per Month:</span> {formatCurrency(selectedRoom.pricePerMonth)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Hostel Information */}
                            {hostels.find(h => h.id === selectedRoom.hostelId) && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Hostel Information</h3>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Hostel:</span> {hostels.find(h => h.id === selectedRoom.hostelId)?.hostelName}</p>
                                        <p><span className="font-medium">Type:</span> {hostels.find(h => h.id === selectedRoom.hostelId)?.hostelType}</p>
                                    </div>
                                </div>
                            )}

                            {/* Amenities */}
                            {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Amenities</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {selectedRoom.amenities.map((amenity, index) => (
                                            <Badge key={index} variant="outline" className="flex items-center gap-1 justify-center">
                                                {getAmenityIcon(amenity)}
                                                {amenity}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedRoom.notes && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Additional Notes</h3>
                                    <p className="text-sm text-muted-foreground">{selectedRoom.notes}</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowDetails(false)}>
                                Close
                            </Button>
                            <Button
                                onClick={() => handleBookRoom(selectedRoom)}
                                disabled={selectedRoom.status !== 'AVAILABLE'}
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                {selectedRoom.status === 'AVAILABLE' ? 'Book This Room' : 'Not Available'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default page;