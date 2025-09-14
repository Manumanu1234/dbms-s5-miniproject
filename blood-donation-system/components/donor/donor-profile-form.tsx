"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"
import { authManager } from "@/lib/auth"
import type { Donor } from "@/lib/types"
import { User, Phone, Mail, MapPin, Calendar, Weight, Activity } from "lucide-react"

export function DonorProfileForm() {
  const [donor, setDonor] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bloodType: "",
    age: "",
    weight: "",
    address: "",
    medicalHistory: "",
    donationUnits: "1",
  })

  useEffect(() => {
    const fetchDonorProfile = async () => {
      try {
        setLoading(true)
        const currentUser = authManager.getCurrentUser()
        if (currentUser) {
          const response = await apiClient.getMyDonorProfile()
          if (response.data) {
            const existingDonor = response.data as any
            setDonor(existingDonor)
            setFormData({
              name: existingDonor.name || '',
              phone: existingDonor.phone || '',
              bloodType: existingDonor.blood_type || existingDonor.bloodType || '',
              age: (existingDonor.age || 0).toString(),
              weight: (existingDonor.weight || 0).toString(),
              address: existingDonor.address || '',
              medicalHistory: existingDonor.medical_history || existingDonor.medicalHistory || '',
              donationUnits: (existingDonor.donation_units || existingDonor.donationUnits || 1).toString(),
            })
          } else {
            setIsEditing(true) // New donor needs to create profile
            setFormData({
              ...formData,
              name: currentUser.email.split("@")[0], // Default name from email
            })
          }
        }
      } catch (error) {
        console.error('Error fetching donor profile:', error)
        // If profile doesn't exist, enable editing mode
        const currentUser = authManager.getCurrentUser()
        if (currentUser) {
          setIsEditing(true)
          setFormData({
            ...formData,
            name: currentUser.email.split("@")[0],
            donationUnits: "1",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDonorProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const currentUser = authManager.getCurrentUser()
      if (!currentUser) return

      const donorData = {
        name: formData.name,
        email: currentUser.email, // Add required email field
        phone: formData.phone,
        blood_type: formData.bloodType,
        age: Number.parseInt(formData.age),
        weight: Number.parseInt(formData.weight),
        address: formData.address,
        medical_history: formData.medicalHistory,
        donation_units: Number.parseInt(formData.donationUnits),
      }

      console.log('Creating/updating donor profile with data:', donorData)

      let response
      if (donor) {
        // Update existing profile
        response = await apiClient.updateDonorProfile(donorData)
      } else {
        // Create new profile
        response = await apiClient.createDonorProfile(donorData)
      }

      if (response.data) {
        setDonor(response.data)
        setIsEditing(false)
        setMessage("Profile updated successfully!")
      } else {
        setMessage("Failed to update profile. Please try again.")
      }
    } catch (error) {
      console.error('Error saving donor profile:', error)
      setMessage("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!donor && !isEditing) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500 mb-4">Complete your donor profile to get started</p>
          <Button onClick={() => setIsEditing(true)} className="bg-red-600 hover:bg-red-700">
            Create Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-red-600" />
          <span>Donor Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={formData.bloodType}
                  onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="65"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="50"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donationUnits">Units Willing to Donate</Label>
                <Input
                  id="donationUnits"
                  type="number"
                  min="1"
                  max="4"
                  value={formData.donationUnits}
                  onChange={(e) => setFormData({ ...formData, donationUnits: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                placeholder="Any relevant medical conditions, medications, or health information..."
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
              {donor && (
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{donor.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{donor.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{donor.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Blood Type</p>
                    <p className="font-medium text-red-600">{donor.blood_type || donor.bloodType}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">{donor.age} years</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Weight className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="font-medium">{donor.weight} kg</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Donation Units</p>
                    <p className="font-medium">{donor.donation_units || donor.donationUnits || 1} units</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Last Donation</p>
                    <p className="font-medium">
                      {(donor.last_donation_date || donor.lastDonationDate) ? new Date(donor.last_donation_date || donor.lastDonationDate).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Eligibility Status</p>
                    <p className={`font-medium ${(donor.is_eligible ?? donor.isEligible ?? true) ? "text-green-600" : "text-red-600"}`}>
                      {(donor.is_eligible ?? donor.isEligible ?? true) ? "Eligible" : "Not Eligible"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{donor.address}</p>
                </div>
              </div>
            </div>

            {(donor.medical_history || donor.medicalHistory) && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Medical History</p>
                <p className="font-medium">{donor.medical_history || donor.medicalHistory}</p>
              </div>
            )}

            <Button onClick={() => setIsEditing(true)} className="bg-red-600 hover:bg-red-700">
              Edit Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
