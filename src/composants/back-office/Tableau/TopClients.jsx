import React, { useEffect, useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
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

import dashboardApi from "../../../services/dashboardApi";
import { toast } from "react-toastify";
import {
  sendPromoEmail,
  fetchPromotions,
  checkPromoSent,
} from "../../../services/promotionService";

ChartJS.register(ArcElement, Tooltip, Legend);

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
      
      setClients(res.data || []);
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
    let list = clients.filter(
      (c) =>
        (c.nomUtilisateur || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    return list.slice(0, limit);
  }, [clients, searchTerm, limit]);

  const openPromoModal = async (client) => {
    setSelectedClient({
      id: client.numUtilisateur,
      nom: client.nomUtilisateur,
      email: client.email,
      commandes: client.commandes_count,
      total: Number(client.total_depense).toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
      }),
    });
    setShowModal(true);
    setLoadingPromos(true);
    setSelectedPromo(null);
    try {
      const promos = await fetchPromotions();
      const now = new Date();
      const activePromos = promos.filter((p) => {
        const dateFin = new Date(p.dateFin);
        const dateDebut = new Date(p.dateDebut);
        return (
          p.codePromo &&
          p.codePromo.trim() !== "" &&
          p.statutPromotion &&
          dateDebut <= now &&
          dateFin > now
        );
      });
      const promosWithStatus = await Promise.all(
        activePromos.map(async (p) => {
          const deja = await checkPromoSent(
            p.numPromotion,
            client.numUtilisateur
          );
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
        toast.success(
          <div style={{ display: "flex", alignItems: "center" }}>
            <FaCheckCircle style={{ marginRight: "10px" }} />
            Code promo **{selectedPromo.codePromo}** envoyé à **{selectedClient.nom}** !
          </div>,
          { autoClose: 3000, position: "top-center" }
        );
        setPromotions((prev) =>
          prev.map((p) =>
            p.numPromotion === selectedPromo.numPromotion
              ? { ...p, dejaEnvoye: true }
              : p
          )
        );
        setSelectedPromo((prev) => ({ ...prev, dejaEnvoye: true }));
        setTimeout(() => setShowModal(false), 800);
      } else {
        toast.error(res.message || "Échec de l'envoi");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur serveur");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="widget-loading">Chargement...</div>;
  if (clients.length === 0) {
  return (
    <div className="top-clients-widget">
      <h2 className="widget-title">Top Clients Fidèles</h2>
      <div className="widget-empty" style={{ textAlign: "center", padding: "40px 20px" }}>
        <p style={{ fontSize: "1.1em", color: "#666" }}>
          Aucun client n'a commandé durant cette période.
        </p>
      </div>
    </div>
  );
}
 const donutColors = [

    "#28a458",
    "#ff8c00",
    " #8B5E3C",
    "#ff6200",
    "#ffb84d",
    "#ffd19a",
    "#28a458",
    "#218838",
    "#34ce70",
    "#a0e6ba",
    "#d4edda",
  ];

  return (
    <div className="top-clients-widget">
      <h2 className="widget-title">Top Clients Fidèles</h2>

      <div className="search-container" style={{ marginBottom: "20px" }}>
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458" }} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="progress-list">
        {filteredClients.map((c) => {
          console.log(
    "Produits donut pour",
    c.nomUtilisateur,
    c.produits_preferes_detail
  );
          const produits = c.produits_preferes_detail || [];
          const hasProducts = produits.length > 0 && produits.some(p => p.qte > 0);

          const labels = hasProducts
            ? produits.map((p) => p.nom || "Produit inconnu")
            : ["Aucun produit"];

          const dataValues = hasProducts
            ? produits.map((p) => p.qte || 1)
            : [1];

          const safeColors = labels.map((_, i) => donutColors[i % donutColors.length]);

          const donutData = {
            labels,
            datasets: [
              {
                data: dataValues,
                backgroundColor: safeColors,
                borderColor: "#fff",
                borderWidth: 2,
              },
            ],
          };

          const donutOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: {
                  boxWidth: 15,
                  padding: 15,
                  font: { size: 12, weight: "bold" },
                  color: "#333",
                },
              },
              
            },
            cutout: "65%",
          };

          return (
            <div key={c.numUtilisateur} className="progress-item">
              <div className="item-header">
                 <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {c.image ? (
  <img 
    src={`${IMAGE_BASE_URL}${c.image}`}
    alt={c.nomUtilisateur} 
    style={{
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      objectFit: "cover"
    }}
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
                
                </div>
                <div className="item-info">
                  <strong className="client-name">{c.nomUtilisateur || "Inconnu"}</strong>
                  <p className="client-desc">
                    <FaEnvelope style={{ marginRight: "5px" }} />
                    {c.email || "Non renseigné"}
                  </p>
                  <div className="client-stats">
                    <span>
                      <FaShoppingCart /> {c.commandes_count || 0} commande(s)
                    </span>
                    <span>
                      <FaMoneyBillAlt /> {Number(c.total_depense || 0).toLocaleString()} Ar
                    </span>
                  </div>
                
                </div>
                <div className="client-donut">
                  <Doughnut data={donutData} options={donutOptions} />
                </div>
              </div>

              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ background:" #8B5E3C", width: `${c.progress_pct > 0 ? c.progress_pct : 5}%` }}
                />
              </div>

              <div className="client-action">
                <button className="btn-primary" onClick={() => openPromoModal(c)}>
                  <FaGift /> Envoyer promo
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content modal-promo-envoi"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px" }}
          >
            <div className="modal-body">
              <div
                className="info-card client-summary"
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  backgroundColor: "#f9f9f9",
                  borderLeft: "5px solid var(--color-primary)",
                }}
              >
                <p>
                  <strong>Nom :</strong> {selectedClient?.nom}
                </p>

                <p>
                  <strong>Commandes passées :</strong>{" "}
                  {selectedClient?.commandes}
                </p>

                <p>
                  <strong>Dépense Totale :</strong>{" "}
                  <span
                    style={{ color: "var(--color-accent)", fontWeight: "bold" }}
                  >
                    {selectedClient?.total} Ar
                  </span>
                </p>
              </div>

              <h4
                style={{
                  marginBottom: "15px",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "10px",
                }}
              >
                Sélectionnez une promotion active :
              </h4>

              {loadingPromos ? (
                <div className="loading-state" style={{ minHeight: "100px" }}>
                  <div className="loading-spinner-small"></div>

                  <p>Chargement des promotions...</p>
                </div>
              ) : promotions.length === 0 ? (
                <p
                  style={{
                    color: "#dc3545",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  Aucune promotion active disponible.
                </p>
              ) : (
                <div
                  className="promo-grid"
                  style={{
                    display: "grid",

                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",

                    gap: "15px",
                  }}
                >
                  {promotions.map((p) => (
                    <div
                      key={p.numPromotion}
                      className={`promo-card ${
                        selectedPromo?.numPromotion === p.numPromotion
                          ? "selected"
                          : ""
                      } ${p.dejaEnvoye ? "sent" : ""}`}
                      onClick={() => !p.dejaEnvoye && setSelectedPromo(p)}
                      title={
                        p.dejaEnvoye
                          ? `Déjà envoyé`
                          : "Cliquer pour sélectionner"
                      }
                      style={{
                        border: `2px solid ${
                          p.dejaEnvoye
                            ? "#ccc"
                            : selectedPromo?.numPromotion === p.numPromotion
                            ? "var(--color-primary)"
                            : "#eee"
                        }`,

                        borderRadius: "8px",

                        padding: "15px",

                        cursor: p.dejaEnvoye ? "not-allowed" : "pointer",

                        transition: "all 0.2s",

                        opacity: p.dejaEnvoye ? 0.6 : 1,

                        position: "relative",

                        backgroundColor:
                          selectedPromo?.numPromotion === p.numPromotion
                            ? "#e6f7ef"
                            : "white",

                        boxShadow:
                          selectedPromo?.numPromotion === p.numPromotion
                            ? "0 4px 8px rgba(0, 0, 0, 0.1)"
                            : "none",
                      }}
                    >
                      <div
                        className="promo-header"
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.1em",
                          color: "var(--color-text)",
                          marginBottom: "10px",
                        }}
                      >
                        <FaPercentage
                          style={{
                            marginRight: "5px",
                            color: "var(--color-accent)",
                          }}
                        />{" "}
                        {p.codePromo}
                      </div>

                      <div
                        className="promo-value"
                        style={{
                          fontSize: "1.5em",
                          fontWeight: "bold",
                          color: p.dejaEnvoye ? "#777" : "var(--color-primary)",
                          marginBottom: "10px",
                        }}
                      >
                        -{p.valeur}
                        {p.typePromotion === "Pourcentage" ? "%" : " Ar"}
                      </div>

                      <div
                        className="promo-dates"
                        style={{ fontSize: "0.9em", color: "#666" }}
                      >
                        <FaCalendarAlt style={{ marginRight: "5px" }} />
                        {formatDate(p.dateDebut)} → {formatDate(p.dateFin)}
                      </div>

                      {p.dejaEnvoye && (
                        <div
                          className="promo-sent"
                          style={{
                            position: "absolute",

                            top: "0",
                            right: "0",

                            backgroundColor: "#d4edda",

                            color: "#155724",

                            padding: "5px 10px",

                            borderRadius: "0 8px 0 8px",

                            fontWeight: "bold",

                            fontSize: "0.8em",
                          }}
                        >
                          <FaCheckCircle style={{ marginRight: "5px" }} /> Déjà
                          envoyé
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Modale */}

            <div
              className="modal-actions"
              style={{ paddingTop: "20px", borderTop: "1px solid #eee" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                disabled={sending}
              >
                Annuler
              </button>

              <button
                className="btn btn-primary"
                onClick={handleEnvoyerPromo}
                disabled={
                  !selectedPromo || selectedPromo?.dejaEnvoye || sending
                }
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
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
