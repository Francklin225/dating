import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  arrayUnion,
  increment
} from 'firebase/firestore'
import { db } from '../firebase'
import { User } from '@/types'

const USERS_COLLECTION = 'users'

export const userService = {
  // Create a new user
  async createUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await setDoc(userRef, {
      ...userData,
      profileCompletion: 0,
      isComplete: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User
    }
    return null
  },

  // Update user
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    })
  },

  // Update profile completion
  async updateProfileCompletion(userId: string, completion: number): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      profileCompletion: completion,
      isComplete: completion >= 100,
      updatedAt: new Date()
    })
  },

  // Get users for discovery (with filters)
  async getDiscoverUsers(
    currentUserId: string,
    filters?: {
      ageMin?: number
      ageMax?: number
      country?: string
      city?: string
      objective?: 'serious' | 'marriage'
      faithImportance?: string
    }
  ): Promise<User[]> {
    let q = query(
      collection(db, USERS_COLLECTION),
      where('isActive', '==', true),
      where('isComplete', '==', true),
      limit(20)
    )

    // Apply filters
    if (filters?.ageMin && filters?.ageMax) {
      // Note: Firestore doesn't support range queries on multiple fields without composite indexes
      // For now, we'll filter client-side or create composite indexes in Firebase console
    }

    const querySnapshot = await getDocs(q)
    const users = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as User)
      .filter(user => user.id !== currentUserId)

    return users
  },

  // Search users by name or location
  async searchUsers(searchTerm: string): Promise<User[]> {
    // Note: For better search, consider using Algolia or a dedicated search service
    const q = query(
      collection(db, USERS_COLLECTION),
      where('isActive', '==', true),
      limit(20)
    )

    const querySnapshot = await getDocs(q)
    const users = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as User)
      .filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )

    return users
  },

  // Add photo to user
  async addPhoto(userId: string, photoUrl: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      photos: arrayUnion(photoUrl),
      updatedAt: new Date()
    })
  },

  // Remove photo from user
  async removePhoto(userId: string, photoUrl: string): Promise<void> {
    const user = await this.getUserById(userId)
    if (user?.photos) {
      const updatedPhotos = user.photos.filter(p => p !== photoUrl)
      await this.updateUser(userId, { photos: updatedPhotos })
    }
  },

  // Set main photo
  async setMainPhoto(userId: string, photoUrl: string): Promise<void> {
    await this.updateUser(userId, { mainPhoto: photoUrl })
  },

  // Deactivate user
  async deactivateUser(userId: string): Promise<void> {
    await this.updateUser(userId, { isActive: false })
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      isActive: false,
      deletedAt: new Date()
    })
  }
}