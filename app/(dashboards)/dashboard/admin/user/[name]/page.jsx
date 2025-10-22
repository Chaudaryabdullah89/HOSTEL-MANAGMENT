"use client";
import React, { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    Bed,
    Wrench,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    DollarSign,
    Building,
} from "lucide-react";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { toast } from "react-toastify";
import { SessionContext } from "@/app/context/sessiondata";
import { format } from "date-fns";

const UserProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const { session } = useContext(SessionContext);

    const [userData, setUserData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        // Check if user is admin
        if (session && session.user && session.user.role !== "ADMIN") {
            toast.error("Access denied: Admin only");
            router.push("/dashboard");
            return;
        }

        if (params.name) {
            fetchUserProfile(params.name);
        }
    }, [params.name, session]);

    const fetchUserProfile = async (userId) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/profile/${userId}`);
            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to fetch user profile");
                return;
            }

            setUserData(data.user);
            setStatistics(data.statistics);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            toast.error("An error occurred while fetching user profile");
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-100 text-red-800";
            case "WARDEN":
                return "bg-purple-100 text-purple-800";
            case "GUEST":
                return "bg-blue-100 text-blue-800";
            case "STAFF":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getBookingStatusColor = (status) => {
        switch (status) {
            case "CHECKED_IN":
                return "bg-green-100 text-green-800";
            case "CHECKED_OUT":
                return "bg-gray-100 text-gray-800";
            case "CONFIRMED":
                return "bg-blue-100 text-blue-800";
            case "CANCELLED":
                return "bg-red-100 text-red-800";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "PAID":
            case "APPROVED":
                return "bg-green-100 text-green-800";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "FAILED":
            case "REJECTED":
                return "bg-red-100 text-red-800";
            case "REFUNDED":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <PageLoadingSkeleton
                title={true}
                statsCards={4}
                filterTabs={3}
                searchBar={false}
                contentCards={6}
            />
        );
    }

    if (!userData) {
        return (
            <div className="p-4">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-500">User not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-2 md:p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">User Profile</h1>
                        <p className="text-muted-foreground">View detailed user information</p>
                    </div>
                </div>
            </div>

            {/* User Overview Card */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-blue-600">
                                    {userData.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{userData.name}</CardTitle>
                                <CardDescription className="text-base">{userData.email}</CardDescription>
                                <div className="flex gap-2 mt-2">
                                    <Badge className={getRoleBadgeColor(userData.role)}>
                                        {userData.role}
                                    </Badge>
                                    {userData.guest && (
                                        <Badge variant="outline">Guest User</Badge>
                                    )}
                                    {userData.wardens && userData.wardens.length > 0 && (
                                        <Badge variant="outline">Warden</Badge>
                                    )}
                                    {userData.admin && (
                                        <Badge variant="outline">Administrator</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userData.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{userData.phone}</span>
                            </div>
                        )}
                        {userData.address && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {userData.address.street}, {userData.address.city}, {userData.address.state}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                                Joined: {format(new Date(userData.createdAt), "MMM dd, yyyy")}
                            </span>
                        </div>
                        {userData.guest?.Hostel && (
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    Hostel: {userData.guest.Hostel.hostelName}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Bed className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.bookings.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {statistics.bookings.active} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₦{statistics.payments.total.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {statistics.payments.paid} paid, {statistics.payments.pending} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.bookings.completed}</div>
                            <p className="text-xs text-muted-foreground">
                                {statistics.bookings.cancelled} cancelled
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.maintenance.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {statistics.maintenance.pending} pending
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b">
                <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    onClick={() => setActiveTab("overview")}
                    className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
                    data-active={activeTab === "overview"}
                >
                    Overview
                </Button>
                <Button
                    variant={activeTab === "bookings" ? "default" : "ghost"}
                    onClick={() => setActiveTab("bookings")}
                    className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
                    data-active={activeTab === "bookings"}
                >
                    Bookings ({userData.bookings?.length || 0})
                </Button>
                <Button
                    variant={activeTab === "payments" ? "default" : "ghost"}
                    onClick={() => setActiveTab("payments")}
                    className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
                    data-active={activeTab === "payments"}
                >
                    Payments ({userData.payments?.length || 0})
                </Button>
                <Button
                    variant={activeTab === "maintenance" ? "default" : "ghost"}
                    onClick={() => setActiveTab("maintenance")}
                    className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
                    data-active={activeTab === "maintenance"}
                >
                    Maintenance ({userData.maintenances?.length || 0})
                </Button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="grid gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">User ID</p>
                                    <p className="font-mono text-sm">{userData.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="text-sm">{userData.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="text-sm">{userData.phone || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <Badge className={getRoleBadgeColor(userData.role)}>
                                        {userData.role}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="text-sm">{format(new Date(userData.createdAt), "PPP")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Updated</p>
                                    <p className="text-sm">{format(new Date(userData.updatedAt), "PPP")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "bookings" && (
                <div className="grid gap-4">
                    {userData.bookings && userData.bookings.length > 0 ? (
                        userData.bookings.map((booking) => (
                            <Card key={booking.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {booking.hostel?.hostelName || "Unknown Hostel"}
                                            </CardTitle>
                                            <CardDescription>
                                                Room {booking.room?.roomNumber || "N/A"} - Floor {booking.room?.floor || "N/A"}
                                            </CardDescription>
                                        </div>
                                        <Badge className={getBookingStatusColor(booking.status)}>
                                            {booking.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Check-in</p>
                                            <p className="font-medium">{format(new Date(booking.checkin), "PPP")}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Check-out</p>
                                            <p className="font-medium">{format(new Date(booking.checkout), "PPP")}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Duration</p>
                                            <p className="font-medium">{booking.duration || "N/A"} days</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Room Type</p>
                                            <p className="font-medium">{booking.room?.type || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Price</p>
                                            <p className="font-medium">
                                                ₦{booking.price?.toLocaleString() || booking.room?.pricePerNight?.toLocaleString() || "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Booking Type</p>
                                            <p className="font-medium">{booking.bookingType || "N/A"}</p>
                                        </div>
                                    </div>
                                    {booking.notes && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm text-muted-foreground">Notes</p>
                                            <p className="text-sm">{booking.notes}</p>
                                        </div>
                                    )}
                                    {booking.payment && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-sm text-muted-foreground mb-2">Payment Information</p>
                                            <div className="flex items-center gap-4">
                                                <Badge className={getPaymentStatusColor(booking.payment.status)}>
                                                    {booking.payment.status}
                                                </Badge>
                                                <span className="text-sm">
                                                    ₦{booking.payment.amount.toLocaleString()} via {booking.payment.method}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Bed className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No bookings found</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "payments" && (
                <div className="grid gap-4">
                    {userData.payments && userData.payments.length > 0 ? (
                        (() => {
                            // Group payments by booking
                            const groupedPayments = userData.payments.reduce((acc, payment) => {
                                const bookingId = payment.bookingId || 'standalone';
                                if (!acc[bookingId]) {
                                    acc[bookingId] = [];
                                }
                                acc[bookingId].push(payment);
                                return acc;
                            }, {});

                            return Object.entries(groupedPayments).map(([bookingId, payments]) => {
                                const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
                                const allPaid = payments.every(p => p.status === "PAID" || p.status === "APPROVED");
                                const anyPending = payments.some(p => p.status === "PENDING");
                                const firstPayment = payments[0];

                                return (
                                    <Card key={bookingId} className="overflow-hidden">
                                        <CardHeader className="bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg">
                                                        {firstPayment.hostel?.hostelName || "Unknown Hostel"}
                                                    </CardTitle>
                                                    {firstPayment.booking && (
                                                        <CardDescription className="mt-1">
                                                            Booking: {format(new Date(firstPayment.booking.checkin), "MMM dd")} - {format(new Date(firstPayment.booking.checkout), "MMM dd, yyyy")}
                                                            <span className="ml-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {firstPayment.booking.status}
                                                                </Badge>
                                                            </span>
                                                        </CardDescription>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <Badge className={allPaid ? "bg-green-100 text-green-800" : anyPending ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}>
                                                        {payments.length} Payment{payments.length > 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground">Total Paid:</span>
                                                    <span className="text-xl font-bold">₦{totalPaid.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y">
                                                {payments.map((payment, index) => (
                                                    <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                                                    {index + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm">Payment #{index + 1}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {format(new Date(payment.createdAt), "PPP")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Badge className={getPaymentStatusColor(payment.status)}>
                                                                {payment.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Amount</p>
                                                                <p className="font-semibold text-green-600">₦{payment.amount.toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Method</p>
                                                                <p className="font-medium">{payment.method || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Transaction ID</p>
                                                                <p className="font-mono text-xs truncate">{payment.transactionId || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Time</p>
                                                                <p className="font-medium">{format(new Date(payment.createdAt), "p")}</p>
                                                            </div>
                                                        </div>
                                                        {payment.notes && (
                                                            <div className="mt-3 pt-3 border-t">
                                                                <p className="text-xs text-muted-foreground">Notes</p>
                                                                <p className="text-sm">{payment.notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            });
                        })()
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No payments found</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "maintenance" && (
                <div className="grid gap-4">
                    {userData.maintenances && userData.maintenances.length > 0 ? (
                        userData.maintenances.map((maintenance) => (
                            <Card key={maintenance.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{maintenance.title}</CardTitle>
                                            <CardDescription>
                                                {maintenance.hostel?.hostelName || "Unknown Hostel"} - Room {maintenance.room?.roomNumber || "N/A"}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={maintenance.status === "RESOLVED" ? "default" : "secondary"}>
                                            {maintenance.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm mb-4">{maintenance.description}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Priority</p>
                                            <Badge variant="outline">{maintenance.priority}</Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Reported At</p>
                                            <p className="text-sm">{format(new Date(maintenance.createdAt), "PPP")}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No maintenance requests found</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;

