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
import { queryClient, queryKeys } from "@/lib/queryClient"
const WardenSettingsPage = () => {
  // Profile state
  const [name, setName] = useState("")
  const {session, refreshSession} = useContext(SessionContext)
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

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")

  // Notification preferences
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)

  // Theme
  const [darkMode, setDarkMode] = useState(false)

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
      setLoadingBtn(true)
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
      setLoadingBtn(false)
    }
  }
  const handleAddressSave = () => {
    // TODO: Implement address save functionality
    toast.info("Address save functionality not implemented yet")
  }

  const handleChangeEmail = async () => {
    if (!session?.user?.id) {
      toast.error("User ID not found. Please refresh the page and try again.")
      return
    }
    
    try {
      setLoadingBtn(true)
      await updateUserMutation.mutateAsync({
        id: session.user.id, 
        data: {email: email}
      })
      

      await refreshSession()
      
      toast.success("Email updated successfully")
    } catch (error) {
      toast.error(error.message || "Failed to update email")
    } finally {
      setLoadingBtn(false)
    }
  }
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match.")
      return
    }
    alert("Password changed successfully!")
  }
  const handleThemeToggle = (checked) => {
    setDarkMode(checked)
    alert(`Theme changed to ${checked ? "Dark" : "Light"} Mode`)
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
            <Button onClick={handleProfileSave} disabled={loadingBtn}>{loadingBtn ? "Saving..." : "Save Changes"}</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Email Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your email address.
            </p>
          </CardHeader>
          <CardContent>
          <div className="">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1 w-full"
                  placeholder="Enter your email address"
                />
             
              </div>
          </CardContent>
          <CardFooter className="flex justify-end">
          <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => handleChangeEmail()} // You should define this function
                  variant="outline"
                >
                  Verify & Change Email
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
            <Button onClick={handleAddressSave}>Save Address</Button>
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
            <Button variant="secondary" onClick={handleChangePassword}>
              Change Password
            </Button>
          </CardFooter>
        </Card>

        {/* Notification Preferences */}
        <Card className="shadow-sm border border-muted/30">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose how you want to receive updates and alerts.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between">
              <Label>SMS Notifications</Label>
              <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="shadow-sm border border-muted/30">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Customize how the dashboard looks.
            </p>
          </CardHeader>
          <CardContent className="flex items-center justify-between py-3">
            <Label>Dark Mode</Label>
            <Switch checked={darkMode} onCheckedChange={handleThemeToggle} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WardenSettingsPage