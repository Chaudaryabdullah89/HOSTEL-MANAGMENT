"use client";
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus,
  ChevronDown,
  Search,
  Pencil,
  Trash,
  MapPin,
  Star,
  Loader,
  Users,
  User,
  Calendar,
  RefreshCw,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton";
import { useHostels, useCreateHostel, useUpdateHostel, useDeleteHostel } from '@/hooks/useHostels';
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify"
import { SessionContext } from "@/app/context/sessiondata";

const HostelPage = () => {

  //
  const { session } = useContext(SessionContext);

  // Use React Query for hostels data
  const { data: hostels = [], isLoading: hostelsLoading, error: hostelsError, refetch: refetchHostels } = useHostels();
  const createHostelMutation = useCreateHostel();
  const updateHostelMutation = useUpdateHostel();
  const deleteHostelMutation = useDeleteHostel();

  //

  const router = useRouter();
  // FILTERS
  const [activeLocation, setActiveLocation] = useState("All Locations");
  const [activeType, setActiveType] = useState("All Types");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageloading, setpageLoading] = useState(false);
  const [creatingHostelLoading, setCreatingHostelLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  // EDIT HOSTEL
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedHostelId, setExpandedHostelId] = useState(null);

  // DELETE HOSTEL
  const [deleteHostel, setDeleteHostel] = useState(null);
  const [deletingHostelId, setDeletingHostelId] = useState(null);

  // ADD HOSTEL FORM
  const [hostelType, setHostelType] = useState("All Types");
  const [hostelStatus, sethostelStatus] = useState("ACTIVE")

  const [hostelName, setHostelName] = useState("");

  const [contact, setContact] = useState("");
  const [floors, setFloors] = useState("");
  // const [capacity, setCapacity] = useState("");
  // const [occupiedRooms, setOccupiedRooms] = useState("");
  // const [image, setImage] = useState("");
  // const [revenue, setRevenue] = useState("");
  const [description, setDescription] = useState("");
  const [currenteditinghostelid, setcurrenteditinghostelid] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
  });
  const [amenities, setAmenities] = useState("");
  const [wardens, setWardens] = useState([]);
  const [wardenId, setWardenId] = useState("");
  const [wardensIds, setWardensIds] = useState([]);
  const [wardensData, setWardensData] = useState([]);
  // Example: Log all hostel address ids
  // if (Array.isArray(hostels) && hostels.length > 0) {
  //   const hostelAddressIds = hostels.map(hostel => hostel.address?.id);
  //   console.log("Hostel Address IDs:", hostelAddressIds);
  // }
  console.log(currenteditinghostelid)

  const fetchRooms = async () => {
    setRoomsLoading(true);
    try {
      const response = await fetch("/api/room/getallrooms", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setRooms(Array.isArray(data) ? data : []);
        console.log("ROOMS ", data);
      } else {
        toast.error("Failed to fetch rooms");
        setRooms([]);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  }

  const getHostelRooms = (hostelId) => {
    return rooms.filter(room => room.hostelId === hostelId);
  }

  const getRoomStats = (hostelId) => {
    const hostelRooms = getHostelRooms(hostelId);
    const totalRooms = hostelRooms.length;
    const occupiedRooms = hostelRooms.filter(room => room.status === "OCCUPIED").length;
    const availableRooms = hostelRooms.filter(room => room.status === "AVAILABLE").length;
    const maintenanceRooms = hostelRooms.filter(room => room.status === "MAINTENANCE").length;

    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms
    };
  }

  // React Query handles hostels fetching automatically
  useEffect(() => {
    fetchRooms();
    // Hostels are automatically fetched by React Query
  }, []);
  const fetchWardens = async () => {
    try {
      const response = await fetch("/api/hostel/getwardens");
      const data = await response.json();
      setWardensData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching wardens:", error);
      setWardensData([]);
    }
  };



  const handleCreateWarden = async (e) => {
    e.preventDefault();
    setCreatingHostelLoading(true);
    try {
      const response = await fetch("/api/users/createwarden", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: wardenId, hostelId: selectedHostel?.id }),
      });
      const data = await response.json();
      console.log("CREATE WARDEN RESPONSE ", data);
      if (!response.ok) {
        toast.error("Failed to create warden");
      } else {
        toast.success("Warden created successfully")
      }
    } catch (error) {
      toast.error("An error occurred while creating the warden");
      console.error("Error creating warden:", error);
    } finally {
      setCreatingHostelLoading(false);
    }
  }
  const handleAddHostel = async (e) => {
    e.preventDefault();
    setCreatingHostelLoading(true);
    try {
      const amenitiesArray = amenities.split(",").map(item => item.trim()).filter(item => item !== "");
      const payload = {
        name: hostelName,
        hostelAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          zipcode: address.zipcode,
        },
        contact: contact,
        floors: floors,
        amenities: amenitiesArray,

        // occupiedRooms: occupiedRooms,
        // image: image,
        // revenue: revenue,
        wardensIds: wardensIds,
        description: description,
        hostelType: hostelType,
        hostelsStatus: hostelStatus,
      }
      const response = await fetch("/api/hostel/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json();

      if (!response.ok) {
        toast.error("Failed to create hostel!");
      } else {
        toast.success("Hostel created successfully!");
        console.log("Redirecting to hostel page after create...");
        // React Query automatically updates the cache
        setIsAddDialogOpen(false);

        setTimeout(() => {
          router.push("/dashboard/admin/hostel");
          router.refresh();
        }, 1000);
      }
      console.log("DATA ", data);

    } catch (error) {
      toast.error("An error occurred while creating the hostel");
      console.error("Error creating hostel:", error);
    } finally {
      setCreatingHostelLoading(false);
    }
  }
  const handleDeleteHostel = async (hostelId) => {
    setDeleteLoading(true);
    setIsDeleting(true);
    setDeletingHostelId(hostelId);
    try {
      const response = await fetch(`/api/hostel/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hostelId: hostelId }),
      });

      const data = await response.json();
      console.log("DELETE RESPONSE ", data);

      if (response.ok) {


        const updatedResponse = await fetch("/api/hostel/gethostels", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const updatedData = await updatedResponse.json();
        // React Query automatically updates the cache
        toast.success("Hostel deleted successfully");
        setDeleteHostel(null);
      } else {
        toast.error("Failed to delete hostel");
      }
    }
    catch (error) {
      toast.error("An error occurred while deleting the hostel");
      console.error("Error deleting hostel:", error);
    } finally {
      setDeleteLoading(false);
      setIsDeleting(false);
      setDeletingHostelId(null);
    }
  }
  const handleSelectHostelForEdit = (hostel) => {
    setSelectedHostel(hostel);
    setcurrenteditinghostelid(hostel.id);
    setHostelName(hostel.hostelName || "");
    setContact(hostel.contact || "");
    setFloors(hostel.floors?.toString() || "");
    // setCapacity(hostel.capacity?.toString() || "");
    // setOccupiedRooms(hostel.occupiedRooms?.toString() || "");
    // setImage(hostel.image || "");
    // setRevenue(hostel.revenue?.toString() || "");
    setDescription(hostel.description || "");
    setAddress({
      street: hostel.address?.street || "",
      city: hostel.address?.city || "",
      state: hostel.address?.state || "",
      country: hostel.address?.country || "",
      zipcode: hostel.address?.zipcode || "",
    });
    setAmenities(hostel.amenities?.join(", ") || "");
    setHostelType(hostel.hostelType || "All Types");
    sethostelStatus(hostel.hostelsStatus || "ACTIVE");
    setWardenId(hostel.Warden?.[0]?.user?.id || "");
    setWardensIds(hostel.Warden?.map(w => w.user.id) || []);
    setIsEditDialogOpen(true);
  };

  const handleEditHostel = async (e) => {
    e.preventDefault();
    setCreatingHostelLoading(true);
    try {

      const payload = {
        id: selectedHostel?.id,
        hostelName: hostelName,
        hostelAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          zipcode: address.zipcode,
          id: selectedHostel?.address?.id,
        },
        hostelId: currenteditinghostelid,
        contact: contact,
        floors: floors,
        amenities: amenities.split(",").map(item => item.trim()).filter(item => item !== ""),
        // capacity: capacity,
        // occupiedRooms: occupiedRooms,
        // image: image,
        // revenue: revenue,
        wardensIds: wardensIds,
        description: description,
        hostelType: hostelType,
        hostelsStatus: hostelStatus,
      }
      const response = await fetch(`/api/hostel/updatehosteldata`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("EDIT RESPONSE ", data);
      if (!response.ok) {
        toast.error("Failed to edit hostel");
      } else {
        toast.success("Hostel edited successfully");


        const updatedSelectedHostel = {
          ...selectedHostel,
          hostelName: hostelName,
          hostelsStatus: hostelStatus,
          hostelType: hostelType,
          contact: contact,
          floors: parseInt(floors),
          description: description,
          amenities: amenities.split(",").map(item => item.trim()).filter(item => item !== ""),
          address: {
            ...selectedHostel.address,
            street: address.street,
            city: address.city,
            state: address.state,
            country: address.country,
            zipcode: address.zipcode,
          }
        };


        // React Query automatically updates the cache


        setSelectedHostel(updatedSelectedHostel);

        setIsEditDialogOpen(false);
        setTimeout(() => {
          router.push("/dashboard/admin/hostel");
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      toast.error("An error occurred while editing the hostel");
      console.error("Error editing hostel:", error);
    } finally {
      setCreatingHostelLoading(false);
    }
  }
  const filteredHostels = hostels.filter((hostel) => {
    const matchesType =
      activeType === "All Types" || hostel.hostelType === activeType;
    const matchesSearch =
      searchTerm === "" ||
      hostel.hostelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hostel.description && hostel.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hostel.address && hostel.address.street && hostel.address.street.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hostel.address && hostel.address.city && hostel.address.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hostel.address && hostel.address.state && hostel.address.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hostel.address && hostel.address.country && hostel.address.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hostel.address && hostel.address.zipcode && hostel.address.zipcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hostel.contact && hostel.contact.toString().includes(searchTerm)) ||
      (hostel.floors && hostel.floors.toString().includes(searchTerm)) ||
      (hostel.amenities && hostel.amenities.some(amenity =>
        amenity.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    return matchesType && matchesSearch;
  });

  if (hostelsLoading) {
    return (
      <PageLoadingSkeleton 
        title={true}
        statsCards={0}
        filterTabs={3}
        searchBar={true}
        contentCards={6}
      />
    );
  }
  return (

    <div className="p-2 md:p-4">
      {/* HEADER */}
      <div className="flex md:flex-row flex-col justify-between px-2 md:px-4">
        <div className="mt-4">
          <h1 className="text-3xl font-bold">Hostels 🏠</h1>
          <p className="text-muted-foreground leading-loose">
            Manage your hostels here.
          </p>
        </div>

        {/* ADD HOSTEL & REFRESH */}
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            onClick={() => {
              refetchHostels();
              fetchRooms();
            }}
            variant="outline"
            className="flex items-center gap-2 cursor-pointer px-5 py-2 rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-100 transition"
            disabled={hostelsLoading || roomsLoading}
          >
            <RefreshCw className={`h-4 w-4 ${(hostelsLoading || roomsLoading) ? 'animate-spin' : ''}`} />
            <span className="font-medium text-base">
              {(hostelsLoading || roomsLoading) ? 'Refreshing...' : 'Refresh'}
            </span>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} className="overflow-visible max-h-[90%]">
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 cursor-pointer px-5 py-2 rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-100 transition" variant="outline">
                <Plus className="h-4 w-4" />
                <span className="font-medium text-base">Add Hostel</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] px-0 py-0 rounded-lg overflow-hidden bg-white border border-gray-200">
              <div className="px-6 py-8 max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold mb-1 text-gray-900">
                    Add New Hostel
                  </DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Create a new hostel listing with all necessary details.
                  </DialogDescription>
                </DialogHeader>

                <form className="space-y-7 mt-6" onSubmit={e => handleAddHostel(e)}>
                  {/* BASIC DETAILS */}
                  <div className="space-y-5">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Hostel Name *</Label>
                        <Input
                          placeholder="Sunrise Hostel"
                          required
                          value={hostelName}
                          onChange={e => setHostelName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Wardens</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between mt-1">
                              {wardensIds.length > 0 ? `${wardensIds.length} warden(s) selected` : "Select Wardens"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem disabled>Select Wardens (Multiple Selection)</DropdownMenuItem>
                            {wardensData && Array.isArray(wardensData) && wardensData.map(wardenObj => (
                              <DropdownMenuItem
                                key={wardenObj.id}
                                value={wardenObj.id}
                                onClick={() => {
                                  if (wardensIds.includes(wardenObj.id)) {
                                  
                                    setWardensIds(wardensIds.filter(id => id !== wardenObj.id));
                                  } else {
                                    // Add to selection
                                    setWardensIds([...wardensIds, wardenObj.id]);
                                  }
                                }}
                                className={wardensIds.includes(wardenObj.id) ? "bg-blue-50" : ""}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={wardensIds.includes(wardenObj.id)}
                                    onChange={() => { }} // Handled by onClick
                                    className="rounded"
                                  />
                                  {wardenObj.name}
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {wardensIds.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {wardensIds.map(wardenId => {
                              const warden = wardensData.find(w => w.id === wardenId);
                              return (
                                <Badge key={wardenId} variant="secondary" className="text-xs">
                                  {warden?.name}
                                  <button
                                    type="button"
                                    onClick={() => setWardensIds(wardensIds.filter(id => id !== wardenId))}
                                    className="ml-1 text-gray-500 hover:text-gray-700"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Contact *</Label>
                        <Input
                          placeholder="e.g. 08123456789"
                          required
                          value={contact}
                          onChange={e => setContact(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Floors *</Label>
                        <Input
                          placeholder="e.g. 3"
                          required
                          value={floors}
                          onChange={e => setFloors(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <Label>Description *</Label>
                        <Input
                          placeholder="e.g. Affordable rooms with great city view."
                          required
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Street *</Label>
                        <Input
                          placeholder="e.g. 12 Bishop Avenue"
                          required
                          value={address.street}
                          onChange={e => setAddress({ ...address, street: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>City *</Label>
                        <Input
                          placeholder="e.g. Lagos"
                          required
                          value={address.city}
                          onChange={e => setAddress({ ...address, city: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>State *</Label>
                        <Input
                          placeholder="e.g. Lagos"
                          required
                          value={address.state}
                          onChange={e => setAddress({ ...address, state: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Country *</Label>
                        <Input
                          placeholder="e.g. Nigeria"
                          required
                          value={address.country}
                          onChange={e => setAddress({ ...address, country: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Zipcode *</Label>
                        <Input
                          placeholder="e.g. 100001"
                          required
                          value={address.zipcode}
                          onChange={e => setAddress({ ...address, zipcode: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Extra Description</Label>
                      <textarea
                        className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                        placeholder="Short description of the hostel..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* HOSTEL TYPE & PRICE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Hostel Type</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between mt-1"
                          >
                            <span>{hostelType || "Select Type"}</span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setHostelType("BUDGET")}>
                            Budget
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setHostelType("STANDARD")}>
                            Standard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setHostelType("PREMIUM")}>
                            Premium
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div>
                      <Label>Hostel Status</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between mt-1"
                          >
                            <span>{hostelStatus || "Select Status"}</span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => sethostelStatus("ACTIVE")}>
                            Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => sethostelStatus("INACTIVE")}>
                            Inactive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* AMENITIES */}
                  <div className="space-y-2">
                    <Label>Amenities</Label>
                    <Input
                      type="text"
                      className="w-full mt-1"
                      placeholder="Enter amenities separated by commas (e.g. WiFi, Gym, Laundry, Pool)"
                      value={amenities}
                      onChange={e => setAmenities(e.target.value)}
                    />
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">

                    <Button
                      type="submit"
                      className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700 px-5 py-2 rounded flex items-center gap-2 disabled:bg-gray-500"
                      loading={creatingHostelLoading ? "true" : undefined}
                      disabled={creatingHostelLoading}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {creatingHostelLoading ? "Adding..." : "Add Hostel"}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostels.length}</div>
            <p className="text-xs text-muted-foreground">
              Hostel records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Active Hostels</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredHostels.filter(hostel => hostel.hostelsStatus === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Inactive Hostels</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredHostels.filter(hostel => hostel.hostelsStatus === "INACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(rooms || []).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Room records
            </p>
          </CardContent>
        </Card>
      </div>
      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 my-6 shadow-sm rounded-md">
        <div className="col-span-3 items-center gap-2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <Input
            type="text"
            className="p-4 rounded-sm pl-12"
            placeholder="Search hostels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="p-4 cursor-pointer">
                {activeType}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveType("All Types")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveType("BUDGET")}>
                Budget
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveType("STANDARD")}>
                Standard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveType("PREMIUM")}>
                Premium
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* HOSTEL GRID */}
      <div
        className={`grid grid-cols-1 gap-4 p-1 md:p-6 my-6 ${filteredHostels.length === 0
          ? "bg-white shadow-sm"
          : "bg-gray-50 shadow-none"
          } rounded-md`}
      >
        {filteredHostels.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center py-12">
            <span className="text-2xl font-semibold text-gray-400 mb-2">
              No hostels found
            </span>
            <span className="text-sm text-muted-foreground">
              Try adjusting your filters or add a new hostel.
            </span>
          </div>
        )}

        {filteredHostels.map((hostel) => (
          <Card key={hostel.id} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl">{hostel.hostelName}</CardTitle>
                <CardDescription className="text-base">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  {hostel.address ? `${hostel.address.street}, ${hostel.address.city}` : 'Address not available'}
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={`${hostel.hostelsStatus === "ACTIVE" ? "bg-green-100" : "bg-red-100"
                  }`}
              >
                {hostel.hostelsStatus}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4 mt-3">
              {/* Hostel Image */}
              {/* {hostel.image && (
                <div className="mb-4">
                  <img 
                    src={hostel.image} 
                    alt={hostel.hostelName}
                    className="w-full h-48 object-cover rounded-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )} */}

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Basic Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Basic Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Type</p>
                      <Badge variant="outline">{hostel.hostelType}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Floors</p>
                      <p className="font-medium">{hostel.floors} floors</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">{hostel.contact}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Wardens</p>
                      <div className="flex flex-wrap gap-1">
                        {hostel.Warden && hostel.Warden.length > 0 ? (
                          hostel.Warden.map((warden, index) => {
                            console.log('Warden data:', warden);
                            return (
                              <Badge key={`${warden.id}-${index}`} variant="secondary" className="text-xs">
                                {warden.user.name}
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-xs text-gray-500">No wardens assigned</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Room Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Rooms Details</h4>
                  <div className="space-y-2">
                    {(() => {
                      const roomStats = getRoomStats(hostel.id);
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Total Rooms</p>
                            <p className="font-medium">{roomStats.totalRooms} {roomStats.totalRooms === 1 || 0 ? "room" : "rooms"}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Available Rooms</p>
                            <p className="font-medium text-shadow-black">{roomStats.availableRooms} {roomStats.availableRooms === 1  || 0? "room" : "rooms"}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Occupied Rooms</p>
                            <p className="font-medium text-shadow-black">{roomStats.occupiedRooms} {roomStats.occupiedRooms === 1 || 0 ? "room" : "rooms"}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Maintenance</p>
                            <p className="font-medium text-shadow-black">{roomStats.maintenanceRooms} {roomStats.maintenanceRooms === 1 || 0 ? "room" : "rooms"}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Address</h4>
                  <div className="text-sm space-y-1">
                    {hostel.address ? (
                      <>
                        <p className="font-medium">{hostel.address.street}</p>
                        <p className="text-muted-foreground">
                          {hostel.address.city}, {hostel.address.state}
                        </p>
                        <p className="text-muted-foreground">
                          {hostel.address.country} {hostel.address.zipcode}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Address not available</p>
                    )}
                  </div>
                </div>
                {/* Description */}
                {hostel.description && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Description</h4>
                    <p className="text-sm text-gray-600">{hostel.description}</p>
                    {hostel.amenities && hostel.amenities.length > 0 && (
                      <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-semibold text-gray-800">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {hostel.amenities.map((item, i) => (
                            <Badge key={i} variant="secondary" className="text-sm">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                )}
              </div>


              {/* Room Details */}
              {(() => {
                const hostelRooms = getHostelRooms(hostel.id);
                if (roomsLoading) {
                  return (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold text-gray-800">Room Details</h4>
                      <div className="flex items-center justify-center py-4">
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Loading room details...</span>
                      </div>
                    </div>
                  );
                }
                if (hostelRooms.length > 0) {
                  return (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-800">Room Details</h4>
                        <span className="text-sm text-gray-500">{hostelRooms.length} rooms total</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {hostelRooms.slice(0, expandedHostelId === hostel.id ? hostelRooms.length : 3).map((room) => (
                          <div key={room.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-sm">Room {room.roomNumber}</p>
                                <p className="text-xs text-gray-500">Floor {room.floor}</p>
                              </div>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${room.status === "AVAILABLE" ? "bg-green-100 text-green-800" :
                                  room.status === "OCCUPIED" ? "bg-orange-100 text-orange-800" :
                                    room.status === "MAINTENANCE" ? "bg-red-100 text-red-800" :
                                      "bg-gray-100 text-gray-800"
                                  }`}
                              >
                                {room.status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Type:</span>
                                <span className="font-medium">{room.type}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Capacity:</span>
                                <span className="font-medium">{room.capacity} beds</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Price/Night:</span>
                                <span className="font-medium text-green-600">₦{room.pricePerNight?.toLocaleString()}</span>
                              </div>
                              {room.pricePerMonth && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Price/Month:</span>
                                  <span className="font-medium text-green-600">₦{room.pricePerMonth?.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {hostelRooms.length > 3 && (
                        <div className="text-center pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              if (expandedHostelId === hostel.id) {
                                setExpandedHostelId(null);
                              } else {
                                setExpandedHostelId(hostel.id);
                              }
                            }}
                          >
                            {expandedHostelId === hostel.id ? 'Show Less' : `View All ${hostelRooms.length} Rooms`}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-gray-800">Room Details</h4>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No rooms found for this hostel</p>
                    </div>
                  </div>
                );
              })()}

              {/* Timestamps */}
              <div className="flex justify-between items-center pt-4 border-t text-xs text-muted-foreground">
                <p>Created on: {new Date(hostel.createdAt).toLocaleDateString()} by {session?.user?.name || "ADMIN"} </p>
                <p>Updated: {new Date(hostel.updatedAt).toLocaleDateString()}</p>
              </div>

              <div className="
              flex justify-end items-center gap-2 mt-4 md:mt-0">
                <Dialog className="overflow-visible max-h-[90%]">
                  <DialogTrigger asChild>
                    <Button
                      className="flex items-center gap-2 cursor-pointer px-5 py-2 rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-100 transition"
                      variant="outline"
                      onClick={() => handleSelectHostelForEdit(hostel)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="font-medium text-base">Edit Hostel</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] px-0 py-0 rounded-lg overflow-hidden bg-white border border-gray-200">
                    <div className="px-6 py-8 max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold mb-1 text-gray-900">
                          Edit Hostel
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                          Edit the hostel listing with all necessary details.
                        </DialogDescription>
                      </DialogHeader>

                      <form className="space-y-7 mt-6" onSubmit={e => handleEditHostel(e)}>
                        {/* BASIC DETAILS */}
                        <div className="space-y-5">
                          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                            Basic Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Hostel Name</Label>
                              <Input
                                placeholder="Sunrise Hostel"
                                value={hostelName}
                                onChange={e => setHostelName(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Wardens</Label>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" className="w-full justify-between mt-1">
                                    {wardensIds.length > 0 ? `${wardensIds.length} warden(s) selected` : "Select Wardens"}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem disabled>Select Wardens (Multiple Selection)</DropdownMenuItem>
                                  {wardensData && Array.isArray(wardensData) && wardensData.map(wardenObj => (
                                    <DropdownMenuItem
                                      key={wardenObj.id}
                                      value={wardenObj.id}
                                      onClick={() => {
                                        if (wardensIds.includes(wardenObj.id)) {
                                          setWardensIds(wardensIds.filter(id => id !== wardenObj.id));
                                        } else {
                                          setWardensIds([...wardensIds, wardenObj.id]);
                                        }
                                      }}
                                      className={wardensIds.includes(wardenObj.id) ? "bg-blue-50" : ""}
                                    >
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={wardensIds.includes(wardenObj.id)}
                                          onChange={() => { }}
                                          className="rounded"
                                        />
                                        {wardenObj.name}
                                      </div>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              {wardensIds.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {wardensIds.map(wardenId => {
                                    const warden = wardensData.find(w => w.id === wardenId);
                                    return (
                                      <Badge key={wardenId} variant="secondary" className="text-xs">
                                        {warden?.name}
                                        <button
                                          type="button"
                                          onClick={() => setWardensIds(wardensIds.filter(id => id !== wardenId))}
                                          className="ml-1 text-gray-500 hover:text-gray-700"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            <div>
                              <Label>Contact</Label>
                              <Input
                                placeholder="e.g. 08123456789"
                                value={contact}
                                onChange={e => setContact(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Floors</Label>
                              <Input
                                placeholder="e.g. 3"
                                value={floors}
                                onChange={e => setFloors(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <Label>Description</Label>
                              <Input
                                placeholder="e.g. Affordable rooms with great city view."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          {/* Address Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Street</Label>
                              <Input
                                placeholder="e.g. 12 Bishop Avenue"
                                value={address.street}
                                onChange={e => setAddress({ ...address, street: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>City</Label>
                              <Input
                                placeholder="e.g. Lagos"
                                value={address.city}
                                onChange={e => setAddress({ ...address, city: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>State</Label>
                              <Input
                                placeholder="e.g. Lagos"
                                value={address.state}
                                onChange={e => setAddress({ ...address, state: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Country</Label>
                              <Input
                                placeholder="e.g. Nigeria"
                                value={address.country}
                                onChange={e => setAddress({ ...address, country: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Zipcode</Label>
                              <Input
                                placeholder="e.g. 100001"
                                value={address.zipcode}
                                onChange={e => setAddress({ ...address, zipcode: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Extra Description</Label>
                            <textarea
                              className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                              placeholder="Short description of the hostel..."
                              value={description}
                              onChange={e => setDescription(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* HOSTEL TYPE & PRICE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Hostel Type</Label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-between mt-1"
                                >
                                  <span>{hostelType || "Select Type"}</span>
                                  <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setHostelType("BUDGET")}>
                                  Budget
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setHostelType("STANDARD")}>
                                  Standard
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setHostelType("PREMIUM")}>
                                  Premium
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div>
                            <Label>Hostel Status</Label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-between mt-1"
                                >
                                  <span>{hostelStatus || "Select Status"}</span>
                                  <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => sethostelStatus("ACTIVE")}>
                                  Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => sethostelStatus("INACTIVE")}>
                                  Inactive
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* AMENITIES */}
                        <div className="space-y-2">
                          <Label>Amenities</Label>
                          <Input
                            type="text"
                            className="w-full mt-1"
                            placeholder="Enter amenities separated by commas (e.g. WiFi, Gym, Laundry, Pool)"
                            value={amenities}
                            onChange={e => setAmenities(e.target.value)}
                          />
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">

                          <Button
                            type="submit"
                            className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700 px-5 py-2 rounded flex items-center gap-2 disabled:bg-gray-500"
                            loading={creatingHostelLoading ? "true" : undefined}
                            disabled={creatingHostelLoading}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            {creatingHostelLoading ? "Editing..." : "Edit Hostel"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="flex items-center gap-2 cursor-pointer px-5 py-2 rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-100 transition"
                      variant="outline"
                      loading={deleteLoading && deletingHostelId === hostel.id ? "true" : undefined}
                      disabled={deleteLoading && deletingHostelId === hostel.id}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="font-medium text-base">
                        {deleteLoading && deletingHostelId === hostel.id ? "Deleting..." : "Delete Hostel"}
                      </span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Hostel</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this hostel? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteHostel(hostel.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deleteLoading && deletingHostelId === hostel.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HostelPage;
