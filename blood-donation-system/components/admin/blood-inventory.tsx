"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { apiClient } from "@/lib/api-client"
import type { BloodInventory } from "@/lib/types"
import { Droplets, AlertTriangle, Plus, Minus, Users, UserCheck, UserX, Activity } from "lucide-react"

export function BloodInventoryManagement() {
  const [donors, setDonors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getDonors()
        if (response.data) {
          setDonors(Array.isArray(response.data) ? response.data : [])
        }
      } catch (error) {
        console.error('Error fetching donors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDonors()
  }, [])

  const updateDonorEligibility = async (donorId: string, isEligible: boolean) => {
    try {
      await apiClient.updateDonorEligibility(donorId, isEligible)
      // Refresh donors list
      const response = await apiClient.getDonors()
      if (response.data) {
        setDonors(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error updating donor eligibility:', error)
    }
  }

  const getEligibilityBadge = (isEligible: boolean) => {
    return isEligible ? 
      { color: "default", text: "Eligible" } : 
      { color: "destructive", text: "Ineligible" }
  }

  const formatLastDonation = (lastDonationDate: string) => {
    if (!lastDonationDate) return "Never"
    const date = new Date(lastDonationDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Blood Inventory</h2>
            <p className="text-gray-600">Monitor and manage blood stock levels</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 p-2 rounded-full w-10 h-10"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blood Inventory</h2>
          <p className="text-gray-600">Monitor and manage blood stock levels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {donors.map((donor) => {
          const bloodType = donor.blood_type || donor.bloodType
          const isEligible = donor.is_eligible !== false && donor.isEligible !== false
          const donationUnits = donor.donation_units || 1
          const eligibilityBadge = getEligibilityBadge(isEligible)
          const lastDonation = formatLastDonation(donor.last_donation_date || donor.lastDonationDate)

          return (
            <Card key={donor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{donor.name}</CardTitle>
                      <p className="text-sm text-gray-600">{bloodType}</p>
                    </div>
                  </div>
                  <Badge variant={eligibilityBadge.color as any}>{eligibilityBadge.text}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Blood Units</span>
                    <span className="text-2xl font-bold text-red-600">{donationUnits}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Droplets className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-600">Available for donation</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900 truncate ml-2">{donor.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="text-gray-900">{donor.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="text-gray-900">{donor.age || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="text-gray-900">{donor.weight ? `${donor.weight} kg` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Donation:</span>
                    <span className="text-gray-900">{lastDonation}</span>
                  </div>
                </div>

                {donor.address && (
                  <div className="text-sm">
                    <span className="text-gray-600">Address:</span>
                    <p className="text-gray-900 mt-1 text-xs">{donor.address}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={isEligible ? "destructive" : "default"}
                    onClick={() => updateDonorEligibility(donor.id, !isEligible)}
                    className="flex-1"
                  >
                    {isEligible ? (
                      <>
                        <UserX className="h-3 w-3 mr-1" />
                        Mark Ineligible
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Mark Eligible
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Donor Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Donor Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {donors.length}
              </div>
              <div className="text-sm text-gray-600">Total Donors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {donors.filter(donor => donor.is_eligible !== false && donor.isEligible !== false).length}
              </div>
              <div className="text-sm text-gray-600">Eligible Donors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {donors.filter(donor => donor.is_eligible === false || donor.isEligible === false).length}
              </div>
              <div className="text-sm text-gray-600">Ineligible Donors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {donors.reduce((sum, donor) => sum + (donor.donation_units || 1), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Units Available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
