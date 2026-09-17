'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppHeader from '../../components/AppHeader'
import RequireCompleteProfile from '../../components/RequireCompleteProfile'
import { messageService } from '@/lib/firestore'
import { userService } from '@/lib/firestore'
import { Conversation, Message, User } from '@/types'

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState<{ [key: string]: User }>({})
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    loadConversations()
    
    const targetUserId = searchParams.get('userId')
    if (targetUserId) {
      loadConversationWithUser(targetUserId)
    }
  }, [searchParams])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) {
        router.push('/login')
        return
      }

      const user = await userService.getUserById(userId)
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUser(user)

      const userConversations = await messageService.getUserConversations(userId)
      setConversations(userConversations)

      const usersData: { [key: string]: User } = {}
      for (const conv of userConversations) {
        const otherUserId = conv.userId1 === userId ? conv.userId2 : conv.userId1
        const otherUser = await userService.getUserById(otherUserId)
        if (otherUser) {
          usersData[otherUserId] = otherUser
        }
      }
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadConversationWithUser = async (targetUserId: string) => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) return

      let conversation = await messageService.getConversation(userId, targetUserId)
      
      if (!conversation) {
        const conversationId = await messageService.createConversation(userId, targetUserId)
        conversation = await messageService.getConversation(userId, targetUserId)
      }

      if (conversation) {
        setSelectedConversation(conversation.id)
        loadMessages(conversation.id)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const convMessages = await messageService.getConversationMessages(conversationId)
      setMessages(convMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return
    
    try {
      const conv = conversations.find(c => c.id === selectedConversation)
      if (!conv) return

      const otherUserId = conv.userId1 === currentUser.id ? conv.userId2 : conv.userId1
      
      await messageService.sendMessage(
        selectedConversation,
        currentUser.id,
        otherUserId,
        newMessage
      )
      
      setMessages([...messages, {
        id: Date.now().toString(),
        conversationId: selectedConversation,
        fromUserId: currentUser.id,
        toUserId: otherUserId,
        text: newMessage,
        createdAt: new Date(),
        read: false
      }])
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation)
  const otherUserId = selectedConv && currentUser ? (selectedConv.userId1 === currentUser.id ? selectedConv.userId2 : selectedConv.userId1) : null
  const otherUser = otherUserId ? users[otherUserId] : null

  if (loading) {
    return (
      <div className="app-page">
        <AppHeader />
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des messages...</p>
        </div>
      </div>
    )
  }

  if (!selectedConversation) {
    return (
      <div className="app-page">
        <AppHeader />
        
        <div className="messages-page">
          <div className="messages-container">
            <h1 className="page-title">Messages</h1>
            
            {conversations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h2>Aucun message</h2>
                <p>Commencez à découvrir des profils pour faire de nouvelles rencontres.</p>
                <button className="btn-primary" onClick={() => router.push('/discover')}>Découvrir des profils</button>
              </div>
            ) : (
              <div className="conversations-list">
                {conversations.map((conv) => {
                  const userId = conv.userId1 === currentUser?.id ? conv.userId2 : conv.userId1
                  const user = users[userId]
                  
                  if (!user) return null
                  
                  const unreadCount = conv.userId1 === currentUser?.id ? conv.unreadCount1 : conv.unreadCount2
                  
                  return (
                    <div 
                      key={conv.id}
                      className={`conversation-item ${unreadCount > 0 ? 'unread' : ''}`}
                      onClick={() => {
                        setSelectedConversation(conv.id)
                        loadMessages(conv.id)
                      }}
                    >
                      <div className="conversation-photo">
                        <div className="photo-placeholder">
                          <span className="photo-initials">{user.firstName?.[0] || '?'}</span>
                        </div>
                      </div>
                      
                      <div className="conversation-info">
                        <div className="conversation-header">
                          <h3 className="conversation-name">
                            {user.firstName}, {user.age}
                          </h3>
                          <span className="conversation-time">
                            {new Date(conv.lastMessageAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="conversation-message">{conv.lastMessage || 'Aucun message'}</p>
                      </div>
                      
                      {unreadCount > 0 && (
                        <div className="unread-badge">{unreadCount}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-page">
      <AppHeader />
      
      <div className="messages-page conversation-view">
        <div className="conversation-header">
          <button 
            className="back-btn"
            onClick={() => setSelectedConversation(null)}
          >
            ← Retour
          </button>
          <div className="conversation-user">
            <div className="user-photo">
              <div className="photo-placeholder">
                <span className="photo-initials">{otherUser?.firstName?.[0] || '?'}</span>
              </div>
            </div>
            <div className="user-info">
              <h3 className="user-name">{otherUser?.firstName} {otherUser?.lastName}</h3>
              <p className="user-location">{otherUser?.city}, {otherUser?.country}</p>
            </div>
          </div>
          <button className="options-btn">⋮</button>
        </div>

        <div className="messages-list">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`message ${message.fromUserId === currentUser?.id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p className="message-text">{message.text}</p>
                <span className="message-time">
                  {new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="message-input-section">
          <div className="message-input-container">
            <input
              type="text"
              className="message-input"
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <RequireCompleteProfile>
      <Suspense fallback={
        <div className="app-page">
          <AppHeader />
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement...</p>
          </div>
        </div>
      }>
        <MessagesContent />
      </Suspense>
    </RequireCompleteProfile>
  )
}
