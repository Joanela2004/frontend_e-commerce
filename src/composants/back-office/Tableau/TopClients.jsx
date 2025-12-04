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
  FaPercentage,
  FaCalendarAlt,
  FaShoppingCart,
  FaMoneyBillAlt,
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
    let list = clients.slice(0, limit);
    return list.filter(c =>
      (c.nomUtilisateur || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
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
        toast.success(`Code ${selectedPromo.codePromo} envoyé à ${selectedClient.nom} !`);

        // Marquer comme déjà envoyé
        setPromotions(prev =>
          prev.map(p =>
            p.numPromotion === selectedPromo.numPromotion
              ? { ...p, dejaEnvoye: true }
              : p
          )
        );
        setSelectedPromo(prev => ({ ...prev, dejaEnvoye: true }));

        // FERMER LA MODALE APRÈS SUCCÈS
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des top clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
      
          <h1><FaUsers style={{ marginRight: "10px" }} /> Top Clients</h1>
          <div className="stats-container" style={{ marginTop: '10px' }}>
            <span className="stat-item">
              {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} trouvé{filteredClients.length !== 1 ? 's' : ''}
            </span>
          
         
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
                                promotion
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

      {/* MODALE */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-promo-envoi" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaGift /> Envoyer un code promo</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="promo-client-info">
              <h4>Client sélectionné</h4>
              <p><strong>Nom :</strong> {selectedClient?.nom}</p>
              <p><strong>Email :</strong> {selectedClient?.email}</p>
              <p><strong>Commandes :</strong> {selectedClient?.commandes}</p>
              <p><strong>Total dépensé :</strong> {selectedClient?.total} Ar</p>
            </div>

            {loadingPromos ? (
              <p>Chargement des promotions...</p>
            ) : promotions.length === 0 ? (
              <p>Aucune promotion active disponible.</p>
            ) : (
              <div className="promo-grid">
                {promotions.map((p) => (
                  <div
                    key={p.numPromotion}
                    className={`promo-card ${selectedPromo?.numPromotion === p.numPromotion ? "selected" : ""} ${p.dejaEnvoye ? "sent" : ""}`}
                    onClick={() => !p.dejaEnvoye && setSelectedPromo(p)}
                    title={p.dejaEnvoye ? "Déjà envoyé" : "Cliquer pour sélectionner"}
                  >
                    <div className="promo-header">
                      <FaPercentage /> {p.codePromo}
                    </div>
                    <div className="promo-value">
                      -{p.valeur}{p.typePromotion === "Pourcentage" ? "%" : " Ar"}
                    </div>
                    <div className="promo-dates">
                      <FaCalendarAlt /> {formatDate(p.dateDebut)} → {formatDate(p.dateFin)}
                    </div>
                    {p.dejaEnvoye && <div className="promo-sent">Déjà envoyé</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={handleEnvoyerPromo}
                disabled={!selectedPromo || selectedPromo?.dejaEnvoye || sending}
              >
                {sending ? "Envoi en cours..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}