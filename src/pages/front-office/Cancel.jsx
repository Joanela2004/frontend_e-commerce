
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import '../../styles/front-office/modal.css'; 

const Cancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optionnel : petit effet visuel ou son si tu veux
    document.body.style.background = "#fef2f2";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <div className="modal-backdrop" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>

        {/* Header rouge */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
          <FaTimesCircle className="modal-icon" style={{ color: '#fff', fontSize: '3.8rem' }} />
          <h2 style={{ color: '#fff', margin: 0 }}>Paiement annulé</h2>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '1rem' }}>
            Aucun montant n’a été débité.
          </p>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            Votre panier est toujours intact.<br />
            Vous pouvez réessayer avec un autre moyen de paiement ou finaliser plus tard.
          </p>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate("/panier")}
            className="btn-primary"
            style={{ background: '#3b82f6', padding: '0.9rem 2rem', fontSize: '1.1rem' }}
          >
            Retour au panier
          </button>

          <button
            onClick={() => navigate("/boutique")}
            className="btn-secondary"
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cancel;