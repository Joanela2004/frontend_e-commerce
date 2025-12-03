import React, { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaPlus, 
  FaSync, 
  FaFilter,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTruck,
  FaWeightHanging,
  FaExclamationTriangle,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import {
  fetchLieux,
  createLieu,
  updateLieu,
  deleteLieu,
  restoreLieu,
} from "../../../services/livraisonService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../contexts/ToastContext";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";

const LieuxLivraison = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [lieuxList, setLieuxList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtreFraisMin, setFiltreFraisMin] = useState("");
  const [filtreFraisMax, setFiltreFraisMax] = useState("");

  // États pour les modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    type: "",
    lieuId: null,
    lieuNom: "",
    onConfirm: null
  });

  const [form, setForm] = useState({ 
    nomLieu: "", 
    fraisLieu: "" 
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const data = await fetchLieux();
      setLieuxList(data);
    } catch (err) {
      console.error("Erreur chargement lieux :", err);
      showModal("error", "Erreur", "Erreur lors du chargement des lieux de livraison");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour afficher une modal
  const showModal = (type, title, message, lieuId = null, lieuNom = "", onConfirm = null) => {
    setModalData({
      type,
      title,
      message,
      lieuId,
      lieuNom,
      onConfirm
    });
    
    if (type === "delete") {
      setShowDeleteModal(true);
    } else if (type === "restore") {
      setShowRestoreModal(true);
    } else if (type === "success") {
      setShowSuccessModal(true);
    }
  };

  // Fermer toutes les modals
  const closeAllModals = () => {
    setIsFormOpen(false);
    setShowDeleteModal(false);
    setShowRestoreModal(false);
    setShowSuccessModal(false);
    setModalData({
      title: "",
      message: "",
      type: "",
      lieuId: null,
      lieuNom: "",
      onConfirm: null
    });
    resetForm();
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
      showModal("error", "Champs manquants", "Tous les champs sont obligatoires !");
      return;
    }

    const payload = {
      nomLieu: form.nomLieu.trim(),
      fraisLieu: parseFloat(form.fraisLieu),
    };

    try {
      if (editingId) {
        await updateLieu(editingId, payload);
        showModal("success", "Succès", "Lieu de livraison mis à jour avec succès !");
      } else {
        await createLieu(payload);
        showModal("success", "Succès", "Lieu de livraison ajouté avec succès !");
      }
      chargerDonnees();
    } catch (err) {
      console.error("Erreur détaillée:", err);

      // CAS SPÉCIAL : lieu soft-deleted → on propose la restauration
      if (err.response?.status === 422 && err.response?.data?.soft_deleted) {
        showModal(
          "restore",
          "Lieu archivé trouvé",
          `Le lieu "${err.response.data.nomLieu}" existe déjà mais est archivé. Voulez-vous le restaurer ?`,
          err.response.data.lieu_id,
          err.response.data.nomLieu,
          async () => {
            try {
              await restoreLieu(err.response.data.lieu_id);
              showToast("success", "Lieu restauré avec succès !");
              chargerDonnees();
            } catch (restoreErr) {
              showToast("error", "Erreur lors de la restauration");
            }
          }
        );
        return;
      }

      // Conflit de lieu existant
      if (err.response?.status === 422) {
        showModal("error", "Conflit", `Le lieu "${payload.nomLieu}" existe déjà !`);
        return;
      }

      const msg = err.response?.data?.message || err.message;
      showModal("error", "Erreur", `Erreur : ${msg}`);
    }
  };

  const handleEdit = (item) => {
    setForm({ 
      nomLieu: item.nomLieu, 
      fraisLieu: item.fraisLieu 
    });
    setEditingId(item.numLieu);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id, nom) => {
    showModal(
      "delete",
      "Confirmer la suppression",
      `Êtes-vous sûr de vouloir supprimer le lieu "${nom}" ?`,
      id,
      nom,
      async () => {
        try {
          await deleteLieu(id);
          chargerDonnees();
          showToast("success", "Lieu supprimé temporairement !");
        } catch (error) {
          showToast("error", "Erreur lors de la suppression");
        }
      }
    );
  };

  // Filtrer les lieux
  const filteredLieux = lieuxList.filter(item => {
    const searchMatch =
      item.nomLieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fraisLieu.toString().includes(searchTerm);
    
    const fraisMatch = (frais) => {
      const fraisNum = parseFloat(frais) || 0;
      const minMatch = !filtreFraisMin || fraisNum >= parseFloat(filtreFraisMin);
      const maxMatch = !filtreFraisMax || fraisNum <= parseFloat(filtreFraisMax);
      return minMatch && maxMatch;
    };
    
    return searchMatch && fraisMatch(item.fraisLieu);
  });

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltreFraisMin("");
    setFiltreFraisMax("");
    showToast("info", "Filtres réinitialisés");
  };

  const hasActiveFilters = searchTerm || filtreFraisMin || filtreFraisMax;

  // Statistiques
  const totalLieux = lieuxList.length;
  const fraisTotal = lieuxList.reduce((sum, item) => sum + item.fraisLieu, 0);
  const fraisMoyen = totalLieux > 0 ? fraisTotal / totalLieux : 0;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des lieux de livraison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaMapMarkerAlt /> Gestion des Lieux de Livraison
          </h1>
          <div className="stats-container" style={{ marginTop: '10px' }}>
            <span className="stat-item">
              {filteredLieux.length} lieu{filteredLieux.length !== 1 ? 'x' : ''} trouvé{filteredLieux.length !== 1 ? 's' : ''}
            </span>
            <span className="stat-item" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
              {totalLieux} lieux total
            </span>
            <span className="stat-item" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
              Total frais: {fraisTotal.toLocaleString()} Ar
            </span>
            <span className="stat-item" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
              Moyenne: {Math.round(fraisMoyen).toLocaleString()} Ar
            </span>
          </div>
        </div>
        <button 
          className="ajout" 
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <FaPlus /> Ajouter un lieu
        </button>
      </div>

      {/* Onglets de navigation */}
      <div className="navigation-tabs" style={{ marginBottom: '20px' }}>
        <button className="tab-inactive" onClick={() => navigate("/admin/livraisons")}>
          <FaTruck style={{ marginRight: '8px' }} /> Livraisons
        </button>
        <button className="tab-inactive" onClick={() => navigate("/admin/livraisons/frais")}>
          <FaWeightHanging style={{ marginRight: '8px' }} /> Frais
        </button>
        <button className="tab-active">
          <FaMapMarkerAlt style={{ marginRight: '8px' }} /> Lieux de livraison
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom ou frais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`filter-toggle ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ border:"none", display:"flex", alignItems:"center", background:"white", color:"#28a458", paddingRight:"10px"}}
          >
            <FaFilter />
          </button>
          <FaSync
            onClick={reinitialiserFiltres}
            style={{ marginRight: '8px', border:"none", color:"#28a458", cursor: "pointer" }}
            title="Réinitialiser tous les filtres"
          />
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Frais min (Ar)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                value={filtreFraisMin}
                onChange={(e) => setFiltreFraisMin(e.target.value)}
                min="0"
                step="100"
              />
            </div>
            
            <div className="filter-group">
              <label>Frais max (Ar)</label>
              <input
                type="number"
                className="form-control"
                placeholder="100000"
                value={filtreFraisMax}
                onChange={(e) => setFiltreFraisMax(e.target.value)}
                min="0"
                step="100"
              />
            </div>
          </div>
          
          {/* Affichage des filtres actifs */}
          <div className="active-filters">
            {filtreFraisMin && (
              <span className="active-filter-tag">
                Frais min: {filtreFraisMin} Ar
                <button onClick={() => setFiltreFraisMin("")}>×</button>
              </span>
            )}
            {filtreFraisMax && (
              <span className="active-filter-tag">
                Frais max: {filtreFraisMax} Ar
                <button onClick={() => setFiltreFraisMax("")}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tableau des lieux */}
      <div className="table-container">
        {filteredLieux.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom du lieu</th>
                <th>Frais supplémentaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLieux.map(item => (
                <tr key={item.numLieu}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      #{item.numLieu}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaMapMarkerAlt style={{ color: "#dc3545" }} />
                      <span>{item.nomLieu}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      
                      <span style={{ fontWeight: "bold", color: "#8b5e3c" }}>
                        {item.fraisLieu.toLocaleString()} Ar
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions" style={{ gap: '8px' }}>
                      <button
                        className="edit"
                        onClick={() => handleEdit(item)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <FaEdit style={{color:"#28a458"}} /> Modifier
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleDeleteClick(item.numLieu, item.nomLieu)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <FaTrash /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-table">
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <h3>
                {hasActiveFilters
                  ? "Aucun lieu ne correspond à vos critères"
                  : "Aucun lieu de livraison enregistré"}
              </h3>
              <p>
                {hasActiveFilters
                  ? "Essayez avec d'autres termes de recherche ou modifiez les filtres."
                  : "Commencez par ajouter votre premier lieu"}
              </p>
              {!hasActiveFilters && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsFormOpen(true)}
                  style={{ marginTop: "20px", display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <FaPlus /> Ajouter un lieu
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de formulaire */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>{editingId ? "Modifier le lieu" : "Ajouter un lieu"}</h2>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom du lieu</label>
                  <input
                    type="text"
                    name="nomLieu"
                    value={form.nomLieu}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Ex: Antananarivo Centre"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frais distance (Ar)</label>
                  <input
                    type="number"
                    name="fraisLieu"
                    value={form.fraisLieu}
                    onChange={handleChange}
                    required
                    min="0"
                    step="100"
                    className="form-control"
                    placeholder="2000"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Mettre à jour" : "Ajouter le lieu"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaExclamationTriangle style={{ color: "#dc3545" }} />
                {modalData.title}
              </h2>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
                {modalData.message}
                <br />
                <span style={{ color: "#6c757d", fontSize: "14px", marginTop: "10px", display: "block" }}>
                  Cette action est réversible, le lieu sera archivé.
                </span>
              </p>
              
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    if (modalData.onConfirm) {
                      await modalData.onConfirm();
                    }
                    closeAllModals();
                  }}
                  style={{ padding: "10px 30px" }}
                >
                  Supprimer
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={closeAllModals}
                  style={{ padding: "10px 30px" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de restauration */}
      {showRestoreModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaExclamationTriangle style={{ color: "#ffc107" }} />
                {modalData.title}
              </h2>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
                {modalData.message}
              </p>
              
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    if (modalData.onConfirm) {
                      await modalData.onConfirm();
                    }
                    closeAllModals();
                  }}
                  style={{ padding: "10px 30px" }}
                >
                  Restaurer
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={closeAllModals}
                  style={{ padding: "10px 30px" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaMapMarkerAlt style={{ color: "#28a458" }} />
                {modalData.title}
              </h2>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ 
                fontSize: "16px", 
                lineHeight: "1.5", 
                marginBottom: "20px",
                textAlign: "center",
                padding: "20px 0"
              }}>
                {modalData.message}
              </p>
              
              <div className="modal-actions" style={{ justifyContent: "center" }}>
                <button
                  className="btn btn-primary"
                  onClick={closeAllModals}
                  style={{ padding: "10px 40px" }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LieuxLivraison;