"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Users,Calendar,TrendingUp, CheckCircle, AlertTriangle, Wrench, Clock} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {Chart as ChartJS} from "chart.js";
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton";
import { useState, useEffect } from "react";

import {
  Card,
  CardAction,
  CardContent,  
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,

} from "@/components/ui/card"
import Link from "next/link";
import Chart from "@/components/chart"
export default function Home() {
  const [loading, setLoading] = useState(true);

  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  const recentActivitiestemp =[
    {
      id: "1",
      type: "booking",
      message: "New booking created for Room 101",
      timestamp: "2 hours ago",
      user: { name: "John Doe" ,avatar: "https://github.com/shadcn.png"}
    },
    {
      id: "2",
      type: "checkin",
      message: "Guest checked in to Room 205",
      timestamp: "4 hours ago",
      user: { name: "Sarah Miller" ,avatar: "https://github.com/shadcn.png"}
    }
  ]
  const pendingBookings = [
    {
      id: "1",
      type: "booking",
      message: "New booking created for Room 101",
      timestamp: "2 hours ago",
      user: { name: "John Doe" ,avatar: "https://github.com/shadcn.png"}
    }
  ]
  const maintenanceRequests = [
    {
      id: "1",
      type: "maintenance",
      message: "Maintenance request created for Room 101",
      timestamp: "2 hours ago",
      user: { name: "John Doe" ,avatar: "https://github.com/shadcn.png"}
    }
  ]

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <PageLoadingSkeleton 
        title={true}
        statsCards={4}
        filterTabs={0}
        searchBar={false}
        contentCards={6}
      />
    );
  }
 
    return (
    <div className="px-2">
      {/* Welcome Header */}
      <div className="flex md:flex-row flex-col justify-between px-4">
        <div className="mt-4 ">
        <h1 className="text-4xl font-bold">Welcome  Back  ! </h1>
        <p className="text-muted-foreground leading-loose" >Here's what's happening at your hostel today.</p>

        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
        <Badge variant="secondary" className="flex items-center  p-2 "> 
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          All Systems Operational </Badge>
        <Button> Generate Report </Button>
        </div>
        </div>  
        {/* Key Metrics */}
     < div className="grid md:grid-cols-2 p-4 lg:grid-cols-4 gap-4">
     <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground">
              100 available
            </p>
          </CardContent>
        </Card>
        <Card>  
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Active Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground">
              100 active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground">
                100 occupied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent> 
            <div className="text-2xl font-bold">100</div>
            <p className="text-xs text-muted-foreground">
                100 revenue
            </p>
          </CardContent>
        </Card>
     </div>
{/* room occupancy and recent activities */}
    <div className="grid md-grid-col-1 lg:grid-cols-7 gap-4 p-4" >
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Overview </CardTitle>
          <CardDescription>
            Current revenue status across all floors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="">
              <div>
                {/* <p className="text-sm font-medium">Ground Floor</p> */}
                <Chart />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Activities  </CardTitle>
          <CardDescription>
          Latest updates and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-col gap-4">
              {recentActivitiestemp.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback>
                      {activity.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.message}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user.name} • {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="grid gap-4 md:grid-cols-2 p-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/bookings/new">
                <Calendar className="mr-2 h-4 w-4" />
                New Booking
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/rooms">
                <Bed className="mr-2 h-4 w-4" />
                Manage Rooms
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/maintenance">
                  <Wrench className="mr-2 h-4 w-4" />
                Maintenance
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>
              Items requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingBookings.length > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Pending Bookings</span>
                  </div>
                  <Badge variant="secondary">{pendingBookings.length}</Badge>
                </div>
              ) : null}
              
              {maintenanceRequests.length > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Maintenance Requests</span>
                  </div>
                  <Badge variant="secondary">{maintenanceRequests.length}</Badge>
                </div>
              ) : null}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">All Systems OK</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              Upcoming events and tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Check-in: Room 101</p>
                  <p className="text-xs text-muted-foreground">John Doe</p>
                </div>
                <Badge variant="secondary">2:00 PM</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Check-out: Room 205</p>
                  <p className="text-xs text-muted-foreground">Sarah Miller</p>
                </div>
                <Badge variant="secondary">11:00 AM</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Maintenance: Room 103</p>
                  <p className="text-xs text-muted-foreground">AC Repair</p>
                </div>
                <Badge variant="secondary">3:00 PM</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}