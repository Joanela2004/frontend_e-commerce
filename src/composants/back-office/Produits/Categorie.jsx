import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaSync, FaEdit, FaTrash, FaBox, FaList, FaUtensils, FaExclamationTriangle } from "react-icons/fa";
import { getCategories, createCategorie, updateCategorie, deleteCategorie, restoreCategorie } from "../../../services/categorieService";
import { useToast } from "../../../contexts/ToastContext";
import { useNavigate } from "react-router-dom";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/toast.css";

const Categorie = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // États pour les modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    type: "",
    categorieId: null,
    categorieNom: "",
    onConfirm: null
  });

  const [form, setForm] = useState({ nomCategorie: "" });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Erreur chargement des catégories:", error);
      showModal("error", "Erreur", "Erreur lors du chargement des catégories");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour afficher une modal
  const showModal = (type, title, message, categorieId = null, categorieNom = "", onConfirm = null) => {
    setModalData({
      type,
      title,
      message,
      categorieId,
      categorieNom,
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
      categorieId: null,
      categorieNom: "",
      onConfirm: null
    });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ nomCategorie: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategorie(editingId, form.nomCategorie);
        showToast("success", "Succès", "Catégorie mise à jour avec succès !");
      } else {
        await createCategorie(form.nomCategorie);
        showToast("success", "Succès", "Catégorie ajoutée avec succès !");
      }
      resetForm();
      chargerDonnees();
    } catch (err) {
          if (err.response?.status === 409 && err.response?.data?.soft_deleted) {
        showModal(
          "restore",
          "Catégorie archivée trouvée",
          `La catégorie "${err.response.data.categorie_nom}" existe déjà mais est archivée. Voulez-vous la restaurer ?`,
          err.response.data.categorie_id,
          err.response.data.categorie_nom,
          async () => {
            try {
              await restoreCategorie(err.response.data.categorie_id);
              showToast("success", "Catégorie restaurée avec succès !");
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

  const handleEdit = (categorie) => {
    setForm({ nomCategorie: categorie.nomCategorie });
    setEditingId(categorie.numCategorie);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id, nom) => {
    showModal(
      "delete",
      "Confirmer la suppression",
      `Êtes-vous sûr de vouloir supprimer la catégorie "${nom}" ?`,
      id,
      nom,
      async () => {
        try {
          await deleteCategorie(id);
          chargerDonnees();
          showToast("success", "Catégorie supprimée temporairement !");
        } catch (error) {
          showToast("error", "Erreur lors de la suppression");
        }
      }
    );
  };

  const handleRestore = async (id) => {
    try {
      await restoreCategorie(id);
      chargerDonnees();
      showToast("success", "Catégorie restaurée avec succès !");
    } catch (error) {
      showToast("error", "Erreur lors de la restauration");
    }
  };

  // Filtrer les catégories
  const filteredCategories = categories.filter(categorie => 
    categorie.nomCategorie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Réinitialiser tous les filtres
  const reinitialiserFiltres = () => {
    setSearchTerm("");
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchTerm;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestion des Catégories</h1>
        </div>
        <button className="ajout" onClick={() => setIsFormOpen(true)}>
          <FaPlus style={{marginRight:"10px"}}/> Ajouter une catégorie
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="navigation-tabs">
        <button className="tab-inactive" onClick={() => navigate("/admin/produits")}>
          <FaBox style={{marginRight:"8px"}} /> Produits
        </button>
        <button className="tab-active">
          <FaList style={{marginRight:"8px"}} /> Catégories
        </button>
        <button className="tab-inactive" onClick={() => navigate("/admin/decoupes")}>
          <FaUtensils style={{marginRight:"8px"}} /> Découpes
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }} />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSync  
            onClick={reinitialiserFiltres} 
            style={{ marginRight: '8px', border:"none", color:"#28a458", cursor: "pointer" }} 
            title="Réinitialiser la recherche"
          />
        </div>
      </div>

      {/* Formulaire */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>{editingId ? "Modifier la catégorie" : "Ajouter une catégorie"}</h2>
              <button className="modal-close" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom de la catégorie</label>
                  <input
                    type="text"
                    name="nomCategorie"
                    value={form.nomCategorie}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Ex: Légumes, Viandes, Fruits..."
                  />
                </div>
              </div>

              <div className="modal-actions">
               <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Mettre à jour" : "Ajouter la catégorie"}
                </button>
                
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tableau des catégories */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom de la catégorie</th>
             
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((categorie) => (
                <tr key={categorie.numCategorie} className={categorie.deleted_at ? "deleted-row" : ""}>
                  <td>{categorie.numCategorie}</td>
                  <td>{categorie.nomCategorie}</td>
               
                  <td>
                    <div className="table-actions">
                      {!categorie.deleted_at ? (
                        <>
                          <button 
                            className="edit"
                            onClick={() => handleEdit(categorie)}
                          >
                            <FaEdit style={{color:"#28a458", marginRight:"8px"}} /> Modifier
                          </button>
                          
                          <button 
                            className="delete" 
                            onClick={() => handleDeleteClick(categorie.numCategorie, categorie.nomCategorie)}
                          >
                            <FaTrash style={{marginRight:"8px"}} /> Supprimer
                          </button>
                        </>
                      ) : (
                        <button 
                          className="restore"
                          onClick={() => handleRestore(categorie.numCategorie)}
                          style={{ 
                            backgroundColor: "#28a458", 
                            color: "white", 
                            border: "none", 
                            padding: "8px 16px", 
                            borderRadius: "6px", 
                            cursor: "pointer",
                            fontWeight: "500"
                          }}
                        >
                          <FaSync style={{marginRight:"8px"}} /> Restaurer
                        </button>
                      )}
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
                        ? "Aucune catégorie ne correspond à vos critères" 
                        : "Aucune catégorie trouvée"}
                    </h3>
                    <p>
                      {hasActiveFilters
                        ? "Essayez avec d'autres termes de recherche."
                        : "Commencez par ajouter votre première catégorie"}
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
                 La catégorie sera supprimée temporairement
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
                  className=" delete"
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

export default Categorie;