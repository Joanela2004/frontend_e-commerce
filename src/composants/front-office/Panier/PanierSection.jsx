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
} from "react-icons/fa";
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
  
  
  const getPrixApresDecoupe = (produit, option = produit.cuttingOption) => {
    const prixDeBase = Number(produit.prixPerKg);
    const decoupeSelected = option; 
    
    if (decoupeSelected) {
               const decoupe = decoupesList.find((d) => d.nomDecoupe === decoupeSelected);
        if (decoupe && decoupe.coefficient) {
            const coefficient = Number(decoupe.coefficient);
            return prixDeBase * coefficient; 
        }
    }
    return prixDeBase; 
}
  const handleRedirectToLogin = () => {
    setShowLoginModal(false);
    navigate("/profil");
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
        if (lieuxData.length > 0) {
          setSelectedLieuNum(lieuxData[0].numLieu || "");
        }

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
  const tranche = fraisList.find(
    (f) => totalPoids >= Number(f.poidsMin) && totalPoids <= Number(f.poidsMax)
  );
  const fraisLivraison = tranche ? Number(tranche.frais) : 0;
  const sousTotal = subtotal;
  const montantBrut = sousTotal + (payerLivraisonChecked ? fraisLivraison : 0);

  const montantAPayer = montantBrut - remise;
  const formattedMontant = montantAPayer.toFixed(2).replace(".", ",");
 

  const handleApplyCodePromo = () => {
    const code = codePromo.trim().toUpperCase();
    if (code === "WELCOME10") {
      const newRemise = Math.min(montantBrut * 0.1, 10);
      setRemise(newRemise);
      alert(
        `Code "${code}" appliqué ! ${newRemise.toFixed(2)} Ar de réduction.`
      );
    } else {
      setRemise(0);
      alert("Code promo non valide.");
    }
  };

 const getMinDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};


  const handleConfirmCommande = async () => {
    if (cartItems.length === 0 || !selectedLieuNum || !dateLivraison) {
      alert("Panier vide ou informations de livraison manquantes.");
      return;
    }
    if (!selectedModePaiement) {
      alert("Veuillez sélectionner un mode de paiement.");
      return;
    }

    const sousTotalCommande = subtotal;
    const fraisLivraisonCommande = fraisLivraison;
    const montantTotalCommande = montantAPayer;

    const numLieuSelectionne = selectedLieuNum;
    const lieuNom =
      lieuxList.find((l) => (l.numLieu || l.id) == numLieuSelectionne)
        ?.nomLieu || "Non spécifié";

    const panierPayload = cartItems.map((item) => {
      const isViande = item.nomCategorie?.toLowerCase().includes("viande");

      return {
        numProduit: item.numProduit || item.id,
        poids: Number(item.poids || item.poids),
        prix: Number(item.prixPerKg || item.prix),
        decoupe: isViande ? item.cuttingOption || "entier" : "entier",
        sousTotal: (
          Number(item.prixPerKg || item.prix) *
          Number(item.poids || item.poids)
        ).toFixed(2),
      };
    });

    const payload = {
      numModePaiement: selectedModePaiement,
      numLieu: numLieuSelectionne,
      lieuNom: lieuNom,
      dateLivraisonSouhaitee: dateLivraison,
      payerLivraison: payerLivraisonChecked,
      statut: "en cours",
      sousTotal: sousTotalCommande.toFixed(2),
      fraisLivraison: fraisLivraisonCommande.toFixed(2),
      montantTotal: montantTotalCommande.toFixed(2),
      codePromo: codePromo || null,
      panier: panierPayload,
    };

    try {
      setIsCreating(true);
      const res = await createCommande(payload);
      alert(
        "Commande créée avec succès (numCommande: " +
          (res.numCommande || res.id) +
          ")"
      );
      clearCart();
      navigate("/mesCommandes");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Erreur lors de la création de la commande";
      setError(msg);
      alert("Erreur : " + msg);
    } finally {
      setIsCreating(false);
    }
  };


  const handleQuantityChange = (itemId, increment) => {
    const item = cartItems.find((i) => i.id === itemId);
    
    if (!item) return; 
const poidsDisponible = Number(item.poidsDisponible); 
    const currentPoids = Number(item.poids); 
    const nextPoids = currentPoids + increment;
   
if (increment > 0 && nextPoids > poidsDisponible) {
        setErrorModalData({
            nom: item.nom,
            maxPoids: poidsDisponible
        });
        setShowErrorModal(true); // On ouvre le modal
        return; 
    }
       updateQuantity(
      itemId,
      nextPoids 
    );
  };



  const handleCuttingOptionChange = (itemId, newOption) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
      const newPrixUnit = getPrixApresDecoupe(item, newOption); // 👈 Calcul du prix unitaire corrigé
     updateQuantity(
        itemId, 
        Number(item.poids || 1), 
        newOption, 
        newPrixUnit 
    );
};

  const handleDelete = (itemId) => {
    removeFromCart(itemId);
    if (currentItems.length === 1 && totalPages > 1) {
      setCurrentPage(Math.max(1, currentPage - 1));
    }
  };

  const handlePasserCommandeClick = () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    if (cartItems.length === 0) {
      alert("Votre panier est vide.");
      return;
    }
    if (!selectedLieuNum || !dateLivraison) {
      alert("Veuillez sélectionner un lieu et une date de livraison.");
      return;
    }
    if (!selectedModePaiement) {
      const paiementSection = document.querySelector(".paiement-section");
      if (paiementSection)
        paiementSection.scrollIntoView({ behavior: "smooth", block: "start" });
      alert("Veuillez sélectionner un mode de paiement.");
      return;
    }
    handleConfirmCommande();
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

  return (
    <section className="panier-section">
      {error && (
        <div className="alert-error" role="alert">
          <FaExclamationCircle /> {error}
        </div>
      )}

      <div className="panier-produits">
        <div className="panier-header">
          <div className="panier-icon-container">
            <img
              src={panierImage}
              className="panier-image"
              alt="Panier icône"
            />
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
                            produit.cuttingOption || decoupesList[0]?.nomDecoupe
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
                      disabled={
                        Number(produit.poids || produit.poids) <= 1
                      }
                    >
                      -
                    </button>
                    <span>
                      {Number(produit.poids || produit.poids)} kg
                    </span>
                    <button onClick={() => handleQuantityChange(produit.id, 1)}>
                      +
                    </button>
                  </div>
                </div>

                <div className="produit-final-row">
                  <p className="total-item-prix">
                    {(
                     getPrixApresDecoupe(produit)* Number(produit.poids)
                    )
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
      </div>

      {cartItems.length > 0 && (
        <div className="right-panel-wrapper">
                 
          <div className="panier-total-card livraison-info-card">
                     
            <h3>
              <FaTruck /> Informations de Livraison
            </h3>
                               
            <div className="livraison-input-group">
                          <FaMapMarkerAlt className="input-icon" />           
              <select
                value={selectedLieuNum}
                onChange={(e) => setSelectedLieuNum(e.target.value)}
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
                                
            <div className="livraison-input-group">
                          <FaCalendarAlt className="input-icon" />
                         
              <input
                type="date"
                value={dateLivraison}
                onChange={(e) => setDateLivraison(e.target.value)}
                min={getMinDate()}
                required
              />
                       
            </div>
            <div className="livraison-input-group" style={{ marginTop: "10px" }}>
  <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <input
      type="checkbox"
      checked={payerLivraisonChecked}
      onChange={() => setPayerLivraisonChecked(!payerLivraisonChecked)}
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
                             
                <div className="text">
                                  <h2>Sous-Total</h2>               
                  <p>{sousTotal.toFixed(2).replace(".", ",")} Ar</p>           
                   
                </div>
                             
               {payerLivraisonChecked && (
  <div className="text">
    <h2> Frais de Livraison</h2>
    <p>{fraisLivraison.toFixed(2).replace(".", ",")} Ar</p>
  </div>
)}

                             
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
                <p className="total-prix-to-pay">{formattedMontant} Ar</p>     
                     
              </div>
                       
            </div>
                   
          </div>
                 
          <div className="paiement-section">
                      <h3> Sélectionnez votre Mode de Paiement</h3>         
            {modesPaiementList.length > 0 ? (
              modesPaiementList.map((mode) => (
                <div
                  key={mode.numModePaiement || mode.id}
                  className={`paiement-option ${
                    selectedModePaiement === (mode.numModePaiement || mode.id)
                      ? "active-payment"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedModePaiement(mode.numModePaiement || mode.id)
                  }
                >
                                 
                  <div className="logo-container">
                                      {getLogoContent(mode)}               
                  </div>
                                 
                  <div className="text-info">
                                      <h4>{mode.nomModePaiement}</h4>           
                                          
                  </div>
                                  <FaChevronRight className="arrow-icon" />     
                         
                </div>
              ))
            ) : (
              <p className="info-message">
                Chargement des modes de paiement...
              </p>
            )}
                   
          </div>
                 
          <button
            className="passer-commande-btn"
            onClick={handlePasserCommandeClick}
            disabled={isCreating}
          >
                     
            {isCreating ? "Traitement..." : <> Valider la Commande et Payer</>} 
                 
          </button>
               
        </div>
      )}

      <ModalConnexion
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginRedirect={handleRedirectToLogin}
      />
      {showErrorModal && errorModalData && (
          <ModalAvertissement
              show={showErrorModal}
              onClose={() => setShowErrorModal(false)}
              nom={errorModalData.nom}
              maxPoids={errorModalData.maxPoids}
          />
      )}
    </section>
  );
};

export default PanierSection;
