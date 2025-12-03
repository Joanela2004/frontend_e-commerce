import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import {
  fetchFrais,
  createFrais,
  updateFrais,
  deleteFrais,
  restoreFrais,
  regenererToutesLesTranches,
} from "../../../services/livraisonService";
import "../../../styles/back-office/fraisLivraison.css";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";

const FraisLivraison = () => {
  const navigate = useNavigate();
  const [fraisList, setFraisList] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ poidsMin: "", poidsMax: "", frais: "" });
  const [toast, setToast] = useState(null);

  useEffect(() => { loadFrais(); }, []);

  const loadFrais = async () => {
    try {
      const data = await fetchFrais();
      setFraisList(data);
    } catch (err) {
      console.error(err);
      setFraisList([]);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => { setForm({ poidsMin: "", poidsMax: "", frais: "" }); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      poidsMin: parseFloat(form.poidsMin),
      poidsMax: parseFloat(form.poidsMax),
      frais: parseFloat(form.frais),
    };

    try {
      editingId ? await updateFrais(editingId, payload) : await createFrais(payload);
      alert(editingId ? "Tranche mise à jour !" : "Tranche ajoutée !");
      resetForm();
      loadFrais();
    } catch (err) {
      if (err.response?.status === 409) {
        const data = err.response.data;
        if (data.soft_deleted) {
          setToast({
            type: "restore",
            message: `La tranche ${data.poids_range} existe déjà mais est archivée.`,
            id: data.frais_id,
          });
        } else {
          const range = data.poids_range || `${payload.poidsMin} - ${payload.poidsMax} kg`;
          setToast({ type: "conflict", message: `La tranche ${range} existe déjà.` });
        }
        return;
      }
      alert("Erreur : " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (item) => {
    setForm({ poidsMin: item.poidsMin, poidsMax: item.poidsMax, frais: item.frais });
    setEditingId(item.numFrais || item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette tranche ?")) return;
    try { await deleteFrais(id); loadFrais(); alert("Supprimée !"); } catch { alert("Erreur"); }
  };

  const handleRegenererTout = async () => {
    if (!form.poidsMin || !form.poidsMax || !form.frais) {
      alert("Remplis d'abord les champs ci-dessus !");
      return;
    }
    if (!window.confirm("TOUTE LA TABLE SERA SUPPRIMÉE ET REGÉNÉRÉE jusqu'à 1000 kg !\nContinuer ?")) return;

    try {
      const result = await regenererToutesLesTranches({
        poidsMin: parseFloat(form.poidsMin),
        poidsMax: parseFloat(form.poidsMax),
        frais: parseFloat(form.frais),
      });
      alert(`SUCCÈS ! ${result.total_tranches} tranches créées !`);
      loadFrais();
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.message || err.message));
    }
  };

  const filteredFrais = fraisList.filter(item =>
    [item.poidsMin, item.poidsMax, item.frais].some(val =>
      val.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  // TOAST PROPRE DANS LE CSS
  const Toast = () => {
    if (!toast) return null;
    return (
      <div className="toast-overlay">
        <div className="toast">
          <p>{toast.message}</p>
          <div className="toast-buttons">
            {toast.type === "restore" && (
              <>
                <button className="toast-btn toast-btn-restore" onClick={async () => {
                  try { await restoreFrais(toast.id); alert("Restaurée !"); setToast(null); loadFrais(); }
                  catch { alert("Erreur"); }
                }}>Restaurer</button>
                <button className="toast-btn toast-btn-cancel" onClick={() => setToast(null)}>Annuler</button>
              </>
            )}
            {toast.type === "conflict" && (
              <button className="toast-btn toast-btn-ok" onClick={() => setToast(null)}>OK</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="frais-container">
      <div className="frais-header">
        <h2>Gestion des Frais de Livraison</h2>
        <div className="livraison-tabs">
          <button className="tab-inactive" onClick={() => navigate("/admin/livraisons")}>Commandes</button>
          <button className="tab-active">Frais de livraison</button>
          <button className="tab-inactive" onClick={() => navigate("/admin/livraisons/lieux")}>Lieux</button>
        </div>
      </div>

   

      <form onSubmit={handleSubmit} className="frais-form">
        <div className="form-row">
          <div className="form-group">
            <label>Poids min (kg)</label>
            <input type="number" name="poidsMin" value={form.poidsMin} onChange={handleChange} required step="0.1" placeholder="5" />
          </div>
          <div className="form-group">
            <label>Poids max (kg)</label>
            <input type="number" name="poidsMax" value={form.poidsMax} onChange={handleChange} required step="0.1" placeholder="10" />
          </div>
          <div className="form-group">
            <label>Frais de base (Ar)</label>
            <input type="number" name="frais" value={form.frais} onChange={handleChange} required step="100" placeholder="5000" />
          </div>
        </div>
    <div className="form-buttons" style={{ gap: "12px", flexWrap: "wrap" }}>
  <button type="submit" className="btn-save">
    {editingId ? "Mettre à jour" : "Ajouter une tranche"}
  </button>

  <button type="button" className="btn-save" onClick={handleRegenererTout}>
    <span className="icon"><FiRefreshCw /></span> Regénérer toutes les tranches
  </button>

  {editingId && <button type="button" className="btn-cancel" onClick={resetForm}>Annuler</button>}
</div>
      </form>

      <div className="frais-search-bar">
        <FaSearch />
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="btn-clear" onClick={() => setSearch("")}>X</button>}
      </div>

      <table className="frais-table">
        <thead>
          <tr><th>ID</th><th>Poids min</th><th>Poids max</th><th>Frais</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filteredFrais.length === 0 ? (
            <tr><td colSpan="5" className="text-center" style={{padding: "40px", color: "#888"}}>
              {search ? "Aucun résultat" : "Aucune tranche enregistrée"}
            </td></tr>
          ) : (
            filteredFrais.map(item => (
              <tr key={item.numFrais || item.id}>
                <td>{item.numFrais || item.id}</td>
                <td>{item.poidsMin} kg</td>
                <td>{item.poidsMax} kg</td>
                <td>{item.frais.toLocaleString()} Ar</td>
                <td className="action-buttons">
                  <button className="btn-edit" onClick={() => handleEdit(item)}>Éditer</button>
                  <button className="btn-delete" onClick={() => handleDelete(item.numFrais || item.id)}>Supprimer</button>
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

export default FraisLivraison;