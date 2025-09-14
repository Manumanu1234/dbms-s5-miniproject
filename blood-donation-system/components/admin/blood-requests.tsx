"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import type { BloodReceiver } from "@/lib/types"
import { Search, Heart, Phone, Mail, MapPin, Calendar, AlertTriangle, User, Stethoscope } from "lucide-react"

export function BloodRequestsManagement() {
  const [receivers, setReceivers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredReceivers, setFilteredReceivers] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBloodRequests = async () => {
      try {
        console.log('Fetching blood receivers...')
        const response = await apiClient.getBloodRequests()
        console.log('Blood receivers API response:', response)
        
        if (response.error) {
          console.error('Error fetching blood receivers:', response.error)
          return
        }
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Blood receivers data:', response.data)
          setReceivers(response.data)
          console.log(`Loaded ${response.data.length} blood receivers`)
        } else {
          console.log('No blood receivers data in response')
          setReceivers([])
        }
      } catch (error) {
        console.error('Error fetching blood receivers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBloodRequests()
  }, [])

  useEffect(() => {
    let filtered = receivers.filter(
      (receiver) => {
        const name = receiver.name || receiver.patient_name || ''
        const email = receiver.email || ''
        const bloodType = receiver.blood_type || receiver.bloodType || ''
        const hospitalName = receiver.hospital_name || receiver.hospitalName || ''
        
        return (receiver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         receiver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         receiver.blood_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         receiver.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" || receiver.status === statusFilter) &&
        (urgencyFilter === "all" || receiver.urgency_level === urgencyFilter)
      }
    )

    setFilteredReceivers(filtered)
  }, [searchTerm, receivers, statusFilter, urgencyFilter])

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      console.log('Updating request status:', { requestId, newStatus })
      const response = await apiClient.updateRequestStatus(requestId, newStatus)
      console.log('Status update response:', response)
      
      if (response.error) {
        console.error('Failed to update status:', response.error)
        return
      }
      
      setReceivers(receivers.map((r) => 
        r.id === requestId ? { ...r, status: newStatus } : r
      ))
    } catch (error) {
      console.error('Error updating request status:', error)
    }
  }

  const getUrgencyBadge = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case "critical":
        return (
          <Badge variant="destructive" className="animate-pulse">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        )
      case "high":
        return <Badge className="bg-orange-600">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-600">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">{urgencyLevel}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "fulfilled":
        return <Badge className="bg-green-600">Fulfilled</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Blood Requests</h2>
            <p className="text-gray-600">Manage blood requests from hospitals and patients</p>
          </div>
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-200 p-3 rounded-full w-12 h-12"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Receivers Management</h1>
          <p className="text-gray-600">Manage and track blood receivers and their requests</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search receivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredReceivers.map((receiver) => {
          const name = receiver.name || 'N/A'
          const email = receiver.email || 'N/A'
          const phone = receiver.phone || 'N/A'
          const bloodType = receiver.blood_type || 'N/A'
          const urgencyLevel = receiver.urgency_level || 'medium'
          const unitsNeeded = receiver.units_needed || 1
          const hospitalName = receiver.hospital_name || 'Not specified'
          const doctorName = receiver.doctor_name || 'Not specified'
          const requestDate = receiver.request_date || receiver.created_at
          const medicalCondition = receiver.medical_condition || 'Not specified'
          
          return (
            <Card key={receiver.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-3 rounded-full">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{name}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {bloodType}
                    </Badge>
                    {getUrgencyBadge(urgencyLevel)}
                    {getStatusBadge(receiver.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium text-gray-700">Units Needed:</span>
                    <p className="text-gray-900">{unitsNeeded}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hospital:</span>
                    <p className="text-gray-900">{hospitalName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Doctor:</span>
                    <p className="text-gray-900">{doctorName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Request Date:</span>
                    <p className="text-gray-900">{new Date(requestDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {medicalCondition && (
                  <div className="mb-4">
                    <span className="font-medium text-gray-700">Medical Condition:</span>
                    <p className="text-gray-900 mt-1">{medicalCondition}</p>
                  </div>
                )}
                <div className="flex justify-end">
                  <Select
                    value={receiver.status}
                    onValueChange={(value) => handleStatusChange(receiver.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredReceivers.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No blood receivers found matching your criteria.</p>
              <p className="text-sm text-gray-400 mt-2">
                Total receivers loaded: {receivers.length}
              </p>
              <p className="text-sm text-gray-400">
                Check console for API response details.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
