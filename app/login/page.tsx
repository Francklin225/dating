'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Check for redirect result on page load
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await authService.handleRedirectResult()
        if (result) {
          console.log('Redirect auth successful:', result)
          router.push('/discover')
        }
      } catch (err) {
        console.error('Redirect result error:', err)
      }
    }
    checkRedirect()
  }, [router])

  const handleGoogleSignIn = async () => {
    console.log('Google sign in clicked')
    try {
      setIsLoading(true)
      setError('')
      console.log('Starting Google sign in...')
      const user = await authService.signInWithGoogle()
      
      // If redirect was triggered, don't navigate (will happen on redirect back)
      if (user) {
        console.log('Google sign in successful:', user)
        router.push('/discover')
      }
    } catch (err: any) {
      console.error('Google sign in error:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)
      
      let errorMessage = 'Erreur lors de la connexion avec Google. Veuillez réessayer.'
      
      if (err.message === 'REDIRECT_IN_PROGRESS') {
        errorMessage = 'Redirection vers Google en cours...'
        // Don't set isLoading to false as redirect is happening
        return
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'La fenêtre de connexion a été fermée.'
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'La fenêtre popup a été bloquée. Redirection vers Google en cours...'
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'Ce domaine n\'est pas autorisé pour l\'authentification Google.'
      } else if (err.code === 'auth/configuration-not-found') {
        errorMessage = 'La configuration Google n\'est pas trouvée. Vérifiez votre console Firebase.'
      }
      
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await authService.signInWithEmail(email, password)
      
      // Check if profile is complete
      const userId = localStorage.getItem('userId')
      if (userId) {
        const { userService } = await import('@/lib/firestore')
        const user = await userService.getUserById(userId)
        if (user && user.profileCompletion < 80) {
          router.push('/onboarding')
          return
        }
      }
      
      router.push('/discover')
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.code === 'auth/invalid-credential') {
        setError('Email ou mot de passe incorrect. Veuillez vérifier vos informations.')
      } else if (err.code === 'auth/user-not-found') {
        setError('Aucun compte trouvé avec cet email. Veuillez vous inscrire.')
      } else if (err.code === 'auth/wrong-password') {
        setError('Mot de passe incorrect.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresse email invalide.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Veuillez réessayer plus tard.')
      } else {
        setError('Erreur lors de la connexion. Veuillez réessayer.')
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <Link href="/" className="login-logo">
              <div className="logo-icon"></div>
              <span className="logo-text">Foi & Cœur</span>
            </Link>
            <h1 className="login-title">Connexion</h1>
            <p className="login-subtitle">Retrouvez votre âme sœur</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
              {error.includes('Aucun compte trouvé') && (
                <div className="error-action">
                  <Link href="/register" className="error-link">S'inscrire</Link>
                </div>
              )}
            </div>
          )}

          <div className="social-login">
            <button 
              className="social-btn google primary"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <div className="social-icon google-icon"></div>
              <span>Continuer avec Google</span>
            </button>
          </div>

          <div className="login-divider">
            <span>ou se connecter avec email</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Se souvenir de moi</span>
              </label>
              <Link href="/forgot-password" className="forgot-password">
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Pas encore de compte ?{' '}
              <Link href="/register" className="register-link">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        <div className="login-image">
          <div className="image-content">
            <div className="image-overlay"></div>
            <div className="image-text">
              <h2>Trouvez votre moitié selon la foi</h2>
              <p>Rejoignez des milliers de chrétiens sérieux qui cherchent le mariage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}