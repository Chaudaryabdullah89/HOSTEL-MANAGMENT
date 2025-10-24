"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from 'react-hot-toast'
import {
  Plus,
  Filter,
  ChevronDown,
  Search,
  Edit,
  Wifi,
  Delete,
  Bin,
  Trash,
  Loader,
  Loader2,
  RefreshCw,
  Users,
  Eye,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Activity,
  User,
  Bed,
  Home,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
//   import { Input } from "@/components/ui/input"
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton";
import { useRooms, useRoomsByHostel, useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/hooks/useRooms';
import { useHostels } from '@/hooks/useHostels';
import { ImageUpload } from "@/components/ui/image-upload";

const page = () => {
  // filter logic is here
  const [activeStatus, setactiveStatus] = useState("All Statuses");
  const [activeType, setActiveType] = useState("All Types");
  const [searchTerm, setSearchTerm] = useState("");

  // Data management with React Query
  const { data: hostels = [], isLoading: hostelsLoading, error: hostelsError, refetch: refetchHostels } = useHostels();
  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();
  const [selectedHostelId, setSelectedHostelId] = useState("");
  const [formselectedHostelId, setFormselectedHostelId] = useState("");
  // const [notes, setNotes] = useState("");

  // for editing of room
  const [selectedroom, setselectedRoom] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: rooms = [], isLoading: loading, error: roomsError, refetch: refetchRooms } = useRoomsByHostel(selectedHostelId);

  const handleSelectRoom = (room) => {
    // Initialize selectedroom with proper structure
    setselectedRoom({
      ...room,
      roomNumber: room.roomNumber || "",
      floor: room.floor || 0,
      capacity: room.capacity || 0,
      pricePerNight: room.pricePerNight || 0,
      pricePerMonth: room.pricePerMonth || 0,
      type: room.type || "SINGLE",
      status: room.status || "AVAILABLE",
      notes: room.notes || "",
      amenities: room.amenities || [],
      image: room.image || ""
    });
    setIsEditDialogOpen(true);
  };
  // for del of room
  const [del, setdel] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // for guests dialog
  const [selectedRoomForGuests, setSelectedRoomForGuests] = useState(null);
  const [isGuestsDialogOpen, setIsGuestsDialogOpen] = useState(false);
  const [roomGuests, setRoomGuests] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(false);
  // form data stored here for creeating new room
  const [roomType, setRoomType] = useState("SINGLE");
  const [roomStatus, setRoomStatus] = useState("AVAILABLE");
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [capacity, setCapacity] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [notes, setNotes] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [amenitiesInput, setAmenitiesInput] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [pageloading, setPageloading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const handleAmenitiesInput = (amenitiesString) => {
    if (typeof amenitiesString === 'string') {
      const separatedAmenities = amenitiesString
        .split(',')
        .map(amenity => amenity.trim())
        .filter(amenity => amenity !== '');
      return separatedAmenities;
    }
    return [];
  };

  // Set first hostel as selected when hostels are loaded
  useEffect(() => {
    if (hostels.length > 0 && !selectedHostelId) {
      setSelectedHostelId(hostels[0].id);
    }
  }, [hostels, selectedHostelId]);

  useEffect(() => {
    const amenitiesList = handleAmenitiesInput(amenitiesInput);
    console.log("Amenities input:", amenitiesInput);
    console.log("Processed amenities:", amenitiesList);
    setAmenities(amenitiesList);
  }, [amenitiesInput]);


  // Reset form function
  const resetForm = () => {
    setRoomNumber("");
    setFloor("");
    setCapacity("");
    setPricePerNight("");
    setPricePerMonth("");
    setSecurityDeposit("");
    setNotes("");
    setAmenities([]);
    setAmenitiesInput("");
    setImage("");
    setFormselectedHostelId("");
    setError("");
  };

  // Update room function
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!selectedroom) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/room/updateroom/${selectedroom.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomnumber: selectedroom.roomNumber,
          floor: selectedroom.floor,
          capacity: selectedroom.capacity,
          pricepernight: selectedroom.pricePerNight,
          pricePerMonth: selectedroom.pricePerMonth,
          type: selectedroom.type,
          status: selectedroom.status,
          amenities: selectedroom.amenities,
          notes: selectedroom.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Room updated successfully!");

        // React Query automatically updates the cache
        setIsEditDialogOpen(false);
        setselectedRoom(null);
      } else {
        toast.error(data.error || "Failed to update room");
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error("An error occurred while updating the room");
    } finally {
      setIsUpdating(false);
    }
  };
  const handleDeleteRoom = async () => {
    if (!del) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/room/deleteroom/${del.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Room deleted successfully!");

        // React Query automatically updates the cache
        setIsDeleteDialogOpen(false);
        setdel("");
      } else {
        toast.error(data.error || "Failed to delete room");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("An error occurred while deleting the room");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch guests for a room
  const fetchRoomGuests = async (roomId) => {
    setIsLoadingGuests(true);
    try {
      const response = await fetch(`/api/room/${roomId}/guests`);
      const data = await response.json();

      if (response.ok) {
        setRoomGuests(data.guests || []);
        setActiveBookings(data.activeBookings || []);
      } else {
        toast.error(data.error || "Failed to fetch room guests");
        setRoomGuests([]);
        setActiveBookings([]);
      }
    } catch (error) {
      console.error("Error fetching room guests:", error);
      toast.error("An error occurred while fetching room guests");
      setRoomGuests([]);
      setActiveBookings([]);
    } finally {
      setIsLoadingGuests(false);
    }
  };

  const handleSeeGuests = (room) => {
    setSelectedRoomForGuests(room);
    setIsGuestsDialogOpen(true);
    fetchRoomGuests(room.id);
  };

  // Create room function
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!formselectedHostelId) {
      toast.error("Please select a hostel first");
      return;
    }

    // Validate required fields
    const missingFields = [];
    if (!roomNumber) missingFields.push("Room Number");
    if (!floor) missingFields.push("Floor");
    if (!capacity) missingFields.push("Capacity");
    if (!pricePerNight) missingFields.push("Price per Night");
    if (!pricePerMonth) missingFields.push("Price per Month");

    if (missingFields.length > 0) {
      const errorMessage = `Missing required fields: ${missingFields.join(", ")}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/room/createroom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomnumber: roomNumber,
          floor: parseInt(floor),
          capacity: parseInt(capacity),
          pricepernight: parseFloat(pricePerNight),
          pricePerMonth: parseFloat(pricePerMonth),
          securitydeposit: parseFloat(securityDeposit),
          notes: notes,
          amenities: amenities,
          type: roomType,
          status: roomStatus,
          image: image,
          hostelId: formselectedHostelId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const hostelName = hostels.find(h => h.id === formselectedHostelId)?.hostelName;
        toast.success(`Room created successfully in ${hostelName}!`);

        // React Query automatically updates the cache

        // Reset form
        resetForm();

        // Close dialog immediately
        setIsDialogOpen(false);
      } else {
        const errorMessage = data.error || "Failed to create room";
        setError(errorMessage);
        toast.error(errorMessage);
        // Don't close dialog on error - keep it open to show the error
      }
    } catch (error) {
      console.error("Error creating room:", error);
      setError(error.message || "An error occurred while creating the room");
      toast.error(error.message || "An error occurred while creating the room");
    } finally {
      setIsCreating(false);
      setPageloading(false);
    }
  };


  const filterstatus = rooms.filter((room) => {
    const matchesHostel = !selectedHostelId || room.hostelId === selectedHostelId;
    const getStatusDisplayValue = (status) => {
      switch (status) {
        case 'AVAILABLE': return 'Available';
        case 'OCCUPIED': return 'Occupied';
        case 'MAINTENANCE': return 'Maintenance';
        case 'OUT_OF_ORDER': return 'Out of Order';
        default: return status;
      }
    };

    const matchesStatus = activeStatus === "All Statuses" || getStatusDisplayValue(room.status) === activeStatus;
    const matchesSearch =
      searchTerm === "" ||
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.amenities?.some(amenity =>
        amenity.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      room.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesHostel && matchesStatus && matchesSearch;
  });



  // Show loading state while hostels are being fetched
  if (hostelsLoading || pageloading) {
    return (
      <PageLoadingSkeleton
        title={true}
        statsCards={4}
        filterTabs={3}
        searchBar={true}
        contentCards={6}
      />
    );
  }

  // Show error state if there's an error with hostels
  if (hostelsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading hostels</h3>
          <p className="mt-1 text-sm text-gray-500">
            {hostelsError.message || "Unable to load hostels data"}
          </p>
          <Button
            className="mt-4"
            onClick={() => refetchHostels()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  return (
    <div className="p-2">
      {/* Global Error Display */}
      {error && (
        <div className="mb-4 mx-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-3">
                  <Button
                    onClick={() => setError("")}
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex md:flex-row flex-col justify-between px-4">
        <div className="mt-4 ">
          <h1 className="text-3xl font-bold">Rooms ! </h1>
          <p className="text-muted-foreground leading-loose">
            Manage your rooms here.
          </p>
        </div>
        {/* <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={() => {
                refetchHostels();
                refetchRooms();
              }}
              disabled={hostelsLoading || loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(hostelsLoading || loading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div> */}

        {/* Hostel Selector */}
        {/* <div className="mt-4 md:mt-0">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Viewing Rooms for:
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {loading ? (
                <Button variant="outline" className="w-full justify-between min-w-[250px] bg-blue-50 border-blue-200">
                  Loading the hostels
                </Button>
              ) : (
              <Button variant="outline" className="w-full justify-between min-w-[250px] bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {hostels.find(h => h.id === selectedHostelId)?.hostelName || "Select Hostel"}
                </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {loading ? (
                <DropdownMenuItem>
                  Loading the hostels
                </DropdownMenuItem>
              ) : (
               hostels.map((hostel) => (
                <DropdownMenuItem
                  key={hostel.id}
                  onClick={() => setSelectedHostelId(hostel.id)}
                  className="cursor-pointer"
                >
                  
                  <div className="flex items-center gap-2">
                   
                    <div className={`w-2 h-2 rounded-full ${hostel.id === selectedHostelId ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    {hostel.hostelName}
                  </div>
                  
                </DropdownMenuItem>
              ))
            )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="cursor-pointer p-4"
                variant="outline"
                onClick={() => {
                  setError("");
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Room
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col"
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setError("");
                }
              }}
            >
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-xl font-semibold">
                  Add New Room
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a new room in your hostel with all necessary details.
                  {formselectedHostelId && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md">
                      <span className="text-sm font-medium text-blue-800">
                        Adding room to: {hostels.find(h => h.id === formselectedHostelId)?.hostelName}
                      </span>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="overflow-y-auto px-6 pb-6 pt-2" style={{ maxHeight: '70vh' }}>
                <form className="space-y-6 overflow-visible" onSubmit={handleCreateRoom}>
                  {/* Room Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Basic Information
                    </h3>

                    {/* Hostel Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Select Hostel *
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-normal"
                          >
                            {hostels.find(h => h.id === formselectedHostelId)?.hostelName || "Select Hostel"}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {hostels.map((hostel) => (
                            <DropdownMenuItem
                              key={hostel.id}
                              onClick={() => {
                                setFormselectedHostelId(hostel.id);
                                if (error) setError("");
                              }}
                              className="cursor-pointer"
                            >
                              {hostel.hostelName}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Room Number *
                        </Label>
                        <Input
                          placeholder="e.g. 101"
                          className="w-full"
                          value={roomNumber}
                          onChange={(e) => {
                            setRoomNumber(e.target.value);
                            if (error) setError(""); // Clear error when user starts typing
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Floor *
                        </Label>
                        <Input
                          placeholder="e.g. 1"
                          type="number"
                          min="0"
                          className="w-full"
                          value={floor}
                          onChange={(e) => {
                            setFloor(e.target.value);
                            if (error) setError("");
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Room Type *
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              {roomType === "SINGLE"
                                ? "Single Room"
                                : roomType === "DOUBLE"
                                  ? "Double Room"
                                  : roomType === "TRIPLE"
                                    ? "Triple Room"
                                    : roomType === "QUAD"
                                      ? "Quad Room"
                                      : roomType === "DORMITORY"
                                        ? "Dormitory"
                                        : "Select room type"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            <DropdownMenuItem
                              onClick={() => setRoomType("SINGLE")}
                              className="flex items-center justify-between"
                            >
                              <span>Single Room</span>
                              <span className="text-xs text-gray-500">
                                1 person
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRoomType("DOUBLE")}
                              className="flex items-center justify-between"
                            >
                              <span>Double Room</span>
                              <span className="text-xs text-gray-500">
                                2 people
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRoomType("TRIPLE")}
                              className="flex items-center justify-between"
                            >
                              <span>Triple Room</span>
                              <span className="text-xs text-gray-500">
                                3 people
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRoomType("QUAD")}
                              className="flex items-center justify-between"
                            >
                              <span>Quad Room</span>
                              <span className="text-xs text-gray-500">
                                4 people
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRoomType("DORMITORY")}
                              className="flex items-center justify-between"
                            >
                              <span>Dormitory</span>
                              <span className="text-xs text-gray-500">
                                4+ people
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Capacity *
                        </Label>
                        <Input
                          placeholder="e.g. 2"
                          type="number"
                          min="1"
                          className="w-full"
                          value={capacity}
                          onChange={(e) => {
                            setCapacity(e.target.value);
                            if (error) setError("");
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Room Status *
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              {roomStatus === "AVAILABLE"
                                ? "Available"
                                : roomStatus === "OCCUPIED"
                                  ? "Occupied"
                                  : roomStatus === "MAINTENANCE"
                                    ? "Maintenance"
                                    : roomStatus === "OUT_OF_ORDER"
                                      ? "Out of Order"
                                      : "Select Status"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            <DropdownMenuItem
                              onClick={() => setRoomStatus("AVAILABLE")}
                              className="cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Available
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRoomStatus("OCCUPIED")}
                              className="cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Occupied
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRoomStatus("MAINTENANCE")}
                              className="cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                Maintenance
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRoomStatus("OUT_OF_ORDER")}
                              className="cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                Out of Order
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <ImageUpload
                          value={image}
                          onChange={(url) => setImage(url)}
                          label="Room Image *"
                          maxSize={5}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Pricing
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Price per Night (PKR) *
                        </Label>
                        <Input
                          placeholder="e.g. 2000"
                          type="number"
                          min="0"
                          className="w-full"
                          value={pricePerNight}
                          onChange={(e) => {
                            setPricePerNight(e.target.value);
                            if (error) setError("");
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Price per Month (PKR) *
                        </Label>
                        <Input
                          placeholder="e.g. 2000"
                          type="number"
                          min="0"
                          className="w-full"
                          value={pricePerMonth}
                          onChange={(e) => {
                            setPricePerMonth(e.target.value);
                            if (error) setError("");
                          }}
                          required
                        />
                      </div>
                      {/* <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Security Deposit (PKR)
                      </Label>
                      <Input
                        placeholder="e.g. 5000"
                        type="number"
                        min="0"
                        className="w-full"
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                      />
                    </div> */}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Amenities
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Room Amenities
                        </Label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter amenities separated by commas (e.g., WiFi, Parking, Air Conditioning, TV, Mini Fridge, Balcony)"
                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                            value={amenitiesInput}
                            onChange={(e) => setAmenitiesInput(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Wifi className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Tip: Use commas to separate multiple amenities for better organization
                        </p>
                      </div>

                      {/* Selected Amenities Preview */}
                      {console.log("Amenities for preview:", amenities)}
                      {amenities.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Selected Amenities Preview
                          </Label>
                          <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            {amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium flex items-center gap-1"
                              >
                                <Star className="h-3 w-3" />
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Additional Notes
                        </Label>
                        <textarea
                          placeholder="Any additional information about the room..."
                          className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Error creating room
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </form>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t px-6 pb-6">
                <Button
                  className="cursor-pointer"
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 cursor-pointer hover:bg-blue-700"
                  disabled={isCreating}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? "Creating..." : "Add Room"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Home className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
            <p className="text-xs text-muted-foreground">
              Room records
            </p>
          </CardContent>
        </Card>
        {/* Available Rooms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <Bed className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filterstatus.filter(room => room.status === "AVAILABLE").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>
        {/* Occupied Rooms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
            <User className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filterstatus.filter(room => room.status === "OCCUPIED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently occupied
            </p>
          </CardContent>
        </Card>
        {/* Maintenance/Out of Order */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Maintenance/Out of Order</CardTitle>
            <Activity className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filterstatus.filter(room => room.status === "MAINTENANCE" || room.status === "OUT_OF_ORDER").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Under maintenance or out of order
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="w-full bg-white p-1 md:p-6 my-6 shadow-sm rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search input should span 2 columns on desktop */}
          <div className="col-span-1 md:col-span-3 relative flex items-center">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <Input
              type="text"
              className="pl-12 py-3 pr-4 border rounded-md w-full text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search rooms by number, type, amenities, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search rooms"
              autoComplete="off"
            />
          </div>
          {/* Status Dropdown */}
          <div className="col-span-1 flex items-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="p-4 cursor-pointer w-full text-left" variant="outline">
                  {activeStatus}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setactiveStatus("All Statuses")}
                >
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setactiveStatus("Available")}
                >
                  Available
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setactiveStatus("Occupied")}
                >
                  Occupied
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setactiveStatus("Maintenance")}
                >
                  Maintenance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Type Dropdown */}
          {/* <div className="col-span-1 flex items-end">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button className="p-4 cursor-pointer w-full text-left" variant="outline">
                   {activeType}
                   <ChevronDown className="h-4 w-4 ml-1" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                 <DropdownMenuItem
                   className="cursor-pointer"
                   onClick={() => setActiveType("All Types")}
                 >
                   All Types
                 </DropdownMenuItem>
                 <DropdownMenuItem
                   className="cursor-pointer"
                   onClick={() => setActiveType("SINGLE")}
                 >
                   Single
                 </DropdownMenuItem>
                 <DropdownMenuItem
                   className="cursor-pointer"
                   onClick={() => setActiveType("DOUBLE")}
                 >
                   Double
                 </DropdownMenuItem>
                 <DropdownMenuItem
                   className="cursor-pointer"
                   onClick={() => setActiveType("TRIPLE")}
                 >
                   Triple
                 </DropdownMenuItem>
                 <DropdownMenuItem
                   className="cursor-pointer"
                   onClick={() => setActiveType("QUAD")}
                 >
                   Quad
                 </DropdownMenuItem>
                 <DropdownMenuItem
                   className="cursor-pointer"
                   onClick={() => setActiveType("DORMITORY")}
                 >
                   Dormitory
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           </div> */}
          {/* Hostel Selector Dropdown */}
          <div className="col-span-1   flex flex-col justify-end">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {loading ? (
                  <Button variant="outline" className="w-full justify-between min-w-[200px] bg-blue-50 border-blue-200">
                    Loading the hostels
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full justify-between min-w-[200px] bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {hostels.find(h => h.id === selectedHostelId)?.hostelName || "Select Hostel"}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {loading ? (
                  <DropdownMenuItem>
                    Loading the hostels
                  </DropdownMenuItem>
                ) : (
                  hostels.map((hostel) => (
                    <DropdownMenuItem
                      key={hostel.id}
                      onClick={() => setSelectedHostelId(hostel.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${hostel.id === selectedHostelId ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        {hostel.hostelName}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {!selectedHostelId ? (
        <div className="flex flex-col items-center justify-center py-12 mx-auto">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Hostel</h3>
            <p className="text-gray-600 mb-4">
              Please select a hostel to view its rooms.
            </p>
          </div>
        </div>
      ) : filterstatus.length === 0 ? (
        <Card className="flex flex-col mt-10 items-center justify-center py-12 mx-auto">
          <CardContent>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-600 mb-4">
                This hostel doesn't have any rooms yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 p-1 md:p-6 my-6 bg-gray-50 shadow-none rounded-md ">
            {filterstatus.map((room) => {
              // Calculate room metrics
              const totalBookings = room.bookings?.length || 0;
              const activeBookings = room.bookings?.filter(booking =>
                booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN'
              ).length || 0;
              const lastBooking = room.bookings?.length > 0 ?
                room.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;

              return (
                <div key={room.id}>
                  <Card className="mb-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Home className="h-6 w-6" />
                          <div>
                            <p className="text-md font-medium">
                              Room {room.roomNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Floor {room.floor} • {room.type}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          room.status === "AVAILABLE" ? "default" :
                            room.status === "OCCUPIED" ? "destructive" :
                              room.status === "MAINTENANCE" ? "secondary" : "outline"
                        }>
                          {room.status === "AVAILABLE" ? "Available" :
                            room.status === "OCCUPIED" ? "Occupied" :
                              room.status === "MAINTENANCE" ? "Maintenance" :
                                room.status === "OUT_OF_ORDER" ? "Out of Order" : room.status}
                        </Badge>
                      </div>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Room Details Section */}
                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                          <div>
                            <p className="text-md font-medium flex items-center gap-2">
                              <Bed className="w-4 h-4" />
                              <span className="text-sm font-semibold text-gray-800">Details</span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Capacity</span>
                              <span className="text-xs text-gray-900">{room.capacity} guests</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Type</span>
                              <span className="text-xs text-gray-900">{room.type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Floor</span>
                              <span className="text-xs text-gray-900">{room.floor}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                          <div>
                            <p className="text-md font-medium flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-sm font-semibold text-gray-800">Pricing</span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Per Night</span>
                              <span className="text-xs font-medium text-gray-900">PKR{room.pricePerNight}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Per Month</span>
                              <span className="text-xs font-medium text-gray-900">PKR{room.pricePerMonth}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Status</span>
                              <span className="text-xs text-gray-900">{room.status}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bookings Section */}
                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                          <div>
                            <p className="text-md font-medium flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-semibold text-gray-800">Bookings</span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Total</span>
                              <span className="text-xs text-gray-900">{totalBookings}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Active</span>
                              <span className="text-xs text-gray-900">{activeBookings}</span>
                            </div>
                            {lastBooking && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Last Booking</span>
                                <span className="text-xs text-gray-900">{new Date(lastBooking.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Amenities Section */}
                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                          <div>
                            <p className="text-md font-medium flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              <span className="text-sm font-semibold text-gray-800">Amenities</span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            {room.amenities?.length > 0 ? (
                              room.amenities.slice(0, 3).map((amenity, idx) => (
                                <div key={idx} className="text-xs text-gray-600 truncate">
                                  • {amenity}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-500">No amenities</div>
                            )}
                            {room.amenities?.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{room.amenities.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {room.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-800">Notes</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-3">{room.notes}</p>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent>
                      {/* Action Buttons */}

                      <div className="flex gap-2 items-center justify-end mt-4 pt-4 border-t">
                        <Button
                          onClick={() => handleSeeGuests(room)}
                          variant="outline"
                          className="px-3 py-2 cursor-pointer text-xs h-8 min-h-0 rounded-md flex items-center gap-1"
                          title="See Guests"
                        >
                          <Users className="h-3 w-3" />
                          Guests
                        </Button>

                        {/* room edit */}
                        <Dialog open={isEditDialogOpen && selectedroom} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => handleSelectRoom(room)}
                              variant="outline"
                              className="px-3 py-2 cursor-pointer text-xs h-8 min-h-0 rounded-md flex items-center gap-1"
                              title="Edit Room"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          {selectedroom && (
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-semibold">
                                  Edit Room - {selectedroom?.roomNumber}
                                </DialogTitle>
                                <DialogDescription className="text-gray-600">
                                  Update room details and settings.
                                </DialogDescription>
                              </DialogHeader>

                              <form className="space-y-6 mt-6" onSubmit={handleUpdateRoom}>
                                {/* Room Basic Information */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                    Basic Information
                                  </h3>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Room Number *
                                      </Label>
                                      <Input
                                        placeholder="e.g. 101"
                                        value={selectedroom?.roomNumber || ""}
                                        onChange={(e) => selectedroom && setselectedRoom({ ...selectedroom, roomNumber: e.target.value })}
                                        className="w-full"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Floor *
                                      </Label>
                                      <Input
                                        placeholder="e.g. 1"
                                        type="number"
                                        value={selectedroom?.floor || ""}
                                        onChange={(e) => selectedroom && setselectedRoom({ ...selectedroom, floor: parseInt(e.target.value) })}
                                        min="0"
                                        className="w-full"
                                        required
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Room Type *
                                      </Label>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className="w-full justify-between text-left font-normal"
                                          >
                                            {selectedroom?.type || "Select Room Type"}
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-full">
                                          <DropdownMenuItem
                                            onClick={() => selectedroom && setselectedRoom({ ...selectedroom, type: "SINGLE" })}
                                            className="flex items-center justify-between"
                                          >
                                            <span>Single Room</span>
                                            <span className="text-xs text-gray-500">
                                              1 person
                                            </span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => selectedroom && setselectedRoom({ ...selectedroom, type: "DOUBLE" })}
                                            className="flex items-center justify-between"
                                          >
                                            <span>Double Room</span>
                                            <span className="text-xs text-gray-500">
                                              2 people
                                            </span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => selectedroom && setselectedRoom({ ...selectedroom, type: "TRIPLE" })}
                                            className="flex items-center justify-between"
                                          >
                                            <span>Triple Room</span>
                                            <span className="text-xs text-gray-500">
                                              3 people
                                            </span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => selectedroom && setselectedRoom({ ...selectedroom, type: "DORMITORY" })}
                                            className="flex items-center justify-between"
                                          >
                                            <span>Dormitory</span>
                                            <span className="text-xs text-gray-500">
                                              4+ people
                                            </span>
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Room Availabity
                                      </Label>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className="w-full justify-between text-left font-normal"
                                          >
                                            {selectedroom?.status || "Select Room Status"}
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-full">
                                          <DropdownMenuItem
                                            onClick={() => selectedroom && setselectedRoom({ ...selectedroom, status: "AVAILABLE" })}
                                            className="flex items-center justify-between"
                                          >
                                            <span>Available</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => selectedroom && setselectedRoom({ ...selectedroom, status: "OCCUPIED" })}
                                            className="flex items-center justify-between"
                                          >
                                            <span>Occupied</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              selectedroom && setselectedRoom({ ...selectedroom, status: "MAINTENANCE" })
                                            }
                                            className="flex items-center justify-between"
                                          >
                                            <span>Maintenance</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              selectedroom && setselectedRoom({ ...selectedroom, status: "OUT_OF_ORDER" })
                                            }
                                            className="flex items-center justify-between"
                                          >
                                            <span>Out of Order</span>
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Capacity *
                                      </Label>
                                      <Input
                                        placeholder="e.g. 2"
                                        type="number"
                                        min="1"
                                        value={selectedroom?.capacity || ""}
                                        onChange={(e) => setselectedRoom({ ...selectedroom, capacity: parseInt(e.target.value) })}
                                        className="w-full"
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Pricing */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                    Pricing
                                  </h3>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Price per Night (PKR) *
                                      </Label>
                                      <Input
                                        placeholder="e.g. 2000"
                                        type="number"
                                        min="0"
                                        className="w-full"
                                        defaultValue={selectedroom.pricePerNight}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Price per Month (PKR)
                                      </Label>
                                      <Input
                                        placeholder="e.g. 5000"
                                        type="number"
                                        min="0"
                                        className="w-full"
                                        defaultValue={selectedroom.pricePerMonth}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Amenities */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                    Amenities
                                  </h3>

                                  <div className="space-y-2">
                                    <div className="relative">
                                      <input
                                        type="text"
                                        placeholder="Enter amenities separated by commas (e.g., WiFi, Parking, Air Conditioning, TV, Mini Fridge, Balcony)"
                                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                                        value={Array.isArray(selectedroom.amenities) ? selectedroom.amenities.join(', ') : selectedroom.amenities || ''}
                                        onChange={(e) => {
                                          const amenitiesArray = handleAmenitiesInput(e.target.value);
                                          setselectedRoom({ ...selectedroom, amenities: amenitiesArray });
                                        }}
                                      />
                                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <Wifi className="h-5 w-5 text-gray-400" />
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      💡 Tip: Use commas to separate multiple amenities for better organization
                                    </p>
                                  </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="bg-blue-600 cursor-pointer hover:bg-blue-700"
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? "Updating..." : "Update Room"}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          )}
                        </Dialog>

                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              onClick={() => {
                                setdel(room);
                                setIsDeleteDialogOpen(true);
                              }}
                              variant="outline"
                              className="px-3 py-2 cursor-pointer text-xs h-8 min-h-0 rounded-md flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                              title="Delete Room"
                            >
                              <Trash className="h-3 w-3" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure you want to delete this room?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the room "{del?.roomNumber}" and remove all its data from our servers.
                                {del?.bookings?.length > 0 && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm text-yellow-800">
                                      ⚠️ This room has {del.bookings.length} active booking(s). You may need to cancel them first.
                                    </p>
                                  </div>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className="cursor-pointer"
                                onClick={() => {
                                  setIsDeleteDialogOpen(false);
                                  setdel("");
                                }}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="cursor-pointer bg-red-600 hover:bg-red-700"
                                onClick={handleDeleteRoom}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete Room"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Guests Dialog */}
      <Dialog open={isGuestsDialogOpen} onOpenChange={setIsGuestsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guests in Room {selectedRoomForGuests?.roomNumber}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              View all guests currently staying in this room and their booking details.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-1 space-y-6 mt-4">
            {isLoadingGuests ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-center flex flex-col items-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-sm text-gray-600 mt-2">Loading guests...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Registered Guests Section */}
                <section>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Registered Guests ({roomGuests.length})
                  </h3>
                  {roomGuests.length > 0 ? (
                    <div className="space-y-3">
                      {roomGuests.map((guest, index) => (
                        <Card key={guest.id || index} className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {guest.user?.image ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={guest.user.image}
                                  alt={guest.user.name || 'Guest'}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {guest.user?.name || 'Unknown Guest'}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {guest.user?.email || 'No email provided'}
                              </p>
                              <p className="text-xs text-gray-400">
                                Guest since: {new Date(guest.user?.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No registered guests found for this room</p>
                    </div>
                  )}
                </section>

                {/* Active Bookings Section */}
                <section>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Active Bookings ({activeBookings.length})
                  </h3>
                  {activeBookings.length > 0 ? (
                    <div className="space-y-3 flex flex-col gap-2">
                      {activeBookings.map((booking, index) => (
                        <Link key={booking.id || index} href={`/dashboard/admin/user/${booking.user.id}`}>
                          <Card className="p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  {booking.user?.image ? (
                                    <img
                                      className="h-10 w-10 rounded-full"
                                      src={booking.user.image}
                                      alt={booking.user.name || 'Guest'}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <Users className="h-5 w-5 text-gray-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {booking.user?.name || 'Unknown Guest'}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {booking.user?.email || 'No email provided'}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {booking.user?.phone || 'No phone number provided'}
                                  </p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-gray-400">
                                      Check-in: {new Date(booking.checkin).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      Check-out: {new Date(booking.checkout).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className={`${booking.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'CHECKED_IN'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                  }`}
                              >
                                {booking.status?.replace('_', ' ') || 'Unknown'}
                              </Badge>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Eye className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No active bookings found for this room</p>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t flex-shrink-0">
            <Button onClick={() => setIsGuestsDialogOpen(false)} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default page;