"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import type { Donor } from "@/lib/types"
import { Search, Phone, Mail, MapPin, Calendar, Droplets, UserCheck, UserX, Filter } from "lucide-react"

export function DonorsManagement() {
  const [donors, setDonors] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [eligibilityFilter, setEligibilityFilter] = useState<string>("all")
  const [filteredDonors, setFilteredDonors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDonors()
  }, [])

  useEffect(() => {
    let filtered = donors.filter(
      (donor) =>
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.blood_type.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (eligibilityFilter === "eligible") {
      filtered = filtered.filter(donor => donor.is_eligible)
    } else if (eligibilityFilter === "ineligible") {
      filtered = filtered.filter(donor => !donor.is_eligible)
    }

    setFilteredDonors(filtered)
  }, [searchTerm, donors, eligibilityFilter])

  const loadDonors = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getDonors()
      if (response.data && !response.error) {
        const donorsData = response.data as any[]
        setDonors(donorsData)
        setFilteredDonors(donorsData)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load donors',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load donors',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getEligibilityBadge = (isEligible: boolean, lastDonationDate?: string) => {
    if (!isEligible) {
      return <Badge variant="destructive">Not Eligible</Badge>
    }

    if (lastDonationDate) {
      const lastDonation = new Date(lastDonationDate)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

      if (lastDonation > threeMonthsAgo) {
        return <Badge variant="secondary">Recently Donated</Badge>
      }
    }

    return (
      <Badge variant="default" className="bg-green-600">
        Eligible
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const toggleDonorEligibility = async (donorId: string, currentEligibility: boolean) => {
    try {
      const response = await apiClient.updateDonorEligibility(donorId, !currentEligibility)
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Success',
        description: `Donor eligibility ${!currentEligibility ? 'enabled' : 'disabled'} successfully`
      })

      // Reload donors to get updated data
      loadDonors()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update donor eligibility',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donor Management</h2>
          <p className="text-gray-600">Manage registered blood donors and their eligibility</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search donors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by eligibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Donors</SelectItem>
              <SelectItem value="eligible">Eligible Only</SelectItem>
              <SelectItem value="ineligible">Ineligible Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Donors</p>
                <p className="text-2xl font-bold text-gray-900">{donors.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eligible Donors</p>
                <p className="text-2xl font-bold text-green-600">
                  {donors.filter(d => d.is_eligible).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ineligible Donors</p>
                <p className="text-2xl font-bold text-red-600">
                  {donors.filter(d => !d.is_eligible).length}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {filteredDonors.map((donor) => (
          <Card key={donor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Droplets className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{donor.name}</CardTitle>
                    <p className="text-sm text-gray-600">{donor.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {donor.blood_type}
                  </Badge>
                  {getEligibilityBadge(donor.is_eligible, donor.last_donation_date)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Age:</span>
                  <p className="text-gray-600">{donor.age} years</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Weight:</span>
                  <p className="text-gray-600">{donor.weight} kg</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Donation:</span>
                  <p className="text-gray-600 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {donor.last_donation_date ? formatDate(donor.last_donation_date) : "Never"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Registered:</span>
                  <p className="text-gray-600">{formatDate(donor.created_at)}</p>
                </div>
              </div>

              <div className="mt-4">
                <span className="font-medium text-gray-700">Address:</span>
                <p className="text-gray-600 flex items-start mt-1">
                  <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  {donor.address}
                </p>
              </div>

              {donor.medicalHistory && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Medical History:</span>
                  <p className="text-gray-600 mt-1">{donor.medicalHistory}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Contact
                </Button>
                <Button
                  variant={donor.is_eligible ? "destructive" : "default"}
                  size="sm"
                  onClick={() => toggleDonorEligibility(donor.id, donor.is_eligible)}
                >
                  {donor.is_eligible ? "Mark Ineligible" : "Mark Eligible"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDonors.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No donors found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
