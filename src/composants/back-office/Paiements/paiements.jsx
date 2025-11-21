import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../../styles/back-office/fraisLivraison.css"; 
import {
  fetchPaiements,
  createPaiement,
  updatePaiement,
  deletePaiement,
  fetchModes,
} from "../../../services/paiementService";

const Paiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [modes, setModes] = useState([]);
  const [form, setForm] = useState({
    numCommande: "",
    montantApayer: "",
    modePaiementId: "",
    statut: "en attente",
  });
  const [editingId, setEditingId] = useState(null);
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.numCommande || !form.montantApayer || !form.modePaiementId) {
      alert("Tous les champs sont obligatoires !");
      return;
    }

    try {
      if (editingId) {
        await updatePaiement(editingId, form);
        alert("Paiement mis à jour !");
      } else {
        await createPaiement(form);
        alert("Nouveau paiement ajouté !");
      }
      setForm({ numCommande: "", montantApayer: "", modePaiementId: "", statut: "en attente" });
      setEditingId(null);
      loadPaiements();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement du paiement");
    }
  };
  
  const handleEdit = (p) => {
    setForm({
      numCommande: p.numCommande,
      montantApayer: p.montantApayer,
      modePaiementId: p.mode_paiement.id,
      statut: p.statut,
    });
    setEditingId(p.numPaiement);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce paiement ?")) return;
    await deletePaiement(id);
    loadPaiements();
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

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="frais-form">
        <div className="form-row">
          <div className="form-group">
            <label>Numéro de commande</label>
            <input type="text" name="numCommande" value={form.numCommande} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Montant</label>
            <input type="number" name="montantApayer" value={form.montantApayer} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mode de paiement</label>
            <select name="modePaiementId" value={form.modePaiementId} onChange={handleChange} required>
              <option value="">-- Choisir --</option>
              {modes.map((m) => (
                <option key={m.id} value={m.id}>{m.nomMode}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange}>
              <option value="effectué">effectué</option>
              <option value="en attente">en attente</option>
              <option value="échoué">échoué</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-save">
          {editingId ? "Mettre à jour" : "Ajouter"}
        </button>
      </form>

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

      {/* Table */}
      <table className="frais-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Commande</th>
            <th>Client</th>
            <th>Montant</th>
            <th>Mode</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPaiements.map((p) => (
            <tr key={p.numPaiement}>
              <td>{p.numPaiement}</td>
              <td>{p.numCommande}</td>
              <td>{p.commande?.utilisateur?.prenom} {p.commande?.utilisateur?.nom}</td>
              <td>{p.montantApayer}</td>
              <td>{p.mode_paiement?.nomMode}</td>
              <td>{p.statut}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(p)}>✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(p.numPaiement)}>🗑️</button>
              </td>
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
