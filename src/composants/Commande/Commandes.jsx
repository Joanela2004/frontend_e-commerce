import React, { useState, useRef, useEffect } from "react";
import "../../styles/front-office/Commande/Commandes.css"; 
import carotte from "../../assets/images/carotte.png";
import tomate from "../../assets/images/tomate.png";
import chou from "../../assets/images/chou.png";
import pommeDeTerre from "../../assets/images/pommeDeTerre.png";
import viande from "../../assets/images/legume3.jpg";
import "../../styles/front-office/global.css";
import SuiviLivraison from "./SuiviLivraison";
import FiltresCommandes from "./FiltresCommandes"; 
import { useNavigate } from "react-router-dom";
const productImages = {
  Tomate: tomate,
  Carotte: carotte,
  Courgette: chou,
  "Pomme de terre": pommeDeTerre,
  Viande: viande,
};

const listeCommandesSimulees = [
  {
    id: "12415645",
    date: "15 septembre 2025",
    status: "récu",
    total: "50 000 Ar",
    lieuLivraison: "15 rue des Jardins, 75015 Paris, France",
    nomClient: "Marie Dupont",
    modePaiement: "Carte bancaire **** 4567",
    dateLivraisonEstimee: "30 octobre 2024",
    livraison: {
      statut: "livré(e)s",
      transporteur: "Chronopost",
      referenceColis: "CH456789123FR",
      contactTransporteur: "01 23 45 67 89",
      dateExpedition: "28 octobre 2024",
      dateLivraison: "30 octobre 2024",
    },
    products: [
      { name: "Tomate", price: "15 000 Ar", qty: 3 },
      { name: "Carotte", price: "15 000 Ar", qty: 3 },
      { name: "Courgette", price: "15 000 Ar", qty: 3 },
      { name: "Pomme de terre", price: "15 000 Ar", qty: 3 },
      { name: "Tomate", price: "15 000 Ar", qty: 1 },
      { name: "Carotte", price: "15 000 Ar", qty: 2 },
    ],
  },
  {
    id: "12415646",
    date: "15 septembre 2025",
    status: "en cours",
    total: "50 000 Ar",
    lieuLivraison: "25 Avenue des Fleurs, 69002 Lyon, France",
    nomClient: "Jean Martin",
    modePaiement: "Carte bancaire **** 1234",
    dateLivraisonEstimee: "05 novembre 2025",
    livraison: {
      statut: "en préparation",
      transporteur: "à déterminer",
      referenceColis: null,
      contactTransporteur: null,
      dateExpedition: null,
      dateLivraison: null,
    },
    products: [
      { name: "Tomate", price: "15 000 Ar", qty: 3 },
      { name: "Carotte", price: "15 000 Ar", qty: 3 },
      { name: "Courgette", price: "15 000 Ar", qty: 3 },
      { name: "Pomme de terre", price: "15 000 Ar", qty: 3 },
    ],
  },
  {
    id: "12415647",
    date: "10 septembre 2025",
    status: "en cours",
    total: "35 000 Ar",
    lieuLivraison: "4 Impasse des Tulipes, 13008 Marseille, France",
    nomClient: "Sophie Petit",
    modePaiement: "PayPal",
    dateLivraisonEstimee: "25 octobre 2025",
    livraison: {
      statut: "en cours",
      transporteur: "La Poste",
      referenceColis: "LP987654321FR",
      contactTransporteur: "09 87 65 43 21",
      dateExpedition: "20 octobre 2025",
      dateLivraison: null,
    },
    products: [
      { name: "Tomate", price: "10 000 Ar", qty: 1 },
      { name: "Courgette", price: "10 000 Ar", qty: 1 },
    ],
  },
  {
    id: "12415648",
    date: "05 septembre 2025",
    status: "récu",
    total: "65 000 Ar",
    lieuLivraison: "2 Allée des Roses, 31000 Toulouse, France",
    nomClient: "Pierre Dubois",
    modePaiement: "Carte bancaire **** 5678",
    dateLivraisonEstimee: "10 septembre 2025",
    livraison: {
      statut: "livré(e)s",
      transporteur: "Colissimo",
      referenceColis: "CO1122334455FR",
      contactTransporteur: "04 56 78 90 12",
      dateExpedition: "08 septembre 2025",
      dateLivraison: "10 septembre 2025",
    },
    products: [
      { name: "Carotte", price: "15 000 Ar", qty: 4 },
      { name: "Pomme de terre", price: "15 000 Ar", qty: 5 },
    ],
  },
  { id: "12415649", date: "01 septembre 2025", status: "récu", total: "20 000 Ar", products: [{ name: "Viande", price: "20 000 Ar", qty: 1 }] },
  { id: "12415650", date: "28 août 2025", status: "en cours", total: "45 000 Ar", products: [{ name: "Tomate", price: "10 000 Ar", qty: 2 }] },
];

const statusMapping = {
  'récu': "statut-livre",
  'en cours': "statut-en-cours",
};

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

  const getStatusClass = (status) => {
    return statusMapping[status] || "";
  };

 const handleTrackOrder = () => {
    // Redirection vers la page de suivi avec l'ID de la commande
    navigate(`/livraisons/${order.id}`, { 
      state: { commande: order } 
    });
  };
  
 
  
  const showNavigation = order.products.length > 4;

  return (
    <div className={`carte-commande ${getStatusClass(order.status)}`}>
      <div className="en-tete-carte">
        <div className="info-commande">
          <p>
            <strong>Commande numéro :</strong>{" "}
            <span className="id-commande">{order.id}</span>
          </p>
          <p className="date-commande">{order.date}</p>
        </div>
        <div className="statut-total-commande">
          <span className="total-commande">{order.total}</span>
          <span className={`badge-statut ${getStatusClass(order.status)}`}>
            {order.status}
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
          {order.products.map((product, index) => (
            <div key={index} className="element-produit">
              <div className="conteneur-image-produit">
                <img
                  src={productImages[product.name]}
                  alt={product.name}
                  className="image-produit"
                />
              </div>
              <p className="nom-produit">{product.name}</p>
              <p className="prix-produit">
                {product.price} × {product.qty}
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
        <button
          className="bouton-suivre-commande"
          onClick={handleTrackOrder}
        >
          Suivre Livraison
        </button>
      </div>
   
    </div>
  );
};

const HistoriqueCommandes = () => {
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtreDate, setFiltreDate] = useState("");
  
  const commandesFiltrees = listeCommandesSimulees.filter((order) => {
    const matchStatut = filtreStatut === "Tous" ? true : order.status === filtreStatut;
    return matchStatut;
  });

  const commandesAffiches = commandesFiltrees; 

  useEffect(() => {
  }, [filtreStatut, filtreDate]);


  return (
    <div className="historique-commandes">
    <div className="filtre-commandes">
       <FiltresCommandes 
        filtreStatut={filtreStatut}
        setFiltreStatut={setFiltreStatut}
        filtreDate={filtreDate}
        setFiltreDate={setFiltreDate}
        statutsDisponibles={["Tous", "en cours", "récu"]}
      />
    </div>
    <div className="list-commandes-section">
      <div className="grille-commandes">
        {commandesAffiches.map((order) => (
          <CarteCommande key={order.id} order={order} />
        ))}
      </div>
    </div>
    </div>
  );
};

export default HistoriqueCommandes;