import React, { useEffect, useState, useRef } from "react";
import "../../../styles/front-office/Commande/Commandes.css"; 
import "../../../styles/front-office/global.css";
import { useNavigate } from "react-router-dom";
import FiltresCommandes from "./FiltresCommandes"; 
import { fetchMesCommandes } from "../../../services/commandeService";
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const CarteCommande = ({ order }) => {
  const productsGridRef = useRef(null);
  const navigate = useNavigate(); 

  const scroll = (direction) => {
    if (productsGridRef.current) {
      const scrollAmount = 250; 
      if (direction === 'gauche') {
        productsGridRef.current.scrollLeft -= scrollAmount;
      } else {
        productsGridRef.current.scrollLeft += scrollAmount;
      }
    }
  };

  const handleTrackOrder = () => {
    navigate(`/client/livraisons/${order.numCommande}`, { 
      state: { commande: order } 
    });
  };

  const showNavigation = order.detail_commandes.length > 4;

  return (
    <div className={`carte-commande ${order.statut.replace(/\s/g, '-')}`}>
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
          <button className="bouton-carrousel gauche" onClick={() => scroll('gauche')} aria-label="Précédent">
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
          <button className="bouton-carrousel droite" onClick={() => scroll('droite')} aria-label="Suivant">
            &gt;
          </button>
        )}
      </div>

      <div className="pied-carte">
        <button className="bouton-suivre-commande" onClick={handleTrackOrder}>
          Suivre Livraison
        </button>
      </div>
    </div>
  );
};

const HistoriqueCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtreDate, setFiltreDate] = useState("");

  const fetchData = async () => {
    try {
      const data = await fetchMesCommandes(); 
      setCommandes(data);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes :", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const commandesFiltrees = commandes.filter((order) => {
    const matchStatut = filtreStatut === "Tous" ? true : order.statut === filtreStatut;
    const matchDate = filtreDate ? order.dateCommande.startsWith(filtreDate) : true;
    return matchStatut && matchDate;
  });

  return (
    <div className="historique-commandes">
      <div className="filtre-commandes">
      <FiltresCommandes 
  filtreStatut={filtreStatut}
  setFiltreStatut={setFiltreStatut}
  filtreDate={filtreDate}
  setFiltreDate={setFiltreDate}
  statutsDisponibles={["Tous", "expédiée", "livrée", "validée", "en attente"]}
/>

      </div>

      <div className="list-commandes-section">
        <div className="grille-commandes">
          {commandesFiltrees.map((order) => (
            <CarteCommande key={order.numCommande} order={order} />
          ))}
          {commandesFiltrees.length === 0 && <p>Aucune commande trouvée.</p>}
        </div>
      </div>
    </div>
  );
};

export default HistoriqueCommandes;
