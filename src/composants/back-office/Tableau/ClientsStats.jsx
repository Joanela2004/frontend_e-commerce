// ClientsStats.jsx
import React, { useMemo, useState } from "react";
import { usePagination } from "../../../pages/hooks/hooks";
import { sendPromoEmail, fetchPromotions, checkPromoSent } from "../../../services/promotionService"; 
import { toast } from "react-toastify";
import { X, Gift, Calendar, Percent, ShoppingBag, DollarSign } from "lucide-react";

const ClientsStats = ({ clients, commandes }) => {
  const [loadingClient, setLoadingClient] = useState(null);
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
      image: client.image ,
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

  return (
    <>
      <div className="clients-stats">
        <h3>Statistiques par client</h3>
        <table className="clients-table">
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
                  <strong>{c.nom}</strong>
                </td>
                <td>{c.email}</td>
                <td>
                  <ShoppingBag size={16} color="#6366f1" /> {c.nbCommandes}
                </td>
                <td>
                  <DollarSign size={16} color="#10b981" /> {c.totalDepense.toFixed(2)} Ar
                </td>
                <td>
                  <button
                    className="btn-action-view"
                    onClick={() => handleOpenModal(c)}
                  >
                    <Gift size={16} style={{ marginRight: "0.5rem" }} />
                    Envoyer promo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Gift size={28} color="#28a458" /> Envoyer un code promo
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-client-info">
              <p><strong>Client :</strong> {selectedClient?.nom}</p>
              <p><strong>Email :</strong> {selectedClient?.email}</p>
              <p>
                <strong>Commandes :</strong> {selectedClient?.nbCommandes} | 
                <strong> Dépensé :</strong> {selectedClient?.totalDepense.toFixed(2)} Ar
              </p>
            </div>

            {loadingPromos ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div className="loading-spinner"></div>
                <p>Chargement des promotions...</p>
              </div>
            ) : promotions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", background: "#f9fafb", borderRadius: "12px" }}>
                <Gift size={48} color="#d1d5db" />
                <p style={{ color: "#6b7280", marginTop: "1rem" }}>Aucune promotion active</p>
              </div>
            ) : (
              <>
                <div className="promo-list">
                  {promotions.map(promo => (
                    <div
                      key={promo.numPromotion}
                      className={`promo-item ${
                        selectedPromo?.numPromotion === promo.numPromotion ? "selected" : ""
                      }`}
                      onClick={() => setSelectedPromo(promo)}
                    >
                      <div className="promo-code">
                        <Percent size={18} /> {promo.codePromo}
                      </div>

                      {promo.dejaEnvoye && (
                        <span className="badge-sent">Déjà envoyé</span> // ⭐ AJOUT
                      )}

                      <div className="promo-valeur">
                        -{promo.valeur} {promo.typePromotion === "Pourcentage" ? "%" : "Ar"}
                      </div>
                      <div className="promo-nomPromotion">{promo.nomPromotion}</div>
                      <div className="promo-dates">
                        <Calendar size={14} /> Du {formatDate(promo.dateDebut)} au{" "}
                        {formatDate(promo.dateFin)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-actions">
                  <button className="btn-modal btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>

                  <button
                    className="btn-modal btn-primary"
                    onClick={handleEnvoyerPromo}
                    disabled={!selectedPromo || sending || selectedPromo?.dejaEnvoye} // ⭐ CORRECTION
                  >
                    {selectedPromo?.dejaEnvoye
                      ? "Déjà envoyé"
                      : sending
                      ? "Envoi..."
                      : "Envoyer le code promo"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ClientsStats;
