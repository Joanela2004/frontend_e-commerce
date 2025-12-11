// src/components/front-office/Commande/PaiementModal.jsx
import React, { useState, useEffect } from "react";
import { Package } from 'lucide-react';
import { fetchModesActifs } from "../../../services/paiementService";
import { createStripeSession } from "../../../services/StripeService";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ModalConfirmationCash from "../../../composants/front-office/Panier/ModalConfirmationCash";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const PaiementModal = ({ order, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [modesPaiementList, setModesPaiementList] = useState([]);
  const [showCashConfirmation, setShowCashConfirmation] = useState(false); 
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

    const nomLower = (mode.nomModePaiement || "").toLowerCase();

     const isCash =
      nomLower.includes("espèces") ||
      nomLower.includes("cash") ||
      nomLower.includes("livraison"); // ← Capture "Paiement à la livraison"

    if (isCash) {
      setShowCashConfirmation(true); // ← Ouvre le modal de confirmation
      return;
    }

    // 2. Paiement par carte (Stripe)
    const isStripe =
      nomLower.includes("carte") ||
      nomLower.includes("stripe") ||
      nomLower.includes("visa") ||
      nomLower.includes("mastercard") ||
      nomLower.includes("bancaire");

    if (isStripe) {
      try {
        const { url } = await createStripeSession({
          referenceCommande: order.referenceCommande,
          numModePaiement: mode.numModePaiement,
          montantTotal: order.montantTotal,
        });
        if (url) {
          window.location.href = url;
        } else {
          toast.error("Erreur lors de la création de la session de paiement.");
        }
      } catch (err) {
        toast.error("Impossible de lancer le paiement sécurisé.");
      }
      return;
    }

    // 3. Autres modes (ex: MVola) → non gérés dans cette modal simplifiée
    toast.warn("Ce mode de paiement n'est pas disponible dans cette interface. Utilisez le panier complet.");
  };

  const handleConfirmCash = () => {
    toast.success("Paiement à la livraison confirmé ! Vous paierez lors de la réception.");
    setShowCashConfirmation(false);
    onClose(true); // Ferme tout et confirme le choix
  };

  const handleCancelCash = () => {
    setShowCashConfirmation(false);
    setPaymentMethod(null); // Optionnel : désélectionne pour forcer un nouveau choix
  };

  const total = Number(order.montantTotal).toFixed(2).replace(".", ",");
  const reference = order.referenceCommande;

  return (
    <>
      {/* Modal principal de sélection du paiement */}
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
                    <p className="mode-name">{mode.nomModePaiement}</p>
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
              {paymentMethod && modesPaiementList.find(m => m.numModePaiement === paymentMethod)?.nomModePaiement.toLowerCase().includes("livraison")
                ? "Confirmer paiement à la livraison"
                : `Payer ${total} Ar maintenant`}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmation pour paiement à la livraison */}
      <ModalConfirmationCash
        show={showCashConfirmation}
        onClose={handleCancelCash}
        onConfirm={handleConfirmCash}
      />
    </>
  );
};

export default PaiementModal;