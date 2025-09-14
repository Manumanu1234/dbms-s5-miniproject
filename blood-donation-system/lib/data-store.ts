import type { User, Donor, BloodReceiver, DonationEvent, DonationRecord, BloodInventory } from "./types"

class DataStore {
  private getFromStorage<T>(key: string): T[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(key, JSON.stringify(data))
  }

  // User management
  getUsers(): User[] {
    return this.getFromStorage<User>("blood_donation_users")
  }

  saveUser(user: User): void {
    const users = this.getUsers()
    const existingIndex = users.findIndex((u) => u.id === user.id)
    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }
    this.saveToStorage("blood_donation_users", users)
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find((u) => u.email === email) || null
  }

  // Donor management
  getDonors(): Donor[] {
    return this.getFromStorage<Donor>("blood_donation_donors")
  }

  saveDonor(donor: Donor): void {
    const donors = this.getDonors()
    const existingIndex = donors.findIndex((d) => d.id === donor.id)
    if (existingIndex >= 0) {
      donors[existingIndex] = donor
    } else {
      donors.push(donor)
    }
    this.saveToStorage("blood_donation_donors", donors)
  }

  getDonorByUserId(userId: string): Donor | null {
    const donors = this.getDonors()
    return donors.find((d) => d.userId === userId) || null
  }

  // Blood receiver management
  getReceivers(): BloodReceiver[] {
    return this.getFromStorage<BloodReceiver>("blood_donation_receivers")
  }

  saveReceiver(receiver: BloodReceiver): void {
    const receivers = this.getReceivers()
    const existingIndex = receivers.findIndex((r) => r.id === receiver.id)
    if (existingIndex >= 0) {
      receivers[existingIndex] = receiver
    } else {
      receivers.push(receiver)
    }
    this.saveToStorage("blood_donation_receivers", receivers)
  }

  // Event management
  getEvents(): DonationEvent[] {
    return this.getFromStorage<DonationEvent>("blood_donation_events")
  }

  saveEvent(event: DonationEvent): void {
    const events = this.getEvents()
    const existingIndex = events.findIndex((e) => e.id === event.id)
    if (existingIndex >= 0) {
      events[existingIndex] = event
    } else {
      events.push(event)
    }
    this.saveToStorage("blood_donation_events", events)
  }

  // Donation records
  getDonationRecords(): DonationRecord[] {
    return this.getFromStorage<DonationRecord>("blood_donation_records")
  }

  saveDonationRecord(record: DonationRecord): void {
    const records = this.getDonationRecords()
    const existingIndex = records.findIndex((r) => r.id === record.id)
    if (existingIndex >= 0) {
      records[existingIndex] = record
    } else {
      records.push(record)
    }
    this.saveToStorage("blood_donation_records", records)
  }

  // Blood inventory
  getInventory(): BloodInventory[] {
    const defaultInventory: BloodInventory[] = [
      { bloodType: "A+", unitsAvailable: 25, expiryDate: "2024-12-31", lastUpdated: new Date().toISOString() },
      { bloodType: "A-", unitsAvailable: 15, expiryDate: "2024-12-31", lastUpdated: new Date().toISOString() },
      { bloodType: "B+", unitsAvailable: 20, expiryDate: "2024-12-31", lastUpdated: new Date().toISOString() },
      { bloodType: "B-", unitsAvailable: 10, expiryDate: "2024-12-31", lastUpdated: new Date().toISOString() },
      { bloodType: "AB+", unitsAvailable: 8, expiryDate: "2024-12-31", lastUpdated: new Date().toISOString() },
      { bloodType: "AB-", unitsAvailable: 5, expiryDate: "2024-12-31", lastUpdated: new Date().toISOString() },
      { bloodType: "O+", unitsAvailable: 30, expiryDate: "2024-12-31", lastUpdated: new Date().toISOString() },
      { bloodType: "O-", unitsAvailable: 18, expiryDate: "2024-12-31", lastUpdated: new Date().toISOString() },
    ]

    const inventory = this.getFromStorage<BloodInventory>("blood_donation_inventory")
    if (inventory.length === 0) {
      this.saveToStorage("blood_donation_inventory", defaultInventory)
      return defaultInventory
    }
    return inventory
  }

  updateInventory(inventory: BloodInventory[]): void {
    this.saveToStorage("blood_donation_inventory", inventory)
  }

  // Initialize with sample data
  initializeSampleData(): void {
    // Create admin user
    const adminUser: User = {
      id: "admin-1",
      email: "admin@bloodbank.com",
      password: "admin123",
      role: "admin",
      createdAt: new Date().toISOString(),
    }
    this.saveUser(adminUser)

    // Create sample donor user
    const donorUser: User = {
      id: "donor-1",
      email: "john.doe@email.com",
      password: "donor123",
      role: "donor",
      createdAt: new Date().toISOString(),
    }
    this.saveUser(donorUser)

    // Create sample donor profile
    const sampleDonor: Donor = {
      id: "donor-profile-1",
      userId: "donor-1",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1-555-0123",
      bloodType: "O+",
      age: 28,
      weight: 70,
      address: "123 Main St, City, State 12345",
      medicalHistory: "No significant medical history",
      lastDonationDate: "2024-08-15",
      isEligible: true,
      createdAt: new Date().toISOString(),
    }
    this.saveDonor(sampleDonor)

    // Create sample blood receiver
    const sampleReceiver: BloodReceiver = {
      id: "receiver-1",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1-555-0456",
      bloodType: "A+",
      urgencyLevel: "high",
      unitsNeeded: 3,
      hospitalName: "City General Hospital",
      doctorName: "Dr. Wilson",
      medicalCondition: "Surgery preparation",
      requestDate: new Date().toISOString(),
      status: "pending",
    }
    this.saveReceiver(sampleReceiver)

    // Create sample donation event
    const sampleEvent: DonationEvent = {
      id: "event-1",
      title: "Community Blood Drive",
      description: "Join us for our monthly community blood drive to help save lives in our community.",
      date: "2024-12-20",
      time: "09:00",
      location: "Community Center",
      address: "456 Community Ave, City, State 12345",
      capacity: 50,
      registeredDonors: ["donor-profile-1"],
      organizer: "City Blood Bank",
      status: "upcoming",
      createdAt: new Date().toISOString(),
    }
    this.saveEvent(sampleEvent)
  }
}

export const dataStore = new DataStore()

// Initialize sample data on first load
if (typeof window !== "undefined" && !localStorage.getItem("blood_donation_initialized")) {
  dataStore.initializeSampleData()
  localStorage.setItem("blood_donation_initialized", "true")
}
