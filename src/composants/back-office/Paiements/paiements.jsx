import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../../styles/back-office/fraisLivraison.css"; 
import {
  fetchPaiements,
  fetchModes,
} from "../../../services/paiementService";

const Paiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [modes, setModes] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadPaiements();
    loadModes();
  }, []);

  const loadPaiements = async () => {
    const data = await fetchPaiements();
    setPaiements(data);
  };

  const loadModes = async () => {
    const data = await fetchModes();
    setModes(data);
  };

  const filteredPaiements = paiements.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.numPaiement.toString().includes(s) ||
      p.numCommande.toString().includes(s) ||
      p.commande?.utilisateur?.nom.toLowerCase().includes(s) ||
      p.commande?.utilisateur?.email.toLowerCase().includes(s)
    );
  });

  return (
    <div className="frais-container">
      <div className="frais-header">
        <h2>Gestion des Paiements</h2>
        <div className="livraison-tabs">
          <button className="tab-active">Paiements</button>
          <button className="tab-inactive" onClick={() => navigate("/admin/paiements/modes")}>
            Modes de paiement
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="frais-search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Rechercher un paiement, client ou commande..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button className="btn-clear" onClick={() => setSearch("")}>✕ Effacer</button>}
      </div>

      {/* Table sans création/édition */}
      <table className="frais-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Commande</th>
            <th>Client</th>
            <th>Mode de paiement</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {filteredPaiements.map((p) => (
            <tr key={p.numPaiement}>
              <td>{p.numPaiement}</td>
              <td>{p.numCommande}</td>
              <td>
                {p.commande?.utilisateur?.prenom} {p.commande?.utilisateur?.nom}
              </td>
              <td>{p.mode_paiement?.nomMode}</td>
              <td>{p.statut}</td>
            </tr>
          ))}

          {filteredPaiements.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", color: "#777" }}>
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
