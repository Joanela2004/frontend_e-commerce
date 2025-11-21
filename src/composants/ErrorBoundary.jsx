import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Met à jour l'état pour afficher l'UI de secours
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez envoyer les informations d'erreur à un service de journalisation externe ici
    console.error("Erreur non gérée interceptée :", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // UI de secours en cas de crash dans l'un des composants enfants
      return (
        <div style={{ padding: '20px', textAlign: 'center', margin: '20px' }}>
          <h1>⚠️ Oups ! Une erreur est survenue dans l'application.</h1>
          <p>Nous vous prions de recharger la page pour continuer.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '15px' }}>
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;