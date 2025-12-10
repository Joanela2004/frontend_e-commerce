
import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import '../../styles/front-office/modal.css'; 

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
   
    confetti({
      particleCount: 200,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#28a458', '#059669', '#34d399', '#6ee7b7', '#ffffff'],
    });
  }, []);

  return (
    <div className="modal-backdrop" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ maxWidth: '480px', width: '90%' }}>
        
        {/* Header vert succès */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #28a458, #28a458)' }}>
          <FaCheckCircle className="modal-icon" style={{ color: '#fff', fontSize: '3.5rem' }} />
          <h2 style={{ color: '#fff', margin: 0 }}>Paiement réussi !</h2>
          <div style={{ height: '24px' }}></div> {/* espace pour le X (pas de fermeture ici) */}
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '1rem' }}>
            Votre commande a été confirmée avec succès.
          </p>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
            Nous préparons vos produits frais avec soin.<br />
            Vous serez notifié(e) dès l’expédition.
          </p>

         
        </div>

        {/* Footer avec un seul bouton bien visible */}
        <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate("/client/mesCommandes")}
            className="btn-primary"
            style={{ padding: '0.9rem 2rem', fontSize: '1.1rem' }}
          >
            Voir mes commandes
          </button>

          <button
            onClick={() => navigate("/")}
            className="btn-secondary"
            style={{ padding: '0.9rem 1.8rem' }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;