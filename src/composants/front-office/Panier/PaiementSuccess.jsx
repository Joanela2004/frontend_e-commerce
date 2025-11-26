import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../styles/front-office/modal.css'; 

const PaiementSuccess = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const handleContinueShopping = () => {
    setShowModal(false);
    navigate("/produits"); 
  };

  const handleGoToOrders = () => {
    setShowModal(false);
    navigate("/client/mesCommandes");
  };

  return (
    <div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <h2>Paiement réussi !</h2>
            <p>Votre commande a été enregistrée avec succès.</p>
            <div className="modal-buttons">
              <button onClick={handleContinueShopping} className="btn-primary">
                Continuer les achats
              </button>
              <button onClick={handleGoToOrders} className="btn-secondary">
                Voir mes commandes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaiementSuccess;
