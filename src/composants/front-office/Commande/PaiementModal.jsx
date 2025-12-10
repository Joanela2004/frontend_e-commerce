// src/components/front-office/Commande/PaiementModal.jsx
import React, { useState, useEffect } from "react";
import { Package } from 'lucide-react';
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
        const modesActifs = modesData.filter(mode => mode.actif === true);
        setModesPaiementList(modesActifs);
        if (modesActifs.length > 0) {
          setPaymentMethod(modesActifs[0].numModePaiement);
        }
      } catch (err) {
        toast.error("Impossible de charger les modes de paiement.");
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
    const isCash = (mode.nomModePaiement || "").toLowerCase().includes("espèces") || 
                    (mode.nomModePaiement || "").toLowerCase().includes("cash");

    if (isCash) {
      toast.success("Paiement en espèces confirmé ! Vous paierez à la livraison.");
      onClose(true);
      return;
    }

    try {
      const { url } = await createStripeSession({
        referenceCommande: order.referenceCommande,
        numModePaiement: mode.numModePaiement,
        montantTotal: order.montantTotal,
      });

      if (url) {
        window.location.href = url;
      } else {
        toast.error("Erreur lors du paiement.");
      }
    } catch (err) {
      toast.error("Impossible de lancer le paiement sécurisé.");
    }
  };

  const total = Number(order.montantTotal).toFixed(2).replace(".", ",");
  const reference = order.referenceCommande;



  return (
    <div className="paiement-modal-overlay open" onClick={() => onClose(false)}>
      <div className="paiement-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={() => onClose(false)}>×</button>

        <div className="modal-header-gradient">
          <h3 className="modal-title">Paiement de la commande</h3>
          <p className="modal-subtitle">N° {reference}</p>
        </div>

        <div className="modal-body">
          <p className="body-message">
            Choisissez votre mode de paiement. Vous pouvez changer d'avis à tout moment.
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
                  <p className="mode-name" >{mode.nomModePaiement}</p>
                  {mode.description && <p className="mode-description">{mode.description}</p>}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handlePayment}
            className="bouton-payer-modal"
            disabled={!paymentMethod}
          >
            {paymentMethod && modesPaiementList.find(m => m.numModePaiement === paymentMethod)?.nomModePaiement.includes("espèces")
              ? "Confirmer paiement à la livraison"
              : `Payer ${total} Ar maintenant`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaiementModal;