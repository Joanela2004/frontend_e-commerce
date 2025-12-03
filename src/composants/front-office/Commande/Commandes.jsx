// src/components/front-office/Commande/HistoriqueCommandes.jsx

import React, { useEffect, useState } from "react";
import "../../../styles/front-office/Commande/Commandes.css"; 
import "../../../styles/front-office/global.css";
import { useNavigate } from "react-router-dom";
import FiltresCommandes from "./FiltresCommandes"; 
import { fetchMesCommandes } from "../../../services/commandeService";
import CarteCommande from "./CarteCommande"; // Assurez-vous d'importer la version modifiée
import PaiementModal from "./PaiementModal"; // Import du nouveau modal
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const HistoriqueCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtreDate, setFiltreDate] = useState("");
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  
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

  const handleSelectOrder = (order) => {
    setSelectedOrderForPayment(order);
    const isPending = order.statut.toLowerCase().includes("attente");
    if (isPending) {
        setShowPaiementModal(true);
    } else {
                setShowPaiementModal(false); 
    }
  };

  const handleCloseModal = (refresh = false) => {
      setShowPaiementModal(false);
      setSelectedOrderForPayment(null);
      if (refresh) {
          fetchData(); 
      }
  }

  const commandesFiltrees = commandes.filter((order) => {
    const matchStatut = filtreStatut === "Tous" ? true : order.statut === filtreStatut;
    const matchDate = filtreDate ? order.dateCommande.startsWith(filtreDate) : true;
    return matchStatut && matchDate;
  });

  return (
    <div className="historique-commandes">
      <ToastContainer />
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
            <CarteCommande 
                key={order.numCommande} 
                order={order} 
                onSelectOrder={handleSelectOrder}
                // Si vous voulez un effet visuel sur la carte sélectionnée dans la liste :
                isSelected={selectedOrderForPayment && selectedOrderForPayment.numCommande === order.numCommande}
            />
          ))}
          {commandesFiltrees.length === 0 && <p>Aucune commande trouvée.</p>}
        </div>
      </div>

      {/* Modal de paiement qui s'affiche à droite */}
      {showPaiementModal && selectedOrderForPayment && (
        <PaiementModal 
            order={selectedOrderForPayment} 
            onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default HistoriqueCommandes;