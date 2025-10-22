"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Filter,
  ChevronDown,
  Search,
  Edit,
  Wifi,
  Tv,
  Wind,
  Delete,
  Bin,
  Trash,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const page = () => {
  // filter logic is here
  const [activeStatus, setactiveStatus] = useState("All Statuses");
  const [activeType, setActiveType] = useState("All Types");
  const [searchTerm, setSearchTerm] = useState("");

  // for eddting of room
  const [selectedroom, setselectedRoom] = useState([]);
  console.log(selectedroom);
  const handleSelectRoom = (room) => {
    setselectedRoom(room);
  };
  // for del of room
  const [del, setdel] = useState("");
  // form data stored here for creeating new room
  const [roomType, setRoomType] = useState("All Type");
  const [roomStatus, setRoomStatus] = useState("Available");

  const temproomsdata = [
    {
      id: 1,
      number: "101",
      floor: 1,
      type: "Single",
      status: "Inavailable",
      capacity: 1,
      price: 100,
      amenities: "Wifi, TV, AC",
      description: "A comfortable single room with a private bathroom",
      images: "https://via.placeholder.com/150",
      bookings: [],
      securitydeposite: 1500,
      occupants: [],
      ammenities: [
        {
          item: "Wifi",
          icon: Wifi,
        },
      ],
      maintenanceRequests: [],
      notes: "this is best room",
    },
    {
      id: 2,
      number: "102",
      notes: "this is best room",
      floor: 1,
      type: "Double",
      status: "Available",
      capacity: 2,
      price: 200,
      amenities: "Wifi, TV, AC",
      securitydeposite: 100,
      description: "A comfortable double room with a private bathroom",
      images: "https://via.placeholder.com/150",
      bookings: [],
      occupants: [],
      ammenities: [
        {
          item: "Wifi",
          icon: Wifi,
        },
        {
          item: "TV",
          icon: Tv,
        },
        {
          item: "AC",
          icon: Wind,
        },
      ],
      maintenanceRequests: [],
    },
    {
      id: 3,
      number: "103",
      floor: 1,
      type: "Triple",
      status: "Available",
      capacity: 3,
      price: 300,
      amenities: "Wifi, TV, AC",
      description: "A comfortable triple room with a private bathroom",
      images: "https://via.placeholder.com/150",
      bookings: [],
      occupants: [],
      ammenities: [
        {
          item: "Wifi",
          icon: Wifi,
        },
        {
          item: "TV",
          icon: Tv,
        },
        {
          item: "AC",
          icon: Wind,
        },
      ],
      maintenanceRequests: [],
    },
  ];

  // Combined filtering for status and search
  const filterstatus = temproomsdata.filter((room) => {
    const matchesStatus =
      activeStatus === "All Statuses" || room.status === activeStatus;
    const matchestype = activeType === "All Types" || room.type === activeType;
    const matchesSearch =
      searchTerm === "" ||
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.amenities.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch && matchestype;
  });
  console.log(filterstatus);
  return (
    <div className="p-2">
      <div className="flex md:flex-row flex-col justify-between px-4">
        <div className="mt-4 ">
          <h1 className="text-3xl font-bold">Rooms ! </h1>
          <p className="text-muted-foreground leading-loose">
            Manage your rooms here.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="cursor-pointer p-4" variant="outline">
                <Plus className="h-4 w-4" /> Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Add New Room
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a new room in your hostel with all necessary details.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-6 mt-6">
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
                            {roomType === "All Type"
                              ? "Select room type"
                              : roomType}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem
                            onClick={() => setRoomType("Single")}
                            className="flex items-center justify-between"
                          >
                            <span>Single Room</span>
                            <span className="text-xs text-gray-500">
                              1 person
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setRoomType("Double")}
                            className="flex items-center justify-between"
                          >
                            <span>Double Room</span>
                            <span className="text-xs text-gray-500">
                              2 people
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setRoomType("Triple")}
                            className="flex items-center justify-between"
                          >
                            <span>Triple Room</span>
                            <span className="text-xs text-gray-500">
                              3 people
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setRoomType("Dormitory")}
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
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Security Deposit (PKR)
                      </Label>
                      <Input
                        placeholder="e.g. 5000"
                        type="number"
                        min="0"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Amenities
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Available Amenities
                      </Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="wifi" />
                          <Label
                            htmlFor="wifi"
                            className="text-sm font-normal flex items-center"
                          >
                            <Wifi className="h-4 w-4 mr-2" />
                            WiFi
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="tv" />
                          <Label
                            htmlFor="tv"
                            className="text-sm font-normal flex items-center"
                          >
                            <Tv className="h-4 w-4 mr-2" />
                            TV
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="ac" />
                          <Label
                            htmlFor="ac"
                            className="text-sm font-normal flex items-center"
                          >
                            <Wind className="h-4 w-4 mr-2" />
                            Air Conditioning
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="heater" />
                          <Label
                            htmlFor="heater"
                            className="text-sm font-normal flex items-center"
                          >
                            <Wind className="h-4 w-4 mr-2" />
                            Heater
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Additional Notes
                      </Label>
                      <textarea
                        placeholder="Any additional information about the room..."
                        className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 cursor-pointer  hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Room
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4  bg-white p-6 my-6  shadow-sm rounded-md">
        <div className="col-span-3 items-center gap-2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <Input
            type="text"
            className="p-4 rounded-sm pl-12"
            placeholder="Search rooms"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="col-span-1 cursor-pointer items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="p-4 cursor-pointer " variant="outline">
                  {activeStatus}
                  <ChevronDown className="h-4 w-4" />
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
          <div className="col-span-1 cursor-pointer items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="p-4 cursor-pointer " variant="outline">
                  {activeType}
                  <ChevronDown className="h-4 w-4" />
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
                  onClick={() => setActiveType("Single")}
                >
                  Single
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveType("Double")}
                >
                  Double
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveType("Triple")}
                >
                  Triple
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-6 my-6 ${filterstatus.length == 0 ? "bg-white shadow-sm " : "bg-gray-50 shadow-none"} rounded-md `}
      >
        {filterstatus.length === 0 && (
          <div className="col-span-3 flex bg-white flex-col items-center justify-center py-12">
            <span className="text-2xl font-semibold text-gray-400 mb-2">
              No rooms found
            </span>
            <span className="text-sm text-muted-foreground">
              Try adjusting your filters or add a new room.
            </span>
          </div>
        )}

        {filterstatus.map((room) => (
          <div key={room.id}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <div>
                  <CardTitle>{room.number}</CardTitle>
                  <CardDescription>
                    {room.floor} | {room.type}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className={`${room.status === "Available" ? "bg-green-100" : "bg-red-100"}`}
                >
                  {room.status}
                </Badge>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p>{room.capacity} Guests</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p>{room.price}PKR/Night</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Bookings</p>
                    <p>{room.bookings.length} Bookings</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">Ammenities</p>
                    <div className="flex flex-wrap gap-2">
                      {room.ammenities.map((ammenity, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="px-2 py-1 text-xs h-6 min-h-0 rounded"
                        >
                          <ammenity.icon className="h-4 w-4" />
                          {ammenity.item}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center justify-end">
                    {/* room edit */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => handleSelectRoom(room)}
                          variant="outline"
                          className="px-2 py-1 cursor-pointer text-xs h-6 min-h-0 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold">
                            Add New Room
                          </DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Create a new room in your hostel with all necessary
                            details.
                          </DialogDescription>
                        </DialogHeader>

                        <form className="space-y-6 mt-6">
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
                                  defaultValue={selectedroom.number}
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
                                  defaultValue={selectedroom.floor}
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
                                      {selectedroom.type}
                                      <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-full">
                                    <DropdownMenuItem
                                      onClick={() => setRoomType("Single")}
                                      className="flex items-center justify-between"
                                    >
                                      <span>Single Room</span>
                                      <span className="text-xs text-gray-500">
                                        1 person
                                      </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setRoomType("Double")}
                                      className="flex items-center justify-between"
                                    >
                                      <span>Double Room</span>
                                      <span className="text-xs text-gray-500">
                                        2 people
                                      </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setRoomType("Triple")}
                                      className="flex items-center justify-between"
                                    >
                                      <span>Triple Room</span>
                                      <span className="text-xs text-gray-500">
                                        3 people
                                      </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setRoomType("Dormitory")}
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
                                      {roomStatus}
                                      <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-full">
                                    <DropdownMenuItem
                                      onClick={() => setRoomStatus("Available")}
                                      className="flex items-center justify-between"
                                    >
                                      <span>Available</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setRoomStatus("Occupied")}
                                      className="flex items-center justify-between"
                                    >
                                      <span>Occupied</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setRoomStatus("Maintenance")
                                      }
                                      className="flex items-center justify-between"
                                    >
                                      <span>Maintenance</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setRoomType("Out of order")
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
                                  defaultValue={selectedroom.capacity}
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
                                  defaultValue={selectedroom.price}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Security Deposit (PKR)
                                </Label>
                                <Input
                                  placeholder="e.g. 5000"
                                  type="number"
                                  min="0"
                                  className="w-full"
                                  defaultValue={selectedroom.securitydeposite}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                              Amenities
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Available Amenities
                                </Label>
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="wifi" />
                                    <Label
                                      htmlFor="wifi"
                                      className="text-sm font-normal flex items-center"
                                    >
                                      <Wifi className="h-4 w-4 mr-2" />
                                      WiFi
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="tv" />
                                    <Label
                                      htmlFor="tv"
                                      className="text-sm font-normal flex items-center"
                                    >
                                      <Tv className="h-4 w-4 mr-2" />
                                      TV
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="ac" />
                                    <Label
                                      htmlFor="ac"
                                      className="text-sm font-normal flex items-center"
                                    >
                                      <Wind className="h-4 w-4 mr-2" />
                                      Air Conditioning
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox id="heater" />
                                    <Label
                                      htmlFor="heater"
                                      className="text-sm font-normal flex items-center"
                                    >
                                      <Wind className="h-4 w-4 mr-2" />
                                      Heater
                                    </Label>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Additional Notes
                                </Label>
                                <textarea
                                  defaultValue={selectedroom.notes}
                                  placeholder="Any additional information about the room..."
                                  className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Form Actions */}
                          <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button
                              type="submit"
                              className="bg-blue-600 cursor-pointer  hover:bg-blue-700"
                            >
                              {/* <Plus className="h-4 w-4 mr-2" /> */}
                              Update
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button
                          onClick={() => setdel(room)}
                          variant="outline"
                          className="px-2 py-1 cursor-pointer text-xs h-6 min-h-0 rounded"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure to delect the room ?{" "}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="cursor-pointer">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction className="cursor-pointer">
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
