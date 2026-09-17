'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '../../components/AppHeader'
import RequireCompleteProfile from '../../components/RequireCompleteProfile'
import { userService } from '@/lib/firestore'
import { User } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) {
        router.push('/login')
        return
      }

      const userData = await userService.getUserById(userId)
      if (!userData) {
        router.push('/login')
        return
      }
      setUser(userData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="app-page">
        <AppHeader />
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app-page">
        <AppHeader />
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <h2>Profil non trouvé</h2>
          <button className="btn-primary" onClick={() => router.push('/login')}>Se connecter</button>
        </div>
      </div>
    )
  }

  return (
    <RequireCompleteProfile>
      <div className="app-page">
        <AppHeader />
      
        <div className="profile-page">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-photo-section">
                <div className="profile-photo-large">
                  <div className="photo-placeholder">
                    <span className="photo-initials">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  </div>
                  <button className="add-photo-btn">+</button>
                </div>
              </div>
              
              <div className="profile-summary">
                <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
                <p className="profile-details">{user.age} ans · {user.city}, {user.country}</p>
                <p className="profile-profession">{user.profession}</p>
              </div>
            </div>

            <div className="profile-completion">
              <div className="completion-header">
                <h3>Profil complété à {user.profileCompletion}%</h3>
                <button className="complete-profile-btn">
                  Compléter mon profil
                </button>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${user.profileCompletion}%` }}
                ></div>
              </div>
            </div>

            <div className="profile-sections">
              <div className="profile-section">
                <div className="section-header">
                  <h3>Informations</h3>
                  <button className="edit-btn">Modifier</button>
                </div>
                <div className="section-content">
                  <div className="info-row">
                    <span className="info-label">Prénom</span>
                    <span className="info-value">{user.firstName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nom</span>
                    <span className="info-value">{user.lastName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Sexe</span>
                    <span className="info-value">{user.gender === 'male' ? 'Homme' : user.gender === 'female' ? 'Femme' : ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Âge</span>
                    <span className="info-value">{user.age} ans</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ville</span>
                    <span className="info-value">{user.city}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Pays</span>
                    <span className="info-value">{user.country}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Profession</span>
                    <span className="info-value">{user.profession}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Études</span>
                    <span className="info-value">{user.education}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Langues</span>
                    <span className="info-value">{user.languages?.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h3>Ma foi</h3>
                  <button className="edit-btn">Modifier</button>
                </div>
                <div className="section-content">
                  <div className="faith-item">
                    <span className="faith-label">Relation avec Dieu</span>
                    <span className="faith-value">{user.faithRelation}</span>
                  </div>
                  <div className="faith-item">
                    <span className="faith-label">Importance de la foi</span>
                    <span className="faith-value">
                      {user.faithImportance === 'very_important' ? 'Très importante' : 
                       user.faithImportance === 'important' ? 'Importante' : 
                       user.faithImportance === 'moderate' ? 'Moyenne' : 'Peu importante'}
                    </span>
                  </div>
                  <div className="faith-item">
                    <span className="faith-label">Communauté</span>
                    <span className="faith-value">{user.community}</span>
                  </div>
                  <div className="faith-item">
                    <span className="faith-label">Foi dans le couple</span>
                    <span className="faith-value">{user.faithInRelationship}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h3>Mes valeurs</h3>
                  <button className="edit-btn">Modifier</button>
                </div>
                <div className="section-content">
                  <div className="values-list">
                    {user.values?.map((value, index) => (
                      <span key={index} className="value-tag">{value}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h3>Ma vision du couple</h3>
                  <button className="edit-btn">Modifier</button>
                </div>
                <div className="section-content">
                  <div className="vision-item">
                    <span className="vision-label">Pourquoi suis-je ici ?</span>
                    <p className="vision-text">{user.whyHere}</p>
                  </div>
                  <div className="vision-item">
                    <span className="vision-label">Relation sérieuse</span>
                    <p className="vision-text">{user.seriousRelationship}</p>
                  </div>
                  <div className="vision-item">
                    <span className="vision-label">Place de la foi</span>
                    <p className="vision-text">{user.faithInCouple}</p>
                  </div>
                  <div className="vision-item">
                    <span className="vision-label">Mariage</span>
                    <p className="vision-text">{user.wantsMarriage ? 'Oui, je souhaite me marier' : 'Non pour le moment'}</p>
                  </div>
                  <div className="vision-item">
                    <span className="vision-label">Enfants</span>
                    <p className="vision-text">{user.wantsChildren ? 'Oui, je souhaite avoir des enfants' : 'Non pour le moment'}</p>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h3>Centres d'intérêt</h3>
                  <button className="edit-btn">Modifier</button>
                </div>
                <div className="section-content">
                  <div className="interests-list">
                    {user.interests?.map((interest, index) => (
                      <span key={index} className="interest-tag">🎵 {interest}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <h3>Préférences de recherche</h3>
                  <button className="edit-btn">Modifier</button>
                </div>
                <div className="section-content">
                  <div className="preference-row">
                    <span className="preference-label">Âge</span>
                    <span className="preference-value">{user.prefAgeMin}-{user.prefAgeMax} ans</span>
                  </div>

                  <div className="preference-row">
                    <span className="preference-label">Objectif</span>
                    <span className="preference-value">
                      {user.prefObjective === 'marriage' ? 'Mariage' : 'Relation sérieuse'}
                    </span>
                  </div>
                  <div className="preference-row">
                    <span className="preference-label">Importance de la foi</span>
                    <span className="preference-value">
                      {user.prefFaithImportance === 'very_important' ? 'Très importante' : 
                       user.prefFaithImportance === 'important' ? 'Importante' : 
                       user.prefFaithImportance === 'moderate' ? 'Moyenne' : 'Peu importante'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireCompleteProfile>
  )
}
