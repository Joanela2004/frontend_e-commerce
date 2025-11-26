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
  FaShoppingCart,
  FaArrowLeft, 
} from "react-icons/fa";
import {createStripeSession} from "../../../services/StripeService";
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
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fr } from 'date-fns/locale';
import { parseISO, format } from 'date-fns';
import "../../../styles/calendrier.css";
registerLocale('fr', fr);


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
                    <p className="montant-total-confirmation">Montant total : <span>{montantTotal} Ar</span></p>
                </div>
            </div>
            <p className="email-sent-note">Un email de confirmation vous a été envoyé</p>
            <button className="retour-boutique-btn" onClick={() => window.location.href = "/boutique"}>Retour à la boutique</button>
        </div>
    );
};

const CheckoutFlowHeader = ({ currentStep }) => {
    const steps = [
        { id: 1, name: "Produits", icon: "1" }, // Étape 1 Produits (dans l'affichage c'est le Panier)
        { id: 2, name: "Détails", icon: "2" }, // Étape 2 Détails (Livraison/Paiement)
        { id: 3, name: "Paiement", icon: "3" }, // Étape 3 Paiement (Confirmation)
        { id: 4, name: "Confirmation", icon: "4" },
    ];
    
    // Ajustement des icônes pour le flux d'affichage (Panier -> Détails -> Confirmation)
    const displaySteps = [
        { id: 1, name: "Panier", icon: "1" }, 
        { id: 2, name: "Livraison", icon: "2" },
        { id: 3, name: "Paiement", icon: "3" },
        { id: 4, name: "Confirmation", icon: "4" },
    ]

    return (
        <div className="checkout-flow-header">
                 <div className="flow-steps">
                {displaySteps.map((step) => (
                    <React.Fragment key={step.id}>
                        <div className={`flow-step ${step.id === currentStep ? 'active' : ''} ${step.id < currentStep ? 'completed' : ''}`}>
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
    clearCart, // Gardé mais non utilisé ici (sauf après commande)
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
  const [showDetails, setShowDetails] = useState(false);
  const [commandeConfirmee, setCommandeConfirmee] = useState(null);
  // Logique pour currentStep ajustée au flux réel: Panier (1) -> Détails (2) -> Confirmation (3)
  const currentStep = commandeConfirmee ? 4 : (showDetails ? 2 : 1); 
 
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
    // Après connexion, l'utilisateur revient à la page du panier/détails
    // Il peut être pertinent de recharger le panier ici via loadCart() du context
    navigate("/panier"); // Redirection vers le panier après login
  };
  
  // Nouvelle fonction de navigation vers la page précédente
  const handleContinueShopping = () => {
    navigate(-1);
  };
  
  // Fonction pour basculer vers les détails (étape suivante)
  const handlePasserCommande = () => {
      if (cartItems.length === 0) {
          toast.error("Votre panier est vide.");
          return;
      }
      setShowDetails(true);
      window.scrollTo(0, 0); 
  };
  
  // Fonction pour revenir au panier (étape précédente)
  const handleRevenirAuPanier = () => {
      setShowDetails(false);
      window.scrollTo(0, 0); 
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

        if (modesActifs.length > 0) {
          setSelectedModePaiement(
            modesActifs[0].numModePaiement || modesActifs[0].id
          );
        }
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
  const formattedMontant = montantAPayer.toFixed(2).replace(".", ",");


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
      toast.success(`Code "${code}" appliqué ! ${Number(result.remise).toFixed(2)} Ar de réduction.`);
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
     return format(today, 'yyyy-MM-dd');
    };

const handleConfirmCommande = async () => {
  setShowConfirmationModal(false);

  if (cartItems.length === 0 || !selectedLieuNum || !dateLivraison) return;
  if (!selectedModePaiement) return; // Devrait déjà être vérifié par handlePasserCommandeClickFinal

  const sousTotalCommande = subtotal;
  const fraisLivraisonCommande = payerLivraisonChecked ? fraisLivraisonTotal : 0;
  const montantTotalCommande = montantAPayer;

  const numLieuSelectionne = selectedLieuNum;
  const lieuNom =
    lieuxList.find((l) => (l.numLieu || l.id) == numLieuSelectionne)
      ?.nomLieu || "Non spécifié";

  const panierPayload = cartItems.map((item) => {
    const isViande = item.nomCategorie?.toLowerCase().includes("viande");
    return {
      numProduit: item.numProduit,
      poids: Number(item.poids),
      // ⭐️ Utiliser prixApresDecoupe qui contient le prix unitaire final
      prix: Number(item.prixApresDecoupe), 
      decoupe: isViande ? item.cuttingOption || "entier" : null, // Envoyer null ou "entier"
      sousTotal: (Number(item.prixApresDecoupe) * Number(item.poids)).toFixed(2),
    };
  });

  const payload = {
    numModePaiement: selectedModePaiement,
    numLieu: numLieuSelectionne,
    lieuNom: lieuNom,
    dateLivraisonSouhaitee: dateLivraison,
    payerLivraison: payerLivraisonChecked,
    statut: "en attente",
    sousTotal: sousTotalCommande.toFixed(2),
    fraisLivraison: fraisLivraisonCommande.toFixed(2),
    montantTotal: montantTotalCommande.toFixed(2),
    codePromo: codePromo || null,
    panier: panierPayload,
  };

  try {
    setIsCreating(true);
    const res = await createCommande(payload);
    toast.success(
      "Commande envoyée avec succès (numéro: " +
        (res.numCommande || res.id) +
        ")",
      { position: "top-center", autoClose: 8000 }
    );
    clearCart();
        setCommandeConfirmee({
        montantTotal: formattedMontant,
        numCommande: res.numCommande || res.id
    });
    
  } catch (err) {
    const msg =
      err?.response?.data?.error ||
      err?.message ||
      "Erreur lors de la création de la commande";
    setError(msg);
    toast.error("Erreur de commande : " + msg);
  } finally {
    setIsCreating(false);
  }
};

const handlePaiementStripe = async (mode) => {
  setErreurPaiement(null);
  
  // Vérifications panier / livraison
  if (!selectedLieuNum || !dateLivraison) {
    toast.error("Veuillez sélectionner un lieu et une date de livraison avant de procéder au paiement.");
    return;
  }
  if (cartItems.length === 0) {
    toast.error("Votre panier est vide.");
    return;
  }

    // Définir le mode de paiement sélectionné
    setSelectedModePaiement(mode.numModePaiement || mode.id);
  
  // Si le mode est "En espèces" ou similaire, on passe à la confirmation modale
  if (mode.nomModePaiement.toLowerCase().includes("espèces") || mode.nomModePaiement.toLowerCase().includes("cash")) {
      handlePasserCommandeClickFinal(true); 
      return;
  }

  // Logique Stripe
  try {
    const sessionData = await createStripeSession(cartItems, montantAPayer);

    if (sessionData?.url) {
      window.location.href = sessionData.url; // Redirection vers Stripe
    } else {
      toast.error("Impossible de lancer le paiement Stripe.");
    }
  } catch (err) {
    console.error("Erreur Stripe Checkout:", err);
    toast.error("Impossible de lancer le paiement Stripe.");
  }
};


// Renommée pour éviter la confusion avec handlePasserCommande (changement d'étape)
const handlePasserCommandeClickFinal = (skipPaiementCheck = false) => {
    setErreurLieu(null);
    setErreurDate(null);
    setErreurPaiement(null);
    setError(null);
    let hasError = false;

    const token = localStorage.getItem("userToken");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedLieuNum) {
      setErreurLieu("Veuillez sélectionner un lieu");
      hasError = true;
    }
    if (!dateLivraison) {
      setErreurDate("Veuillez sélectionner une date");
      hasError = true;
    }
    
    // Vérification du mode de paiement
    if (!selectedModePaiement && !skipPaiementCheck) { 
      const paiementSection = document.querySelector(".paiement-section");
      if (paiementSection)
        paiementSection.scrollIntoView({ behavior: "smooth", block: "start" });
      setErreurPaiement("Veuillez sélectionner un mode de paiement.");
      hasError = true;
    }
    
    // Si pas d'erreur, on affiche la modale de confirmation
    if (!hasError) {
      setShowConfirmationModal(true);
    } else {
        // En cas d'erreur de livraison/date, on scroll vers la section concernée
        const livraisonSection = document.querySelector(".livraison-info-card");
        if (livraisonSection)
            livraisonSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  
  const handleQuantityChange = (itemId, increment) => {
    const item = cartItems.find((i) => i.id === itemId);

    if (!item) return;
    // ⭐️ CORRECTION: Utiliser la clé de stock correcte
    const poidsDisponible = Number(item.poidsMax || item.stockDisponible || Infinity); 
    const currentPoids = Number(item.poids);
    const nextPoids = currentPoids + increment;
    
    if (nextPoids <= 0) {
        // Supprimer l'article si la quantité atteint zéro
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
    // Mettre à jour la quantité avec la nouvelle valeur
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

  const getLogoContent = (mode) => {
    if (mode.image) {
      return (
        <img
          src={`${IMAGE_BASE_URL}${
            mode.image.startsWith("/") ? mode.image.substring(1) : mode.image
          }`}
          alt={mode.nomModePaiement}
          className="mode-paiement-logo-img"
        />
      );
    }
    return (
      <div className="mode-paiement-logo-img no-image">
        {mode.nomModePaiement}
      </div>
    );
  };
  
  if (commandeConfirmee) {
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
          
          {/* ⭐️ AFFICHAGE DE LA LISTE DES PRODUITS (Étape 1) */}
          {!showDetails && (
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
                                  produit.cuttingOption || (decoupesList.find(d => d.nomDecoupe.toLowerCase().includes('entier'))?.nomDecoupe) || decoupesList[0]?.nomDecoupe
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
                          <button onClick={() => handleQuantityChange(produit.id, 1)}
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
                      Votre panier est vide. Ajoutez des produits pour commencer votre
                      commande !
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
                  <button className="passer-commande-btn-retour" onClick={handleContinueShopping}>
                      <FaArrowLeft /> Continuer les achats
                  </button>
                  {cartItems.length > 0 && (
                    <button className="passer-commande-btn" onClick={handlePasserCommande}>
                        Passer Commande <FaChevronRight />
                    </button>
                  )}
              </div>
            </div>
          )}

          {/* ⭐️ AFFICHAGE DES DÉTAILS DE COMMANDE (Étape 2) */}
          {showDetails && cartItems.length > 0 && (
            <div className="right-panel-wrapper"> 
             
              <div className="panier-total-card livraison-info-card">
                         
                <h3>
                  <FaTruck /> Informations de Livraison
                </h3>
                   {" "}
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
                         {" "}
                {erreurDate && (
                  <div className="message-erreur-inline">{erreurDate}</div>
                )}{" "}
                                    
                <div className="livraison-input-group">
                              <FaCalendarAlt className="input-icon" />
                             
                  <DatePicker
                    selected={dateLivraison ? parseISO(dateLivraison) : null}
                    dateFormat="dd/MM/yyyy"
                    locale="fr"
                    placeholderText="JJ/MM/AAAA"
                    onChange={(date) => {
                      const isoString = date ? format(date, 'yyyy-MM-dd') : "";
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
                                  {remise.toFixed(2).replace(".", ",")} Ar de remise
                    appliquée !            
                  </p>
                )}
                       
              </div>
                     
              <div className="panier-total-card commande-globale-card">
                         
                <div className="total-card">
                             
                  <div className="total-card-top">
                    <div className="text">
                      <h2>Poids total du panier </h2>
                      {totalPoids > 0 && <p> {totalPoids.toFixed(2)} kg</p>}       
                    </div>
                    
                             {payerLivraisonChecked && (
                      <div className="text">
                        <h2> Frais de poids</h2>
                        <p>{fraisParPoids.toFixed(2).replace(".", ",")} Ar</p>
                      </div>
                    )}
                    
                    {/* CONTINUATION DE LA LOGIQUE DES FRAIS */}
                    {payerLivraisonChecked && (
                      <div className="text">
                        <h2> Frais de Lieu ({lieuSelectionne?.nomLieu || 'Non sélectionné'})</h2>
                        <p>{fraisParLieu.toFixed(2).replace(".", ",")} Ar</p>
                      </div>
                    )}
                    
                    <div className="text">
                      <h2>Sous-total des produits</h2>
                      <p>{sousTotal.toFixed(2).replace(".", ",")} Ar</p>
                    </div>
                    
                    {remise > 0 && (
                      <div className="text promo-remise">
                        <h2>Réduction Code Promo</h2>
                        <p>- {remise.toFixed(2).replace(".", ",")} Ar</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="total-card-bottom">
                    <div className="text montant-final">
                      <h2>Total à Payer</h2>
                      <p>{formattedMontant} Ar</p>
                    </div>
                  </div>
                </div>
                     
              </div>
                     
              {/* Section Paiement */}
              <div className="panier-total-card paiement-section">
                         
                <h3>
                  <FaLock /> Mode de Paiement
                </h3>
                         
                {erreurPaiement && (
                  <div className="message-erreur-inline">{erreurPaiement}</div>
                )}
                         
                <div className="modes-paiement-list">
                  {modesPaiementList.map((mode) => (
                    <div
                      key={mode.numModePaiement || mode.id}
                      className={`mode-paiement-item ${
                        (mode.numModePaiement || mode.id) == selectedModePaiement
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        // Si l'utilisateur clique sur un mode, on le gère via handlePaiementStripe
                        handlePaiementStripe(mode);
                      }}
                    >
                      {getLogoContent(mode)}
                      <span className="mode-paiement-name">
                        {mode.nomModePaiement}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
                     
              {/* Boutons de navigation et de validation finale */}
              <div className="bouton-paiement">
                <button className="passer-commande-btn-retour" onClick={handleRevenirAuPanier}>
                  <FaArrowLeft /> Revenir au Panier
                </button>
                {selectedModePaiement && (
                  <button
                    className={`passer-commande-btn ${isCreating ? 'loading' : ''}`}
                    onClick={() => handlePasserCommandeClickFinal()}
                    disabled={isCreating}
                  >
                    {isCreating ? 'En cours...' : 'Finaliser Commande'} <FaChevronRight />
                  </button>
                )}
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
            onLoginSuccess={handleRedirectToLogin}
          />
        )}
        {showConfirmationModal && (
          <ModalConfirmation
            show={showConfirmationModal}
            onClose={() => setShowConfirmationModal(false)}
            onConfirm={handleConfirmCommande}
            montantTotal={formattedMontant}
            isCreating={isCreating}
          />
        )}
    </section>
  );
};

export default PanierSection;