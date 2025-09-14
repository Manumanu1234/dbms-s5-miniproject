// API Client for Blood Donation System
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.refreshToken()
  }

  private refreshToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('blood_donation_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Refresh token before each request to ensure we have the latest token
    this.refreshToken()
    
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('API Error Response:', errorData)
        
        // Handle authentication errors specifically
        if (response.status === 401 || (errorData.detail && errorData.detail.includes('Not authenticated'))) {
          console.log('Authentication error detected, clearing token')
          this.token = null
          if (typeof window !== 'undefined') {
            localStorage.removeItem('blood_donation_token')
            localStorage.removeItem('blood_donation_current_user')
          }
          throw new Error('Authentication required. Please log in again.')
        }
        
        let errorMessage = `HTTP error! status: ${response.status}`
        
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
        
        console.log('Extracted error message:', errorMessage)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.log('Final API error:', errorMessage)
      return { error: errorMessage }
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.data) {
      this.token = response.data.access_token
      if (typeof window !== 'undefined') {
        localStorage.setItem('blood_donation_token', this.token)
      }
    }

    return response
  }

  async register(email: string, password: string, role: 'admin' | 'donor' | 'receiver' = 'donor') {
    console.log('API Client register called with:', { email, role })
    
    // Convert receiver role to backend format
    const backendRole = role === 'receiver' ? 'recv' : role
    
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: backendRole }),
    })
    console.log('API Client response:', response)
    return response
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  logout() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('blood_donation_token')
    }
  }

  // Donors
  async getDonors() {
    return this.request('/donors/')
  }

  async getMyDonorProfile() {
    return this.request('/donors/me')
  }

  async createDonorProfile(donorData: any) {
    console.log('API Client creating donor profile with:', donorData)
    const response = await this.request('/donors/', {
      method: 'POST',
      body: JSON.stringify(donorData),
    })
    console.log('API Client donor profile response:', response)
    return response
  }

  async updateDonorProfile(donorData: any) {
    return this.request('/donors/me', {
      method: 'PUT',
      body: JSON.stringify(donorData),
    })
  }

  async updateDonorEligibility(donorId: string, isEligible: boolean) {
    return this.request(`/donors/${donorId}/eligibility`, {
      method: 'PUT',
      body: JSON.stringify({ is_eligible: isEligible }),
    })
  }

  // Blood Inventory
  async getBloodInventory() {
    return this.request('/blood-inventory/')
  }

  async updateBloodInventory(inventoryId: string, data: any) {
    return this.request(`/blood-inventory/${inventoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateBloodUnits(inventoryId: string, unitsChange: number) {
    return this.request(`/blood-inventory/${inventoryId}/units`, {
      method: 'PUT',
      body: JSON.stringify({ units_change: unitsChange }),
    })
  }

  // Blood Requests
  async getBloodRequests(status?: string, urgencyLevel?: string) {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (urgencyLevel) params.append('urgency_level', urgencyLevel)
    
    const queryString = params.toString()
    return this.request(`/blood-requests/${queryString ? `?${queryString}` : ''}`)
  }

  async createBloodRequest(requestData: any) {
    return this.request('/blood-requests/', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async updateBloodRequest(requestId: string, data: any) {
    return this.request(`/blood-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateRequestStatus(requestId: string, status: string) {
    return this.request(`/blood-requests/${requestId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ new_status: status }),
    })
  }

  // Events
  async getEvents(status?: string) {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    
    const queryString = params.toString()
    return this.request(`/events/${queryString ? `?${queryString}` : ''}`)
  }

  async createEvent(eventData: any) {
    return this.request('/events/', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  }

  async updateEvent(eventId: string, data: any) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteEvent(eventId: string) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    })
  }

  async registerForEvent(eventId: string, donorId: string) {
    return this.request(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ donor_id: donorId }),
    })
  }

  async unregisterFromEvent(eventId: string, donorId: string) {
    return this.request(`/events/${eventId}/unregister`, {
      method: 'POST',
      body: JSON.stringify({ donor_id: donorId }),
    })
  }

  // Donation Records
  async getDonationRecords(donorId?: string) {
    const params = new URLSearchParams()
    if (donorId) params.append('donor_id', donorId)
    
    const queryString = params.toString()
    return this.request(`/donation-records/${queryString ? `?${queryString}` : ''}`)
  }

  async getMyDonationRecords() {
    return this.request('/donation-records/my-records')
  }

  async createDonationRecord(recordData: any) {
    return this.request('/donation-records/', {
      method: 'POST',
      body: JSON.stringify(recordData),
    })
  }

  async updateTestResults(recordId: string, testResults: any) {
    return this.request(`/donation-records/${recordId}/test-results`, {
      method: 'PUT',
      body: JSON.stringify(testResults),
    })
  }

  // Receivers
  async getReceivers() {
    return this.request('/receivers/')
  }

  async getMyReceiverProfile() {
    return this.request('/receivers/me')
  }

  async createReceiverProfile(receiverData: any) {
    console.log('API Client creating receiver profile with:', receiverData)
    const response = await this.request('/receivers/', {
      method: 'POST',
      body: JSON.stringify(receiverData),
    })
    console.log('API Client receiver profile response:', response)
    return response
  }

  async updateReceiverProfile(receiverData: any) {
    return this.request('/receivers/me', {
      method: 'PUT',
      body: JSON.stringify(receiverData),
    })
  }

  // Blood Requests (Updated)
  async getMyBloodRequests() {
    return this.request('/blood-requests/my-requests')
  }

  async createMyBloodRequest(requestData: any) {
    console.log('Creating blood request with data:', requestData)
    const response = await this.request('/blood-requests/', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
    console.log('Blood request creation response:', response)
    return response
  }

  async updateMyBloodRequest(requestId: string, data: any) {
    return this.request(`/blood-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMyBloodRequest(requestId: string) {
    return this.request(`/blood-requests/${requestId}`, {
      method: 'DELETE',
    })
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats')
  }

  // Enhanced Blood Inventory with Donor Information
  async getBloodInventoryWithDonorInfo() {
    const [inventoryResponse, donorsResponse, donationRecordsResponse] = await Promise.all([
      this.getBloodInventory(),
      this.getDonors(),
      this.request('/donation-records/')
    ])

    return {
      data: {
        inventory: inventoryResponse.data || [],
        donors: donorsResponse.data || [],
        donationRecords: donationRecordsResponse.data || []
      }
    }
  }

  async getEligibleDonors() {
    return this.request('/donors/eligible')
  }

  async getIneligibleDonors() {
    return this.request('/donors/ineligible')
  }
}

export const apiClient = new ApiClient()
