"use client"

import React, { useState, useContext, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {useUserById} from "../../../../../hooks/useUsers"
import { SessionContext } from "../../../../context/sessiondata"
import { useUpdateUser } from "../../../../../hooks/useUsers"
import { toast } from "react-toastify"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { queryClient, queryKeys } from "@/lib/queryClient"
import { PageLoadingSkeleton, LoadingSpinner, ItemLoadingOverlay } from "@/components/ui/loading-skeleton"
// import { sendEmail } from "@/lib/sendmail"
const WardenSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  
  // Profile state
  const [name, setName] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const {session, refreshSession} = useContext(SessionContext)

  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState({
    Adressline1 : "",
    Adressline2 : "",
    city : "",
    state : "",
    country : "",
    zipcode : ""
  })
  const [phone, setPhone] = useState("")
  const [newEmail, setNewEmail] = useState("")
  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Separate loading states for each button
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isVerificationLoading, setIsVerificationLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isAddressLoading, setIsAddressLoading] = useState(false)
  // Notification preferences
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)

  // Theme
  const [darkMode, setDarkMode] = useState(false)

  const [isEmailVerificationDialogOpen, setIsEmailVerificationDialogOpen] = useState(false)
  const [isPasswordChangeDialogOpen, setIsPasswordChangeDialogOpen] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)

    const {data : userData} = useUserById(session?.user?.id || "")
    const updateUserMutation = useUpdateUser()

        // Populate form fields when user data loads
    useEffect(() => {
      if (userData?.user) {
        console.log("User data updated:", userData.user)
        setName(userData.user.name || "")
        setEmail(userData.user.email || "")
        setPhone(userData.user.phone || "")
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
        data: {name: name, phone: phone}
      })
      
      console.log("Update result:", result)
      
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.usersList(), 'detail', session.user.id] 
      })
      
      await refreshSession()
      
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsProfileLoading(false)
    }
  }

  
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    try {
      setIsPasswordLoading(true)
      const response = await fetch("/api/users/updatepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword, confirmPassword: confirmPassword })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Password changed successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setIsPasswordChangeDialogOpen(false)
      }
    } catch (error) {
      toast.error(error.message || "Failed to change password")
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const handleAddressSave = () => {
    setIsAddressDialogOpen(true)
  }

  const handleConfirmAddressSave = async () => {
    try {
      setIsAddressLoading(true)
      const response = await fetch("/api/users/updateaddress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Adressline1: address.Adressline1, Adressline2: address.Adressline2, city: address.city, state: address.state, country: address.country, zipcode: address.zipcode })
      })
      const data = await response.json()
      if (response.ok) {
        toast.success("Address saved successfully!")
        setIsAddressDialogOpen(false)
      } else {
        toast.error(data.error || "Failed to save address")
      }
    } catch (error) {
      toast.error(error.message || "Failed to save address")
    } finally {
      setIsAddressLoading(false)
    }
  }

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <PageLoadingSkeleton 
        title={true}
        statsCards={0}
        filterTabs={0}
        searchBar={false}
        contentCards={4}
      />
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-background">
      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Warden Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account, security, and preferences here.
          </p>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-6xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Profile Settings */}
        <Card className="shadow-sm border border-muted/30">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your name, email address, and phone number.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleProfileSave} disabled={isProfileLoading}>
              {isProfileLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
       
        <Card className="shadow-sm border border-muted/30">
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your address information.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <Label htmlFor="address-line1">Address Line 1</Label>
                <Input
                  id="address-line1"
                  value={address.Adressline1}
                  onChange={e => setAddress({ ...address, Adressline1: e.target.value })}
                  className="mt-1"
                  placeholder="Enter address line 1"
                  autoComplete="address-line1"
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="address-line2">Address Line 2</Label>
                <Input
                  id="address-line2"
                  value={address.Adressline2}
                  onChange={e => setAddress({ ...address, Adressline2: e.target.value })}
                  className="mt-1"
                  placeholder="Enter address line 2"
                  autoComplete="address-line2"
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={e => setAddress({ ...address, city: e.target.value })}
                  className="mt-1"
                  placeholder="Enter city"
                  autoComplete="address-level2"
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={address.state}
                  onChange={e => setAddress({ ...address, state: e.target.value })}
                  className="mt-1"
                  placeholder="Enter state"
                  autoComplete="address-level1"
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={address.country}
                  onChange={e => setAddress({ ...address, country: e.target.value })}
                  className="mt-1"
                  placeholder="Enter country"
                  autoComplete="country"
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="zipcode">Zipcode</Label>
                <Input
                  id="zipcode"
                  value={address.zipcode}
                  onChange={e => setAddress({ ...address, zipcode: e.target.value })}
                  className="mt-1"
                  placeholder="Enter zipcode"
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleAddressSave} disabled={isAddressLoading}>
              {isAddressLoading ? "Saving..." : "Save Address"}
            </Button>
          </CardFooter>
        </Card>
       

        {/* Change Password */}
        <Card className="shadow-sm border border-muted/30">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <p className="text-sm text-muted-foreground">
              Change your account password regularly for better protection.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="secondary" onClick={handleChangePassword} disabled={isPasswordLoading}>
              {isPasswordLoading ? "Processing..." : "Change Password"}
            </Button>
          </CardFooter>
        </Card>

       
       
      </div>

      {/* Email Verification Dialog */}
      <Dialog open={isEmailVerificationDialogOpen} onOpenChange={setIsEmailVerificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Email Address</DialogTitle>
            <DialogDescription>
              We've sent a verification code to <strong>{newEmail}</strong>. Please enter the code below to verify your new email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
            
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
                className="mt-1"
              />
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setVerificationCode("")
                  setIsEmailVerificationDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSendVerificationCode}
                  disabled={isEmailLoading}
                >
                  {isEmailLoading ? "Sending..." : "Resend Code"}
                </Button>
                <Button onClick={handleVerifyEmail} disabled={isVerificationLoading}>
                  {isVerificationLoading ? "Verifying..." : "Verify Email"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Confirmation Dialog */}
      <Dialog open={isPasswordChangeDialogOpen} onOpenChange={setIsPasswordChangeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Password Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change your password? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Current Password:</strong> {currentPassword ? "••••••••" : "Not provided"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>New Password:</strong> {newPassword ? "••••••••" : "Not provided"}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPasswordChangeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={isPasswordLoading}
              >
                {isPasswordLoading ? "Processing..." : "Confirm Change"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address Save Confirmation Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Address Save</DialogTitle>
            <DialogDescription>
              Are you sure you want to save your address information? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm"><strong>Address Line 1:</strong> {address.Adressline1 || "Not provided"}</p>
              <p className="text-sm"><strong>Address Line 2:</strong> {address.Adressline2 || "Not provided"}</p>
              <p className="text-sm"><strong>City:</strong> {address.city || "Not provided"}</p>
              <p className="text-sm"><strong>State:</strong> {address.state || "Not provided"}</p>
              <p className="text-sm"><strong>Country:</strong> {address.country || "Not provided"}</p>
              <p className="text-sm"><strong>Zipcode:</strong> {address.zipcode || "Not provided"}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddressDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAddressSave}
                disabled={isAddressLoading}
              >
                {isAddressLoading ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WardenSettingsPage