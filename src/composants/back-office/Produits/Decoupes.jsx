import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { fetchDecoupes, createDecoupe, updateDecoupe, deleteDecoupe } from "../../../services/DecoupeService";
import "../../../styles/back-office/fraisLivraison.css";
import {useNavigate} from "react-router-dom";
const Decoupes = () => {
    const navigate = useNavigate();
  const [decoupes, setDecoupes] = useState([]);
  const [form, setForm] = useState({ 
    nomDecoupe: "", 
    coefficient: "" 
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDecoupes();
  }, []);

  const loadDecoupes = async () => {
    try {
      const data = await fetchDecoupes();
      setDecoupes(data);
    } catch (error) {
      console.error("Erreur chargement découpes:", error);
      alert("Erreur lors du chargement des découpes");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateDecoupe(editingId, form);
        alert("Découpe mise à jour !");
      } else {
        await createDecoupe(form);
        alert("Découpe ajoutée !");
      }
      
      setForm({ 
        nomDecoupe: "", 
        coefficient: "" 
      });
      setEditingId(null);
      loadDecoupes();

    } catch (err) {
      console.error("Erreur détaillée:", err);
      alert("Erreur lors de l'enregistrement: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (decoupe) => {
    setForm({ 
      nomDecoupe: decoupe.nomDecoupe, 
      coefficient: decoupe.coefficient 
    });
    setEditingId(decoupe.numDecoupe);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette découpe ?")) return;
    try {
      await deleteDecoupe(id);
      loadDecoupes();
      alert("Découpe supprimée !");
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const filteredDecoupes = decoupes.filter(d =>
    d.nomDecoupe.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="frais-container">
     <div className="frais-header">
        <h2>Gestion des Découpes</h2>
        <div className="livraison-tabs">
          <button className="tab-inactive" onClick={() => navigate("/admin/produits")}>
            Produits
          </button>
          <button className="tab-inactive" onClick={() => navigate("/admin/categories")}>
            Catégories
          </button>
          <button className="tab-active">Découpes</button>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="frais-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nom de la découpe</label>
            <input
              type="text"
              name="nomDecoupe"
              value={form.nomDecoupe}
              onChange={handleChange}
              required
              placeholder="Ex: Entier, Tranches, Dés..."
            />
          </div>

          <div className="form-group">
            <label>Coefficient</label>
            <input
              type="number"
              name="coefficient"
              value={form.coefficient}
              onChange={handleChange}
              required
              placeholder="1.0"
              step="0.1"
              min="0.1"
            />
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
              setForm({ 
                nomDecoupe: "", 
                coefficient: "" 
              });
            }}
          >
            Annuler
          </button>
        )}
      </form>

      {/* Barre de recherche */}
      <div className="frais-search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Rechercher une découpe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button className="btn-clear" onClick={() => setSearch("")}>✕</button>}
      </div>

      {/* Tableau */}
      <table className="frais-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Coefficient</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredDecoupes.map((d) => (
            <tr key={d.numDecoupe}>
              <td>{d.numDecoupe}</td>
              <td>{d.nomDecoupe}</td>
              <td>{d.coefficient}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(d)}>✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(d.numDecoupe)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Decoupes;