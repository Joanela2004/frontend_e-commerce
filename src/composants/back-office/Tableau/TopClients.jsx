import React, { useEffect, useState, useMemo } from "react";
import dashboardApi from "../../../services/dashboardApi";
import { usePagination } from "../../../pages/hooks/hooks";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import { sendPromoEmail, fetchPromotions, checkPromoSent } from "../../../services/promotionService";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaUsers,
  FaGift,
  FaTimes,
  FaSync,
  FaPercentage,
  FaCalendarAlt,
  FaShoppingCart,
  FaMoneyBillAlt,
  FaCheckCircle, 
  FaEnvelope, 
} from "react-icons/fa";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function TopClients({ start = null, end = null, limit = 10 }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      // Charger plus de données que la limite pour permettre la recherche avant la pagination
      const res = await dashboardApi.topClients(start, end, 1000); 
      setClients(res.data);
    } catch (err) {
      console.error("Erreur API TopClients:", err);
      toast.error("Impossible de charger les top clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [start, end]);

  const filteredClients = useMemo(() => {
    let list = clients.filter(c =>
        (c.nomUtilisateur || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    // Appliquer la limite après le filtre de recherche
    return list.slice(0, limit); 
  }, [clients, searchTerm, limit]);

  const { currentRows: clientsDataRows, goToPage, currentPage, totalPages } =
    usePagination(filteredClients, 10);

  const openPromoModal = async (client) => {
    setSelectedClient({
      id: client.numUtilisateur,
      nom: client.nomUtilisateur,
      email: client.email,
      commandes: client.commandes_count,
      total: Number(client.total_depense).toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    });
    setShowModal(true);
    setLoadingPromos(true);
    setSelectedPromo(null);

    try {
      const promos = await fetchPromotions();
      const now = new Date();

      const activePromos = promos.filter(p => {
        const dateFin = new Date(p.dateFin);
        const statut = (p.autoStatut || "").toLowerCase();
        // Inclure seulement les promotions actives et non expirées
        return statut === "active" && dateFin > now; 
      });

      const promosWithStatus = await Promise.all(
        activePromos.map(async (p) => {
          const deja = await checkPromoSent(p.numPromotion, client.numUtilisateur);
          return { ...p, dejaEnvoye: deja };
        })
      );

      setPromotions(promosWithStatus);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger les promotions");
    } finally {
      setLoadingPromos(false);
    }
  };

  const handleEnvoyerPromo = async () => {
    if (!selectedPromo || !selectedClient || sending) return;

    try {
      setSending(true);

      const payload = {
        numUtilisateur: selectedClient.id,
        numPromotion: selectedPromo.numPromotion,
        nomClient: selectedClient.nom,
      };

      const res = await sendPromoEmail(payload);

      if (res.success) {
         // TOAST DE SUCCÈS AMÉLIORÉ
         toast.success(
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaCheckCircle style={{ marginRight: '10px' }} />
                Code promo **{selectedPromo.codePromo}** envoyé à **{selectedClient.nom}** !
            </div>,
            {
                autoClose: 3000,
                position: "top-center"
            }
        );

        // Marquer comme déjà envoyé
        setPromotions(prev =>
          prev.map(p =>
            p.numPromotion === selectedPromo.numPromotion
              ? { ...p, dejaEnvoye: true }
              : p
          )
        );
        setSelectedPromo(prev => ({ ...prev, dejaEnvoye: true }));

             setTimeout(() => {
          setShowModal(false);
        }, 800);
      } else {
        toast.error(res.message || "Échec de l'envoi");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur serveur";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
      
          <h1><FaUsers style={{ marginRight: "10px" }} /> Top Clients ({limit} )</h1>
          <div className="stats-container" style={{ marginTop: '10px' }}>
            <span className="stat-item">
              {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} trouvé{filteredClients.length !== 1 ? 's' : ''}
            </span>    
        </div>
      </div>
     
      <div className="search-container" style={{ marginBottom: '20px' }}>
          <div className="search-bar">
              <FaSearch style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }} className="search-icon" />
              <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                   <FaSync className="reset-icon" onClick={() => setSearchTerm("")} />
              )}
             
          </div>
      </div>


      {/* TABLEAU */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Commandes</th>
              <th>Total dépensé</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clientsDataRows.length > 0 ? (
              clientsDataRows.map((c) => (
                <tr key={c.numUtilisateur}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {c.image ? (
                        <img
                          src={`${IMAGE_BASE_URL}${c.image}`}
                          alt={c.nomUtilisateur}
                          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#e3f2fd",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#1565c0",
                          fontWeight: "bold"
                        }}>
                          {c.nomUtilisateur?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                      )}
                      <div style={{ fontWeight: "bold" }}>{c.nomUtilisateur || "N/A"}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaShoppingCart style={{ color: "#28a458" }} />
                      <span>{c.commandes_count}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaMoneyBillAlt style={{ color: "#ffc107" }} />
                      <span style={{ fontWeight: 'bold' }}>
                        {Number(c.total_depense).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar
                      </span>
                    </div>
                  </td>
                  <td>
                    
                    <button
                              className="btn-primary"
                              onClick={() => openPromoModal(c)}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              <FaGift />
                                Promotion
                            </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-table">
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <h3>Aucun client trouvé</h3>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination-zone" style={{ marginTop: '20px' }}>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn prev">
            Précédent
          </button>
          <div className="pagination-info">
            <span>Page {currentPage} sur {totalPages}</span>
          </div>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn next">
            Suivant
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-promo-envoi" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
          

            <div className="modal-body">
              <div className="info-card client-summary" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderLeft: '5px solid var(--color-primary)' }}>
                  <p><strong>Nom :</strong> {selectedClient?.nom}</p>
                  <p><strong>Commandes passées :</strong> {selectedClient?.commandes}</p>
                  <p><strong>Dépense Totale :</strong> <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{selectedClient?.total} Ar</span></p>
              </div>

              <h4 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  Sélectionnez une promotion active :
              </h4>

              {loadingPromos ? (
                  <div className="loading-state" style={{ minHeight: '100px' }}>
                      <div className="loading-spinner-small"></div>
                      <p>Chargement des promotions...</p>
                  </div>
              ) : promotions.length === 0 ? (
                  <p style={{ color: '#dc3545', padding: '20px', textAlign: 'center' }}>
                      Aucune promotion active disponible.
                  </p>
              ) : (
                  <div className="promo-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '15px'
                  }}>
                      {promotions.map((p) => (
                          <div
                              key={p.numPromotion}
                              className={`promo-card ${selectedPromo?.numPromotion === p.numPromotion ? "selected" : ""} ${p.dejaEnvoye ? "sent" : ""}`}
                              onClick={() => !p.dejaEnvoye && setSelectedPromo(p)}
                              title={p.dejaEnvoye ? `Déjà envoyé` : "Cliquer pour sélectionner"}
                              style={{
                                  border: `2px solid ${p.dejaEnvoye ? '#ccc' : (selectedPromo?.numPromotion === p.numPromotion ? 'var(--color-primary)' : '#eee')}`,
                                  borderRadius: '8px',
                                  padding: '15px',
                                  cursor: p.dejaEnvoye ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  opacity: p.dejaEnvoye ? 0.6 : 1,
                                  position: 'relative',
                                  backgroundColor: selectedPromo?.numPromotion === p.numPromotion ? '#e6f7ef' : 'white',
                                  boxShadow: selectedPromo?.numPromotion === p.numPromotion ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
                              }}
                          >
                              <div className="promo-header" style={{ fontWeight: 'bold', fontSize: '1.1em', color: 'var(--color-text)', marginBottom: '10px' }}>
                                  <FaPercentage style={{ marginRight: '5px', color: 'var(--color-accent)' }} /> {p.codePromo}
                              </div>
                              <div className="promo-value" style={{ fontSize: '1.5em', fontWeight: 'bold', color: p.dejaEnvoye ? '#777' : 'var(--color-primary)', marginBottom: '10px' }}>
                                  -{p.valeur}{p.typePromotion === "Pourcentage" ? "%" : " Ar"}
                              </div>
                              <div className="promo-dates" style={{ fontSize: '0.9em', color: '#666' }}>
                                  <FaCalendarAlt style={{ marginRight: '5px' }} /> 
                                  {formatDate(p.dateDebut)} → {formatDate(p.dateFin)}
                              </div>
                              {p.dejaEnvoye && (
                                  <div className="promo-sent" style={{ 
                                      position: 'absolute', 
                                      top: '0', right: '0', 
                                      backgroundColor: '#d4edda', 
                                      color: '#155724', 
                                      padding: '5px 10px', 
                                      borderRadius: '0 8px 0 8px', 
                                      fontWeight: 'bold',
                                      fontSize: '0.8em'
                                  }}>
                                      <FaCheckCircle style={{ marginRight: '5px' }} /> Déjà envoyé
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              )}
            </div>

            {/* Actions Modale */}
            <div className="modal-actions" style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={sending}>
                Annuler
              </button>
              <button
                  className="btn btn-primary"
                  onClick={handleEnvoyerPromo}
                  disabled={!selectedPromo || selectedPromo?.dejaEnvoye || sending}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                  {sending ? (
                      <>
                          <div className="loading-spinner-small"></div>
                          Envoi en cours...
                      </>
                  ) : (
                      <>
                          <FaEnvelope /> Envoyer le code promo
                      </>
                  )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}