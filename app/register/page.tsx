'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')

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

  // Validate email format when user stops typing
  useEffect(() => {
    const validateEmail = () => {
      if (formData.email && !authService.isValidEmail(formData.email)) {
        setEmailError('Format d\'email invalide')
      } else {
        setEmailError('')
      }
    }

    const timeoutId = setTimeout(validateEmail, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.email])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear email error when user changes email
    if (name === 'email') {
      setEmailError('')
    }
  }

  const handleGoogleSignUp = async () => {
    console.log('Google sign up clicked')
    try {
      setIsLoading(true)
      setError('')
      console.log('Starting Google sign up...')
      const user = await authService.signInWithGoogle()
      
      // If redirect was triggered, don't navigate (will happen on redirect back)
      if (user) {
        console.log('Google sign up successful:', user)
        router.push('/discover')
      }
    } catch (err: any) {
      console.error('Google sign up error:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)
      
      let errorMessage = 'Erreur lors de l\'inscription avec Google. Veuillez réessayer.'
      
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
    
    // Validate email format
    if (!authService.isValidEmail(formData.email)) {
      setError('Format d\'email invalide')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    
    if (!formData.agreeTerms) {
      setError('Vous devez accepter les conditions d\'utilisation')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await authService.signUpWithEmail(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      )
      router.push('/onboarding')
    } catch (err: any) {
      console.error('Registration error:', err)
      if (err.code === 'auth/email-already-in-use') {
        setError('Un compte existe déjà avec cet email. Veuillez vous connecter.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresse email invalide.')
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible (minimum 8 caractères).')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Veuillez réessayer plus tard.')
      } else {
        setError('Erreur lors de l\'inscription. Veuillez réessayer.')
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
            <h1 className="login-title">Créer un compte</h1>
            <p className="login-subtitle">Rejoignez la communauté chrétienne</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
              {error.includes('existe déjà') && (
                <div className="error-action">
                  <Link href="/login" className="error-link">Se connecter</Link>
                </div>
              )}
            </div>
          )}

          <div className="social-login">
            <button 
              className="social-btn google primary"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <div className="social-icon google-icon"></div>
              <span>S'inscrire avec Google</span>
            </button>
          </div>

          <div className="login-divider">
            <span>ou s'inscrire avec email</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jean"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
                disabled={isLoading}
                className={emailError ? 'input-error' : ''}
              />
              {emailError && (
                <span className="input-error-message">{emailError}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <span>J'accepte les <Link href="/terms" className="terms-link">conditions d'utilisation</Link> et la <Link href="/privacy" className="terms-link">politique de confidentialité</Link></span>
              </label>
            </div>

            <button 
              type="submit" 
              className="login-btn" 
              disabled={isLoading}
            >
              {isLoading ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Déjà un compte ?{' '}
              <Link href="/login" className="register-link">
                Se connecter
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