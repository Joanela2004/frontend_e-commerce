import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaSync, FaEdit, FaTrash, FaBox, FaList, FaUtensils, FaFilter, FaPercentage, FaExclamationTriangle } from "react-icons/fa";
import {
  fetchDecoupes,
  createDecoupe,
  updateDecoupe,
  deleteDecoupe,
  restoreDecoupe,
} from "../../../services/DecoupeService";
import { useToast } from "../../../contexts/ToastContext";
import { useNavigate } from "react-router-dom";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/toast.css";

const Decoupes = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [decoupes, setDecoupes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtreCoefficientMin, setFiltreCoefficientMin] = useState("");
  const [filtreCoefficientMax, setFiltreCoefficientMax] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
   const [modalData, setModalData] = useState({
    title: "",
    message: "",
    type: "",
    decoupeId: null,
    decoupeNom: "",
    onConfirm: null
  });

  const [form, setForm] = useState({
    nomDecoupe: "",
    coefficient: "",
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const data = await fetchDecoupes();
      setDecoupes(data);
    } catch (error) {
      console.error("Erreur chargement des découpes:", error);
      showModal("error", "Erreur", "Erreur lors du chargement des découpes");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour afficher une modal
  const showModal = (type, title, message, decoupeId = null, decoupeNom = "", onConfirm = null) => {
    setModalData({
      type,
      title,
      message,
      decoupeId,
      decoupeNom,
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
    setShowDeleteModal(false);
    setShowRestoreModal(false);
    setShowSuccessModal(false);
    setModalData({
      title: "",
      message: "",
      type: "",
      decoupeId: null,
      decoupeNom: "",
      onConfirm: null
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ nomDecoupe: "", coefficient: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateDecoupe(editingId, form);
        showToast("success", "Succès", "Découpe mise à jour avec succès !");
      } else {
        await createDecoupe(form);
        showToast("success", "Succès", "Découpe ajoutée avec succès !");
      }

      resetForm();
      chargerDonnees();
    } catch (err) {
      console.error("Erreur détaillée:", err);

      // CAS SPÉCIAL : découpe soft-deleted → on propose la restauration
      if (err.response?.status === 409 && err.response?.data?.soft_deleted) {
        showModal(
          "restore",
          "Découpe archivée trouvée",
          `La découpe "${err.response.data.decoupe_nom}" existe déjà mais est archivée. Voulez-vous la restaurer ?`,
          err.response.data.decoupe_id,
          err.response.data.decoupe_nom,
          async () => {
            try {
              await restoreDecoupe(err.response.data.decoupe_id);
              showToast("success", "Découpe restaurée avec succès !");
              resetForm();
              chargerDonnees();
            } catch (restoreErr) {
              showToast("error", "Erreur lors de la restauration");
            }
          }
        );
        return;
      }

      const msg = err.response?.data?.message || err.message;
      showModal("error", "Erreur", `Erreur : ${msg}`);
    }
  };

  const handleEdit = (decoupe) => {
    setForm({
      nomDecoupe: decoupe.nomDecoupe,
      coefficient: decoupe.coefficient,
    });
    setEditingId(decoupe.numDecoupe);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id, nom) => {
    showModal(
      "delete",
      "Confirmer la suppression",
      `Êtes-vous sûr de vouloir supprimer la découpe "${nom}" ?`,
      id,
      nom,
      async () => {
        try {
          await deleteDecoupe(id);
          chargerDonnees();
          showToast("success", "Découpe supprimée temporairement !");
        } catch (error) {
          showToast("error", "Erreur lors de la suppression");
        }
      }
    );
  };

  // Filtrer les découpes
  const filteredDecoupes = decoupes.filter(decoupe => {
    const searchMatch = 
      decoupe.nomDecoupe.toLowerCase().includes(searchTerm.toLowerCase());
    
    const coefficientMinMatch = !filtreCoefficientMin || decoupe.coefficient >= parseFloat(filtreCoefficientMin);
    const coefficientMaxMatch = !filtreCoefficientMax || decoupe.coefficient <= parseFloat(filtreCoefficientMax);
    
    return searchMatch && coefficientMinMatch && coefficientMaxMatch;
  });

  // Réinitialiser tous les filtres
  const reinitialiserFiltres = () => {
    setFiltreCoefficientMin("");
    setFiltreCoefficientMax("");
    setSearchTerm("");
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchTerm || filtreCoefficientMin || filtreCoefficientMax;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des découpes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestion des Découpes</h1>
        </div>
        <button className="ajout" onClick={() => setIsFormOpen(true)}>
          <FaPlus style={{marginRight:"10px"}}/> Ajouter une découpe
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="navigation-tabs">
        <button className="tab-inactive" onClick={() => navigate("/admin/produits")}>
          <FaBox style={{marginRight:"8px"}} /> Produits
        </button>
        <button className="tab-inactive" onClick={() => navigate("/admin/categories")}>
          <FaList style={{marginRight:"8px"}} /> Catégories
        </button>
        <button className="tab-active">
          <FaUtensils style={{marginRight:"8px"}} /> Découpes
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }} />
          <input
            type="text"
            placeholder="Rechercher une découpe..."
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
              <label>Coefficient minimum</label>
              <input
                type="number"
                className="form-control"
                placeholder="0.01"
                value={filtreCoefficientMin}
                onChange={(e) => setFiltreCoefficientMin(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </div>
            
            <div className="filter-group">
              <label>Coefficient maximum</label>
              <input
                type="number"
                className="form-control"
                placeholder="10.0"
                value={filtreCoefficientMax}
                onChange={(e) => setFiltreCoefficientMax(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </div>
          </div>
          
          {/* Affichage des filtres actifs */}
          <div className="active-filters">
            {filtreCoefficientMin && (
              <span className="active-filter-tag">
                Coeff. min: {filtreCoefficientMin}
                <button onClick={() => setFiltreCoefficientMin("")}>×</button>
              </span>
            )}
            {filtreCoefficientMax && (
              <span className="active-filter-tag">
                Coeff. max: {filtreCoefficientMax}
                <button onClick={() => setFiltreCoefficientMax("")}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Formulaire */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>{editingId ? "Modifier la découpe" : "Ajouter une découpe"}</h2>
              <button className="modal-close" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom de la découpe</label>
                  <input
                    type="text"
                    name="nomDecoupe"
                    value={form.nomDecoupe}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Ex: Entier, Tranches, Dés..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaPercentage /> Coefficient</label>
                  <input
                    type="number"
                    name="coefficient"
                    value={form.coefficient}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0.01"
                    className="form-control"
                    placeholder="1.0"
                  />
                
                </div>
              </div>

              <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                  {editingId ? "Mettre à jour" : "Ajouter la découpe"}
                </button>
                 <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Annuler
                </button>
               
               
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tableau des découpes */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom de la découpe</th>
              <th>Coefficient</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDecoupes.length > 0 ? (
              filteredDecoupes.map((decoupe) => (
                <tr key={decoupe.numDecoupe}>
                  <td>{decoupe.numDecoupe}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      
                      {decoupe.nomDecoupe}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      fontWeight: "bold", 
                      color: " #8b5e3c",
                      
                    }}>
                      {decoupe.coefficient}x
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="edit"
                        onClick={() => handleEdit(decoupe)}
                      >
                        <FaEdit style={{color:"#28a458", marginRight:"8px"}} /> Modifier
                      </button>
                      
                      <button 
                        className="delete" 
                        onClick={() => handleDeleteClick(decoupe.numDecoupe, decoupe.nomDecoupe)}
                      >
                        <FaTrash style={{marginRight:"8px"}} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-table">
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <h3>
                      {hasActiveFilters
                        ? "Aucune découpe ne correspond à vos critères" 
                        : "Aucune découpe trouvée"}
                    </h3>
                    <p>
                      {hasActiveFilters
                        ? "Essayez avec d'autres termes de recherche ou modifiez les filtres."
                        : "Commencez par ajouter votre première découpe"}
                    </p>
                  
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                  La découpe sera supprimée temporairement.
                </span>
              </p>
              
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                 <button
                  className="edit"
                  onClick={closeAllModals}
                  style={{ padding: "10px 30px" }}
                >
                  Annuler
                </button>
                <button
                  className="delete"
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
                  className="btn btn-secondary"
                  onClick={closeAllModals}
                  style={{ padding: "10px 30px" }}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    if (modalData.onConfirm) {
                      await modalData.onConfirm();
                    }
                    resetForm();
                    closeAllModals();
                  }}
                 
                >
                  Restaurer
                </button>
               
              </div>
            </div>
          </div>
        </div>
      )}

     
    </div>
  );
};

export default Decoupes;