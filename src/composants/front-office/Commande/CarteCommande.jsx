import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteCommandeClient } from "../../../services/commandeService";
import ModalConfirmation from "./ModalConfirmation";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const formatDateHeureServer = (dateString) => {
  if (!dateString) return "Date inconnue";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Date invalide";

  const jour = String(date.getDate()).padStart(2, "0");
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const annee = date.getFullYear();
  const heures = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `Le ${jour}/${mois}/${annee} à ${heures}:${minutes}`;
};

const CarteCommande = ({ order, onSelectOrder, refreshCommandes }) => {
  const productsGridRef = useRef(null);
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const scroll = (direction, e) => {
    e.stopPropagation();
    if (productsGridRef.current) {
      const scrollAmount = 280;
      productsGridRef.current.scrollLeft += direction === "gauche" ? -scrollAmount : scrollAmount;
    }
  };
  
  const modePaiement = order.mode_paiement || order.modePaiement;
  const nomModePaiement = modePaiement?.nomModePaiement || "Non spécifié";
  
  const estEnAttenteDePaiement = () => {
    const statutLower = (order.statut || "").toLowerCase();
    
   
    if (statutLower.includes("attente")) {
      if (order.paiement?.statutPaiement === "payé") {
        return false;
      }
      return true;
    }
    
    return false; 
  };

  const estEnAttente = estEnAttenteDePaiement();
  const estPaiementALivraison = nomModePaiement.toLowerCase().includes("espèces") || 
                                nomModePaiement.toLowerCase().includes("cash") ||
                                nomModePaiement.toLowerCase().includes("livraison");

  const handlePaymentClick = (e) => {
    e.stopPropagation();
    onSelectOrder(order);
  };

  const openConfirmModal = (e) => {
    e.stopPropagation();
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteOrder = async () => {
    closeConfirmModal();
    try {
      await deleteCommandeClient(order.referenceCommande);
      toast.success("Commande annulée avec succès ! Vous pouvez maintenant modifier vos produits.");
      refreshCommandes();
      navigate("/panier");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Impossible d'annuler la commande.";
      toast.error(message);
    }
  };

  const handleSuivreLivraison = (e) => {
    e.stopPropagation();
    navigate(`/client/mesCommandes/${order.numCommande}/livraison`, {
      state: { commande: order },
    });
  };

  const showNavigation = order.detail_commandes?.length > 4;

  const getStatutClass = (statut) => {
    const s = statut.toLowerCase();
    if (s.includes("attente")) return "attente";
    if (s.includes("payée") || s.includes("paye")) return "paye";
    if (s.includes("validée") || s.includes("validee")) return "validee";
    if (s.includes("expédiée") || s.includes("expediee")) return "expediee";
    if (s.includes("livrée") || s.includes("livree")) return "livree";
    if (s.includes("annulée") || s.includes("annulee")) return "annulee";
    return "";
  };

  return (
    <>
      <div
        className={`carte-commande ${order.statut.replace(/\s+/g, "-").toLowerCase()}`}
        style={{ cursor: estEnAttente ? "pointer" : "default" }}
        onClick={() => estEnAttente && onSelectOrder(order)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && estEnAttente && onSelectOrder(order)}
      >
        <div className="en-tete-carte">
          <div className="info-commande">
            <p>
              <strong>Commande n°</strong>{" "}
              <span className="id-commande">{order.referenceCommande}</span>
            </p>
            <p className="date-commande">
              {formatDateHeureServer(order.dateCommande)}
            </p>
          </div>
          <div className="statut-total-commande">
            <span className="total-commande">
              {Number(order.montantTotal).toLocaleString("fr-FR")} Ar
            </span>
            <span className={`stat-item ${getStatutClass(order.statut)}`}>
              {order.statut}
            </span>
          </div>
        </div>

        <hr className="separateur-carte" />

        <div className="conteneur-carrousel-produits">
          {showNavigation && (
            <button
              className="bouton-carrousel gauche"
              onClick={(e) => scroll("gauche", e)}
              aria-label="Précédent"
            >
              ←
            </button>
          )}
          <div className="grille-produits-commande" ref={productsGridRef}>
            {order.detail_commandes?.map((item, index) => (
              <div key={index} className="element-produit">
                <div className="conteneur-image-produit">
                  <img
                    src={
                      item.produit?.image
                        ? `${IMAGE_BASE_URL}/${item.produit.image.startsWith("/")
                            ? item.produit.image.slice(1)
                            : item.produit.image}`
                        : "/placeholder.png"
                    }
                    alt={item.produit?.nomProduit || "Produit"}
                    className="image-produit"
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </div>
                <p className="nom-produit">{item.produit?.nomProduit || "Produit inconnu"}</p>
                <p className="prix-produit">
                  {Number(item.prixUnitaire).toLocaleString("fr-FR")} Ar × {item.poids} kg
                </p>
              </div>
            ))}
          </div>
          {showNavigation && (
            <button
              className="bouton-carrousel droite"
              onClick={(e) => scroll("droite", e)}
              aria-label="Suivant"
            >
              →
            </button>
          )}
        </div>

        {/* Boutons d'action - CORRIGÉ */}
        <div className="pied-carte">
          {estEnAttente ? (
            <>
              <button
                onClick={handlePaymentClick}
                className="bouton-suivre-commande"
                style={{
                  background: "#8b5e3c",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                {estPaiementALivraison
                  ? "Changer le mode de paiement"
                  : "Finaliser le paiement"}
              </button>
              <button
                onClick={openConfirmModal}
                className="bouton-suivre-commande"
                style={{
                  background: "white",
                  color: "red",
                  border: "1px solid red",
                  fontWeight: "600",
                }}
              >
                Annuler la commande
              </button>
            </>
          ) : (
            <button
              onClick={handleSuivreLivraison}
              className="bouton-suivre-commande"
              style={{
                background: "#28a458",
                fontWeight: "600",
              }}
            >
              Suivre la livraison
            </button>
          )}
        </div>
      </div>

      <ModalConfirmation
        show={showConfirmModal}
        onClose={closeConfirmModal}
        onConfirm={confirmDeleteOrder}
        title="Annuler la commande"
      >
        <p>Voulez-vous vraiment annuler cette commande ?</p>
        <p>Vous pourrez ensuite modifier vos produits et repasser une nouvelle commande.</p>
      </ModalConfirmation>
    </>
  );
};

export default CarteCommande;