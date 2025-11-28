import React, { useContext, useState, useEffect } from "react";
import {
  FaTrash,
  FaLock,
  FaTruck,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaChevronRight,
  FaTag,
  FaExclamationCircle,
  FaArrowLeft,
} from "react-icons/fa";
// Importations de composants inutilisées dans le PanierSection actuel (laisser pour la complétude)
// import CheckoutPayment from "./CheckoutPayment";
// import Success from "../../../pages/front-office/Success";
// import Cancel from "../../../pages/front-office/Cancel";
import { createStripeSession } from "../../../services/StripeService";
import { validerCodePromo } from "../../../services/promotionService";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import { parseISO, format } from "date-fns";
import "../../../styles/calendrier.css";
registerLocale("fr", fr);

const ConfirmationCommande = ({ montantTotal, numCommande }) => {
  return (
    <div className="order-confirmation-container">
      <h1 className="confirmation-header">Commande confirmée !</h1>
      <p>Votre commande a été enregistrée avec succès</p>
      <div className="confirmation-details-box">
        <p className="order-number-title">N° de commande :</p>
        <p className="order-number-value">{numCommande}</p>

        <div className="details-commande-info">
          <p className="details-commande-title">Détails de la commande :</p>
          <p className="montant-total-confirmation">
            Montant total : <span>{montantTotal} Ar</span>
          </p>
        </div>
      </div>
      <p className="email-sent-note">Un email de confirmation vous a été envoyé</p>
      <button
        className="retour-boutique-btn"
        onClick={() => (window.location.href = "/boutique")}
      >
        Retour à la boutique
      </button>
    </div>
  );
};

const CheckoutFlowHeader = ({ currentStep }) => {
  const displaySteps = [
    { id: 1, name: "Panier", icon: "1" }, // Étape 1 Produits (dans l'affichage c'est le Panier)
    { id: 2, name: "Commande", icon: "2" }, // Étape 2 Détails (Livraison)
    { id: 3, name: "Paiement", icon: "3" }, // Étape 3 Paiement (Choix du mode)
   
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
            {step.id < displaySteps.length && (
              <div className="step-separator"></div>
            )}
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
  const totalPages = Math.ceil(cartItems.length / itemsPerPage);
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
  const [error, setError] = useState(null);
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
  const [erreurLieu, setErreurLieu] = useState(null);
  const [erreurPaiement, setErreurPaiement] = useState(null);
  const [erreurDate, setErreurDate] = useState(null);
  // Ancien état `showDetails` remplacé par `currentStep`
  // const [showDetails, setShowDetails] = useState(false);
  const [commandeConfirmee, setCommandeConfirmee] = useState(null);
  // NOUVEL ÉTAT POUR LE FLUX
  const [currentStep, setCurrentStep] = useState(1); // 1: Panier, 2: Détails (Livraison/Promo), 3: Paiement, 4: Confirmation

  const getPrixApresDecoupe = (produit, option = produit.cuttingOption) => {
    // Utiliser le prix per Kg de l'article pour le calcul
    const prixDeBase = Number(produit.prixPerKg || produit.prix);
    const decoupeSelected = option;
    if (decoupeSelected) {
      const decoupe = decoupesList.find(
        (d) => d.nomDecoupe === decoupeSelected
      );
      if (decoupe && decoupe.coefficient) {
        const coefficient = Number(decoupe.coefficient);
        return prixDeBase * coefficient;
      }
    }
    return prixDeBase;
  };

  const handleRedirectToLogin = () => {
    setShowLoginModal(false);
    navigate("/profil");
  };

  // Nouvelle fonction de navigation vers la page précédente
  const handleContinueShopping = () => {
    navigate(-1);
  };

  // Fonction pour passer à l'étape 2 (Détails Commande)
  const handlePasserCommande = () => {
    if (cartItems.length === 0) {
      toast.error("Votre panier est vide.");
      return;
    }
    setCurrentStep(2); // Passe à l'étape 2
    window.scrollTo(0, 0);
  };

 
  // Fonction pour revenir à l'étape précédente
  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setError(null);
      try {
        const fraisData = await fetchFrais();
        setFraisList(fraisData);
        const decoupeData = await fetchDecoupes();
        setDecoupesList(decoupeData);
        const lieuxData = await fetchLieux();
        setLieuxList(lieuxData);
        const modesData = await fetchModesActifs();
        const modesActifs = modesData.filter((mode) => mode.actif === true);
        setModesPaiementList(modesActifs);
       
      } catch (err) {
        console.error("Erreur fetch données :", err);
      }
    };
    loadData();
  }, []);

  const totalPoids = totalWeight;
  const fraisSelonPoids = fraisList.find(
    (f) => totalPoids >= Number(f.poidsMin) && totalPoids <= Number(f.poidsMax)
  );
  const fraisParPoids = fraisSelonPoids ? Number(fraisSelonPoids.frais) : 0;
  const lieuSelectionne = lieuxList.find(
    (l) => (l.numLieu || l.id) == selectedLieuNum
  );
  const fraisParLieu = lieuSelectionne ? Number(lieuSelectionne.fraisLieu || 0) : 0;
  const fraisLivraisonTotal = fraisParPoids + fraisParLieu;
  const sousTotal = subtotal;
  const montantBrut = sousTotal + (payerLivraisonChecked ? fraisLivraisonTotal : 0);
  const montantAPayer = montantBrut - remise;
  
  const handleApplyCodePromo = async () => {
    const code = codePromo.trim().toUpperCase();
    if (!code) {
      toast.warn("Veuillez entrer un code promo.");
      setRemise(0);
      return;
    }
    try {
      const result = await validerCodePromo(code);
      if (result.valid) {
        setRemise(Number(result.remise));
        toast.success(
          `Code "${code}" appliqué ! ${Number(result.remise).toFixed(
            2
          )} Ar de réduction.`
        );
      } else {
        setRemise(0);
        toast.error("Code promo non valide ou non applicable pour vous.");
      }
    } catch (err) {
      console.error("Erreur lors de la validation du code promo:", err);
      setRemise(0);
      toast.error("Impossible de valider le code promo. Réessayez plus tard.");
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return format(today, "dd/MM/yyyy");
  };

const handleCreateCommande = async () => {
  if (cartItems.length === 0 || !selectedLieuNum || !dateLivraison) return;

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
      sousTotal: Number(item.prixApresDecoupe || getPrixApresDecoupe(item) * (item.poids).toFixed(2)),
    })),
  };

  try {

    setIsCreating(true);
    const res = await createCommande(payload);

    const reference = res.commande?.referenceCommande || "CMD-XXXXXX";
    const montantTotal = res.commande?.montantTotal;

    toast.success(`Commande envoyée ! N°${reference}`, {
      position: "top-center",
   
    });

    setCommandeConfirmee({
      referenceCommande: reference,
      montantTotal: montantTotal,       
         });

    clearCart();
    setCurrentStep(3);

  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || "Erreur lors de l'envoi";
    toast.error("Erreur : " + msg);
  } finally {
    setIsCreating(false);
    setShowConfirmationModal(false);
  }
};


const handleChoisirPaiement = async (mode) => {
  if (mode.nomModePaiement.toLowerCase().includes("espèces") || mode.nomModePaiement.toLowerCase().includes("cash")) {
    toast.success("Paiement en espèces sélectionné ! Nous vous livrons bientôt.");
    setCurrentStep(4); 
  } else {
    try {
      const sessionData = await createStripeSession({referenceCommande: commandeConfirmee.referenceCommande,numModePaiement: mode.numModePaiement,
      montantTotal: commandeConfirmee.montantTotal});
      if (sessionData?.url) {
        window.location.href = sessionData.url;
      }
    } catch (err) {
      toast.error("Erreur lors du lancement du paiement");
    }
  }
};
 
  const handleQuantityChange = (itemId, increment) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
    const poidsDisponible = Number(
      item.poidsMax || item.stockDisponible || Infinity
    );
    const currentPoids = Number(item.poids);
    const nextPoids = currentPoids + increment;
    if (nextPoids <= 0) {
      handleDelete(itemId);
      return;
    }
    if (increment > 0 && nextPoids > poidsDisponible) {
      setErrorModalData({
        nom: item.nom,
        maxPoids: poidsDisponible,
      });
      setShowErrorModal(true);
      return;
    }
    updateQuantity(itemId, nextPoids);
  };

  const handleCuttingOptionChange = (itemId, newOption) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
    const newPrixUnit = getPrixApresDecoupe(item, newOption);
    updateQuantity(itemId, Number(item.poids || 1), newOption, newPrixUnit);
  };

  const handleDelete = (itemId) => {
    removeFromCart(itemId);
    if (currentItems.length === 1 && totalPages > 1) {
      setCurrentPage(Math.max(1, currentPage - 1));
    }
  };

 
  if (currentStep === 4 && commandeConfirmee) {
    return <ConfirmationCommande {...commandeConfirmee} />;
  }

  return (
    <section className="panier-section-wrapper">
      <ToastContainer />
      <CheckoutFlowHeader currentStep={currentStep} />

      <div className="panier-section">
        {error && (
          <div className="alert-error" role="alert">
            <FaExclamationCircle /> {error}
          </div>
        )}

        {/* ⭐️ ÉTAPE 1: AFFICHAGE DE LA LISTE DES PRODUITS (Panier) */}
        {currentStep === 1 && (
          <div className="panier-produits">
            <div className="panier-header">
              <div className="panier-icon-container">
                <img src={panierImage} alt="panier.png" />
                <h3>
                  Mon Panier ({cartItems.length} article
                  {cartItems.length > 1 ? "s" : ""})
                </h3>
              </div>
            </div>
            <div className="panier-item-container">
              {cartItems.length > 0 ? (
                currentItems.map((produit) => (
                  <div className="item-card" key={produit.id}>
                    <div className="item-card-image-info">
                      <img
                        src={produit.image}
                        alt={produit.nom}
                        className="panier-img"
                      />
                      <div className="produit-info-text">
                        <p className="produit-nom">{produit.nom}</p>
                        <p className="prix-per-kg">
                          {Number(produit.prixPerKg || produit.prix)
                            .toFixed(2)
                            .replace(".", ",")}
                          Ar / kg
                        </p>
                      </div>
                    </div>
                    <div className="produit-controls-row">
                      {produit.nomCategorie?.toLowerCase().includes("viande") &&
                        decoupesList.length > 0 && (
                          <div className="cutting-option-group">
                            <label htmlFor={`cutting-${produit.id}`}>
                              Découpe :
                            </label>
                            <select
                              id={`cutting-${produit.id}`}
                              value={
                                produit.cuttingOption ||
                                (decoupesList.find((d) =>
                                  d.nomDecoupe.toLowerCase().includes("entier")
                                )?.nomDecoupe) ||
                                decoupesList[0]?.nomDecoupe
                              }
                              onChange={(e) =>
                                handleCuttingOptionChange(
                                  produit.id,
                                  e.target.value
                                )
                              }
                            >
                              {decoupesList.map((d) => (
                                <option key={d.numDecoupe} value={d.nomDecoupe}>
                                  {d.nomDecoupe}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      <div className="quantite-control-group">
                        <button
                          onClick={() => handleQuantityChange(produit.id, -1)}
                          disabled={Number(produit.poids) <= 1}
                        >
                          -
                        </button>
                        <span>{Number(produit.poids)} kg</span>
                        <button
                          onClick={() => handleQuantityChange(produit.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="produit-final-row">
                      <p className="total-item-prix">
                        {(getPrixApresDecoupe(produit) * Number(produit.poids))
                          .toFixed(2)
                          .replace(".", ",")}
                        Ar
                      </p>
                      <button
                        className="delete-btn"
                        style={{ color: "red" }}
                        onClick={() => handleDelete(produit.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-cart-message">
                  <p>
                    Votre panier est vide. Ajoutez des produits pour commencer
                    votre commande !
                  </p>
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

            {/* ⭐️ BOUTONS D'ACTION POUR LE PANIER */}
            <div className="bouton-paiement">
              <button
                className="passer-commande-btn-retour"
                onClick={handleContinueShopping}
              >
                <FaArrowLeft /> Continuer les achats
              </button>
              {cartItems.length > 0 && (
                <button
                  className="passer-commande-btn"
                  onClick={handlePasserCommande}
                >
                  Passer Commande <FaChevronRight />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ⭐️ ÉTAPE 2: AFFICHAGE DES DÉTAILS DE COMMANDE (Livraison/Code Promo) */}
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
                  dateFormat="dd/MM/yyyy"
                  locale="fr"
                  placeholderText="JJ/MM/AAAA"
                  onChange={(date) => {
                    const isoString = date ? format(date, "yyyy-MM-dd") : "";
                    setDateLivraison(isoString);
                    if (erreurDate) {
                      setErreurDate(null);
                    }
                  }}
                  minDate={new Date(getMinDate())}
                  className="date-input-custom"
                  required
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
        if (!selectedLieuNum) {
      setErreurLieu("Veuillez sélectionner un lieu de livraison");
      return;
    }
    if (!dateLivraison) {
      setErreurDate("Veuillez choisir une date de livraison");
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

    {/* Modes de paiement */}
    <div className="modes-paiement-grid">
      {modesPaiementList.map((mode) => (
        <div
          key={mode.numModePaiement }
          className={`mode-paiement-card ${selectedModePaiement === (mode.numModePaiement ) ? "selected" : ""}`}
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
              />
            ) : (
              <div className="mode-paiement-logo-placeholder">
                <FaLock size={28} />
              </div>
            )}
          </div>
          <span className="mode-name">{mode.nomModePaiement}</span>
          {selectedModePaiement === (mode.numModePaiement || mode.id) && (
            <span className="selected-badge">Sélectionné</span>
          )}
        </div>
      ))}
    </div>

    {/* LES DEUX BOUTONS QUE TU VEUX */}
    <div className="final-actions">
      <button 
        className="btn-continuer-achats" 
        onClick={() => navigate("/")}
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
    </section>
  );
};

export default PanierSection;