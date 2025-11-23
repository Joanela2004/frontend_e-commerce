import React, { useState, useEffect } from "react";
import "../../../styles/back-office/commandes.css";
import { Link } from "react-router-dom";
import { useNouvelleCommande } from '../../../contexts/Actualisation';
import { usePagination } from "../../../pages/hooks/hooks";
import { fetchCommandes, updateCommandeAdmin } from "../../../services/commandeService";
import ModalLivraison from './ModalLivraison';
import { updateLivraison } from "../../../services/livraisonService";
const Commandes = () => {
    const [commandes, setCommandes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDeliveryData, setCurrentDeliveryData] = useState({});
    const [currentCmd, setCurrentCmd] = useState(null);

    const { refreshOrders } = useNouvelleCommande(); 

    const fetchData = async () => {
        try {
            const data = await fetchCommandes(); 
            setCommandes(data);
        } catch (error) {
            console.error("Erreur lors du chargement des commandes", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { currentRows, currentPage, totalPages, goToPage } = usePagination(commandes, 5);

    const handleValidate = async (id, currentStatut) => {
        let newStatus;
        if (currentStatut === 'en attente') newStatus = 'validée';
        else if (currentStatut === 'validée') newStatus = 'annulée';
        else return;

        try {
            await updateCommandeAdmin(id, { statut: newStatus });
            setCommandes(prev =>
                prev.map(cmd => cmd.numCommande === id ? { ...cmd, statut: newStatus } : cmd)
            );
        } catch (error) {
            console.error("Erreur mise à jour statut :", error);
        }
    };

  const handleDeliveryClick = (cmd) => {
    const livraison = cmd.livraisons?.[0] || {};
    setCurrentCmd(cmd);
    setCurrentDeliveryData({
        numCommande: cmd.numCommande,
        referenceColis: livraison.referenceColis || '',
        lieuLivraison: livraison.lieuLivraison || '',
        transporteur: '',
        contactTransporteur: '',
    });
    setIsModalOpen(true);
};


const handleDeliverySubmit = async (data) => {
  if (!currentCmd) {
    console.error("Aucune commande sélectionnée.");
    return alert("Aucune commande sélectionnée.");
  }

  const livraison = currentCmd.livraisons?.[0];
  if (!livraison?.numLivraison) {
    console.error("Livraison introuvable pour cette commande.");
    return alert("Livraison introuvable pour cette commande.");
  }

  try {
    // 1️⃣ Mettre à jour la livraison
    const updatedLivraison = {
      transporteur: data.transporteur || null,
      contactTransporteur: data.contactTransporteur || null,
      statutLivraison: "en cours",
    };

    // La date d'expédition est gérée côté backend dans la table livraisons
    const livraisonResponse = await updateLivraison(livraison.numLivraison, updatedLivraison);

    // 2️⃣ Déterminer le nouveau statut de la commande
    const newStatut = currentCmd.statut === "validée" ? "expédiée" : currentCmd.statut;
    await updateCommandeAdmin(currentCmd.numCommande, { statut: newStatut });

    // 3️⃣ Mettre à jour le state local
    setCommandes(prev =>
      prev.map(cmd =>
        cmd.numCommande === currentCmd.numCommande
          ? { 
              ...cmd, 
              statut: newStatut,
              livraisons: [{ ...livraison, ...updatedLivraison, dateExpedition: livraisonResponse.dateExpedition }]
            }
          : cmd
      )
    );

    // 4️⃣ Fermer le modal
    setIsModalOpen(false);
    setCurrentCmd(null);

  } catch (error) {
    console.error("Erreur lors de la soumission de la livraison :", error.response?.data || error.message);
    alert("Une erreur est survenue lors de la mise à jour de la livraison.");
  }
};


const handlePayLivraison = async (numCommande) => {
  try {
    const commande = commandes.find(cmd => cmd.numCommande === numCommande);
    if (!commande) return;

        const montantTotalActuel = parseFloat(commande.montantTotal || 0);
    const fraisLivraison = parseFloat(commande.fraisLivraison || 0);
    
    // Le nouveau montant total est l'ancien montant + les frais de livraison
    const nouveauMontantTotal = montantTotalActuel + fraisLivraison;

      // 1. Mise à jour du backend
      await updateCommandeAdmin(numCommande, {
      payerLivraison: 1, // On marque comme payé
      montantTotal: nouveauMontantTotal // On met à jour le montant total
    });

           setCommandes(prev => prev.map(cmd =>
          cmd.numCommande === numCommande
              ? { ...cmd, payerLivraison: 1, montantTotal: nouveauMontantTotal } // Utiliser 1 pour correspondre à la structure des données (1 ou 0)
              : cmd
      ));

       } catch (error) {
    console.error("Erreur lors du paiement du frais de livraison :", error);
      }
};


    const handleViewClick = async (id) => {
        try {
            setCommandes(prev => prev.map(cmd => cmd.numCommande === id ? { ...cmd, estConsulte: 1 } : cmd));
            await updateCommandeAdmin(id, { estConsulte: 1 });
            refreshOrders();
        } catch (error) {
            console.error("Erreur lors de la consultation de la commande:", error);
        }
    };

    const newOrdersCount = commandes.filter(cmd => !cmd.estConsulte).length;

    return (
        <div className="commandes-container">
            <h2>Liste des Commandes</h2>

            {newOrdersCount > 0 && (
                <p className="new-orders-indicator">
                    **{newOrdersCount}** nouvelle(s) commande(s) non consultée(s).
                </p>
            )}

            <table className="table-commandes">
                <thead>
                    <tr>
                        <th>N° Commande</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Frais de livraison </th>
                        <th>Actions</th> 
                        
                    </tr>
                </thead>
               <tbody>
  {currentRows.map((cmd) => (
    <tr key={cmd.numCommande} className={!cmd.estConsulte ? 'new-order-row' : ''}>
      <td>{cmd.referenceCommande}</td>
      <td>{cmd.utilisateur?.nomUtilisateur || "Inconnu"}</td>
      <td>{cmd.dateCommande}</td>
      <td>
        <span className={`status-badge status-${cmd.statut.replace(/\s/g, '-')}`}>
          {cmd.statut}
        </span>
      </td>
      <td>
        {cmd.payerLivraison
          ? <span className="badge-paid"> payé</span>
          : <span className="badge-unpaid"> non payé</span>
        }
      </td>
     <td>
  <Link
    to={`/admin/commandes/${cmd.numCommande}`}
    onClick={() => handleViewClick(cmd.numCommande)}
    className={cmd.estConsulte ? "btn-voir consultée" : "btn-voir non-consultée"} 
  >
    Voir
  </Link>

  {cmd.statut === 'en attente' && (
    <button
      onClick={() => handleValidate(cmd.numCommande, cmd.statut)}
      className="btn-action btn-validate"
    >
      Valider
    </button>
  )}

  {cmd.statut === 'validée' && (
    <>
      <button
        onClick={() => handleValidate(cmd.numCommande, cmd.statut)}
        className="btn-action btn-cancel"
      >
        Annuler
      </button>

      {cmd.livraisons?.[0]?.statutLivraison !== 'livrée' ? (
        <button
          onClick={() => handleDeliveryClick(cmd)}
          className="btn-action btn-delivery"
          title="Saisir les informations d'expédition"
        >
          Livrer
        </button>
      ) : (
        <button className="btn-action btn-delivery" disabled>
          Livrée
        </button>
      )}
    </>
  )}

  {cmd.statut === 'expédiée' && (
    cmd.livraisons?.[0]?.statutLivraison === 'livrée' ? (
      <button className="btn-action btn-delivery" disabled>
        Livrée
      </button>
    ) : (
      <button className="btn-action btn-delivery" disabled>
        En cours
      </button>
    )
  )}

   {!cmd.payerLivraison && (
    <button
      onClick={() => handlePayLivraison(cmd.numCommande)}
      className="btn-action btn-pay"
    >
      Payer frais livraison
    </button>
  )}
</td>

    </tr>
  ))}
</tbody>

            </table>

            <div className="pagination">
                <button className="pagination-btn" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                    &lt;
                </button>
                <button className="pagination-btn active">{currentPage}</button>
                <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
                    &gt;
                </button>
            </div>

            <ModalLivraison
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleDeliverySubmit}
                initialData={currentDeliveryData}
            />
        </div>
    );
};

export default Commandes;