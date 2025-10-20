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

  // Search states for dropdowns
  const [hostelSearchTerm, setHostelSearchTerm] = useState("");
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // --- State variables for Add Room form ---

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

  // New guest creation state
  const [guestType, setGuestType] = useState("existing"); // "existing" or "new"
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestStreet, setNewGuestStreet] = useState("");
  const [newGuestCity, setNewGuestCity] = useState("");
  const [newGuestCountry, setNewGuestCountry] = useState("");
  const [newGuestPostalCode, setNewGuestPostalCode] = useState("");
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);
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

  // Search filtering functions
  const getFilteredHostels = () => {
    if (!hostelSearchTerm) return hostels;
    return hostels.filter(hostel =>
      hostel.hostelName.toLowerCase().includes(hostelSearchTerm.toLowerCase()) ||
      hostel.address?.city?.toLowerCase().includes(hostelSearchTerm.toLowerCase())
    );
  };

  const getFilteredRooms = () => {
    if (!roomSearchTerm) return filteredRooms;
    return filteredRooms.filter(room =>
      room.roomNumber.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
      room.status.toLowerCase().includes(roomSearchTerm.toLowerCase())
    );
  };

  const getFilteredUsers = () => {
    if (!userSearchTerm) return filteredUsers;
    return filteredUsers.filter(user =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  };

  const handleHostelSelection = (selectedHostel) => {
    setCurrentselectedhostel(selectedHostel);
    setCurrentselectedroom("");
    setCurrentselectedbooking("");
    setRoomAvailable(true);
    setShowPersistentError(false);
    clearError();
    setHostelSearchTerm("");
    setRoomSearchTerm("");
    setUserSearchTerm("");

    const hostelRooms = rooms.filter(
      (room) => room.hostelId === selectedHostel.id,
    );
    setFilteredRooms(hostelRooms);
    setFilteredUsers([]);
  };

  const handleRoomSelection = async (selectedRoom) => {
    setCurrentselectedroom(selectedRoom);
    setCurrentselectedbooking("");
    setUserSearchTerm("");

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

  // Create new guest function
  const createNewGuest = async (guestData) => {
    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: guestData.name,
          email: guestData.email,
          phone: guestData.phone,
          role: guestData.role,
          // Generate password as a mixture of name, email, and phone
          password: `${guestData.name?.split(" ")[0] || ""}_${guestData.email?.split("@")[0] || ""}_${guestData.phone?.slice(-4) || ""}`,
          address: guestData.address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create guest");
      }

      const newGuest = await response.json();
      return newGuest;
    } catch (error) {
      console.error("Error creating guest:", error);
      throw error;
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
    if (guestType === "existing" && !currentselectedbooking) {
      toast.error("Please select a user");
      setBookingloading(false);
      return;
    }
    if (guestType === "new") {
      if (!newGuestName || !newGuestEmail || !newGuestPhone || !newGuestStreet || !newGuestCity || !newGuestCountry) {
        toast.error("Please fill in all guest information including address");
        setBookingloading(false);
        return;
      }
    }

    let duration, checkin, checkout;
    let selectedUserId = currentselectedbooking?.id;

    console.log("Initial selectedUserId:", selectedUserId);
    console.log("Current selected booking:", currentselectedbooking);
    console.log("Guest type:", guestType);

    // Create new guest if needed
    if (guestType === "new") {
      try {
        setIsCreatingGuest(true);
        console.log("Creating new guest with data:", {
          name: newGuestName,
          email: newGuestEmail,
          phone: newGuestPhone,
          role: "GUEST",
          address: {
            street: newGuestStreet,
            city: newGuestCity,
            country: newGuestCountry,
            postalCode: newGuestPostalCode,
          },
        });

        const newGuest = await createNewGuest({
          name: newGuestName,
          email: newGuestEmail,
          phone: newGuestPhone,
          role: "GUEST",
          address: {
            street: newGuestStreet,
            city: newGuestCity,
            country: newGuestCountry,
            postalCode: newGuestPostalCode,
          },
        });

        console.log("New guest created successfully:", newGuest);
        console.log("New guest ID:", newGuest.id);
        console.log("New guest user object:", newGuest.user);

        // Handle the API response structure - the user data is in newGuest.user
        if (newGuest.user && newGuest.user.id) {
          selectedUserId = newGuest.user.id;
        } else if (newGuest.id) {
          selectedUserId = newGuest.id;
        } else {
          throw new Error("No user ID found in guest creation response");
        }

        console.log("Selected user ID for booking:", selectedUserId);
        toast.success("New guest created successfully!");
      } catch (error) {
        console.error("Error creating guest:", error);
        toast.error(`Failed to create guest: ${error.message}`);
        setBookingloading(false);
        setIsCreatingGuest(false);
        return;
      } finally {
        setIsCreatingGuest(false);
      }
    }

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
      userId: selectedUserId,
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

    console.log("Booking payload:", payload);
    console.log("Selected user ID:", selectedUserId);

    // Final validation before creating booking
    if (!selectedUserId) {
      toast.error("No user selected or user creation failed");
      setBookingloading(false);
      return;
    }

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

        const getPaymentStatus = (bookingStatus) => {
          switch (bookingStatus) {
            case "CONFIRMED":
            case "CHECKED_IN":
              return "COMPLETED";
            case "PENDING":
              return "PENDING";
            case "CANCELLED":
              return "FAILED";
            case "CHECKED_OUT":
              return "COMPLETED";
            default:
              return "PENDING";
          }
        };

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

        // Send consolidated booking confirmation email with payment data
        try {
          const emailPayload = {
            userEmail: guestType === "new" ? newGuestEmail : currentselectedbooking?.email,
            userName: guestType === "new" ? newGuestName : currentselectedbooking?.name,
            bookingId: data.id,
            roomNumber: currentselectedroom.roomNumber,
            hostelName: currentselectedhostel.hostelName,
            checkin: checkin,
            checkout: checkout,
            totalAmount: totalAmount || (bookingTypeInput === "MONTHLY" ? currentselectedroom.pricePerMonth : currentselectedroom.pricePerNight),
            bookingType: bookingTypeInput,
            isNewUser: guestType === "new",
            userCredentials: guestType === "new" ? {
              email: newGuestEmail,
              password: `${newGuestName?.split(" ")[0] || ""}_${newGuestEmail?.split("@")[0] || ""}_${newGuestPhone?.slice(-4) || ""}`
            } : null
          };

          console.log("Sending consolidated booking confirmation email:", emailPayload);

          const emailResponse = await fetch("/api/mail/send-booking-confirmation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailPayload),
          });

          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            console.log("Booking confirmation email sent successfully:", emailData);
            toast.success("Booking confirmation email sent!");
          } else {
            const errorData = await emailResponse.json();
            console.error("Failed to send booking confirmation email:", errorData);
            toast.warning(`Booking created but email failed: ${errorData.error || 'Unknown error'}`);
          }
        } catch (emailError) {
          console.error("Error sending booking confirmation email:", emailError);
          toast.warning("Booking created but email notification failed");
        }

        // Registration email is now included in booking confirmation email

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
        // Reset guest creation fields
        setGuestType("existing");
        setNewGuestName("");
        setNewGuestEmail("");
        setNewGuestPhone("");
        setNewGuestStreet("");
        setNewGuestCity("");
        setNewGuestCountry("");
        setNewGuestPostalCode("");

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
  console.log("Active Status:", activeStatus);
  console.log("Bookings state:", bookings);
  console.log("Bookings type:", typeof bookings);
  console.log("Is bookings array:", Array.isArray(bookings));
  console.log("Total bookings:", bookings.length);
  console.log("Filtered bookings:", filteredBookings.length);
  console.log("Current loadingBookingId:", loadingBookingId);

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
                  {(currentselectedbooking || guestType === "new") && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                        {guestType === "new" ? "New Guest Information" : "Selected User Information"}
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Name
                            </Label>
                            <p className="text-sm text-gray-900">
                              {guestType === "new" ? newGuestName : currentselectedbooking?.name}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Email
                            </Label>
                            <p className="text-sm text-gray-900">
                              {guestType === "new" ? newGuestEmail : currentselectedbooking?.email}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Phone
                            </Label>
                            <p className="text-sm text-gray-900">
                              {guestType === "new" ? newGuestPhone : currentselectedbooking?.phone || "N/A"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              {guestType === "new" ? "Address" : "Role"}
                            </Label>
                            <p className="text-sm text-gray-900">
                              {guestType === "new"
                                ? `${newGuestStreet}, ${newGuestCity}, ${newGuestCountry}`
                                : currentselectedbooking?.role}
                            </p>
                          </div>
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
                          <div className="p-2">
                            <Input
                              placeholder="Search hostels..."
                              value={hostelSearchTerm}
                              onChange={(e) => setHostelSearchTerm(e.target.value)}
                              className="w-full"
                            // onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {getFilteredHostels().map((hostelItem) => (
                              <DropdownMenuItem
                                key={hostelItem.id}
                                onClick={() => handleHostelSelection(hostelItem)}
                              >
                                {hostelItem.hostelName} -{" "}
                                {hostelItem.address?.city}
                              </DropdownMenuItem>
                            ))}
                            {getFilteredHostels().length === 0 && (
                              <DropdownMenuItem disabled>
                                <span className="text-gray-500">
                                  No hostels found
                                </span>
                              </DropdownMenuItem>
                            )}
                          </div>
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
                            <div className="p-2">
                              <Input
                                placeholder="Search rooms..."
                                value={roomSearchTerm}
                                onChange={(e) => setRoomSearchTerm(e.target.value)}
                                className="w-full"
                              // onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {getFilteredRooms().map((room) => {
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
                              {getFilteredRooms().length === 0 && (
                                <DropdownMenuItem disabled>
                                  <span className="text-gray-500">
                                    No rooms found
                                  </span>
                                </DropdownMenuItem>
                              )}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    {/* Guest Selection - Only show if room is selected */}
                    {currentselectedroom && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Guest Type *
                          </Label>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="guestType"
                                value="existing"
                                checked={guestType === "existing"}
                                onChange={(e) => setGuestType(e.target.value)}
                                className="text-blue-600"
                              />
                              <span className="text-sm">Existing Guest</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="guestType"
                                value="new"
                                checked={guestType === "new"}
                                onChange={(e) => setGuestType(e.target.value)}
                                className="text-blue-600"
                              />
                              <span className="text-sm">New Guest</span>
                            </label>
                          </div>
                        </div>

                        {guestType === "existing" && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Select Existing User *
                            </Label>
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
                                    </div>
                                  ) : (
                                    "Select User"
                                  )}
                                  <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-full">
                                <div className="p-2">
                                  <Input
                                    placeholder="Search users..."
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    className="w-full"
                                  // onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                  {getFilteredUsers().length > 0 ? (
                                    getFilteredUsers().map((user) => (
                                      <DropdownMenuItem
                                        key={user.id}
                                        onClick={() => {
                                          setCurrentselectedbooking(user);
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
                                        {userSearchTerm ? "No users found" : "No users available"}
                                      </span>
                                    </DropdownMenuItem>
                                  )}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        {guestType === "new" && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700">
                              New Guest Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Full Name *
                                </Label>
                                <Input
                                  placeholder="Enter guest name"
                                  value={newGuestName}
                                  onChange={(e) => setNewGuestName(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Email *
                                </Label>
                                <Input
                                  type="email"
                                  placeholder="Enter email address"
                                  value={newGuestEmail}
                                  onChange={(e) => setNewGuestEmail(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Phone Number *
                                </Label>
                                <Input
                                  type="tel"
                                  placeholder="Enter phone number"
                                  value={newGuestPhone}
                                  onChange={(e) => setNewGuestPhone(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Street Address *
                                </Label>
                                <Input
                                  placeholder="Enter street address"
                                  value={newGuestStreet}
                                  onChange={(e) => setNewGuestStreet(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  City *
                                </Label>
                                <Input
                                  placeholder="Enter city"
                                  value={newGuestCity}
                                  onChange={(e) => setNewGuestCity(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Country *
                                </Label>
                                <Input
                                  placeholder="Enter country"
                                  value={newGuestCountry}
                                  onChange={(e) => setNewGuestCountry(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Postal Code
                                </Label>
                                <Input
                                  placeholder="Enter postal code"
                                  value={newGuestPostalCode}
                                  onChange={(e) => setNewGuestPostalCode(e.target.value)}
                                />
                              </div>
                            </div>
                            {isCreatingGuest && (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Creating new guest...
                              </div>
                            )}
                          </div>
                        )}
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
                        bookingloading ||
                        !roomAvailable ||
                        !currentselectedroom ||
                        isCreatingGuest ||
                        (guestType === "existing" && !currentselectedbooking) ||
                        (guestType === "new" && (!newGuestName || !newGuestEmail || !newGuestPhone || !newGuestStreet || !newGuestCity || !newGuestCountry))
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isCreatingGuest
                        ? "Creating Guest..."
                        : bookingloading
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
            <div className="text-2xl font-bold">
              {filteredBookings
                .filter(
                  (booking) =>
                    ["COMPLETED", "CHECKED_OUT"].includes(
                      (booking.status || "").toUpperCase(),
                    ) && booking.payment?.status === "COMPLETED",
                )
                .reduce(
                  (sum, booking) => sum + Number(booking.payment?.amount || 0),
                  0,
                )
                .toLocaleString()}{" "}
              PKR
            </div>
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
                                Payment
                              </span>
                            </p>
                          </div>
                          {booking.payment ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  Status
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${booking.payment.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800"
                                    : booking.payment.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : booking.payment.status === "FAILED"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {booking.payment.status || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  Amount
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  PKR
                                  {booking.payment.amount?.toLocaleString() ||
                                    "0"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  Method
                                </span>
                                <span className="text-sm text-gray-900">
                                  {booking.payment.method || "N/A"}
                                </span>
                              </div>
                              {booking.payment.transactionId && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    Txn ID
                                  </span>
                                  <span className="text-xs text-gray-600 font-mono truncate max-w-20">
                                    {booking.payment.transactionId}
                                  </span>
                                </div>
                              )}
                              {booking.payment.notes && (
                                <div className="pt-1 border-t">
                                  <span className="text-xs text-gray-500">
                                    Notes
                                  </span>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {booking.payment.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <p className="text-xs text-gray-500">
                                No payment data
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <hr />
                  <CardFooter>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                      <div>
                        <p className="text-muted-foreground text-md">
                          Notes: {booking.notes || "No notes"}
                        </p>
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
                </Card>
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
      </div>

      {/* Toast notifications */}
    </div>
  );
};

export default page;
