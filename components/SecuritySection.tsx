export default function SecuritySection() {
  return (
    <section className="security-section">
      <div className="security-container">
        <h2 className="security-title">Ta sécurité n'est pas négociable</h2>
        <p className="security-subtitle">
          On gère les faux profils, les arnaques, etc. pour que tu puisses te concentrer sur ta recherche.
        </p>
        
        <div className="security-cards">
          <div className="security-card">
            <div className="security-card-icon"></div>
            <h3 className="security-card-title">Vérification manuelle</h3>
            <p className="security-card-description">
              Pas de bot, pas de faux profil. Chaque inscription passe par notre équipe avant d'être validée.
            </p>
          </div>
          
          <div className="security-card">
            <div className="security-card-icon"></div>
            <h3 className="security-card-title">Modération intelligente</h3>
            <p className="security-card-description">
              Notre IA scanne chaque message. Contenu inapproprié ? Bloqué instantanément. Pas de place pour les comportements irrespectueux.
            </p>
          </div>
          
          <div className="security-card">
            <div className="security-card-icon"></div>
            <h3 className="security-card-title">Contrôle total</h3>
            <p className="security-card-description">
              Mode anonyme, photos floues... Tu décides qui voit quoi. Tes données restent les tiennes.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
