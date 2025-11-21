import React, { useState, useEffect } from "react";
import "../../../styles/back-office/commandes.css";
import { Link } from "react-router-dom";
import { useNouvelleCommande } from '../../../contexts/Actualisation';
import { usePagination } from "../../../pages/hooks/hooks";
import { fetchCommandes, updateCommandeAdmin } from "../../../services/commandeService";
import ModalLivraison from './ModalLivraison';

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
        setCurrentCmd(cmd);
        setCurrentDeliveryData({
            numCommande: cmd.numCommande,
            transporteur: cmd.livraisons?.[0]?.transporteur || 'Arato Express',
            referenceColis: cmd.livraisons?.[0]?.referenceColis || `COLIS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,        
            lieuLivraison: cmd.livraisons?.[0]?.lieuLivraison || '',
            contactTransporteur: cmd.livraisons?.[0]?.contactTransporteur || '',
        });
        setIsModalOpen(true);
    };

    const handleDeliverySubmit = async (data) => {
        if (!currentCmd) return;
        const newStatut = currentCmd.statut === "validée" ? "expédiée" : currentCmd.statut;

        try {
            const { numCommande, ...deliveryDetails } = data;
            await updateCommandeAdmin(numCommande, {
                ...deliveryDetails,
                statut: newStatut,
                dateExpedition: new Date().toISOString().slice(0, 19).replace('T', ' '),
            });

            setCommandes(prev =>
                prev.map(cmd => cmd.numCommande === numCommande ? { ...cmd, statut: newStatut } : cmd)
            );

            setIsModalOpen(false);
            setCurrentCmd(null);
        } catch (error) {
            console.error("Erreur lors de la soumission de la livraison:", error);
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
      <td>{cmd.numCommande}</td>
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

            <button
              onClick={() => handleDeliveryClick(cmd)}
              className="btn-action btn-delivery"
              title="Saisir les informations d'expédition"
            >
              Livrer
            </button>
          </>
        )}

        {cmd.statut === 'annulée' && (
          <button className="btn-action cancel" disabled>
            Annulée
          </button>
        )}

        {cmd.statut === 'expédiée' && (
          <button className="btn-action btn-delivery" disabled>
            En cours
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
