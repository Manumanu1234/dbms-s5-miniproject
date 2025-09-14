import type { User, Donor, BloodReceiver, DonationEvent, DonationRecord, BloodInventory } from "./types"
import { apiClient } from "./api-client"

class ApiDataStore {
  // User management
  async getUsers(): Promise<User[]> {
    // This would typically be an admin-only endpoint
    const response = await apiClient.getDonors()
    return response.data || []
  }

  async saveUser(user: User): Promise<void> {
    // Users are managed through auth endpoints
    console.log("User management through auth endpoints")
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // This would require a search endpoint or getting current user
    const response = await apiClient.getCurrentUser()
    if (response.data && response.data.email === email) {
      return response.data as User
    }
    return null
  }

  // Donor management
  async getDonors(): Promise<Donor[]> {
    const response = await apiClient.getDonors()
    return response.data || []
  }

  async saveDonor(donor: Donor): Promise<void> {
    if (donor.id && donor.id.startsWith('donor-profile-')) {
      // Update existing donor
      await apiClient.updateDonorProfile(donor)
    } else {
      // Create new donor
      await apiClient.createDonorProfile(donor)
    }
  }

  async getDonorByUserId(userId: string): Promise<Donor | null> {
    const response = await apiClient.getMyDonorProfile()
    return response.data || null
  }

  // Blood receiver management
  async getReceivers(): Promise<BloodReceiver[]> {
    const response = await apiClient.getBloodRequests()
    return response.data || []
  }

  async saveReceiver(receiver: BloodReceiver): Promise<void> {
    if (receiver.id && receiver.id.startsWith('receiver-')) {
      // Update existing receiver
      await apiClient.updateBloodRequest(receiver.id, receiver)
    } else {
      // Create new receiver
      await apiClient.createBloodRequest(receiver)
    }
  }

  // Event management
  async getEvents(): Promise<DonationEvent[]> {
    const response = await apiClient.getEvents()
    return response.data || []
  }

  async saveEvent(event: DonationEvent): Promise<void> {
    if (event.id && event.id.startsWith('event-')) {
      // Update existing event
      await apiClient.updateEvent(event.id, event)
    } else {
      // Create new event
      await apiClient.createEvent(event)
    }
  }

  // Donation records
  async getDonationRecords(): Promise<DonationRecord[]> {
    const response = await apiClient.getDonationRecords()
    return response.data || []
  }

  async saveDonationRecord(record: DonationRecord): Promise<void> {
    if (record.id && record.id.startsWith('record-')) {
      // Update existing record
      await apiClient.updateTestResults(record.id, {
        hiv_test: record.testResults.hiv,
        hepatitis_b_test: record.testResults.hepatitisB,
        hepatitis_c_test: record.testResults.hepatitisC,
        syphilis_test: record.testResults.syphilis
      })
    } else {
      // Create new record
      await apiClient.createDonationRecord(record)
    }
  }

  // Blood inventory
  async getInventory(): Promise<BloodInventory[]> {
    const response = await apiClient.getBloodInventory()
    return response.data || []
  }

  async updateInventory(inventory: BloodInventory[]): Promise<void> {
    // Update each inventory item
    for (const item of inventory) {
      await apiClient.updateBloodInventory(item.id, item)
    }
  }

  // Initialize with sample data (this would be handled by the backend)
  async initializeSampleData(): Promise<void> {
    // Sample data is now initialized on the backend
    console.log("Sample data initialized on backend")
  }
}

export const apiDataStore = new ApiDataStore()
