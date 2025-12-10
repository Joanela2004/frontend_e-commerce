// src/components/front-office/Commande/CarteCommande.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const formatDateOnly = (dateString) => {
  if (!dateString) return "Date inconnue";
  const date = new Date(dateString);
  return `Le ${date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
};

const CarteCommande = ({ order, onSelectOrder }) => {
  const productsGridRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction, e) => {
    e.stopPropagation();
    if (productsGridRef.current) {
      const scrollAmount = 280;
      productsGridRef.current.scrollLeft += direction === "gauche" ? -scrollAmount : scrollAmount;
    }
  };

  // Détection si la commande est encore en attente de paiement
  const estEnAttente = ["en attente", "attente"].some(s =>
    (order.statut || "").toLowerCase().includes(s)
  );

  // Détection du mode de paiement actuel (pour le texte du bouton)
  const modeActuel = (order?.modePaiement?.nomModePaiement || "").toLowerCase();
  const estPaiementALivraison = modeActuel.includes("espèces") || modeActuel.includes("cash");

  const handleAction = (e) => {
    e.stopPropagation();
    if (estEnAttente) {
      onSelectOrder(order); // Ouvre le modal de paiement
    } else {
      navigate(`/client/mesCommandes/${order.numCommande}/livraison`, {
        state: { commande: order },
      });
    }
  };

  const showNavigation = order.detail_commandes?.length > 4;

  // Mapping exact du statut → classe CSS (identique à ton dashboard)
  const getStatutClass = (statut) => {
    const s = statut.toLowerCase();
    if (s.includes("attente")) return "attente";
    if (s.includes("payée") || s.includes("paye")) return "paye";
    if (s.includes("validée") || s.includes("validee")) return "validee";
    if (s.includes("expédiée") || s.includes("expediee")) return "expediee";
    if (s.includes("livrée") || s.includes("livree")) return "livree";
    if (s.includes("annulée") || s.includes("annulee")) return "annulee";
    return ""; // fallback
  };

  return (
    <div
      className={`carte-commande ${order.statut.replace(/\s+/g, "-").toLowerCase()}`}
      style={{ cursor: estEnAttente ? "pointer" : "default" }}
      onClick={() => estEnAttente && onSelectOrder(order)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && estEnAttente && onSelectOrder(order)}
    >
      {/* En-tête */}
      <div className="en-tete-carte">
        <div className="info-commande">
          <p>
            <strong>Commande n°</strong>{" "}
            <span className="id-commande">{order.referenceCommande}</span>
          </p>
          <p className="date-commande">{formatDateOnly(order.dateCommande)}</p>
        </div>

        <div className="statut-total-commande">
          <span className="total-commande">
            {Number(order.montantTotal).toLocaleString("fr-FR")} Ar
          </span>

          {/* BADGE STATUT IDENTIQUE À TON DASHBOARD */}
          <span className={`stat-item ${getStatutClass(order.statut)}`}>
            {order.statut}
          </span>
        </div>
      </div>

      <hr className="separateur-carte" />

      {/* Carrousel produits */}
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

      {/* Bouton d'action */}
      <div className="pied-carte">
        <button
          onClick={handleAction}
          className="bouton-suivre-commande"
          style={{
            background: estEnAttente
              ? "#8b5e3c"
              : "#28a458",
            fontWeight: "600",
          }}
        >
          {estEnAttente ? (
            estPaiementALivraison ? (
              "Changer le mode de paiement"
            ) : (
              "Finaliser le paiement"
            )
          ) : (
            "Suivre la livraison"
          )}
        </button>
      </div>
    </div>
  );
};

export default CarteCommande;