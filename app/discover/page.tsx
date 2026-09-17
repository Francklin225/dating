'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '../../components/AppHeader'
import RequireCompleteProfile from '../../components/RequireCompleteProfile'
import { userService } from '@/lib/firestore'
import { likeService } from '@/lib/firestore'
import { User } from '@/types'

export default function DiscoverPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [likedProfiles, setLikedProfiles] = useState<string[]>([])
  const [passedProfiles, setPassedProfiles] = useState<string[]>([])
  const [showWhyModal, setShowWhyModal] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
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

      const discoverUsers = await userService.getDiscoverUsers(userId)
      setProfiles(discoverUsers)
      setCurrentIndex(0)
    } catch (error) {
      console.error('Error loading profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (profileId: string) => {
    try {
      if (!currentUser) return
      
      setDirection('right')
      await likeService.createLike(currentUser.id, profileId)
      setLikedProfiles([...likedProfiles, profileId])
      
      setTimeout(() => {
        setProfiles(profiles.filter(p => p.id !== profileId))
        setCurrentIndex(prev => Math.max(0, prev - 1))
        setDirection(null)
      }, 300)
      
      const isMutual = await likeService.isMutualLike(currentUser.id, profileId)
      if (isMutual) {
        showMatchAnimation()
      }
    } catch (error) {
      console.error('Error liking profile:', error)
    }
  }

  const handlePass = (profileId: string) => {
    setDirection('left')
    setPassedProfiles([...passedProfiles, profileId])
    
    setTimeout(() => {
      setProfiles(profiles.filter(p => p.id !== profileId))
      setCurrentIndex(prev => Math.max(0, prev - 1))
      setDirection(null)
    }, 300)
  }

  const showMatchAnimation = () => {
    // Could add a match overlay animation here
    alert('❤️ Vous avez un nouveau match !')
  }

  const handleShowWhy = (profileId: string) => {
    setShowWhyModal(profileId)
  }

  if (loading) {
    return (
      <div className="app-page">
        <AppHeader />
        <div className="loading-state-modern">
          <div className="loading-spinner-modern"></div>
          <p>Découverte de profils en cours...</p>
        </div>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="app-page">
        <AppHeader />
        <div className="empty-state-modern">
          <div className="empty-icon-modern">🌸</div>
          <h2>Aucun profil disponible</h2>
          <p>Nous n'avons pas trouvé de nouvelles suggestions pour le moment.</p>
          <button className="refresh-btn-modern" onClick={loadProfiles}>
            <span>🔄</span>
            Rafraîchir
          </button>
        </div>
      </div>
    )
  }

  const currentProfile = profiles[currentIndex]
  const compatibilityScore = Math.floor(Math.random() * 20) + 80

  return (
    <RequireCompleteProfile>
      <div className="app-page">
        <AppHeader />
      
      <div className="discover-page-modern">
        <div className="discover-container-modern">
          <div className="discover-header-modern">
            <div className="header-left">
              <h1>Découvrir</h1>
              <span className="profile-count">{profiles.length} profils</span>
            </div>
            <button 
              className={`filters-btn-modern ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M4 8h16"/>
                <path d="M4 12h8"/>
              </svg>
              Filtres
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel-modern">
              <div className="filters-grid">
                <div className="filter-item-modern">
                  <label>Âge</label>
                  <select className="filter-select-modern">
                    <option>18-25</option>
                    <option>25-30</option>
                    <option>30-35</option>
                    <option>35-40</option>
                    <option>40+</option>
                  </select>
                </div>
                
                <div className="filter-item-modern">
                  <label>Localisation</label>
                  <select className="filter-select-modern">
                    <option>Abidjan</option>
                    <option>Dakar</option>
                    <option>Yaoundé</option>
                    <option>Paris</option>
                    <option>Bruxelles</option>
                    <option>Montréal</option>
                  </select>
                </div>
                
                <div className="filter-item-modern">
                  <label>Objectif</label>
                  <select className="filter-select-modern">
                    <option>Relation sérieuse</option>
                    <option>Mariage</option>
                  </select>
                </div>
                
                <div className="filter-item-modern">
                  <label>Foi</label>
                  <select className="filter-select-modern">
                    <option>Très importante</option>
                    <option>Importante</option>
                    <option>Moyenne</option>
                  </select>
                </div>
              </div>
              
              <div className="filters-actions">
                <button className="reset-filters-btn">Réinitialiser</button>
                <button className="apply-filters-btn-modern">Appliquer</button>
              </div>
            </div>
          )}

          <div className={`profile-card-modern ${direction ? `swipe-${direction}` : ''}`}>
            <div className="card-image-section">
              <div className="photo-placeholder-modern">
                <span className="photo-initials-modern">{currentProfile.firstName?.[0] || '?'}</span>
                <div className="photo-gradient"></div>
              </div>
              
              <div className="compatibility-badge-modern">
                <div className="compatibility-ring">
                  <span className="compatibility-score-modern">{compatibilityScore}%</span>
                </div>
                <span className="compatibility-label-modern">Compatibilité</span>
              </div>

              <div className="card-indicators">
                <div className="indicator like-indicator">❤️</div>
                <div className="indicator pass-indicator">✕</div>
              </div>
            </div>

            <div className="card-content-section">
              <div className="profile-header-modern">
                <div className="name-section">
                  <h2 className="profile-name-modern">
                    {currentProfile.firstName}, {currentProfile.age}
                  </h2>
                  <div className="location-modern">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{currentProfile.city}, {currentProfile.country}</span>
                  </div>
                </div>
                <div className="objective-badge-modern">
                  {currentProfile.prefObjective === 'marriage' ? '💍 Mariage' : '❤️ Relation sérieuse'}
                </div>
              </div>

              <div className="profile-details-modern">
                <div className="values-row-modern">
                  {currentProfile.values?.slice(0, 3).map((value, index) => (
                    <span key={index} className="value-tag-modern">{value}</span>
                  ))}
                </div>

                <div className="faith-row-modern">
                  <div className="faith-icon">✝️</div>
                  <div className="faith-info">
                    <span className="faith-label-modern">Importance de la foi</span>
                    <span className="faith-value-modern">
                      {currentProfile.faithImportance === 'very_important' ? 'Très importante' : 
                       currentProfile.faithImportance === 'important' ? 'Importante' : 
                       currentProfile.faithImportance === 'moderate' ? 'Moyenne' : 'Peu importante'}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                className="why-btn-modern"
                onClick={() => handleShowWhy(currentProfile.id)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Pourquoi cette personne ?
              </button>
            </div>

            <div className="card-actions-modern">
              <button 
                className="action-btn-modern pass-btn-modern"
                onClick={() => handlePass(currentProfile.id)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Passer
              </button>
              
              <button 
                className="action-btn-modern super-like-btn-modern"
                onClick={() => handleLike(currentProfile.id)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                J'aime
              </button>
            </div>
          </div>

          {showWhyModal === currentProfile.id && (
            <div className="why-modal-overlay-modern" onClick={() => setShowWhyModal(null)}>
              <div className="why-modal-modern" onClick={(e) => e.stopPropagation()}>
                <div className="why-modal-header-modern">
                  <div className="modal-icon">💡</div>
                  <h3>Pourquoi cette personne ?</h3>
                  <button 
                    className="close-modal-btn-modern"
                    onClick={() => setShowWhyModal(null)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <div className="why-modal-content-modern">
                  <p className="why-intro-modern">
                    Vous partagez plusieurs points importants :
                  </p>
                  <ul className="why-list-modern">
                    <li>
                      <span className="why-icon-modern">✓</span>
                      <span>Vous recherchez tous les deux une relation sérieuse.</span>
                    </li>
                    <li>
                      <span className="why-icon-modern">✓</span>
                      <span>La famille occupe une place importante pour vous deux.</span>
                    </li>
                    <li>
                      <span className="why-icon-modern">✓</span>
                      <span>Vous accordez tous les deux une place importante à la foi.</span>
                    </li>
                    <li>
                      <span className="why-icon-modern">✓</span>
                      <span>Vous avez plusieurs centres d'intérêt communs.</span>
                    </li>
                  </ul>
                  <p className="why-disclaimer-modern">
                    Compatibilité basée sur vos préférences et vos réponses.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </RequireCompleteProfile>
  )
}