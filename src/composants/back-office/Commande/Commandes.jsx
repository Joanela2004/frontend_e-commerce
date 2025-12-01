import React, { useState, useEffect, useMemo } from "react";
import "../../../styles/back-office/commandes.css";
import { Link } from "react-router-dom";
import { FaBoxes, FaSearch ,FaEye} from "react-icons/fa"; 
import { useNouvelleCommande } from '../../../contexts/Actualisation';
import { usePagination } from "../../../pages/hooks/hooks";
import { fetchCommandes, updateCommandeAdmin } from "../../../services/commandeService";
import ModalLivraison from './ModalLivraison';
import { updateLivraison } from "../../../services/livraisonService";

const allStatuts = [
    { value: '', label: 'Tous les statuts' },
    { value: 'en attente', label: 'En attente' },
    { value: 'validée', label: 'Validée' },
    { value: 'expédiée', label: 'Expédiée' },
    { value: 'livrée', label: 'Livrée' },
    { value: 'annulée', label: 'Annulée' },
];

const getStatusClass = (statut) => {
    switch (statut) {
        case 'validée':
        case 'livrée':
            return 'statut-reussi';
        case 'expédiée':
            return 'statut-expediee';
        case 'en attente':
            return 'statut-attente';
        case 'annulée':
            return 'statut-annule';
        default:
            return 'statut-default';
    }
};

const Commandes = () => {
    const [commandes, setCommandes] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); 
    const [statusFilter, setStatusFilter] = useState(""); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDeliveryData, setCurrentDeliveryData] = useState({});
    const [currentCmd, setCurrentCmd] = useState(null);
    const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

    const { newOrdersCount, markAsConsulted } = useNouvelleCommande();

    const fetchData = async () => {
        try {
            const data = await fetchCommandes();
            setCommandes(data);
        } catch (error) {
            console.error("Erreur chargement commandes", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredCommandes = useMemo(() => {
        let filtered = commandes;

        if (statusFilter) {
            filtered = filtered.filter(cmd => cmd.statut === statusFilter);
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(cmd => 
                cmd.referenceCommande?.toLowerCase().includes(lowerCaseQuery) ||
                cmd.utilisateur?.nomUtilisateur?.toLowerCase().includes(lowerCaseQuery) ||
                cmd.dateCommande?.toLowerCase().includes(lowerCaseQuery) ||
                cmd.mode_paiement?.nomModePaiement?.toLowerCase().includes(lowerCaseQuery)
            );
        }

        return filtered;
    }, [commandes, statusFilter, searchQuery]);

    const { currentRows, currentPage, totalPages, goToPage } = usePagination(filteredCommandes, 5);


    const handleViewClick = async (id) => {
        try {
            setCommandes(prev => prev.map(cmd =>
                cmd.numCommande === id ? { ...cmd, estConsulte: 1 } : cmd
            ));
            await markAsConsulted(id);
        } catch (err) {
            setCommandes(prev => prev.map(cmd =>
                cmd.numCommande === id ? { ...cmd, estConsulte: 0 } : cmd
            ));
        }
    };

    const handleValidate = async (id, currentStatut) => {
        const newStatus = currentStatut === 'en attente' ? 'validée' : 'annulée';
        if (!window.confirm(`Êtes-vous sûr de vouloir ${newStatus === 'validée' ? 'valider' : 'annuler'} la commande N°${id} ?`)) return;

        try {
            await updateCommandeAdmin(id, { statut: newStatus });
            setCommandes(prev => prev.map(cmd =>
                cmd.numCommande === id ? { ...cmd, statut: newStatus } : cmd
            ));
        } catch (err) {
            console.error("Erreur mise à jour statut", err);
            alert("Erreur lors de la mise à jour du statut");
        }
    };

    const handleDeliveryClick = (cmd) => {
        const livraison = cmd.livraisons?.[0] || {};
        setCurrentCmd(cmd);
        setCurrentDeliveryData({
            numCommande: cmd.numCommande,
            referenceColis: '', 
            lieuLivraison: livraison.lieuLivraison || '', 
            transporteur: livraison.transporteur || '',
            contactTransporteur: livraison.contactTransporteur || '',
        });
        setIsModalOpen(true);
    };

    const handleDeliverySubmit = async (data) => {
        if (!currentCmd) return alert("Aucune commande sélectionnée.");

        const livraison = currentCmd.livraisons?.[0];
        if (!livraison?.numLivraison) return alert("Livraison introuvable.");

        try {
            const updatedLivraison = {
                transporteur: data.transporteur || null,
                contactTransporteur: data.contactTransporteur || null,
                statutLivraison: "en cours", 
                referenceColis: data.referenceColis, 
                lieuLivraison: data.lieuLivraison, 
            };

            const livraisonResponse = await updateLivraison(livraison.numLivraison, updatedLivraison);
            
            const newStatutCommande = "expédiée"; 

            await updateCommandeAdmin(currentCmd.numCommande, { statut: newStatutCommande });

            setCommandes(prev => prev.map(cmd =>
                cmd.numCommande === currentCmd.numCommande
                    ? {
                        ...cmd,
                        statut: newStatutCommande,
                        livraisons: [{
                            ...livraison,
                            ...updatedLivraison,
                            dateExpedition: livraisonResponse.dateExpedition || new Date().toISOString()
                        }]
                    }
                    : cmd
            ));

            setIsModalOpen(false);
            setCurrentCmd(null);
        } catch (err) {
            console.error("Erreur livraison", err);
            alert("Erreur lors de la mise à jour de la livraison/commande");
        }
    };

    const handlePayLivraison = async (numCommande) => {
        const commande = commandes.find(c => c.numCommande === numCommande);
        if (!commande) return;

        if (!window.confirm(`Confirmez-vous le paiement des frais de livraison pour la commande N°${commande.referenceCommande} ?`)) return;

        const nouveauTotal = parseFloat(commande.montantTotal || 0) + parseFloat(commande.fraisLivraison || 0);

        try {
            await updateCommandeAdmin(numCommande, {
                payerLivraison: 1,
                montantTotal: nouveauTotal
            });

            setCommandes(prev => prev.map(cmd =>
                cmd.numCommande === numCommande
                    ? { ...cmd, payerLivraison: 1, montantTotal: nouveauTotal }
                    : cmd
            ));
        } catch (err) {
            console.error("Erreur paiement livraison", err);
            alert("Erreur lors du paiement des frais de livraison");
        }
    };

    return (
        <div className="livraison-container">
            <div className="livraison-header">
                <h2><FaBoxes /> Gestion des Commandes</h2>
                <div className="livraison-tabs">
                    <button className="tab-active">Commandes</button>
                    <button className="tab-inactive" disabled>Détails</button>
                    <button className="tab-inactive" disabled>Statistiques</button>
                </div>
            </div>
            
            {newOrdersCount > 0 && (
                <p className="new-orders-indicator">
                    **{newOrdersCount}** nouvelle(s) commande(s) non consultée(s).
                </p>
            )}

            <div className="livraison-search-bar">
                <FaSearch />
                <input
                    type="text"
                    placeholder="Rechercher par référence, client, date..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        goToPage(1); 
                    }}
                />

                <select
                    className="select-filter"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        goToPage(1); 
                    }}
                >
                    {allStatuts.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            <table className="livraison-table table-commandes">
                <thead>
                    <tr>
                        <th>Référence</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Paiement Frais</th>
                        <th>Mode Paiement</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRows.length > 0 ? (
                        currentRows.map(cmd => (
                            <tr key={cmd.numCommande} className={!cmd.estConsulte ? 'new-order-row' : ''}>
                                <td>{cmd.referenceCommande}</td>
                                <td>{cmd.utilisateur?.nomUtilisateur || "Inconnu"}</td>
                                <td>{new Date(cmd.dateCommande).toLocaleDateString('fr-FR')}</td>
                                <td>
                                    <span className={`statut-badge ${getStatusClass(cmd.statut)}`}>
                                        {cmd.statut}
                                    </span>
                                </td>
                                <td>
                                    {cmd.payerLivraison
                                        ? <span className="badge-paid">Payé</span>
                                        : <span className="badge-unpaid">Non Payé</span>
                                    }
                                </td>
                                <td>
                                    <img
                                        src={`${IMAGE_BASE_URL}${cmd.mode_paiement?.image}`}
                                        alt="Mode de paiement"
                                        className="mode-paiement-logo"
                                    />
                                </td>
                                <td>
                                   <div className="actions-cell-bo flex flex-wrap gap-2">
    <Link
        className="btn-edit"
        to={`/admin/commandes/${cmd.numCommande}`}
        onClick={() => handleViewClick(cmd.numCommande)}
    >
        <FaEye /> Voir
    </Link>

    {cmd.statut === 'en attente' && (
        <button onClick={() => handleValidate(cmd.numCommande, cmd.statut)} className="btn-action btn-validate">
            Valider
        </button>
    )}
    {cmd.statut === 'validée' && (
        <button onClick={() => handleValidate(cmd.numCommande, cmd.statut)} className="btn-action btn-cancel">
            Annuler
        </button>
    )}

    {/* Nouveau bouton pour passer directement en expédiée */}
    {(cmd.payerLivraison || cmd.statut === 'en attente' || cmd.statut === 'validée') && cmd.statut !== 'expédiée' && cmd.statut !== 'livrée' && (
        <button
            onClick={async () => {
                if (!window.confirm(`Voulez-vous changer le statut de la commande N°${cmd.numCommande} en "expédiée" ?`)) return;
                try {
                    await updateCommandeAdmin(cmd.numCommande, { statut: 'expédiée' });
                    setCommandes(prev => prev.map(c => c.numCommande === cmd.numCommande ? { ...c, statut: 'expédiée' } : c));
                } catch (err) {
                    console.error("Erreur mise à jour statut", err);
                    alert("Impossible de changer le statut en expédiée");
                }
            }}
            className="btn-action btn-delivery"
        >
            Expédier Direct
        </button>
    )}

    {/* Boutons existants liés à la livraison */}
    {cmd.statut === 'validée' && cmd.livraisons?.[0]?.statutLivraison !== 'livrée' && (
        <button onClick={() => handleDeliveryClick(cmd)} className="btn-action btn-delivery">
            Expédier
        </button>
    )}
    {cmd.statut === 'expédiée' && (
        <button className="btn-action btn-delivery" disabled>
            Expédiée
        </button>
    )}
    {cmd.statut === 'livrée' && (
        <button className="btn-action btn-delivery" disabled>
            Livrée
        </button>
    )}

    {!cmd.payerLivraison && (cmd.statut !== 'annulée') && (
        <button onClick={() => handlePayLivraison(cmd.numCommande)} className="btn-action btn-pay">
            Payer Frais
        </button>
    )}
</div>

                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-light)' }}>
                                Aucune commande trouvée correspondant aux critères.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

          

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