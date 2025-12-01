// src/composants/back-office/Paiements/ModesPaiement.jsx
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/back-office/fraisLivraison.css";
import {
  fetchModes,
  createMode,
  updateMode,
  deleteMode,
} from "../../../services/paiementService";

const ModesPaiement = () => {
  const [modes, setModes] = useState([]);
  const [form, setForm] = useState({ nomModePaiement: "", actif: true, image: null });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  useEffect(() => {
    loadModes();
  }, []);

  const loadModes = async () => {
    try {
      const data = await fetchModes();
      setModes(data);
    } catch (err) {
      alert("Erreur chargement des modes");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nomModePaiement", form.nomModePaiement);
    formData.append("actif", form.actif ? "1" : "0");
    if (form.image) formData.append("image", form.image);

    try {
      if (editingId) {
        await updateMode(editingId, formData);
        alert("Mode mis à jour !");
      } else {
        await createMode(formData);
        alert("Mode ajouté !");
      }
      setForm({ nomModePaiement: "", actif: true, image: null });
      setPreview(null);
      setEditingId(null);
      loadModes();
    } catch (err) {
      alert("Erreur enregistrement");
    }
  };

  const handleEdit = (mode) => {
    setForm({
      nomModePaiement: mode.nomModePaiement,
      actif: mode.actif === 1 || mode.actif === true,
      image: null,
    });
    setPreview(`${IMAGE_BASE_URL}${mode.image}`);
    setEditingId(mode.numModePaiement);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce mode de paiement ?")) return;
    await deleteMode(id);
    loadModes();
  };

  const filtered = modes.filter((m) =>
    m.nomModePaiement.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="frais-container">
      <div className="frais-header">
        <h2>Gestion des Modes de Paiement</h2>
        <div className="livraison-tabs">
          <button
            className={location.pathname === "/admin/paiements" ? "tab-active" : "tab-inactive"}
            onClick={() => navigate("/admin/paiements")}
          >
            Paiements
          </button>
          <button className="tab-active">Modes de paiement</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="frais-form">
        <div className="form-row">
          <div className="form-group">
            <label>Logo du mode</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && <img src={preview} alt="Preview" style={{ width: 80, marginTop: 10, borderRadius: 8 }} />}
          </div>
          <div className="form-group">
            <label>Nom du mode</label>
            <input
              type="text"
              value={form.nomModePaiement}
              onChange={(e) => setForm({ ...form, nomModePaiement: e.target.value })}
              required
              placeholder="Ex: Carte Bancaire, PayPal, Virement..."
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={form.actif}
                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
              />{" "}
              Actif
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" className="btn-save">
            {editingId ? "Mettre à jour" : "Ajouter"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditingId(null);
                setForm({ nomModePaiement: "", actif: true, image: null });
                setPreview(null);
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="frais-search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Rechercher un mode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button className="btn-clear" onClick={() => setSearch("")}>X</button>}
      </div>

      <table className="frais-table">
        <thead>
          <tr>
            <th>Logo</th>
            <th>Nom</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m) => (
            <tr key={m.numModePaiement}>
              <td>
                {m.image ? (
                  <img
                    src={`${IMAGE_BASE_URL}${m.image}`}
                    alt={m.nomModePaiement}
                    style={{ width: 60, height: 40, objectFit: "contain" }}
                  />
                ) : (
                  "—"
                )}
              </td>
              <td>{m.nomModePaiement}</td>
              <td>
                <span className={`status ${m.actif ? "active" : "inactive"}`}>
                  {m.actif ? "Actif" : "Inactif"}
                </span>
              </td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(m)}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(m.numModePaiement)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
                Aucun mode trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ModesPaiement;