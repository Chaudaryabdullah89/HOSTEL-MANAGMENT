"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Filter,
  ChevronDown,
  Search,
  Edit,
  Wifi,
  Tv,
  FileText,
  CheckCircle,
  XCircle,
  DotDashed,
  DollarSign,
  Wind,
  Delete,
  Bin,
  Trash,
  Clock,
  User,
  Bed,
  Calendar,
  CardSim,
  CreditCard,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { BookingPaymentInfo } from "@/components/booking-payment-info";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookingTabs from "@/components/menu";
import { getDaysBetween } from "@/lib/dateUtils";
import { toast, Toaster } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  useBookings,
  useCreateBooking,
  useUpdateBooking,
  useDeleteBooking,
  useUpdateBookingStatus,
  useConfirmBooking,
} from "@/hooks/useBookings";
import { useHostels } from "@/hooks/useHostels";
import { useRooms } from "@/hooks/useRooms";
import { useUsers } from "@/hooks/useUsers";
import { get } from "http";

const page = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [currentselectedhostel, setCurrentselectedhostel] = useState("");
  const [currentselectedroom, setCurrentselectedroom] = useState("");
  const [roomAvailable, setRoomAvailable] = useState(true);
  const [showPersistentError, setShowPersistentError] = useState(false);
  const [currentselectedbooking, setCurrentselectedbooking] = useState("");
  const [optimisticBookings, setOptimisticBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingloading, setBookingloading] = useState(false);

  const [activeStatus, setActiveStatus] = useState("All Bookings");
  const [selectedHostelFilter, setSelectedHostelFilter] =
    useState("All Hostels");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useBookings({});

  const { data: hostels = [], isLoading: hostelsLoading } = useHostels();
  const {
    data: rooms = [],
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useRooms();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  // Mutation hooks
  const createBookingMutation = useCreateBooking();
  const updateBookingMutation = useUpdateBooking();
  const deleteBookingMutation = useDeleteBooking();
  const updateBookingStatusMutation = useUpdateBookingStatus();
  const confirmBookingMutation = useConfirmBooking();

  const [confirmbooking, setConfirmbooking] = useState(false);
  const [checkedinbooking, setCheckedinbooking] = useState(false);
  const [checkedoutbooking, setCheckedoutbooking] = useState(false);

  const [completedbooking, setCompletedbooking] = useState(false);
  const [error, setError] = useState("");
  // Filtered data for cascading dropdowns
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // --- State variables for Add Room form ---

  const [newusername, setnewname] = useState("");
  const [newuseremail, setnewemail] = useState("");
  const [newuserphone, setnewphone] = useState("");
  const [newuseraddress, setnewaddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [newuserpassword, setnewpassword] = useState("");

  // Guest creation form state variables
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestGender, setGuestGender] = useState("");
  const [bookingTypeInput, setBookingTypeInput] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [roomNumberInput, setRoomNumberInput] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [status, setStatus] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [btnloading, setBtnloading] = useState(false);
  const [loadingBookingId, setLoadingBookingId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const loadingRef = useRef(null);
  const handleStatusChange = (status) => {
    setActiveStatus(status);
  };

  const filteredBookings = bookingsLoading
    ? []
    : (Array.isArray(bookings) ? bookings : []).filter((booking) => {
      const matchesStatus =
        activeStatus === "All Bookings" || booking.status === activeStatus;
      const matchesHostel =
        selectedHostelFilter === "All Hostels" ||
        booking.hostel?.id === selectedHostelFilter;
      const matchesSearch =
        searchTerm === "" ||
        booking.user?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.room?.roomNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.room?.type?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesHostel && matchesSearch;
    });

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetch("/api/room/updatestatuses", { method: "POST" });
        refetchRooms();
      } catch (error) {
        console.error("Error updating room statuses on page load:", error);
      }
    };

    initializeData();
  }, [refetchRooms]);

  const handleHostelSelection = (selectedHostel) => {
    setCurrentselectedhostel(selectedHostel);
    setCurrentselectedroom("");
    setCurrentselectedbooking("");
    setRoomAvailable(true);
    setShowPersistentError(false);
    clearError();

    const hostelRooms = rooms.filter(
      (room) => room.hostelId === selectedHostel.id,
    );
    setFilteredRooms(hostelRooms);
    setFilteredUsers([]);
  };

  const handleRoomSelection = async (selectedRoom) => {
    setCurrentselectedroom(selectedRoom);
    setCurrentselectedbooking("");

    try {
      const response = await fetch(
        `/api/room/checkavailability?roomId=${selectedRoom.id}`,
      );
      const availabilityData = await response.json();

      if (!availabilityData.available) {
        setError(
          availabilityData.reason || "Room is not available for booking",
        );
        setCurrentselectedroom(null);
        setRoomAvailable(false);
        setShowPersistentError(true);
        return;
      } else {
        setRoomAvailable(true);
        setShowPersistentError(false); // Hide persistent error
        clearError();
      }
    } catch (error) {
      console.error("Error checking room availability:", error);
      setError("Failed to check room availability");
      setCurrentselectedroom(null);
      setRoomAvailable(false);
      return;
    }

    const eligibleUsers = users.filter((user) => {
      const role = user.role?.toUpperCase();
      // User role check
      return role === "GUEST" || role === "STAFF" || role === "WARDEN";
    });
    // Eligible users filtered

    if (eligibleUsers.length === 0 && users.length > 0) {
      // No users matched role filter
      setFilteredUsers(users);
    } else {
      setFilteredUsers(eligibleUsers);
    }
  };

  // Clear error when form is opened or fields change
  const clearError = () => {
    setError("");
  };

  // Helper function to determine payment status based on booking status
  const getPaymentStatus = (bookingStatus) => {
    switch ((bookingStatus || "").toUpperCase()) {
      case "CONFIRMED":
      case "CHECKED_IN":
      case "CHECKED_OUT":
        return "COMPLETED";
      case "PENDING":
        return "PENDING";
      case "CANCELLED":
        return "FAILED";
      default:
        return "PENDING";
    }
  };

  const handlecreatebooking = async (e) => {
    e.preventDefault();
    setBookingloading(true);

    if (!currentselectedhostel) {
      toast.error("Please select a hostel");
      setBookingloading(false);
      return;
    }
    if (!currentselectedroom) {
      toast.error("Please select a room");
      setBookingloading(false);
      return;
    }
    if (!currentselectedbooking) {
      toast.error("Please select a user");
      setBookingloading(false);
      return;
    }

    let duration, checkin, checkout;

    if (bookingTypeInput === "MONTHLY") {
      duration = 30;
      checkin = checkInDate || new Date().toISOString().split("T")[0];
      checkout =
        checkOutDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
    } else {
      if (!checkInDate || !checkOutDate) {
        toast.error(
          "Check-in and check-out dates are required for daily bookings",
        );
        setBookingloading(false);
        return;
      }
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      checkin = checkInDate;
      checkout = checkOutDate;
    }

    const payload = {
      hostelId: currentselectedhostel.id,
      roomId: currentselectedroom.id,
      userId: currentselectedbooking.id,
      checkin: checkin,
      checkout: checkout,
      price:
        totalAmount ||
        (bookingTypeInput === "MONTHLY"
          ? currentselectedroom.pricePerMonth
          : currentselectedroom.pricePerNight) ||
        undefined,
      bookingType: bookingTypeInput || undefined,
      duration: duration || undefined,
      notes: additionalNotes || undefined,
      status: paymentStatus || "PENDING",
      totalAmount: totalAmount || undefined,
      paymentId: "",
    };
    // Note: paymentintializationpayload will be created after booking is created
    // to use the new booking's ID
    // Booking payload prepared
    try {
      const response = await fetch("/api/booking/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.error ||
          data.message ||
          "An error occurred while creating the booking";
        console.error("Error creating booking:", errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
        setBookingloading(false);
        return;
      } else {
        await refetchBookings();

        // Use global getPaymentStatus function
        const paymentintializationpayload = {
          bookingId: data.id,
          amount:
            totalAmount ||
            (bookingTypeInput === "MONTHLY"
              ? currentselectedroom.pricePerMonth
              : currentselectedroom.pricePerNight) ||
            undefined,
          paymentMethod: "CASH",
          status: getPaymentStatus(paymentStatus) || "PENDING",
          notes: additionalNotes || undefined,
          roomId: currentselectedroom.id,
          hostelId: currentselectedhostel.id,
        };

        const paymentintializationresponse = await fetch(
          "/api/payments/createpayment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentintializationpayload),
          },
        );
        if (!paymentintializationresponse.ok) {
          const errorMessage =
            paymentintializationresponse.error ||
            paymentintializationresponse.message ||
            "An error occurred while creating the payment";
          console.error("Error creating payment:", errorMessage);
          setError(errorMessage);
          toast.error(errorMessage);
          setBookingloading(false);
          return;
        }
        const paymentintializationdata =
          await paymentintializationresponse.json();
        // Payment initialization completed
        payload.paymentId = paymentintializationdata.id;
        // Payment added successfully, refetch data
        await refetchBookings();

        toast.success("Booking and payment created successfully!");

        await refetchRooms();

        setError("");

        setCurrentselectedhostel("");
        setCurrentselectedroom("");
        setCurrentselectedbooking("");
        setCheckInDate("");
        setCheckOutDate("");
        setTotalAmount("");
        setBookingTypeInput("");
        setAdditionalNotes("");
        setPaymentStatus("");

        setTimeout(() => {
          setIsDialogOpen(false);
        }, 1000);
      }
    } catch (error) {
      const errorMessage =
        error.message || "Network error occurred while creating the booking";
      console.error("Error creating booking:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setBtnloading(false);
      setBookingloading(false);
    }
  };
  const handlebookingstatuschange = async (bookingId, status) => {
    console.log("Setting loading for booking:", bookingId);
    loadingRef.current = bookingId;
    setLoadingBookingId(bookingId);

    try {
      console.log("Changing booking status:", { bookingId, status });

      const response = await fetch(`/api/booking/changebookingstatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId, status }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Updated booking response:", responseData);

        const updatedStatus =
          responseData.booking?.status || responseData.status || status;
        console.log("Updated booking status:", updatedStatus);

        // Update successful, refetch data
        await refetchBookings();

        toast.success(`Booking ${status.toLowerCase()} successfully!`);

        // Refresh rooms data to show updated room statuses
        await refetchRooms();
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `Failed to ${status.toLowerCase()} booking`;
        console.error("Error updating booking status:", errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
        setBookingloading(false);
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        "Network error occurred while updating the booking status";
      console.error("Error updating booking status:", error);
      setError(errorMessage);
      toast.error(errorMessage);
      setBookingloading(false);
    } finally {
      loadingRef.current = null;
      setLoadingBookingId(null);
      setBookingloading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    setIsDeleting(bookingId);
    try {
      console.log("Deleting booking:", bookingId);

      const response = await fetch(`/api/booking/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();

        await refetchBookings();

        toast.success("Booking deleted successfully!");

        setIsDeleteDialogOpen(false);
        setBookingToDelete(null);

        await refetchRooms();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to delete booking";
        console.error("Error deleting booking:", errorMessage);
        toast.error(errorMessage);
        // Don't close dialog on error - let user try again or cancel
      }
    } catch (error) {
      const errorMessage =
        error.message || "Network error occurred while deleting the booking";
      console.error("Error deleting booking:", error);
      toast.error(errorMessage);
      // Don't close dialog on error - let user try again or cancel
    } finally {
      setIsDeleting(null); // Reset to null instead of false
    }
  };


  // Only render on client side
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (bookingsLoading) {
    return (
      <div className="p-2">
        <div className="flex md:flex-row flex-col justify-between px-4">
          <div className="mt-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-28"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="px-4 py-2">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 bg-gray-200 rounded animate-pulse w-20"
              ></div>
            ))}
          </div>
        </div>

        {/* Search and Filter Skeleton */}
        <div className="px-4 py-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
        </div>

        {/* Booking Cards Skeleton */}
        <div className="px-4 py-2 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (bookingsError) {
    return (
      <div className="p-2">
        <div className="flex md:flex-row flex-col justify-between px-4">
          <div className="mt-4">
            <h1 className="text-3xl font-bold">Bookings</h1>
            <p className="text-muted-foreground leading-loose">
              Manage your bookings and payments here.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <XCircle className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Error loading bookings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {bookingsError.message || "Unable to load your bookings"}
                </p>
                <div className="mt-4 flex gap-2 justify-center">
                  <Button onClick={() => refetchBookings()} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex md:flex-row flex-col justify-between px-4">
        <div className="mt-4 ">
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground leading-loose">
            Manage your bookings and payments here.
          </p>
        </div>
        <div className="flex items-center overflow-visible gap-2 mt-4 md:mt-0">
          <Button
            className="cursor-pointer p-4"
            variant="outline"
            onClick={async () => {
              setLoading(true);
              try {
                await refetchBookings();
                toast.success("Bookings refreshed!");
              } catch (error) {
                toast.error("Failed to refresh bookings");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            className="cursor-pointer p-4"
            variant="outline"
            onClick={async () => {
              setLoading(true);
              try {
                const response = await fetch("/api/room/updatestatuses", {
                  method: "POST",
                });
                if (response.ok) {
                  toast.success("Room statuses updated successfully!");
                  await refetchBookings();
                  await refetchRooms();
                } else {
                  toast.error("Failed to update room statuses");
                }
              } catch (error) {
                console.error("Error updating room statuses:", error);
                toast.error("Error updating room statuses");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Updating..." : "Update Room Statuses"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="cursor-pointer p-4"
                variant="outline"
                onClick={() => {
                  clearError();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-xl font-semibold">
                  Create New Booking
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Select hostel, room, and user to create a new booking
                </DialogDescription>
              </DialogHeader>
              <div
                className="overflow-y-auto px-6 pb-6 pt-2"
                style={{ maxHeight: "70vh" }}
              >
                <form
                  className="space-y-6 overflow-visible"
                  onSubmit={handlecreatebooking}
                >
                  {currentselectedbooking && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                        Selected User Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Name
                            </Label>
                            <p className="text-sm text-gray-900">
                              {currentselectedbooking.name}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Email
                            </Label>
                            <p className="text-sm text-gray-900">
                              {currentselectedbooking.email}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Role
                            </Label>
                            <p className="text-sm text-gray-900">
                              {currentselectedbooking.role}
                            </p>
                          </div>
                          {/* <div>
                                                        <Label className="text-sm font-medium text-gray-700">Room Number</Label>
                                                        <p className="text-sm text-gray-900">

                                                            {
                                                                currentselectedbooking.room?.roomNumber
                                                                || currentselectedbooking.room?.number
                                                                || currentselectedbooking.roomNumber
                                                                || currentselectedbooking.number
                                                                || "N/A"
                                                            }
                                                        </p>
                                                    </div> */}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Booking Information
                    </h3>

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
                            {currentselectedhostel
                              ? currentselectedhostel.hostelName
                              : "Select Hostel"}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          {hostels.map((hostelItem) => (
                            <DropdownMenuItem
                              key={hostelItem.id}
                              onClick={() => handleHostelSelection(hostelItem)}
                            >
                              {hostelItem.hostelName} -{" "}
                              {hostelItem.address?.city}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {currentselectedhostel && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Select Room *
                        </Label>
                        {currentselectedroom && !roomAvailable && (
                          <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <div className="flex items-center">
                              <span className="text-red-600 mr-2">⚠️</span>
                              <span className="text-red-800 text-sm font-medium">
                                {error ||
                                  "This room is not available for booking"}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-red-600">
                              Please select a different room to continue.
                            </div>
                          </div>
                        )}
                        {showPersistentError &&
                          error &&
                          !currentselectedroom && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                              <div className="flex items-center">
                                <span className="text-yellow-600 mr-2">ℹ️</span>
                                <span className="text-yellow-800 text-sm font-medium">
                                  {error}
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-yellow-600">
                                Please select a different room to continue.
                              </div>
                            </div>
                          )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              <div className="flex items-center gap-2">
                                {currentselectedroom ? (
                                  <>
                                    <span>
                                      {currentselectedroom.roomNumber} -{" "}
                                      {currentselectedroom.type}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${currentselectedroom.status ===
                                        "AVAILABLE"
                                        ? "bg-green-100 text-green-800"
                                        : currentselectedroom.status ===
                                          "OCCUPIED"
                                          ? "bg-red-100 text-red-800"
                                          : currentselectedroom.status ===
                                            "MAINTENANCE"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                      {currentselectedroom.status}
                                    </span>
                                  </>
                                ) : (
                                  "Select Room"
                                )}
                              </div>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            {filteredRooms.map((room) => {
                              const getStatusColor = (status) => {
                                switch (status) {
                                  case "AVAILABLE":
                                    return "text-green-600";
                                  case "OCCUPIED":
                                    return "text-red-600";
                                  case "MAINTENANCE":
                                    return "text-yellow-600";
                                  case "OUT_OF_ORDER":
                                    return "text-gray-600";
                                  default:
                                    return "text-gray-600";
                                }
                              };

                              return (
                                <DropdownMenuItem
                                  key={room.id}
                                  onClick={() => handleRoomSelection(room)}
                                  className={`${getStatusColor(room.status)} ${room.status === "OCCUPIED" || room.status === "MAINTENANCE" || room.status === "OUT_OF_ORDER" ? "opacity-60" : ""}`}
                                  disabled={
                                    room.status === "OCCUPIED" ||
                                    room.status === "MAINTENANCE" ||
                                    room.status === "OUT_OF_ORDER"
                                  }
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      {room.roomNumber} | Floor {room.floor} |{" "}
                                      {room.type} | PKR{room.pricePerNight}
                                      /night
                                    </div>
                                    <div
                                      className={`text-xs font-medium ${getStatusColor(room.status)}`}
                                    >
                                      {room.status}
                                    </div>
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    {/* User Selection - Only show if room is selected */}






                    <input type="text" onChange={(e) => setnewname} name="email" />
                    <input type="text" name="phonenumber" />







                    {currentselectedroom && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Select User *
                        </Label>
                        {/* Debug info */}
                        {/* <div className="text-xs text-gray-500">
                                                    Debug: {users.length} total users, {filteredUsers.length} filtered users
                                                </div> */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              {currentselectedbooking ? (
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">
                                    {currentselectedbooking.name}
                                  </span>
                                  {/* <span className="text-sm text-gray-500">{currentselectedbooking.email} ({currentselectedbooking.role})</span> */}
                                </div>
                              ) : (
                                "Select User"
                              )}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((user) => (
                                <DropdownMenuItem
                                  key={user.id}
                                  onClick={() => {
                                    setCurrentselectedbooking(user);
                                    // Don't clear errors when selecting user - only clear when valid room is selected
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {user.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {user.email}
                                    </span>
                                    <span className="text-xs text-blue-600 font-medium">
                                      {user.role}
                                    </span>
                                  </div>
                                </DropdownMenuItem>
                              ))
                            ) : (
                              <DropdownMenuItem disabled>
                                <span className="text-gray-500">
                                  No users available
                                </span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    <div className="flex items-end gap-4 w-full">
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Booking Type
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full mt-4 justify-between text-left font-normal"
                            >
                              {bookingTypeInput
                                ? bookingTypeInput
                                : "Select Booking Type"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full items-start ">
                            <DropdownMenuItem
                              onClick={() => setBookingTypeInput("DAILY")}
                            >
                              Daily
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setBookingTypeInput("MONTHLY")}
                            >
                              Monthly
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Price Suggestion for Monthly Bookings */}
                    {bookingTypeInput === "MONTHLY" && currentselectedroom && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-800">
                            Monthly Booking Price
                          </span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Suggested price: PKR
                          {currentselectedroom.pricePerMonth || "N/A"} per month
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          This will be automatically set if you leave the amount
                          field empty
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Check-In Date{" "}
                          {bookingTypeInput === "DAILY" ? "*" : "(Optional)"}
                        </Label>
                        <Input
                          type="date"
                          className="w-full"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          placeholder={
                            bookingTypeInput === "MONTHLY"
                              ? "Leave empty for current date"
                              : ""
                          }
                        />
                        {bookingTypeInput === "MONTHLY" && (
                          <p className="text-xs text-gray-500">
                            If left empty, will use current date
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Check-Out Date{" "}
                          {bookingTypeInput === "DAILY" ? "*" : "(Optional)"}
                        </Label>
                        <Input
                          type="date"
                          className="w-full"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          placeholder={
                            bookingTypeInput === "MONTHLY"
                              ? "Leave empty for 30 days from check-in"
                              : ""
                          }
                        />
                        {bookingTypeInput === "MONTHLY" && (
                          <p className="text-xs text-gray-500">
                            If left empty, will use 30 days from check-in date
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Payment Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Total Amount (PKR) *
                        </Label>
                        <Input
                          placeholder="e.g. 4500"
                          type="number"
                          min="0"
                          className="w-full"
                          required
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Payment Status *
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              {paymentStatus ? paymentStatus : "Select Status"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            <DropdownMenuItem
                              onClick={() => setPaymentStatus("PENDING")}
                            >
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setPaymentStatus("CONFIRMED")}
                            >
                              Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setPaymentStatus("CHECKED_IN")}
                            >
                              Checked In
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setPaymentStatus("CHECKED_OUT")}
                            >
                              Checked Out
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setPaymentStatus("CANCELLED")}
                            >
                              Cancelled
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Additional Notes
                    </Label>
                    <textarea
                      placeholder="Any additional information about the guest or booking..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Error creating booking
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
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
                      className={`${roomAvailable ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"} cursor-pointer`}
                      disabled={
                        bookingloading || !roomAvailable || !currentselectedroom
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {bookingloading
                        ? "Creating Booking..."
                        : "Create Booking"}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredBookings.length}</div>
            <p className="text-xs text-muted-foreground">All booking records</p>
          </CardContent>
        </Card>
        {/* Active Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">
              Active Bookings
            </CardTitle>
            <Bed className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredBookings.filter(
                  (booking) => booking.status === "CHECKED_IN",
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        {/* Completed Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">
              Completed Bookings
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredBookings.filter(
                  (booking) => booking.status === "CHECKED_OUT",
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Completed bookings</p>
          </CardContent>
        </Card>
        {/* Revenue from Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">
              Revenue from Bookings
            </CardTitle>
            <DollarSign className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {(() => {
              // Safer, clearer revenue calculation using reduce.
              // Supports both booking.payment (single) and booking.payments (array).
              const totalRevenue = filteredBookings.reduce((acc, booking) => {
                const status = (booking.status || "").toUpperCase();

                // Normalize payments into an array (handles both `payment` and `payments`).
                const payments = Array.isArray(booking.payments)
                  ? booking.payments
                  : booking.payment
                    ? [booking.payment]
                    : [];

                // Sum only completed payments for this booking.
                const completedAmount = payments.reduce((sum, p) => {
                  const pStatus = (p?.status || "").toUpperCase();
                  const amount = Number(p?.amount) || 0;
                  return pStatus === "COMPLETED" ? sum + amount : sum;
                }, 0);

                // Only include revenue for bookings with an appropriate final status.
                if (
                  (status === "COMPLETED" || status === "CHECKED_OUT" || status === "CONFIRMED") &&
                  completedAmount > 0
                ) {
                  return acc + completedAmount;
                }

                return acc;
              }, 0);

              return (
                <div className="text-2xl font-bold">
                  {totalRevenue.toLocaleString()} PKR
                </div>
              );
            })()}
            <p className="text-xs text-muted-foreground">
              Revenue from bookings
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4  bg-white p-6 my-6  shadow-sm rounded-md">
        <div className="col-span-3  items-center gap-2 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <Input
            type="text"
            className="p-4 rounded-sm pl-12"
            placeholder="Search bookings"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Hostel Filter Dropdown */}
        <div className="col-span-1 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="p-4 w-full" variant="outline">
                {hostels.find((h) => h.id === selectedHostelFilter)
                  ?.hostelName || "All Hostels"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => setSelectedHostelFilter("All Hostels")}
              >
                All Hostels
              </DropdownMenuItem>
              {hostels.map((hostelItem) => (
                <DropdownMenuItem
                  key={hostelItem.id}
                  onClick={() => setSelectedHostelFilter(hostelItem.id)}
                >
                  {hostelItem.hostelName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <div className="cursor-pointer items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="p-4 px-10" variant="outline">
                  {activeStatus}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("All Bookings")}
                >
                  All Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("PENDING")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("CONFIRMED")}
                >
                  Confirmed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("CHECKED_IN")}
                >
                  Checked In
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("CHECKED_OUT")}
                >
                  Checked Out
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("CANCELLED")}
                >
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <BookingTabs
        tabs={[
          "All Bookings",
          "PENDING",
          "CONFIRMED",
          "CHECKED_IN",
          "CHECKED_OUT",
          "CANCELLED",
        ]}
        onStatusChange={handleStatusChange}
        activeStatus={activeStatus}
      />

      {/* Display current active status
            <div className="px-4 py-2">
                <p className="text-sm text-gray-600">
                    Showing: <span className="font-medium text-indigo-600">{activeStatus}</span>
                </p>
                <p className="text-xs text-gray-500">
                    Total bookings: {bookings.length} | Filtered: {filteredBookings.length}
                </p>
            </div> */}

      {/* Display filtered bookings */}
      <div className="grid grid-cols-1  bg-white p-6 my-6  shadow-sm rounded-md">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          <>
            {/* Debug section - remove this in production */}
            {/* <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                            <h4 className="font-medium text-yellow-800">Debug Info:</h4>
                            <pre className="text-xs text-yellow-700 mt-2 overflow-auto">
                                {JSON.stringify(filteredBookings[0], null, 2)}
                            </pre>
                        </div> */}
            {filteredBookings.map((booking) => {
              const isBookingLoading =
                loadingBookingId === booking.id ||
                loadingRef.current === booking.id;
              return (
                <Card
                  key={booking.id}
                  className={`mb-4 relative ${isBookingLoading ? "opacity-75 pointer-events-none" : ""}`}
                >
                  {isBookingLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-gray-600">Processing...</p>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-6 w-6" />
                          <div>
                            <p className="text-md font-medium">
                              Booking #{booking.id.slice(-8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            booking.status === "PENDING"
                              ? "secondary"
                              : booking.status === "CONFIRMED"
                                ? "default"
                                : booking.status === "CHECKED_IN"
                                  ? "outline"
                                  : booking.status === "CHECKED_OUT"
                                    ? "default"
                                    : "destructive"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* User Section */}
                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                          <div>
                            <p className="text-md font-medium flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="text-sm font-semibold text-gray-800">
                                User
                              </span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {booking.user?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {booking.user?.email || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Role: {booking.user?.role || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Payment Section */}

                        {/* Room Section */}
                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                          <div>
                            <p className="text-md font-medium flex items-center gap-2">
                              <Bed className="w-4 h-4" />
                              <span className="text-sm font-semibold text-gray-800">
                                Room
                              </span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              Room {booking.room?.roomNumber || "N/A"}
                            </p>
                            <p className="text-xs text-gray-600">
                              Type: {booking.room?.type || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Floor: {booking.room?.floor || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Date Section */}
                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                          <div>
                            <p className="text-md font-medium flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-semibold text-gray-800">
                                Dates
                              </span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Check-in
                              </span>
                              <span className="text-xs text-gray-900">
                                {new Date(booking.checkin).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Check-out
                              </span>
                              <span className="text-xs text-gray-900">
                                {new Date(
                                  booking.checkout,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Duration
                              </span>
                              <span className="text-xs text-gray-900">
                                {booking.duration || 0} days
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Booking Details Section */}
                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                          <div>
                            <p className="text-md font-medium flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              <span className="text-sm font-semibold text-gray-800">
                                Details
                              </span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Type
                              </span>
                              <span className="text-xs text-gray-900">
                                {booking.bookingType || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Status
                              </span>
                              <span className="text-xs text-gray-900">
                                {booking.status || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Price
                              </span>
                              <span className="text-xs font-medium text-gray-900">
                                PKR{booking.price || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Details Section */}
                        <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
                          <div>
                            <p className="text-md font-medium flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              <span className="text-sm font-semibold text-gray-800">
                                Payments
                              </span>
                            </p>
                          </div>
                          {/* {booking.payments && booking.payments.length > 0 ? (
                            booking.payments.map((payment) => (
                              <div key={payment.id} className="space-y-2 border-b pb-2 last:border-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Status</span>
                                  <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-medium ${
                                    payment.status === "COMPLETED"
                                      ? "bg-green-100 text-green-800"
                                      : payment.status === "PENDING"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : payment.status === "FAILED"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {payment.status || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Amount</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    PKR{payment.amount?.toLocaleString() || "0"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Method</span>
                                  <span className="text-sm text-gray-900">{payment.method || "N/A"}</span>
                                </div>
                                {payment.transactionId && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Txn ID</span>
                                    <span className="text-xs text-gray-600 font-mono truncate max-w-20">{payment.transactionId}</span>
                                  </div>
                                )}
                                {payment.notes && (
                                  <div className="pt-1 border-t">
                                    <span className="text-xs text-gray-500">Notes</span>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{payment.notes}</p>
                                  </div>
                                )}
                                  <Dialog>
  <DialogTrigger>
    <Button>See All payment</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-2">
                              <p className="text-xs text-gray-500">No payment data</p>
                            </div>
                          )} */}
                          {booking.payments && booking.payments.length > 0 ? (
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <p className="text-sm text-muted-foreground " >Total Paid</p>
                                <p className="text-sm font-medium " >{booking.payments.reduce((acc, payment) => acc + (payment.amount || 0), 0).toLocaleString()} PKR</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Last Payment:</p>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-900">
                                    {new Date(booking.payments[booking.payments.length - 1].createdAt).toLocaleDateString()}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    PKR {booking.payments[booking.payments.length - 1].amount?.toLocaleString() || 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                          ) : (
                            <div className="text-center py-2">
                              <p className="text-xs text-gray-500">No payment data</p>
                            </div>
                          )}

                        </div>
                        <p className="text-muted-foreground ml-0 md:ml-4 text-md">
                          Notes: {booking.notes || "No notes"}
                        </p>
                      </div>
                    </div >
                  </CardHeader >
                  <hr />
                  <CardFooter>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                      <div>

                        <Dialog>
                          <DialogTrigger>
                            <Button>See All Payments</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                <h2>ALL PAYMENTS</h2>
                              </DialogTitle>
                              <p>All the payments made by the user</p>
                              <DialogDescription>
                                <div>
                                  {booking.payments.map((payment) => (
                                    <div
                                      key={payment.id}
                                      className="my-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                                    >
                                      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                                        <div className="space-y-1">
                                          <h4 className="text-sm font-semibold text-gray-800">
                                            Payment ID:{" "}
                                            <span className="font-normal text-gray-600">{payment.id}</span>
                                          </h4>
                                          <p className="text-sm text-gray-700">
                                            Amount:{" "}
                                            <span className="font-semibold text-blue-700">
                                              PKR {payment.amount?.toLocaleString() || 0}
                                            </span>
                                          </p>
                                          <p className="text-sm text-gray-700">
                                            Method:{" "}
                                            <span className="font-medium text-gray-800">
                                              {payment.method || "N/A"}
                                            </span>
                                          </p>
                                          {payment.transactionId && (
                                            <p className="text-sm text-gray-700">
                                              Transaction ID:{" "}
                                              <span className="font-mono text-gray-600">
                                                {payment.transactionId}
                                              </span>
                                            </p>
                                          )}
                                          {payment.createdAt && (
                                            <p className="text-sm text-gray-700">
                                              Date:{" "}
                                              <span className="text-gray-600">
                                                {new Date(payment.createdAt).toLocaleString()}
                                              </span>
                                            </p>
                                          )}
                                          {payment.notes && (
                                            <div className="mt-2">
                                              <p className="text-sm text-gray-700">Notes:</p>
                                              <p className="text-sm text-gray-600 italic">{payment.notes}</p>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center">
                                          <Badge
                                            className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatus(payment.status) === "COMPLETED"
                                              ? "bg-green-100 text-green-800"
                                              : getPaymentStatus(payment.status) === "PENDING"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : getPaymentStatus(payment.status) === "FAILED"
                                                  ? "bg-red-100 text-red-800"
                                                  : "bg-gray-100 text-gray-800"
                                              }`}
                                          >
                                            {payment.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>

                      </div>

                      <div className="md:ml-auto flex gap-3 ">
                        <Button
                          className={`cursor-pointer bg-black  hover:bg-black ${booking.status === "CANCELLED" ? "hidden" : ""}`}
                          onClick={() => {
                            handlebookingstatuschange(booking.id, "CANCELLED");
                          }}
                          disabled={
                            loadingBookingId === booking.id ||
                            loadingRef.current === booking.id
                          }
                          variant="destructive"
                        >
                          {(() => {
                            const isLoading =
                              loadingBookingId === booking.id ||
                              loadingRef.current === booking.id;
                            // console.log(`Booking ${booking.id}: isLoading=${isLoading}, loadingBookingId=${loadingBookingId}, loadingRef=${loadingRef.current}`);
                            return (
                              <>
                                {isLoading && (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                )}
                                {isLoading ? "Cancelling..." : "Cancel"}
                              </>
                            );
                          })()}
                        </Button>
                        {booking.status === "PENDING" && (
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                              console.log(
                                "Confirm clicked for booking:",
                                booking.id,
                              );
                              console.log(
                                "Current loadingBookingId:",
                                loadingBookingId,
                              );
                              handlebookingstatuschange(
                                booking.id,
                                "CONFIRMED",
                              );
                            }}
                            disabled={
                              loadingBookingId === booking.id ||
                              loadingRef.current === booking.id
                            }
                          >
                            {(() => {
                              const isLoading =
                                loadingBookingId === booking.id ||
                                loadingRef.current === booking.id;
                              console.log(
                                `Confirm Booking ${booking.id}: isLoading=${isLoading}, loadingBookingId=${loadingBookingId}, loadingRef=${loadingRef.current}`,
                              );
                              return (
                                <>
                                  {isLoading && (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                                  )}
                                  {isLoading ? "Confirming..." : "Confirm"}
                                </>
                              );
                            })()}
                          </Button>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() =>
                              handlebookingstatuschange(
                                booking.id,
                                "CHECKED_IN",
                              )
                            }
                            disabled={
                              loadingBookingId === booking.id ||
                              loadingRef.current === booking.id
                            }
                          >
                            {(() => {
                              const isLoading =
                                loadingBookingId === booking.id ||
                                loadingRef.current === booking.id;
                              return (
                                <>
                                  {isLoading && (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-2"></div>
                                  )}
                                  {isLoading ? "Checking In..." : "Check In"}
                                </>
                              );
                            })()}
                          </Button>
                        )}
                        {booking.status === "CHECKED_IN" && (
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() =>
                              handlebookingstatuschange(
                                booking.id,
                                "CHECKED_OUT",
                              )
                            }
                            disabled={
                              loadingBookingId === booking.id ||
                              loadingRef.current === booking.id
                            }
                          >
                            {(() => {
                              const isLoading =
                                loadingBookingId === booking.id ||
                                loadingRef.current === booking.id;
                              return (
                                <>
                                  {isLoading && (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600 mr-2"></div>
                                  )}
                                  {isLoading ? "Checking Out..." : "Check Out"}
                                </>
                              );
                            })()}
                          </Button>
                        )}
                        {booking.status === "CHECKED_OUT" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            {booking.payment?.status === "COMPLETED" ? (
                              <>
                                <svg
                                  className="w-3 h-3 text-green-500 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M13.78 4.22a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 4.72-4.72a.75.75 0 0 1 1.06 0z"
                                  />
                                </svg>
                                {loadingBookingId === booking.id
                                  ? "Booking Completed..."
                                  : "Booking Completed"}
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3 h-3 text-yellow-500 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M7.001 4a1 1 0 1 1 2 0v3a1 1 0 0 1-2 0V4Zm1 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
                                </svg>
                                {loadingBookingId === booking.id
                                  ? "Awaiting Booking Completion..."
                                  : "Awaiting Booking Completion"}
                              </>
                            )}
                          </span>
                        )}
                        {booking.status === "CANCELLED" && (
                          <span className="inline-flex items-center gap-1 p-2 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                            <svg
                              className="w-3 h-3 text-red-500 mr-1"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path
                                fillRule="evenodd"
                                d="M13.78 4.22a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 4.72-4.72a.75.75 0 0 1 1.06 0z"
                              />
                            </svg>
                            {loadingBookingId === booking.id
                              ? "Booking Cancelled..."
                              : "Booking Cancelled"}
                          </span>
                        )}

                        {console.log(
                          "Booking status:",
                          booking.status,
                          "Should show delete:",
                          booking.status !== "CHECKED_OUT",
                        )}

                        {true && (
                          <Button
                            onClick={() => {
                              setBookingToDelete(booking);
                              setIsDeleteDialogOpen(true);
                            }}
                            variant="destructive"
                            size="sm"
                            className="px-3 py-2 cursor-pointer text-xs h-8 min-h-0 rounded-md flex items-center gap-1"
                            title="Delete Booking"
                            disabled={isDeleting === booking.id}
                          >
                            {isDeleting === booking.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            ) : (
                              <Trash className="h-3 w-3" />
                            )}
                            {isDeleting === booking.id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        )}


                        {/* Delete Confirmation Dialog */}
                        <AlertDialog
                          open={
                            isDeleteDialogOpen &&
                            bookingToDelete?.id === booking.id
                          }
                          onOpenChange={(open) => {
                            // Only allow closing if not currently deleting
                            if (!isDeleting) {
                              setIsDeleteDialogOpen(open);
                              if (!open) {
                                setBookingToDelete(null);
                              }
                            }
                          }}
                        >
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure you want to delete this booking?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {isDeleting === booking.id ? (
                                  <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    <span>
                                      Deleting booking for{" "}
                                      {booking.user?.name || "Unknown User"} in
                                      Room {booking.room?.roomNumber || "N/A"}
                                      ...
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    This action cannot be undone. This will
                                    permanently delete the booking for{" "}
                                    {booking.user?.name || "Unknown User"} in
                                    Room {booking.room?.roomNumber || "N/A"} and
                                    remove all its data from our servers.
                                    {booking.payment && (
                                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                        <p className="text-sm text-yellow-800">
                                          ⚠️ This booking has an associated
                                          payment that will also be deleted.
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className="cursor-pointer"
                                onClick={() => {
                                  if (!isDeleting) {
                                    setIsDeleteDialogOpen(false);
                                    setBookingToDelete(null);
                                  }
                                }}
                                disabled={isDeleting === booking.id}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="cursor-pointer bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeleteBooking(booking.id)}
                                disabled={isDeleting === booking.id}
                              >
                                {isDeleting === booking.id
                                  ? "Deleting..."
                                  : "Delete Booking"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardFooter>
                </Card >
              );
            })}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No bookings found for "{activeStatus}"
            </p>
          </div>
        )}
      </div >

      {/* Toast notifications */}
    </div >
  );
};

export default page;
