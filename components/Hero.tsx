'use client'

import { useMouseTracking, useRippleEffect } from '@/lib/animations'

export default function Hero() {
  const { mouseX, mouseY } = useMouseTracking()
  const { createRipple } = useRippleEffect()

  const handleRipple = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement
    createRipple(target, e)
  }

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <div className="trophy-icon"></div>
            <span>N°1 des apps de rencontre chrétiennes</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-highlight">Votre âme sœur</span>, désignée par <span className="title-highlight">Dieu</span>,<br />
            vous attend peut-être ici.
          </h1>
          <p className="hero-subtitle">
            Arrête de perdre ton temps sur des apps qui ne respectent pas tes valeurs. 
            Ici, on parle mariage. Sérieusement.
          </p>
          
          <div className="cta-buttons">
            <div className="app-store-btn" onClick={handleRipple}>
              <div className="store-icon apple-icon"></div>
              <div className="store-text">
                <span className="store-label">Télécharger sur</span>
                <span className="store-name">App Store</span>
              </div>
            </div>
            
            <div className="google-play-btn" onClick={handleRipple}>
              <div className="store-icon google-icon"></div>
              <div className="store-text">
                <span className="store-label">Disponible sur</span>
                <span className="store-name">Google Play</span>
              </div>
            </div>
          </div>
          
          <button className="web-cta-btn" onClick={handleRipple}>
            Commencer sur le web
          </button>
        </div>
        
        <div className="hero-image">
          <div className="hero-image-bg"></div>
          <div 
            className="hero-image-content"
            style={{ transform: `translate(${mouseX}px, ${mouseY}px)` }}
          >
            <div className="person-image"></div>
          </div>
        </div>
      </div>
    </section>
  )
}