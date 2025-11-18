
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../../styles/back-office/fraisLivraison.css";
import {
  fetchModes,
  createMode,
  updateMode,
  deleteMode
} from "../../../services/paiementService";

const ModesPaiement = () => {
  const [modes, setModes] = useState([]);
  const [form, setForm] = useState({ 
    nomModePaiement: "", 
    actif: true,
    image: null,
    config: "" 
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const IMAGE_PAIEMENT = import.meta.env.VITE_IMAGE_PAIEMENT;

  useEffect(() => {
    loadModes();
  }, []);

  const loadModes = async () => {
    try {
      const data = await fetchModes();
      setModes(data);
    } catch (error) {
      console.error("Erreur chargement modes:", error);
      alert("Erreur lors du chargement des modes de paiement");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setForm({ ...form, image: files[0] });
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: e.target.checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nomModePaiement", form.nomModePaiement);
  
    formData.append("actif", form.actif.toString());
       formData.append("config", form.config || ""); 
    
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (editingId) {
              await updateMode(editingId, formData);
        alert("Mode mis à jour !");
      } else {
        await createMode(formData);
        alert("Mode ajouté !");
      }
      
      setForm({ 
        nomModePaiement: "", 
        actif: true,
        image: null,
        config: "" 
      });
      setEditingId(null);
      loadModes();

    } catch (err) {
      console.error("Erreur détaillée:", err);
           const errorMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(' ; ')
        : (err.response?.data?.message || err.message);

      alert("Erreur lors de l'enregistrement: " + errorMsg);
    }
  };

  const handleEdit = (mode) => {
    setForm({
      nomModePaiement: mode.nomModePaiement,
      actif: mode.actif,
      image: null, 
            config: mode.config ? JSON.stringify(mode.config) : "" 
    });
    setEditingId(mode.numModePaiement || mode.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce mode ?")) return;
    try {
      await deleteMode(id);
      loadModes();
      alert("Mode supprimé !");
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const filteredModes = modes.filter(m =>
    m.nomModePaiement.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="frais-container">
      <div className="frais-header">
        <h2>Gestion des Modes de Paiement</h2>
        <div className="livraison-tabs">
          <button className="tab-inactive" onClick={() => navigate("/admin/paiements")}>
            Paiements
          </button>
          <button className="tab-active">Modes de paiement</button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="frais-form" encType="multipart/form-data">
        <div className="form-row">
          <div className="form-group">
            <label>Logo</label>
            <input 
              type="file" 
              name="image" 
              accept="image/*" 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Nom du mode de paiement</label>
            <input
              type="text"
              name="nomModePaiement"
              value={form.nomModePaiement}
              onChange={handleChange}
              required
              placeholder="Ex: Carte bancaire, PayPal..."
            />
          </div>
         

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="actif"
                checked={form.actif}
                onChange={handleChange}
              />
              Actif
            </label>
          </div>
        </div>

        <button className="btn-save" type="submit">
          {editingId ? "Mettre à jour" : "Ajouter"}
        </button>
        
        {editingId && (
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => {
              setEditingId(null);
              setForm({ nomModePaiement: "", actif: true, image: null, config: "" });
            }}
          >
            Annuler
          </button>
        )}
      </form>

      {/* Search */}
      <div className="frais-search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button className="btn-clear" onClick={() => setSearch("")}>✕</button>}
      </div>

      {/* Table */}
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
          {filteredModes.map((m) => (
            <tr key={m.numModePaiement || m.id}>
              <td>
    {m.image ? (
        <img
            src={`${IMAGE_PAIEMENT}${m.image}`}
            alt={m.nomModePaiement}
            style={{ width: 50, height: 50, objectFit: 'contain' }}
        />
    ) : "—"}
</td>

              <td>{m.nomModePaiement}</td>
              
              <td>
                <span className={`status ${m.actif ? 'active' : 'inactive'}`}>
                  {m.actif ? 'Actif' : 'Inactif'}
                </span>
              </td>

              <td>
                <button className="btn-edit" onClick={() => handleEdit(m)}>✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(m.numModePaiement || m.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModesPaiement;