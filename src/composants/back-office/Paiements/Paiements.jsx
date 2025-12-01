// src/composants/back-office/Paiements/Paiements.jsx
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../../styles/back-office/fraisLivraison.css";
import { fetchPaiements, updatePaiement } from "../../../services/paiementService";

const Paiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState(null); // Pour spinner sur le bouton
  const navigate = useNavigate();
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  useEffect(() => {
    loadPaiements();
  }, []);

  const loadPaiements = async () => {
    try {
      const data = await fetchPaiements();
      setPaiements(data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des paiements");
    }
  };

  // Nouvelle fonction : marquer un paiement comme payé
  const handleMarkAsPaid = async (numPaiement) => {
    if (!window.confirm("Marquer ce paiement comme payé ?")) return;

    setLoadingAction(numPaiement);
    try {
      await updatePaiement(numPaiement, { statut: "effectué" });

      // Mise à jour optimiste du state
      setPaiements(prev =>
        prev.map(p =>
          p.numPaiement === numPaiement
            ? { ...p, statut: "effectué", datePaiement: new Date().toISOString() }
            : p
        )
      );

      alert("Paiement marqué comme payé !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du paiement");
    } finally {
      setLoadingAction(null);
    }
  };

  const filtered = paiements.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.numPaiement?.toString().includes(s) ||
      p.numCommande?.toString().includes(s) ||
      `${p.commande?.utilisateur?.prenom || ""} ${p.commande?.utilisateur?.nom || ""}`
        .toLowerCase()
        .includes(s) ||
      p.commande?.utilisateur?.email?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="frais-container">
      <div className="frais-header">
        <h2>Gestion des Paiements</h2>
        <div className="livraison-tabs">
          <button className="tab-active">Paiements</button>
          <button
            className="tab-inactive"
            onClick={() => navigate("/admin/paiements/modes")}
          >
            Modes de paiement
          </button>
        </div>
      </div>

      <div className="frais-search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Rechercher par ID, commande, client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="btn-clear" onClick={() => setSearch("")}>
            X Effacer
          </button>
        )}
      </div>

      <table className="frais-table">
        <thead>
          <tr>
            <th>ID Paiement</th>
            <th>Commande</th>
            <th>Client</th>
            <th>Montant</th>
            <th>Mode</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.numPaiement}>
              <td>#{p.numPaiement}</td>
              <td>CMD-{p.numCommande}</td>
              <td>
                {p.commande?.utilisateur?.prenom} {p.commande?.utilisateur?.nom}
                <br />
                <small>{p.commande?.utilisateur?.email}</small>
              </td>
              <td>{parseFloat(p.montantApayer || 0).toFixed(2)} €</td>
              <td>
                {p.mode_paiement?.image ? (
                  <img
                    src={`${IMAGE_BASE_URL}${p.mode_paiement.image}`}
                    alt={p.mode_paiement.nomMode}
                    style={{ width: 40, height: 30, objectFit: "contain" }}
                  />
                ) : (
                  p.mode_paiement?.nomMode || "—"
                )}
              </td>
              <td>
                <span
                  className={`status ${p.statut === "effectué" ? "active" : "inactive"}`}
                >
                  {p.statut === "effectué" ? "Payé" : "En attente"}
                </span>
              </td>
              <td>
                {p.datePaiement
                  ? new Date(p.datePaiement).toLocaleDateString("fr-FR")
                  : "—"}
              </td>
              <td>
                {p.statut !== "effectué" && (
                  <button
                    className="btn-action btn-validate"
                    onClick={() => handleMarkAsPaid(p.numPaiement)}
                    disabled={loadingAction === p.numPaiement}
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.85rem",
                      opacity: loadingAction === p.numPaiement ? 0.7 : 1,
                    }}
                  >
                    {loadingAction === p.numPaiement ? "..." : "Marquer payé"}
                  </button>
                )}
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#777" }}>
                {search ? "Aucun paiement trouvé" : "Aucun paiement enregistré"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Paiements;