import React from "react";
import "../../../styles/front-office/Panier/panierSection.css"; 

const ModalConfirmationCash = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{
            width: "90px",
            height: "90px",
            background: "#d4edda",
            borderRadius: "50%",
            margin: "0 auto 25px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="#28a745">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
          </div>

          <h3 style={{ color: "#28a745", marginBottom: "15px", fontSize: "24px" }}>
            Paiement à la livraison
          </h3>
          <p style={{ marginBottom: "35px", color: "#555", lineHeight: "1.6" }}>
            Vous avez choisi le paiement en espèces.<br />
            Le livreur collectera le montant lors de la remise de votre commande.
          </p>

          <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
            <button
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: "12px 25px", minWidth: "120px" }}
            >
              Annuler
            </button>

            <button
              className="btn btn-primary"
              onClick={onConfirm}
              style={{ padding: "12px 35px", minWidth: "180px" }}
            >
              Confirmer 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmationCash;