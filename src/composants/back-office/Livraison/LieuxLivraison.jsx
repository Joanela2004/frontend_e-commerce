import React, { useState, useEffect } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import {
  fetchLieux,
  createLieu,
  updateLieu,
  deleteLieu,
  restoreLieu,
} from "../../../services/livraisonService";
import "../../../styles/back-office/fraisLivraison.css";
import { useNavigate } from "react-router-dom";

const LieuxLivraison = () => {
  const navigate = useNavigate();
  const [lieuxList, setLieuxList] = useState([]);
  const [form, setForm] = useState({ nomLieu: "", fraisLieu: "" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadLieux();
  }, []);

  const loadLieux = async () => {
    try {
      const data = await fetchLieux();
      setLieuxList(data);
    } catch (err) {
      console.error("Erreur chargement lieux :", err);
      setLieuxList([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ nomLieu: "", fraisLieu: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nomLieu.trim() || form.fraisLieu === "") {
      alert("Tous les champs sont obligatoires !");
      return;
    }

    const payload = {
      nomLieu: form.nomLieu.trim(),
      fraisLieu: parseFloat(form.fraisLieu),
    };

    try {
      if (editingId) {
        await updateLieu(editingId, payload);
        alert("Lieu mis à jour !");
      } else {
        await createLieu(payload);
        alert("Lieu ajouté !");
      }
      resetForm();
      loadLieux();
    } catch (err) {
      console.log("Erreur reçue :", err.response?.data);

      // NOUVEAU CAS : 422 avec soft_deleted = true
      if (err.response?.status === 422 && err.response.data?.soft_deleted) {
        setToast({
          type: "restore",
          message: `Le lieu "${err.response.data.nomLieu}" existe déjà mais est archivé.`,
          id: err.response.data.lieu_id,
        });
        return;
      }

      // Autres erreurs 422 (nom déjà pris et actif)
      if (err.response?.status === 422) {
        setToast({
          type: "conflict",
          message: `Le lieu "${payload.nomLieu}" existe déjà !`,
        });
        return;
      }

      // Erreur générique
      alert("Erreur : " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (item) => {
    setForm({ nomLieu: item.nomLieu, fraisLieu: item.fraisLieu });
    setEditingId(item.numLieu);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce lieu ?")) return;
    try {
      await deleteLieu(id);
      loadLieux();
      alert("Lieu supprimé (soft delete)");
    } catch {
      alert("Erreur suppression");
    }
  };

  const filteredLieux = lieuxList.filter((item) =>
    item.nomLieu.toLowerCase().includes(search.toLowerCase()) ||
    item.fraisLieu.toString().includes(search)
  );

  // TOAST (identique à FraisLivraison)
  const Toast = () => {
    if (!toast) return null;
    return (
      <div className="toast-overlay">
        <div className="toast">
          <p>{toast.message}</p>
          <div className="toast-buttons">
            {toast.type === "restore" && (
              <>
                <button
                  className="toast-btn toast-btn-restore"
                  onClick={async () => {
                    try {
                      await restoreLieu(toast.id);
                      alert("Lieu restauré avec succès !");
                      setToast(null);
                      resetForm();
                      loadLieux();
                    } catch {
                      alert("Erreur lors de la restauration");
                    }
                  }}
                >
                  Restaurer
                </button>
                <button className="toast-btn toast-btn-cancel" onClick={() => setToast(null)}>
                  Annuler
                </button>
              </>
            )}
            {toast.type === "conflict" && (
              <button className="toast-btn toast-btn-ok" onClick={() => setToast(null)}>
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="frais-container">
      {/* Header + Tabs */}
      <div className="frais-header">
        <h2><FaMapMarkerAlt /> Gestion des Lieux de Livraison</h2>
        <div className="livraison-tabs">
          <button className="tab-inactive" onClick={() => navigate("/admin/livraisons")}>Commandes</button>
          <button className="tab-inactive" onClick={() => navigate("/admin/livraisons/frais")}>Frais</button>
          <button className="tab-active">Lieux</button>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="frais-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nom du lieu</label>
            <input type="text" name="nomLieu" value={form.nomLieu} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Frais supp. (Ar)</label>
            <input type="number" name="fraisLieu" value={form.fraisLieu} onChange={handleChange} required min="0" />
          </div>
        </div>
        <div className="form-buttons">
          <button type="submit" className="btn-save">
            {editingId ? "Mettre à jour" : "Ajouter"}
          </button>
          {editingId && <button type="button" className="btn-cancel" onClick={resetForm}>Annuler</button>}
        </div>
      </form>

      {/* Recherche + Tableau */}
      <div className="frais-search-bar">
        <FaSearch />
        <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && <button className="btn-clear" onClick={() => setSearch("")}>X</button>}
      </div>

      <table className="frais-table">
        <thead>
          <tr><th>ID</th><th>Nom</th><th>Frais</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filteredLieux.length === 0 ? (
            <tr><td colSpan="4" className="text-center" style={{padding: "40px", color: "#888"}}>
              {search ? "Aucun résultat" : "Aucun lieu"}
            </td></tr>
          ) : (
            filteredLieux.map((item) => (
              <tr key={item.numLieu}>
                <td>{item.numLieu}</td>
                <td>{item.nomLieu}</td>
                <td>{item.fraisLieu.toLocaleString()} Ar</td>
                <td className="action-buttons">
                  <button className="btn-edit" onClick={() => handleEdit(item)}>Éditer</button>
                  <button className="btn-delete" onClick={() => handleDelete(item.numLieu)}>Supprimer</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Toast />
    </div>
  );
};

export default LieuxLivraison;