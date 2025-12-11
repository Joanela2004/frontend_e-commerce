import React, { useContext, useState, useEffect } from "react";
import {
  FaTrash, FaLock, FaTruck, FaMapMarkerAlt, FaCalendarAlt,
  FaChevronRight, FaTag, FaExclamationCircle, FaArrowLeft
} from "react-icons/fa";
import { createMvolaPayment } from "../../../services/MvolaService";
import { createStripeSession } from "../../../services/StripeService";
import {updateCommandeModePaiement} from "../../../services/paiementService";
import { validerCodePromo, appliquerPromotionAutomatique } from "../../../services/promotionService";
import ModalAvertissement from "./ModalAvertissement";
import { fetchModesActifs } from "../../../services/paiementService";
import PaginationProduits from "../Accueil/PaginationProduits";
import panierImage from "../../../assets/images/panierList.png";
import "../../../styles/front-office/global.css";
import "../../../styles/front-office/Panier/panierSection.css";
import { CartContext } from "../../../contexts/CartContext";
import { createCommande } from "../../../services/commandeService";
import { fetchFrais, fetchLieux } from "../../../services/livraisonService";
import { useNavigate } from "react-router-dom";
import ModalConnexion from "../ModalConnexion";
import { fetchDecoupes } from "../../../services/DecoupeService";
import ModalConfirmation from "./ModalConfirmation";
import ModalConfirmationCash from "./ModalConfirmationCash";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO, format } from "date-fns";
import "../../../styles/calendrier.css";
import { useToast } from "../../../contexts/ToastContext"; 

const TODAY_SERVER = new Date().toISOString().split("T")[0]; //

const CheckoutFlowHeader = ({ currentStep }) => {
  const displaySteps = [
    { id: 1, name: "Panier", icon: "1" },
    { id: 2, name: "Commande", icon: "2" },
    { id: 3, name: "Paiement", icon: "3" },
  ];

  return (
    <div className="checkout-flow-header">
      <div className="flow-steps">
        {displaySteps.map((step) => (
          <React.Fragment key={step.id}>
            <div
              className={`flow-step ${step.id === currentStep ? "active" : ""} ${
                step.id < currentStep ? "completed" : ""
              }`}
            >
              <div className="step-number">{step.id < currentStep ? "✓" : step.icon}</div>
              <span className="step-name">{step.name}</span>
            </div>
            {step.id < displaySteps.length && <div className="step-separator"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const PanierSection = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalWeight,
    subtotal,
  } = useContext(CartContext);

  const { showToast } = useToast(); 
  const navigate = useNavigate();

  const [decoupesList, setDecoupesList] = useState([]);
  const [payerLivraisonChecked, setPayerLivraisonChecked] = useState(true);
  const [errorModalData, setErrorModalData] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);
  const [showCashConfirmation, setShowCashConfirmation] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [dateLivraison, setDateLivraison] = useState("");
  const [codePromo, setCodePromo] = useState("");
  const [remise, setRemise] = useState(0);
  const [selectedModePaiement, setSelectedModePaiement] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [fraisList, setFraisList] = useState([]);
  const [lieuxList, setLieuxList] = useState([]);
  const [selectedLieuNum, setSelectedLieuNum] = useState("");
  const [modesPaiementList, setModesPaiementList] = useState([]);
  const [commandeConfirmee, setCommandeConfirmee] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
  const [erreurLieu, setErreurLieu] = useState(null);
  const [erreurDate, setErreurDate] = useState(null);

  const getPrixApresDecoupe = (produit, option = produit.cuttingOption) => {
    const prixDeBase = Number(produit.prixPerKg || produit.prix);
    const decoupeSelected = option;
    if (decoupeSelected) {
      const decoupe = decoupesList.find((d) => d.nomDecoupe === decoupeSelected);
      if (decoupe && decoupe.coefficient) {
        return prixDeBase * Number(decoupe.coefficient);
      }
    }
    return prixDeBase;
  };
 const handleRedirectToLogin = () => {
    setShowLoginModal(false);
    navigate("/profil");
  };
  const handleContinueShopping = () => navigate('/produit');

  const handlePasserCommande = () => {
    if (cartItems.length === 0) {
      showToast("error", "Votre panier est vide.");
      return;
    }
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const [fraisData, decoupeData, lieuxData] = await Promise.all([
          fetchFrais(),
          fetchDecoupes(),
          fetchLieux(),
        ]);
        setFraisList(fraisData || []);
        setDecoupesList(decoupeData || []);
        setLieuxList(lieuxData || []);
      } catch (err) {
        console.error("Erreur chargement données publiques :", err);
        showToast("error", "Erreur lors du chargement des informations de livraison.");
      }
    };
    loadPublicData();
  }, []);
  useEffect(() => {
    if (currentStep === 3 && commandeConfirmee) {
      const token = localStorage.getItem("userToken");
      if (token) {
        const loadModes = async () => {
          try {
            const modesData = await fetchModesActifs();
            const modesActifs = (modesData || []).filter(mode => mode.actif === true);
            setModesPaiementList(modesActifs);
          } catch (err) {
            if (err.response?.status === 401) {
              showToast("warning", "Session expirée. Veuillez vous reconnecter.");
              setShowLoginModal(true);
            } else {
              showToast("error", "Impossible de charger les modes de paiement.");
            }
            setModesPaiementList([]);
          }
        };
        loadModes();
      } else {
        setShowLoginModal(true);
        setModesPaiementList([]);
      }
    }
  }, [currentStep, commandeConfirmee]);
  const totalPoids = totalWeight;
  const fraisSelonPoids = fraisList.find(
    (f) => totalPoids >= Number(f.poidsMin) && totalPoids <= Number(f.poidsMax)
  );
  const fraisParPoids = fraisSelonPoids ? Number(fraisSelonPoids.frais) : 0;
  const lieuSelectionne = lieuxList.find((l) => (l.numLieu || l.id) == selectedLieuNum);
  const fraisParLieu = lieuSelectionne ? Number(lieuSelectionne.fraisLieu || 0) : 0;
  const fraisLivraisonTotal = fraisParPoids + fraisParLieu;
  const sousTotal = subtotal;
  const montantBrut = sousTotal + (payerLivraisonChecked ? fraisLivraisonTotal : 0);
  const montantAPayer = montantBrut - remise;

  useEffect(() => {
    const appliquerPromoAuto = async () => {
      if (subtotal === 0) return;
      try {
        const promoAuto = await appliquerPromotionAutomatique(subtotal);
        if (promoAuto && promoAuto.reduction > 0) {
          setRemise(promoAuto.reduction);
         }
      } catch (err) {
        console.error("Erreur promo auto", err);
      }
    };
    appliquerPromoAuto();
  }, [subtotal]);

  const handleApplyCodePromo = async () => {
    const code = codePromo.trim().toUpperCase();
    if (!code) {
      showToast("warning", "Veuillez entrer un code promo.");
      setRemise(0);
      return;
    }

    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData?.numUtilisateur) {
      showToast("error", "Vous devez être connecté pour utiliser un code promo.");
      setRemise(0);
      return;
    }

    try {
      const result = await validerCodePromo(code, userData.numUtilisateur);
      if (result.message === "Code promo valide") {
        setRemise(Number(result.valeur));
        showToast("success", `Code "${code}" appliqué ! ${result.valeur} Ar de réduction.`);
      } else {
        setRemise(0);
        showToast("error", result.message || "Code promo non valide.");
      }
    } catch (err) {
      setRemise(0);
      showToast("error", "Erreur lors de la validation du code promo.");
    }
  };

  const handleCreateCommande = async () => {
    if (!selectedLieuNum || !dateLivraison) return;

    const token = localStorage.getItem("userToken");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    
    const payload = {
      numLieu: selectedLieuNum,
      lieuNom: lieuxList.find(l => (l.numLieu || l.id) == selectedLieuNum)?.nomLieu || "Non spécifié",
      dateLivraisonSouhaitee: dateLivraison,
      payerLivraison: payerLivraisonChecked,
      statut: "en attente",
      sousTotal: Number(subtotal.toFixed(2)),
      fraisLivraison: payerLivraisonChecked ? Number(fraisLivraisonTotal.toFixed(2)) : "0.00",
      montantTotal: Number(montantAPayer.toFixed(2)),
      codePromo: codePromo || null,
      panier: cartItems.map(item => ({
        numProduit: item.numProduit,
        poids: Number(item.poids),
        prix: Number(item.prixApresDecoupe || getPrixApresDecoupe(item)),
        decoupe: item.nomCategorie?.toLowerCase().includes("viande") ? (item.cuttingOption || "entier") : null,
        sousTotal: Number((item.prixApresDecoupe || getPrixApresDecoupe(item)) * item.poids).toFixed(2),
      })),
    };
    if (selectedModePaiement) {
  payload.numModePaiement = selectedModePaiement;
    }

    try {
      setIsCreating(true);
      const res = await createCommande(payload);
      const reference = res.commande?.referenceCommande || "CMD-XXXXXX";
      const montantTotal = res.commande?.montantTotal;

     showToast("success", `Commande envoyée ! N°${reference}`);
      setCommandeConfirmee({ referenceCommande: reference, montantTotal });
      clearCart();
      setCurrentStep(3);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de l'envoi de la commande";
      showToast("error", msg);
    } finally {
      setIsCreating(false);
      setShowConfirmationModal(false);
    }
  };

const handleChoisirPaiement = async (mode) => {
  const type = (mode.typePaiement || mode.nomModePaiement || "").toLowerCase().trim();

  try {
   
     await updateCommandeModePaiement(
      commandeConfirmee.referenceCommande,
      mode.numModePaiement
    );

     if (type.includes("cash") || type.includes("espèces")) {
      setSelectedModePaiement(mode.numModePaiement);
      setShowCashConfirmation(true);
      return;
    }

    if (type.includes("mvola")) {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      if (!userData?.numeroTelephone) {
        showToast("error", "Numéro de téléphone manquant pour MVola.");
        return;
      }

      await createMvolaPayment({
        amount: commandeConfirmee.montantTotal,
        customerNumber: userData.numeroTelephone,
        referenceCommande: commandeConfirmee.referenceCommande,
      });

      showToast("warning", "Demande MVola envoyée ! Validez le paiement sur votre téléphone.");
      return;
    }

    const sessionData = await createStripeSession({
      referenceCommande: commandeConfirmee.referenceCommande,
      numModePaiement: mode.numModePaiement,
      montantTotal: commandeConfirmee.montantTotal,
    });

    if (sessionData?.url) {
      window.location.href = sessionData.url;
    } else {
      showToast("error", "Impossible d'initier le paiement carte.");
    }
  } catch (error) {
    console.error("Erreur lors du choix du paiement :", error);
    showToast("error", "Une erreur est survenue lors du traitement du paiement.");
  }
};
 
const handleConfirmCash = () => {
  showToast("success", "Commande confirmée ! Vous paierez en espèces à la livraison.");
  setShowCashConfirmation(false);
   navigate("/client/mesCommandes");
};

  const handleDelete = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    removeFromCart(itemId);
    showToast("success", `${item?.nom} retiré du panier`);
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <section className="panier-section-wrapper">
      <CheckoutFlowHeader currentStep={currentStep} />
      <div className="panier-section">

        {currentStep === 1 && (
          <div className="panier-produits">
            <div className="panier-header">
              <div className="panier-icon-container">
                <img src={panierImage} alt="panier" />
                <h3>Mon Panier ({cartItems.length} article{cartItems.length > 1 ? "s" : ""})</h3>
              </div>
            </div>

            <div className="panier-item-container">
              {cartItems.length > 0 ? (
                currentItems.map((produit) => (
                  <div className="item-card" key={produit.id}>
                    <div className="item-card-image-info">
                      <img src={produit.image} alt={produit.nom} className="panier-img" />
                      <div className="produit-info-text">
                        <p className="produit-nom">{produit.nom}</p>
                        <p className="prix-per-kg">
                          {Number(produit.prixPerKg || produit.prix).toFixed(2).replace(".", ",")} Ar / kg
                        </p>
                      </div>
                    </div>

                    <div className="produit-controls-row">
                      {produit.nomCategorie?.toLowerCase().includes("viande") && decoupesList.length > 0 && (
                        <div className="cutting-option-group">
                          <label>Découpe :</label>
                          <select
                            value={produit.cuttingOption || decoupesList[0]?.nomDecoupe}
                            onChange={(e) => {
                              const newPrix = getPrixApresDecoupe(produit, e.target.value);
                              updateQuantity(produit.id, produit.poids, e.target.value, newPrix);
                            }}
                          >
                            {decoupesList.map((d) => (
                              <option key={d.numDecoupe} value={d.nomDecoupe}>{d.nomDecoupe}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="quantite-control-group editable">
                        <button onClick={() => updateQuantity(produit.id, Math.max(0.25, Number(produit.poids) - 0.25))} className="quantity-btn" disabled={Number(produit.poids) <= 0.25}>−</button>
                        <input
                          type="number"
                          min="0.25"
                          step="0.25"
                          value={Number(produit.poids).toFixed(2)}
                          onChange={(e) => {
                            let value = parseFloat(e.target.value) || 0.25;
                            if (value > (produit.poidsDisponible || 999)) {
                              showToast("warning", `Stock maximum atteint pour ${produit.nom}`);
                              value = produit.poidsDisponible || 999;
                            }
                            updateQuantity(produit.id, value);
                          }}
                          className="quantity-input-editable"
                          style={{ width: "90px", textAlign: "center", border: "2px solid #28a745", borderRadius: "12px", padding: "5px", fontWeight: "bold", color: "#28a745" }}
                        />
                        <button onClick={() => {
                          const next = Number(produit.poids) + 0.25;
                          if (next > (produit.poidsDisponible || 999)) {
                            showToast("warning", `Stock maximum atteint pour ${produit.nom}`);
                            return;
                          }
                          updateQuantity(produit.id, next);
                        }} className="quantity-btn">+</button>
                      </div>
                    </div>

                    <div className="produit-final-row">
                      <p className="total-item-prix">
                        {(getPrixApresDecoupe(produit) * Number(produit.poids)).toFixed(2).replace(".", ",")} Ar
                      </p>
                      <button className="delete-btn" onClick={() => handleDelete(produit.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-cart-message">
                  <p>Votre panier est vide.</p>
                </div>
              )}
            </div>

            {cartItems.length > itemsPerPage && (
              <PaginationProduits
                totalProduits={cartItems.length}
                produitsParPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            )}

            <div className="bouton-paiement">
              <button className="passer-commande-btn-retour" onClick={handleContinueShopping}>
                <FaArrowLeft /> Continuer les achats
              </button>
              {cartItems.length > 0 && (
                <button className="passer-commande-btn" onClick={handlePasserCommande}>
                  Voir récapitulatif <FaChevronRight />
                </button>
              )}
            </div>
          </div>
        )}

             {currentStep === 2 && cartItems.length > 0 && (
          <div className="right-panel-wrapper">
            <div className="panier-total-card livraison-info-card">
              <h3>
                <FaTruck /> Informations de Livraison
              </h3>
              {erreurLieu && (
                <div className="message-erreur-inline">{erreurLieu}</div>
              )}
              <div className="livraison-input-group">
                <FaMapMarkerAlt className="input-icon" />
                <select
                  value={selectedLieuNum}
                  onChange={(e) => {
                    setSelectedLieuNum(e.target.value);
                    if (erreurLieu) {
                      setErreurLieu(null);
                    }
                  }}
                >
                  <option value="" disabled>
                    Sélectionnez un lieu de livraison
                  </option>
                  {lieuxList.map((lieu) => (
                    <option
                      key={lieu.numLieu || lieu.id}
                      value={lieu.numLieu || lieu.id}
                    >
                      {lieu.nomLieu}
                    </option>
                  ))}
                </select>
              </div>
              {erreurDate && (
                <div className="message-erreur-inline">{erreurDate}</div>
              )}
             <div className="livraison-input-group">
            <FaCalendarAlt className="input-icon" />
            <DatePicker
              selected={dateLivraison ? parseISO(dateLivraison) : null}
            onChange={(date) => {
  const iso = date ? format(date, "yyyy-MM-dd") : "";  // Format ISO standard attendu par le backend
  setDateLivraison(iso);
  if (erreurDate) setErreurDate(null);
}}
              dateFormat="dd/MM/yyyy"
              
              placeholderText="Choisir une date"
              minDate={new Date(TODAY_SERVER)} 
              className="date-input-custom"
              required
              popperClassName="datepicker-popper"
            />
          </div>
              <div
                className="livraison-input-group"
                style={{ marginTop: "10px" }}
              >
                <label
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="checkbox"
                    checked={payerLivraisonChecked}
                    onChange={() =>
                      setPayerLivraisonChecked(!payerLivraisonChecked)
                    }
                  />
                  Payer les frais de livraison ?
                </label>
              </div>
            </div>

            <div className="panier-total-card promo-code-card">
              <h3>
                <FaTag /> Code Promo
              </h3>
              <div className="promo-input-group">
                <input
                  type="text"
                  value={codePromo}
                  onChange={(e) => setCodePromo(e.target.value)}
                  placeholder="Ex: WELCOME10"
                />
                <button
                  className="apply-promo-btn"
                  onClick={handleApplyCodePromo}
                >
                  Appliquer
                </button>
              </div>
              {remise > 0 && (
                <p className="remise-applied-message">
                  {remise.toFixed(2).replace(".", ",")} Ar de remise appliquée !
                </p>
              )}
            </div>
 <div className="panier-total-card commande-globale-card">
              <div className="total-card">
                <div className="total-card-top">
                  <div className="text">
                    <h2>Poids total du panier</h2>
                    {totalPoids > 0 && <p>{totalPoids.toFixed(2)} kg</p>}
                  </div>
                  
                  {payerLivraisonChecked && (
                    <div className="text">
                      <h2>Frais de poids</h2>
                      <p>{fraisParPoids.toFixed(2).replace(".", ",")} Ar</p>
                    </div>
                  )}
                  
                  {payerLivraisonChecked && fraisParLieu > 0 && (
                    <div className="text">
                      <h2>Frais de distance ({lieuSelectionne?.nomLieu})</h2>
                      <p>{fraisParLieu.toFixed(2).replace(".", ",")} Ar</p>
                    </div>
                  )}
                  
                  <hr />
                  
                  {payerLivraisonChecked && fraisParPoids > 0 && fraisParLieu > 0 && (
                    <div className="text total-line">
                      <h2>Total Frais Livraison</h2>
                      <p>{fraisLivraisonTotal.toFixed(2).replace(".", ",")} Ar</p>
                    </div>
                  )}
                  
                  <div className="text total-line">
                    <h2>Sous-Total</h2>
                    <p>{sousTotal.toFixed(2).replace(".", ",")} Ar</p>
                  </div>
                  
                  {remise > 0 && (
                    <div className="text discount-line">
                      <h2>Remise Code Promo</h2>
                      <p>-{remise.toFixed(2).replace(".", ",")} Ar</p>
                    </div>
                  )}
                </div>
                
                <hr />
                
                <div className="text total-line">
                  <h2>Montant total</h2>
                  <p className="total-prix-to-pay">
                    {montantAPayer.toFixed(2).replace(".", ",")} Ar
                  </p>
                </div>
              </div>
            </div>
            
              <div className="bouton-paiement">
              <button
                className="passer-commande-btn-retour" 
                onClick={handleGoBack}
              >
                <FaArrowLeft /> Revenir au Panier
              </button>
         <button
  className={`passer-commande-btn ${isCreating ? "loading" : ""}`}
  onClick={() => {
    // Validation des champs obligatoires
    if (!selectedLieuNum) {
      setErreurLieu("Veuillez sélectionner un lieu de livraison");
      return;
    }
    if (!dateLivraison) {
      setErreurDate("Veuillez choisir une date de livraison");
      return;
    }
    const token = localStorage.getItem("userToken");
    if (!token) {
      setShowLoginModal(true); 
      return;
    }
   setShowConfirmationModal(true);
  }}
  disabled={isCreating}
>
  {isCreating ? "Envoi en cours..." : "Envoyer la commande"} <FaChevronRight />
</button>
            </div>
          </div>
        )}

       {currentStep === 3 && commandeConfirmee && (
  <div className="commande-envoyee-container">
    <div className="success-message-card">
      <div className="success-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="#28a745">
          <circle cx="12" cy="12" r="11" fill="#28a745" opacity="0.2"/>
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#28a745"/>
        </svg>
      </div>
      <h2>Votre commande a été envoyée avec succès !</h2>
      <p className="order-number">
        N° de commande : <strong>{commandeConfirmee.referenceCommande}</strong>
      </p>
      <p className="montant-total">
        Montant total : <strong>{commandeConfirmee.montantTotal} Ar</strong>
      </p>
      <p className="info-paiement">
        Choisissez votre mode de paiement ci-dessous :
      </p>
    </div>

    <div className="modes-paiement-list">
  {modesPaiementList.map((mode) => {
    const isSelected = selectedModePaiement === mode.numModePaiement;

    return (
      <div
        key={mode.numModePaiement}
        className={`mode-option ${isSelected ? "selected" : ""}`}
        onClick={() => {
          setSelectedModePaiement(mode.numModePaiement);
          handleChoisirPaiement(mode);
        }}
      >
        <div className="mode-logo-container">
          {mode.image ? (
            <img
              src={`${IMAGE_BASE_URL}${mode.image.startsWith("/") ? mode.image.substring(1) : mode.image}`}
              alt={mode.nomModePaiement}
              className="mode-image"
            />
          ) : (
            <div className="mode-paiement-logo-placeholder">
              <FaLock size={28} />
            </div>
          )}
        </div>

         <div className="mode-info">
                  <p className="mode-name" style={{display:"flex",alignItems:"flex-start"}}>{mode.nomModePaiement}</p>
                 
                </div>
        {isSelected && <span className="selected-badge">Sélectionné</span>}
      </div>
    );
  })}
</div>



    <div className="final-actions">
      <button 
        className="btn-continuer-achats" 
        onClick={() => navigate("/produit")}
      >
        Découvrir plus de produits
      </button>
      <button 
        className="btn-suivre-commande" 
        onClick={() => navigate("/client/mesCommandes")}
      >
        Suivre ma commande
      </button>
    </div>
  </div>
)}
      </div>

      {showErrorModal && (
        <ModalAvertissement
          show={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          data={errorModalData}
        />
      )}
      {showLoginModal && (
        <ModalConnexion
          show={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginRedirect={handleRedirectToLogin}
        />
      )}
      {showConfirmationModal && (
        <ModalConfirmation
          show={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleCreateCommande}
          montantTotal={montantAPayer}
          isCreating={isCreating}
        /> 
      )}
      {showCashConfirmation && (
  <ModalConfirmationCash
    show={showCashConfirmation}
    onClose={() => {
      setShowCashConfirmation(false);
      setSelectedModePaiement(null);
    }}
    onConfirm={handleConfirmCash}
  />
)}
    </section>
  );
};

export default PanierSection;