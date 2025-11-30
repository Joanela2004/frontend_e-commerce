// src/components/front-office/Commande/PaiementModal.jsx

import React, { useState, useEffect } from "react";
import { CreditCard, Package } from 'lucide-react'; 
import { fetchModesActifs } from "../../../services/paiementService";
import { createStripeSession } from "../../../services/StripeService";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const PaiementModal = ({ order, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [modesPaiementList, setModesPaiementList] = useState([]);
  const [loadingModes, setLoadingModes] = useState(true);

  useEffect(() => {
    const loadModes = async () => {
      try {
        const modesData = await fetchModesActifs();
        const modesActifs = modesData.filter((mode) => mode.actif === true);
        setModesPaiementList(modesActifs);
        if (modesActifs.length > 0) {
            setPaymentMethod(modesActifs[0].numModePaiement); // Sélectionne le premier par défaut
        }
      } catch (err) {
        console.error("Erreur fetch modes de paiement :", err);
        toast.error("Erreur lors du chargement des modes de paiement.");
      } finally {
        setLoadingModes(false);
      }
    };
    loadModes();
  }, []);

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.warn("Veuillez sélectionner un mode de paiement.");
      return;
    }
    
    const mode = modesPaiementList.find(m => m.numModePaiement === paymentMethod);
    if (!mode) return;

    if (mode.nomModePaiement.toLowerCase().includes("espèces") || mode.nomModePaiement.toLowerCase().includes("cash")) {
        toast.success("Paiement en espèces sélectionné ! Votre commande sera traitée.");
        // Fermer le modal et potentiellement changer le statut de la commande côté client/serveur
        onClose(true); // Ferme et indique succès (pourrait déclencher une actualisation)
        return;
    } else {
        try {
            const sessionData = await createStripeSession({
                referenceCommande: order.referenceCommande,
                numModePaiement: mode.numModePaiement,
                montantTotal: order.montantTotal 
            });
            if (sessionData?.url) {
                // Redirection vers Stripe
                window.location.href = sessionData.url;
            }
        } catch (err) {
            toast.error("Erreur lors du lancement du paiement sécurisé.");
        }
    }
  };

  const total = Number(order.montantTotal).toFixed(2).replace(".", ",");
  const reference = order.referenceCommande;

  if (loadingModes) {
      return (
        <div className="paiement-modal-overlay open">
            <div className="paiement-modal-content loading">Chargement des modes de paiement...</div>
        </div>
      );
  }

  return (
    <div className="paiement-modal-overlay open" onClick={() => onClose(false)}>
      <div className="paiement-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={() => onClose(false)}>&times;</button>
        
        <div className="modal-header-gradient">
            <CreditCard size={32} className="header-icon" />
            <h3 className="modal-title">Finaliser le paiement</h3>
            <p className="modal-subtitle">Commande {reference}</p>
        </div>

        <div className="modal-body">
            <p className="body-message">
                Votre commande est en attente de paiement. Choisissez votre mode de paiement pour finaliser.
            </p>

            <div className="modes-paiement-list">
                {modesPaiementList.map((mode) => (
                    <div
                        key={mode.numModePaiement}
                        onClick={() => setPaymentMethod(mode.numModePaiement)}
                        className={`mode-option ${paymentMethod === mode.numModePaiement ? 'option-selected-modal' : ''}`}
                    >
                        <div className="mode-logo-container">
                            {mode.image ? (
                                <img 
                                    src={`${IMAGE_BASE_URL}${mode.image.startsWith("/") ? mode.image.substring(1) : mode.image}`} 
                                    alt={mode.nomModePaiement} 
                                    className="mode-image"
                                />
                            ) : (
                                <Package size={24} />
                            )}
                        </div>
                        <div className="mode-info">
                            <p className="mode-name">{mode.nomModePaiement}</p>
                            <p className="mode-description">{mode.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handlePayment}
                className="bouton-payer-modal"
                disabled={!paymentMethod}
            >
                Payer {total} Ar maintenant
            </button>
            
            <p className="securite-note">
                🔒 Paiement 100% sécurisé et crypté
            </p>
        </div>
      </div>
    </div>
  );
};

export default PaiementModal;