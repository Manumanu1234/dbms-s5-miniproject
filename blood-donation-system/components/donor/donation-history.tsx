"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import { authManager } from "@/lib/auth"
import type { DonationRecord, Donor } from "@/lib/types"
import { Calendar, Droplets, MapPin, FileText, Award } from "lucide-react"

export function DonationHistory() {
  const [records, setRecords] = useState<any[]>([])
  const [donor, setDonor] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDonationHistory = async () => {
      try {
        setLoading(true)
        const currentUser = authManager.getCurrentUser()
        if (currentUser) {
          // Fetch donor profile and donation records in parallel
          const [donorResponse, recordsResponse] = await Promise.all([
            apiClient.getMyDonorProfile(),
            apiClient.getMyDonationRecords()
          ])

          if (donorResponse.data) {
            setDonor(donorResponse.data)
          }

          if (recordsResponse.data) {
            const sortedRecords = (recordsResponse.data as any[]).sort((a, b) => {
              const dateA = new Date(a.donation_date || a.donationDate)
              const dateB = new Date(b.donation_date || b.donationDate)
              return dateB.getTime() - dateA.getTime()
            })
            setRecords(sortedRecords)
          }
        }
      } catch (error) {
        console.error('Error fetching donation history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDonationHistory()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "collected":
        return <Badge variant="secondary">Collected</Badge>
      case "tested":
        return <Badge variant="default">Testing</Badge>
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTotalDonations = () => {
    return records.filter((record) => record.status === "approved").length
  }

  const getTotalUnits = () => {
    return records
      .filter((record) => record.status === "approved")
      .reduce((sum, record) => sum + (record.units_collected || record.unitsCollected || 0), 0)
  }

  const getLastDonationDate = () => {
    const approvedRecords = records.filter((record) => record.status === "approved")
    if (approvedRecords.length === 0) return null
    const donationDate = approvedRecords[0].donation_date || approvedRecords[0].donationDate
    return new Date(donationDate).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-200 p-2 rounded-full w-9 h-9"></div>
                  <div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!donor) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Please complete your donor profile first.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Award className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{getTotalDonations()}</p>
                <p className="text-sm text-gray-600">Total Donations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{getTotalUnits()}</p>
                <p className="text-sm text-gray-600">Units Donated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{getLastDonationDate() || "Never"}</p>
                <p className="text-sm text-gray-600">Last Donation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donation Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-red-600" />
            <span>Donation History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No donation records found.</p>
              <p className="text-sm text-gray-400 mt-2">
                Your donation history will appear here after your first donation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => {
                const donationDate = record.donation_date || record.donationDate
                const bloodType = record.blood_type || record.bloodType
                const unitsCollected = record.units_collected || record.unitsCollected || 0
                const eventId = record.event_id || record.eventId
                
                return (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{new Date(donationDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Droplets className="h-4 w-4 text-red-500" />
                            <span className="text-red-600 font-medium">{bloodType}</span>
                          </div>
                          <span className="text-gray-600">{unitsCollected} units</span>
                        </div>

                        {eventId && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <MapPin className="h-3 w-3" />
                            <span>Donation Event</span>
                          </div>
                        )}

                        {record.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Notes:</strong> {record.notes}
                          </p>
                        )}

                        {record.status === "approved" && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Test Results:</strong> All tests passed ✓
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(record.status)}
                        {record.status === "approved" && (
                          <div className="text-xs text-green-600 font-medium">Lives Saved: ~3</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
