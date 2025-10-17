"use client"

import React, { useState, useContext, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useUserById } from "../../../../../hooks/useUsers"
import { SessionContext } from "../../../../context/sessiondata"
import { useUpdateUser } from "@/hooks/useUsers"
import { toast } from "react-toastify"
import { queryClient, queryKeys } from "@/lib/queryClient"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Activity,
  BookOpen,
  CreditCard,
  Settings
} from "lucide-react"
import { format } from "date-fns"

const AdminProfilePage = () => {
  // Profile state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [createdAt, setCreatedAt] = useState("")
  const [image, setImage] = useState("")
  
  // Address state
  const [address, setAddress] = useState({
    Adressline1: "",
    Adressline2: "",
    city: "",
    state: "",
    country: "",
    zipcode: ""
  })

  // Dialog states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Loading states
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isAddressLoading, setIsAddressLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  const { session, refreshSession } = useContext(SessionContext)
  const { data: userData, isLoading: userDataLoading, error: userDataError } = useUserById(session?.user?.id || "")
  const updateUserMutation = useUpdateUser()

  // Populate form fields when user data loads
  useEffect(() => {
    if (userData?.user) {
      console.log("User data updated:", userData.user)
      setName(userData.user.name || "")
      setEmail(userData.user.email || "")
      setPhone(userData.user.phone || "")
      setRole(userData.user.role || "ADMIN")
      setCreatedAt(userData.user.createdAt || "")
      setImage(userData.user.image || "")
      
      // Set address if available
      if (userData.user.address) {
        setAddress({
          Adressline1: userData.user.address.street || "",
          Adressline2: "",
          city: userData.user.address.city || "",
          state: userData.user.address.state || "",
          country: userData.user.address.country || "",
          zipcode: userData.user.address.zipcode || ""
        })
      }
    }
  }, [userData])

  const handleProfileSave = async () => {
    if (!session?.user?.id) {
      toast.error("User ID not found. Please refresh the page and try again.")
      return
    }
    
    try {
      setIsProfileLoading(true)
      const result = await updateUserMutation.mutateAsync({
        id: session.user.id, 
        data: { name: name, phone: phone }
      })
      
      console.log("Update result:", result)
      
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.usersList(), 'detail', session.user.id] 
      })
      
      await refreshSession()
      
      toast.success("Profile updated successfully")
      setIsEditProfileOpen(false)
    } catch (error) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handleAddressSave = async () => {
    try {
      setIsAddressLoading(true)
      const response = await fetch("/api/users/updateaddress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Adressline1: address.Adressline1,
          Adressline2: address.Adressline2,
          city: address.city,
          state: address.state,
          country: address.country,
          zipcode: address.zipcode
        })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Address saved successfully!")
        setIsEditAddressOpen(false)
      } else {
        toast.error(data.error || "Failed to save address")
      }
    } catch (error) {
      toast.error(error.message || "Failed to save address")
    } finally {
      setIsAddressLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      setIsPasswordLoading(true)
      const response = await fetch("/api/users/updatepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Password changed successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setIsChangePasswordOpen(false)
      } else {
        toast.error(data.error || "Failed to change password")
      }
    } catch (error) {
      toast.error(error.message || "Failed to change password")
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "WARDEN":
        return "bg-blue-100 text-blue-800"
      case "GUEST":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Show loading state while data is being fetched
  if (userDataLoading) {
    return (
      <div className="flex flex-col w-full h-full bg-background">
        {/* Page Header */}
        <div className="border-b bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">
              View and manage your account information and preferences.
            </p>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-6xl mx-auto w-full px-6 py-10 space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card Skeleton */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse md:col-span-2"></div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-28"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-28"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-14"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-18"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Settings Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-64"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (userDataError) {
    return (
      <div className="flex flex-col w-full h-full bg-background">
        {/* Page Header */}
        <div className="border-b bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">
              View and manage your account information and preferences.
            </p>
          </div>
        </div>

        {/* Error Content */}
        <div className="max-w-6xl mx-auto w-full px-6 py-10">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading profile</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {userDataError.message || "Unable to load your profile information"}
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-background">
      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage your account information and preferences.
          </p>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-6xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Profile Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold">{name || "Loading..."}</h2>
                    <Badge className={getRoleBadgeColor(role)}>
                      {role || "ADMIN"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{email}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {createdAt ? format(new Date(createdAt), "MMMM yyyy") : "Loading..."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{phone || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {address.city && address.state 
                      ? `${address.city}, ${address.state}` 
                      : "Address not provided"
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Login</span>
                <span className="text-sm">Today</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium">{role}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <p className="text-sm mt-1">{name || "Not provided"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                <p className="text-sm mt-1">{email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                <p className="text-sm mt-1">{phone || "Not provided"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                <p className="text-sm mt-1">
                  {createdAt ? format(new Date(createdAt), "MMMM dd, yyyy") : "Loading..."}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Information
              </Button>
            </CardFooter>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-sm mt-1">
                  {address.Adressline1 || "Not provided"}
                  {address.Adressline2 && `, ${address.Adressline2}`}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">City</Label>
                <p className="text-sm mt-1">{address.city || "Not provided"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">State</Label>
                <p className="text-sm mt-1">{address.state || "Not provided"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                <p className="text-sm mt-1">{address.country || "Not provided"}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditAddressOpen(true)}
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Address
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your account security and password settings.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Last changed: Never (recommended to change regularly)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  Change Password
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Information</DialogTitle>
            <DialogDescription>
              Update your personal information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditProfileOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProfileSave}
                disabled={isProfileLoading}
              >
                {isProfileLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={isEditAddressOpen} onOpenChange={setIsEditAddressOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Address Information</DialogTitle>
            <DialogDescription>
              Update your address information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-address1">Address Line 1</Label>
              <Input
                id="edit-address1"
                value={address.Adressline1}
                onChange={e => setAddress({ ...address, Adressline1: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-address2">Address Line 2</Label>
              <Input
                id="edit-address2"
                value={address.Adressline2}
                onChange={e => setAddress({ ...address, Adressline2: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={address.city}
                  onChange={e => setAddress({ ...address, city: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  value={address.state}
                  onChange={e => setAddress({ ...address, state: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={address.country}
                  onChange={e => setAddress({ ...address, country: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-zipcode">Zipcode</Label>
                <Input
                  id="edit-zipcode"
                  value={address.zipcode}
                  onChange={e => setAddress({ ...address, zipcode: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditAddressOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddressSave}
                disabled={isAddressLoading}
              >
                {isAddressLoading ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsChangePasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={isPasswordLoading}
              >
                {isPasswordLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminProfilePage
