"use client";

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, User, CreditCard, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
    id: string;
    type: 'booking' | 'user' | 'payment';
    title: string;
    message: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    booking?: {
        id: string;
        roomNumber: string;
        hostelName: string;
        checkin: string;
        checkout: string;
        price: number;
    };
    payment?: {
        id: string;
        amount: number;
        method: string;
        createdAt: string;
    };
    createdAt: string;
    priority: 'high' | 'medium' | 'low';
}

interface NotificationBadgeProps {
    className?: string;
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                const allNotifications = [
                    ...data.newBookings,
                    ...data.newUsers,
                    ...data.pendingPayments
                ];
                setNotifications(allNotifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'booking':
                return <Calendar className="w-4 h-4" />;
            case 'user':
                return <User className="w-4 h-4" />;
            case 'payment':
                return <CreditCard className="w-4 h-4" />;
            default:
                return <Bell className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const totalNotifications = notifications.length;
    const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

    return (
        <div className={`relative ${className}`}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className="w-4 h-4" />
                {totalNotifications > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                        {totalNotifications}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Notifications</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        {highPriorityCount > 0 && (
                            <Badge variant="destructive" className="w-fit">
                                {highPriorityCount} High Priority
                            </Badge>
                        )}
                    </CardHeader>

                    <CardContent className="p-0">
                        <ScrollArea className="h-96">
                            {loading ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Loading notifications...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No new notifications
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 border-b hover:bg-gray-50 transition-colors ${getPriorityColor(notification.priority)}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-medium">{notification.title}</h4>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTime(notification.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {notification.message}
                                                    </p>
                                                    {notification.user && (
                                                        <div className="mt-2 text-xs">
                                                            <span className="font-medium">User:</span> {notification.user.name} ({notification.user.role})
                                                        </div>
                                                    )}
                                                    {notification.booking && (
                                                        <div className="mt-1 text-xs">
                                                            <span className="font-medium">Room:</span> {notification.booking.roomNumber} |
                                                            <span className="font-medium"> Hostel:</span> {notification.booking.hostelName} |
                                                            <span className="font-medium"> Amount:</span> {notification.booking.price} PKR
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
