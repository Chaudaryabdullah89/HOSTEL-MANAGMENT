"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { BookingPaymentInfo } from "@/components/booking-payment-info";
import { Clock, User, Bed, Calendar } from "lucide-react";

interface Booking {
  id: string;
  status: string;
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
  room?: {
    roomNumber?: string;
    type?: string;
    floor?: number;
    pricePerNight?: number;
  };
  checkin?: string;
  checkout?: string;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
  }>;
}

interface BookingCardProps {
  booking: Booking;
  isBookingLoading: boolean;
}

export function BookingCard({ booking, isBookingLoading }: BookingCardProps) {
  return (
    <Card
      key={booking.id}
      className={`mb-4 relative ${
        isBookingLoading ? "opacity-75 pointer-events-none" : ""
      }`}
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
            <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full col-span-2">
              <BookingPaymentInfo payments={booking.payments} />
            </div>

            {/* Room Section */}
            <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
              <div>
                <p className="text-md font-medium flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  <span className="text-sm font-semibold text-gray-800">
                    Room Details
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

            {/* Dates Section */}
            <div className="flex flex-col gap-2 bg-white rounded-xl p-4 h-full">
              <div>
                <p className="text-md font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-semibold text-gray-800">
                    Stay Duration
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Check-in: {booking.checkin ? new Date(booking.checkin).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Check-out: {booking.checkout ? new Date(booking.checkout).toLocaleDateString() : "N/A"}
                </p>
                {booking.checkin && booking.checkout && (
                  <p className="text-xs text-gray-500">
                    {Math.ceil((new Date(booking.checkout).getTime() - new Date(booking.checkin).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}