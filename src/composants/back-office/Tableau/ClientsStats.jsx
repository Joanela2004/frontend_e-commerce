import React, { useMemo, useState } from "react";
import { usePagination } from "../../../pages/hooks/hooks";
import { sendPromoEmail, fetchPromotions, checkPromoSent } from "../../../services/promotionService"; 
import { toast } from "react-toastify";
import { FaGift, FaCalendar, FaPercentage, FaShoppingBag, FaDollarSign, FaTimes, FaEnvelope, FaUser, FaStore } from "react-icons/fa";

const ClientsStats = ({ clients, commandes }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [sending, setSending] = useState(false);

  const clientsAvecStats = useMemo(() => {
    if (!clients || !commandes) return [];

    const clientsNormaux = clients.filter(c => c.role !== "admin");

    const mapTotalParClient = new Map();
    const mapNbCommandes = new Map();

    commandes.forEach(cmd => {
      const clientId = cmd.numUtilisateur;
      const totalCmd = parseFloat(cmd.montantTotal || 0);

      mapTotalParClient.set(clientId, (mapTotalParClient.get(clientId) || 0) + totalCmd);
      mapNbCommandes.set(clientId, (mapNbCommandes.get(clientId) || 0) + 1);
    });

    return clientsNormaux.map(client => ({
      id: client.numUtilisateur,
      nom: client.nomUtilisateur,
      email: client.email,
      image: client.image,
      totalDepense: mapTotalParClient.get(client.numUtilisateur) || 0,
      nbCommandes: mapNbCommandes.get(client.numUtilisateur) || 0,
    }));
  }, [clients, commandes]);

  const { currentRows, goToPage, currentPage, totalPages } = usePagination(clientsAvecStats, 5);

  const handleOpenModal = async (client) => {
    setSelectedClient(client);
    setShowModal(true);
    setLoadingPromos(true);
    setSelectedPromo(null);

    try {
      const promos = await fetchPromotions();
      const maintenant = new Date();

      const promosActives = promos.filter(p => {
        const dateFin = new Date(p.dateFin);
        return (
          (p.statutPromotion === "active" || p.statutPromotion === "actif" || p.statutPromotion === true) &&
          dateFin > maintenant
        );
      });

      const promosAvecStatus = await Promise.all(
        promosActives.map(async (p) => {
          const deja = await checkPromoSent(p.numPromotion, client.id);
          return { ...p, dejaEnvoye: deja };
        })
      );

      setPromotions(promosAvecStatus);
    } catch (err) {
      toast.error("Erreur lors du chargement des promotions.");
      setPromotions([]);
    } finally {
      setLoadingPromos(false);
    }
  };

  const handleEnvoyerPromo = async () => {
    if (!selectedPromo || !selectedClient) return;

    if (selectedPromo.dejaEnvoye) {
      toast.warning("Cette promotion a déjà été envoyée à ce client.");
      return;
    }

    try {
      setSending(true);
      const res = await sendPromoEmail({
        email: selectedClient.email,
        codePromo: selectedPromo.codePromo,
        valeur: selectedPromo.valeur,
        typePromotion: selectedPromo.typePromotion,
        nomClient: selectedClient.nom,
        numUtilisateur: selectedClient.id,
        numPromotion: selectedPromo.numPromotion, 
      });

      if (res.success) {
        toast.success(`Code promo ${selectedPromo.codePromo} envoyé à ${selectedClient.nom} !`);
        setShowModal(false);
        setSelectedPromo(null);
      } else {
        toast.error(res.message || "Échec de l'envoi");
      }
    } catch (err) {
      toast.error("Erreur lors de l'envoi du code promo");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  const getTypeClass = (type) => {
    const typeStr = type ? type.toString().toLowerCase() : '';
    switch (typeStr) {
      case 'pourcentage':
        return 'badge-type-pourcentage';
      case 'montant fixe':
      case 'montantfixe':
        return 'badge-type-montantfixe';
      default:
        return 'badge-type-pourcentage';
    }
  };

  return (
    <div className="livraison-container">
      <div className="livraison-header">
        <h2><FaGift /> Statistiques Clients & Promotions</h2>
        <div className="livraison-tabs">
          <button className="tab-active">Tous les clients</button>
          <button>Clients fidèles</button>
          <button>Nouveaux clients</button>
        </div>
      </div>

      <div className="table-container-bo">
        <table className="livraison-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Commandes</th>
              <th>Total dépensé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="client-name">{c.nom}</div>
                </td>
                <td>
                  <div className="client-email">{c.email}</div>
                </td>
                <td>
                  <div className="client-orders">
                    <FaShoppingBag /> {c.nbCommandes} commande{c.nbCommandes > 1 ? 's' : ''}
                  </div>
                </td>
                <td>
                  <div className="client-total">
                    <FaDollarSign /> {c.totalDepense.toFixed(2)} Ar
                  </div>
                </td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleOpenModal(c)}
                    title="Envoyer une promotion à ce client"
                  >
                    <FaGift /> Envoyer promo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentRows.length === 0 && (
          <div className="clients-empty">
            Aucun client avec des commandes trouvé.
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination-zone">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              &lt;
            </button>
            <span className="pagination-info">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* MODAL D'ENVOI DE PROMO */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-promo-envoi" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FaGift style={{ marginRight: '10px', color: 'var(--color-green-primary)' }} />
                Envoyer un code promo
              </h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            {/* Informations client */}
            <div className="promo-client-info">
              <div className="promo-client-header">
                <FaUser style={{ color: 'var(--color-blue-primary)' }} />
                <h4>Client sélectionné</h4>
              </div>
              <div className="promo-client-details">
                <div className="client-detail-item">
                  <span className="detail-label">Nom :</span>
                  <span className="detail-value">{selectedClient?.nom}</span>
                </div>
                <div className="client-detail-item">
                  <span className="detail-label">Email :</span>
                  <span className="detail-value">{selectedClient?.email}</span>
                </div>
                <div className="client-detail-item">
                  <span className="detail-label">Commandes :</span>
                  <span className="detail-value">
                    <FaShoppingBag style={{ marginRight: '5px' }} />
                    {selectedClient?.nbCommandes}
                  </span>
                </div>
                <div className="client-detail-item">
                  <span className="detail-label">Total dépensé :</span>
                  <span className="detail-value">
                    <FaDollarSign style={{ marginRight: '5px' }} />
                    {selectedClient?.totalDepense.toFixed(2)} Ar
                  </span>
                </div>
              </div>
            </div>

            {/* Liste des promotions */}
            {loadingPromos ? (
              <div className="promo-loading">
                <div className="loading-spinner"></div>
                <p>Chargement des promotions disponibles...</p>
              </div>
            ) : promotions.length === 0 ? (
              <div className="promo-empty">
                <FaGift />
                <p>Aucune promotion active disponible</p>
                <small>Créez d'abord des promotions dans la section dédiée</small>
              </div>
            ) : (
              <>
                <div className="promo-selection">
                  <div className="promo-selection-header">
                    <FaStore style={{ color: 'var(--color-green-primary)' }} />
                    <h4>Sélectionnez une promotion</h4>
                  </div>
                  
                  <div className="promo-grid">
                    {promotions.map(promo => (
                      <div
                        key={promo.numPromotion}
                        className={`promo-card ${selectedPromo?.numPromotion === promo.numPromotion ? 'promo-card-selected' : ''} ${promo.dejaEnvoye ? 'promo-card-sent' : ''}`}
                        onClick={() => !promo.dejaEnvoye && setSelectedPromo(promo)}
                      >
                        <div className="promo-card-header">
                          <div className="promo-code">
                            <FaPercentage />
                            <strong>{promo.codePromo}</strong>
                          </div>
                          <div className="promo-badges">
                            <span className={`promo-type-badge ${getTypeClass(promo.typePromotion)}`}>
                              {promo.typePromotion}
                            </span>
                            {promo.dejaEnvoye && (
                              <span className="promo-sent-badge">
                                Déjà envoyé
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="promo-value">
                          -{promo.valeur} {promo.typePromotion === "Pourcentage" ? "%" : "Ar"}
                        </div>

                        <div className="promo-name">
                          {promo.nomPromotion}
                        </div>

                        <div className="promo-dates">
                          <FaCalendar />
                          <span>Du {formatDate(promo.dateDebut)} au {formatDate(promo.dateFin)}</span>
                        </div>

                        {promo.montantMinimum > 0 && (
                          <div className="promo-minimum">
                            Minimum d'achat : {promo.montantMinimum} Ar
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions du modal */}
                <div className="modal-actions">
                  <button 
                    className="btn-secondary" 
                    onClick={() => setShowModal(false)}
                    disabled={sending}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleEnvoyerPromo}
                    disabled={!selectedPromo || sending || selectedPromo?.dejaEnvoye}
                  >
                    {sending ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Envoi en cours...
                      </>
                    ) : selectedPromo?.dejaEnvoye ? (
                      <>
                        <FaTimes />
                        Déjà envoyé
                      </>
                    ) : (
                      <>
                        <FaEnvelope />
                        Envoyer à {selectedClient?.nom}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsStats;