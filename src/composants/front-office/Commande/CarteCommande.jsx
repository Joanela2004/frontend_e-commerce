// src/components/front-office/Commande/CarteCommande.jsx

import React, { useRef } from "react";
import { useNavigate } from "react-router-dom"; 
// Importez si nécessaire, mais l'action sera gérée par le composant parent.
// import { Clock, CreditCard, Truck } from 'lucide-react'; 

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

// Ajout de 'onSelectOrder' et 'isSelected' comme props
const CarteCommande = ({ order, onSelectOrder, isSelected }) => { 
  const productsGridRef = useRef(null);
  const navigate = useNavigate(); 
  
  const scroll = (direction, e) => { // Prendre l'événement pour l'arrêter
    e.stopPropagation(); // Empêche la sélection de la carte
    if (productsGridRef.current) {
      const scrollAmount = 250; 
      if (direction === 'gauche') {
        productsGridRef.current.scrollLeft -= scrollAmount;
      } else {
        productsGridRef.current.scrollLeft += scrollAmount;
      }
    }
  };

  const handleAction = (e) => {
    e.stopPropagation(); // Empêche la sélection de la carte
    const isPending = order.statut.toLowerCase().includes("attente");
    
    if (isPending) {
      // Si en attente, on ouvre le panneau de paiement (la logique est dans le parent)
      onSelectOrder(order); 
    } else {
      // Sinon, on navigue vers le suivi de livraison
      navigate(`/client/mesCommandes/${order.numCommande}/livraison`, { 
        state: { commande: order } 
      });
    }
  };

  const showNavigation = order.detail_commandes.length > 4;
  const isPending = order.statut.toLowerCase().includes("attente");

  return (
    // La carte devient cliquable pour la sélection
    <div 
      className={`carte-commande ${order.statut.replace(/\s/g, '-')} ${isSelected ? 'carte-commande-selected' : ''}`}
      onClick={() => onSelectOrder(order)} // Sélectionne la commande
    >
      <div className="en-tete-carte">
        <div className="info-commande">
          <p><strong>Commande numéro :</strong> <span className="id-commande">{order.referenceCommande}</span></p>
          <p className="date-commande">{order.dateCommande}</p>
        </div>
        <div className="statut-total-commande">
          <span className="total-commande">{Number(order.montantTotal).toLocaleString()} Ar</span>
          <span className={`badge-statut ${order.statut.replace(/\s/g, '-')}`}>
            {order.statut}
          </span>
        </div>
      </div>

      <hr className="separateur-carte" />

      <div className="conteneur-carrousel-produits">
        {showNavigation && (
          <button className="bouton-carrousel gauche" onClick={(e) => scroll('gauche', e)} aria-label="Précédent">
            &lt;
          </button>
        )}

        <div className="grille-produits-commande" ref={productsGridRef}>
          {order.detail_commandes?.map((item, index) => (
            <div key={index} className="element-produit">
              <div className="conteneur-image-produit">
                <img
                  src={item.produit?.image ? `${IMAGE_BASE_URL}/${item.produit.image}` : "/placeholder.png"}
                  alt={item.produit?.nomProduit || "Produit"}
                  className="image-produit"
                />
              </div>
              <p className="nom-produit">{item.produit?.nomProduit}</p>
              <p className="prix-produit">
                {Number(item.prixUnitaire).toLocaleString()} Ar × {item.poids} kg
              </p>
            </div>
          ))}
        </div>

        {showNavigation && (
          <button className="bouton-carrousel droite" onClick={(e) => scroll('droite', e)} aria-label="Suivant">
            &gt;
          </button>
        )}
      </div>

      <div className="pied-carte">
        <button className="bouton-suivre-commande" onClick={handleAction}>
          {isPending ? 'Finaliser Paiement' : 'Suivre Livraison'}
        </button>
      </div>
    </div>
  );
};

export default CarteCommande;