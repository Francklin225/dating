export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: Date
  updatedAt: Date
  
  // Profile Information
  gender?: 'male' | 'female'
  age?: number
  address?: string
  city?: string
  country?: string
  profession?: string
  education?: string
  languages?: string[]
  interests?: string[]
  
  // Faith & Values
  faithRelation?: string
  faithImportance?: 'very_important' | 'important' | 'moderate' | 'low'
  community?: string
  faithInRelationship?: string
  values?: string[]
  
  // Vision of Couple
  whyHere?: string
  seriousRelationship?: string
  faithInCouple?: string
  wantsMarriage?: boolean
  wantsChildren?: boolean
  communicationImportance?: string
  livingLocation?: string
  lifeProjects?: string
  
  // Photos
  photos?: string[]
  mainPhoto?: string
  
  // Search Preferences
  prefAgeMin?: number
  prefAgeMax?: number
  prefDistance?: number
  prefObjective?: 'serious' | 'marriage'
  prefFaithImportance?: 'very_important' | 'important' | 'moderate' | 'low'
  prefWantsChildren?: boolean
  
  // Profile Completion
  profileCompletion: number
  
  // Account Status
  isComplete: boolean
  isActive: boolean
}

export interface Match {
  id: string
  userId1: string
  userId2: string
  matchedAt: Date
  compatibilityScore: number
}

export interface Like {
  id: string
  fromUserId: string
  toUserId: string
  createdAt: Date
}

export interface Message {
  id: string
  conversationId: string
  fromUserId: string
  toUserId: string
  text: string
  createdAt: Date
  read: boolean
}

export interface Conversation {
  id: string
  userId1: string
  userId2: string
  lastMessageAt: Date
  lastMessage?: string
  unreadCount1: number
  unreadCount2: number
}

export interface Report {
  id: string
  reporterId: string
  reportedUserId: string
  reason: 'fake_profile' | 'scam' | 'harassment' | 'inappropriate' | 'sexual_content' | 'spam' | 'money_request' | 'other'
  description?: string
  createdAt: Date
  status: 'pending' | 'reviewed' | 'resolved'
}

export interface Block {
  id: string
  blockerId: string
  blockedUserId: string
  createdAt: Date
}