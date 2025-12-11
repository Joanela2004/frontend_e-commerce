// src/components/front-office/Commande/HistoriqueCommandes.jsx
import React, { useEffect, useState } from "react";
import FiltresCommandes from "./FiltresCommandes";
import { fetchMesCommandes } from "../../../services/commandeService";
import CarteCommande from "./CarteCommande";
import PaiementModal from "./PaiementModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../styles/front-office/Commande/Commandes.css";
import "../../../styles/front-office/global.css";

const HistoriqueCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtreDate, setFiltreDate] = useState("");
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    refreshCommandes();
}, []);
const refreshCommandes = async () => {
    try {
        const res = await fetchMesCommandes();
        setCommandes(res);
    } catch (err) {
        console.error(err);
    }
};

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchMesCommandes();
      setCommandes(data || []);
    } catch (error) {
      console.error("Erreur chargement commandes :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleSelectOrder = (order) => {
    const estEnAttente = ["en attente", "attente"].some(s =>
      (order.statut || "").toLowerCase().includes(s)
    );

    if (estEnAttente) {
      setSelectedOrderForPayment(order);
      setShowPaiementModal(true);
    }
    };

  const handleCloseModal = (refresh = false) => {
    setShowPaiementModal(false);
    setSelectedOrderForPayment(null);
    if (refresh) fetchData();
  };

  const commandesFiltrees = commandes.filter((order) => {
    const statutNormalise = (order.statut || "").toLowerCase().trim();
    const filtreNormalise = filtreStatut === "Tous" ? "" : filtreStatut.toLowerCase().trim();
    const matchStatut = filtreStatut === "Tous" || statutNormalise === filtreNormalise;
    const matchDate = !filtreDate || order.dateCommande.startsWith(filtreDate);
    return matchStatut && matchDate;
  });

  const statutsDisponibles = ["Tous", "en attente", "payée", "validée", "expédiée", "livrée", "annulée"];

  if (loading) {
    return (
      <div className="historique-commandes">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historique-commandes">
      <ToastContainer position="top-right" />

      <div className="filtre-commandes">
        <FiltresCommandes
          filtreStatut={filtreStatut}
          setFiltreStatut={setFiltreStatut}
          filtreDate={filtreDate}
          setFiltreDate={setFiltreDate}
          statutsDisponibles={statutsDisponibles}
        />
      </div>

      <div className="list-commandes-section">
        {commandesFiltrees.length === 0 ? (
          <div className="empty-state" style={{margin:"0 20px"}}>
            <h3>Aucune commande trouvée</h3>
            <p>
              {filtreStatut !== "Tous" || filtreDate
                ? "Aucun résultat avec les filtres actuels."
                : "Vous n'avez pas encore passé de commande."}
            </p>
          </div>
        ) : (
          <div className="grille-commandes">
            {commandesFiltrees.map((order) => (
              <CarteCommande
                key={order.numCommande}
                order={order}
                onSelectOrder={handleSelectOrder}
                refreshCommandes={refreshCommandes}
              />
            ))}
          </div>
        )}
      </div>

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