"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const GuestProfilePage = () => {
  // Profile state
  const [name, setName] = useState("Aarav Sharma")
  const [email, setEmail] = useState("aarav.sharma@example.com")
  const [phone, setPhone] = useState("+91 9876543210")

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Notification preferences
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)

  // Theme
  const [darkMode, setDarkMode] = useState(false)

  // Handlers (for demo only)
  const handleProfileSave = () => alert("Profile updated successfully!")
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
          <h1 className="text-3xl font-bold tracking-tight">Guest Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and update your guest account details here.
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
                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleProfileSave}>Save Changes</Button>
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

export default GuestProfilePage