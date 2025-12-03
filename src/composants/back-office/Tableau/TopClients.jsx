import { useEffect, useState, useMemo } from "react";
import dashboardApi from "../../../services/dashboardApi";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/global.css";
import { sendPromoEmail, fetchPromotions, checkPromoSent } from "../../../services/promotionService"; 
import { toast } from "react-toastify";

import {
  FaEnvelope,
  FaShoppingCart,
  FaMoneyBillAlt,
  FaSearch,
  FaUsers,
  FaGift,
  FaTimes,
  FaPercentage,
  FaCalendar,
  FaStore
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
      const res = await dashboardApi.topClients(start, end, limit);
      setClients(res.data);
    } catch (err) {
      console.error("Erreur API TopClients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [start, end, limit]);

  const filteredClients = useMemo(() => {
    return clients.filter(c =>
      (c.nomUtilisateur || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const openPromoModal = async (client) => {
    setSelectedClient({
      id: client.numUtilisateur,
      nom: client.nomUtilisateur,
      email: client.email,
      commandes: client.commandes_count,
      total: client.total_depense
    });

    setShowModal(true);
    setLoadingPromos(true);
    setSelectedPromo(null);

    try {
      const promos = await fetchPromotions();
      const now = new Date();

      const activePromos = promos.filter(p => {
        const dateFin = new Date(p.dateFin);
        return (
          (p.statutPromotion === "active" || p.statutPromotion === "actif" || p.statutPromotion === true) &&
          dateFin > now
        );
      });

      const promosWithStatus = await Promise.all(
        activePromos.map(async (p) => {
          const deja = await checkPromoSent(p.numPromotion, client.numUtilisateur);
          return { ...p, dejaEnvoye: deja };
        })
      );

      setPromotions(promosWithStatus);
    } catch {
      toast.error("Erreur lors du chargement des promotions");
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
        toast.error(res.message || "Échec de l'envoi.");
      }
    } catch (err) {
      toast.error("Erreur lors de l'envoi du code promo");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="loading">Chargement top clients...</div>;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <FaUsers style={{ marginRight: "10px", color: "#28a458" }} />
          Top Clients
        </h1>
      </div>

      {/* Barre de recherche */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau */}
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
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => (
                <tr key={c.numUtilisateur}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {c.image ? (
  // Si le client a une image → afficher la photo
  <img 
    src={`${IMAGE_BASE_URL}${c.image}`}
    alt={c.nomUtilisateur} 
    style={{
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      objectFit: "cover"
    }}
    className="tooltip-img"
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

                      <div>
                        <div style={{ fontWeight: "bold" }}>{c.nomUtilisateur || "N/A"}</div>
                      </div>
                    </div>
                  </td>

                  <td>{c.commandes_count}</td>

                  <td>{Number(c.total_depense).toLocaleString()} Ar</td>

                  <td>
                    <button
                      className="btn-promo"
                      onClick={() => openPromoModal(c)}
                    >
                      <FaGift /> Envoyer promo
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5">Aucun client trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL PROMO (inchangé, juste corrigé indentation) --- */}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-promo-envoi" onClick={(e) => e.stopPropagation()}>
            
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
              <p><strong>Total :</strong> {selectedClient?.total} Ar</p>
            </div>

            {loadingPromos ? (
              <p>Chargement des promotions...</p>
            ) : promotions.length === 0 ? (
              <p>Aucune promotion active</p>
            ) : (
              <div className="promo-grid">
                {promotions.map((p) => (
                  <div
                    key={p.numPromotion}
                    className={`promo-card ${selectedPromo?.numPromotion === p.numPromotion ? "selected" : ""} ${p.dejaEnvoye ? "sent" : ""}`}
                    onClick={() => !p.dejaEnvoye && setSelectedPromo(p)}
                  >
                    <div className="promo-header">
                      <FaPercentage /> {p.codePromo}
                    </div>

                    <div className="promo-value">
                      -{p.valeur}{p.typePromotion === "Pourcentage" ? "%" : " Ar"}
                    </div>

                    <div className="promo-dates">
                      <FaCalendar /> {formatDate(p.dateDebut)} → {formatDate(p.dateFin)}
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
                {sending ? "Envoi..." : "Envoyer"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Bouton promo CSS */}
      <style>
        {`
          .btn-promo {
            background-color: var(--color-green-primary);
            color: white;
            padding: 8px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            border: none;
            display: flex;
            align-items: center;
            gap: 6px;
          }
        `}
      </style>
    </div>
  );
}
