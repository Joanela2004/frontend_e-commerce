import React, { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaPlus, 
  FaSync, 
  FaFilter,
  FaWeightHanging,
  FaTruck,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
  FaRuler,
  FaMoneyBill,
  FaCalculator,
  FaInfoCircle
} from "react-icons/fa";
import { FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
import {
  fetchFrais,
  createFrais,
  updateFrais,
  deleteFrais,
  restoreFrais,
  regenererToutesLesTranches,
} from "../../../services/livraisonService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../contexts/ToastContext";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";

const FraisLivraison = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [fraisList, setFraisList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtrePoidsMin, setFiltrePoidsMin] = useState("");
  const [filtrePoidsMax, setFiltrePoidsMax] = useState("");

  // États pour les modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    type: "",
    fraisId: null,
    fraisInfo: "",
    onConfirm: null
  });

  const [form, setForm] = useState({ 
    poidsMin: "", 
    poidsMax: "", 
    frais: "" 
  });
  const [editingId, setEditingId] = useState(null);

  // État pour la régénération
  const [regenerateForm, setRegenerateForm] = useState({
    poidsMin: "0",
    poidsMax: "10",
    frais: "5000",
    jusquaPoids: "1000"
  });

  useEffect(() => { 
    chargerDonnees(); 
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const data = await fetchFrais();
      setFraisList(data);
    } catch (err) {
      console.error(err);
      showToast("error", "Erreur lors du chargement des frais de livraison");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour afficher une modal
  const showModal = (type, title, message, fraisId = null, fraisInfo = "", onConfirm = null) => {
    setModalData({
      type,
      title,
      message,
      fraisId,
      fraisInfo,
      onConfirm
    });
    
    if (type === "delete") {
      setShowDeleteModal(true);
    } else if (type === "restore") {
      setShowRestoreModal(true);
    } else if (type === "success") {
      setShowSuccessModal(true);
    } else if (type === "regenerate") {
      setShowRegenerateModal(true);
    } else if (type === "info") {
      setShowInfoModal(true);
    } else if (type === "confirmRegenerate") {
      // Pour la confirmation de régénération
      setModalData({
        type: "confirmRegenerate",
        title,
        message,
        onConfirm
      });
      setShowRegenerateModal(false);
    }
  };

  // Fermer toutes les modals
  const closeAllModals = () => {
    setIsFormOpen(false);
    setShowDeleteModal(false);
    setShowRestoreModal(false);
    setShowSuccessModal(false);
    setShowRegenerateModal(false);
    setShowInfoModal(false);
    setModalData({
      title: "",
      message: "",
      type: "",
      fraisId: null,
      fraisInfo: "",
      onConfirm: null
    });
    resetForm();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegenerateChange = (e) => {
    setRegenerateForm({ ...regenerateForm, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ poidsMin: "", poidsMax: "", frais: "" });
    setEditingId(null);
  };
const checkIfTrancheExists = (nouveauMin, nouveauMax, excludeId = null) => {
  return fraisList.some(frais => {
    // Ignorer la tranche en cours de modification
    if (excludeId && (frais.numFrais === excludeId || frais.id === excludeId)) {
      return false;
    }

    const existantMin = frais.poidsMin;
    const existantMax = frais.poidsMax;

    // Cas de chevauchement (y compris si elles se touchent)
    return nouveauMin < existantMax && nouveauMax > existantMin;
    // Cette condition est la plus simple et la plus fiable
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();

  const poidsMin = parseFloat(form.poidsMin);
  const poidsMax = parseFloat(form.poidsMax);
  const frais = parseFloat(form.frais);

  // Validation basique
  if (isNaN(poidsMin) || isNaN(poidsMax) || isNaN(frais)) {
    showToast("error", "Veuillez remplir tous les champs correctement");
    return;
  }

  if (poidsMax <= poidsMin) {
    showToast("error", "Le poids maximum doit être supérieur au poids minimum");
    return;
  }
  if (checkIfTrancheExists(poidsMin, poidsMax, editingId)) {
    showToast("error", `La tranche ${poidsMin} - ${poidsMax} kg chevauche une tranche existante !`);
    return;
  }

  const payload = { poidsMin, poidsMax, frais };

  try {
    if (editingId) {
      await updateFrais(editingId, payload);
      showModal("success", "Succès", "Tranche mise à jour avec succès !");
    } else {
      await createFrais(payload);
      showModal("success", "Succès", "Tranche ajoutée avec succès !");
    }
    chargerDonnees();
    closeAllModals();
    } catch (err) {
      console.error("Erreur détaillée:", err);

      if (err.response?.status === 409 && err.response?.data?.soft_deleted) {
        showModal(
          "restore",
          "Tranche archivée trouvée",
          `La tranche ${err.response.data.poids_range} existe déjà mais est archivée. Voulez-vous la restaurer ?`,
          err.response.data.frais_id,
          err.response.data.poids_range,
          async () => {
            try {
              await restoreFrais(err.response.data.frais_id);
              showToast("success", "Tranche restaurée avec succès !");
              chargerDonnees();
            } catch (restoreErr) {
              showToast("error", "Erreur lors de la restauration");
            }
          }
        );
        return;
      }

      if (err.response?.status === 409) {
        const range = err.response.data.poids_range || `${payload.poidsMin} - ${payload.poidsMax} kg`;
        showToast("error", `La tranche ${range} existe déjà`);
        return;
      }

      const msg = err.response?.data?.message || err.message;
      showToast("error", `Erreur : ${msg}`);
    }
  };

  const handleEdit = (item) => {
    setForm({ 
      poidsMin: item.poidsMin, 
      poidsMax: item.poidsMax, 
      frais: item.frais 
    });
    setEditingId(item.numFrais || item.id);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id, info) => {
    showModal(
      "delete",
      "Confirmer la suppression",
      `Êtes-vous sûr de vouloir supprimer la tranche ${info} ?`,
      id,
      info,
      async () => {
        try {
          await deleteFrais(id);
          chargerDonnees();
          showToast("success", "Tranche supprimée temporairement !");
        } catch (error) {
          showToast("error", "Erreur lors de la suppression");
        }
      }
    );
  };

  const handleRegenererClick = () => {
    setShowRegenerateModal(true);
  };

  const handleRegenerateSubmit = async (e) => {
    e.preventDefault();
    try {
      const poidsMin = parseFloat(regenerateForm.poidsMin);
      const poidsMax = parseFloat(regenerateForm.poidsMax);
      const frais = parseFloat(regenerateForm.frais);
      const jusquaPoids = parseFloat(regenerateForm.jusquaPoids);
      
      if (poidsMax <= poidsMin) {
        showToast("error", "Le poids maximum doit être supérieur au poids minimum");
        return;
      }

      if (jusquaPoids <= poidsMax) {
        showToast("error", "Le poids maximum final doit être supérieur au poids maximum de la tranche");
        return;
      }

      // Calculer le nombre de tranches qui seront créées
      const intervalle = poidsMax - poidsMin;
      const nombreTranches = Math.floor(jusquaPoids / intervalle);
      
      showModal(
        "confirmRegenerate",
        "Confirmer la régénération",
        `Cette action va supprimer toutes les tranches existantes et créer ${nombreTranches} nouvelles tranches de ${intervalle}kg chacune, de 0kg à ${jusquaPoids}kg, avec un frais de ${frais.toLocaleString()} Ar par tranche.\n\nVoulez-vous continuer ?`,
        null,
        null,
        async () => {
          try {
            const result = await regenererToutesLesTranches({
              poidsMin,
              poidsMax,
              frais,
            });
            showModal("success", "Succès", `${result.total_tranches} tranches créées avec succès !`);
            chargerDonnees();
          } catch (err) {
            showToast("error", `Erreur : ${err.response?.data?.message || err.message}`);
          }
        }
      );
    } catch (err) {
      showToast("error", "Veuillez vérifier les valeurs saisies");
    }
  };

 

  // Calcul des statistiques pour la régénération
  const calculateRegenerateStats = () => {
    try {
      const poidsMin = parseFloat(regenerateForm.poidsMin || 0);
      const poidsMax = parseFloat(regenerateForm.poidsMax || 10);
      const frais = parseFloat(regenerateForm.frais || 5000);
      const jusquaPoids = parseFloat(regenerateForm.jusquaPoids || 1000);
      
      if (poidsMax <= poidsMin || jusquaPoids <= poidsMax) return null;
      
      const intervalle = poidsMax - poidsMin;
      const nombreTranches = Math.floor(jusquaPoids / intervalle);
      const totalFrais = nombreTranches * frais;
      
      return {
        intervalle,
        nombreTranches,
        totalFrais,
        jusquaPoids
      };
    } catch {
      return null;
    }
  };

  // Filtrer les frais
  const filteredFrais = fraisList.filter(item => {
    const searchMatch =
      item.poidsMin.toString().includes(searchTerm) ||
      item.poidsMax.toString().includes(searchTerm) ||
      item.frais.toString().includes(searchTerm);
    
    const poidsMinMatch = !filtrePoidsMin || item.poidsMin >= parseFloat(filtrePoidsMin);
    const poidsMaxMatch = !filtrePoidsMax || item.poidsMax <= parseFloat(filtrePoidsMax);
    
    return searchMatch && poidsMinMatch && poidsMaxMatch;
  });

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltrePoidsMin("");
    setFiltrePoidsMax("");
    showToast("info", "Filtres réinitialisés");
  };

  const hasActiveFilters = searchTerm || filtrePoidsMin || filtrePoidsMax;

  // Statistiques
  const totalTranches = fraisList.length;
  const poidsMaxTotal = fraisList.reduce((max, item) => Math.max(max, item.poidsMax), 0);
  const fraisMoyen = fraisList.length > 0 
    ? fraisList.reduce((sum, item) => sum + item.frais, 0) / fraisList.length 
    : 0;

  const regenerateStats = calculateRegenerateStats();

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des frais de livraison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaWeightHanging /> Gestion des Frais de Livraison
          </h1>
          <div className="stats-container" style={{ marginTop: '10px' }}>
            <span className="stat-item">
              {filteredFrais.length} tranche{filteredFrais.length !== 1 ? 's' : ''} trouvée{filteredFrais.length !== 1 ? 's' : ''}
            </span>
            <span className="stat-item" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
              {totalTranches} tranches totales
            </span>
            <span className="stat-item" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
              Jusqu'à {poidsMaxTotal} kg
            </span>
          
          </div>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={handleRegenererClick}
         
          >
            <FiRefreshCw style={{marginRight:"10px",fontSize:"bold"}}/> Régénérer
          </button>
          <button 
            className="ajout" 
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <FaPlus /> Ajouter une tranche
          </button>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="navigation-tabs" style={{ marginBottom: '20px' }}>
        <button className="tab-inactive" onClick={() => navigate("/admin/livraisons")}>
          <FaTruck style={{ marginRight: '8px' }} /> Livraisons
        </button>
        <button className="tab-active">
          <FaWeightHanging style={{ marginRight: '8px' }} /> Frais de livraison
        </button>
        <button className="tab-inactive" onClick={() => navigate("/admin/livraisons/lieux")}>
          <FaMapMarkerAlt style={{ marginRight: '8px' }} /> Lieux
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par poids ou frais..."
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
              <label>Poids min (kg)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                value={filtrePoidsMin}
                onChange={(e) => setFiltrePoidsMin(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="filter-group">
              <label>Poids max (kg)</label>
              <input
                type="number"
                className="form-control"
                placeholder="1000"
                value={filtrePoidsMax}
                onChange={(e) => setFiltrePoidsMax(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
          </div>
          
          {/* Affichage des filtres actifs */}
          <div className="active-filters">
            {filtrePoidsMin && (
              <span className="active-filter-tag">
                Poids min: {filtrePoidsMin} kg
                <button onClick={() => setFiltrePoidsMin("")}>×</button>
              </span>
            )}
            {filtrePoidsMax && (
              <span className="active-filter-tag">
                Poids max: {filtrePoidsMax} kg
                <button onClick={() => setFiltrePoidsMax("")}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tableau des frais */}
      <div className="table-container">
        {filteredFrais.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Poids min (kg)</th>
                <th>Poids max (kg)</th>
                <th>Frais (Ar)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFrais.map(item => (
                <tr key={item.numFrais || item.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      #{item.numFrais || item.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{item.poidsMin} kg</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{item.poidsMax} kg</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "bold", color: "#8b5e3c" }}>
                        {item.frais.toLocaleString()} Ar
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
                        onClick={() => handleDeleteClick(item.numFrais || item.id, `${item.poidsMin}-${item.poidsMax}kg`)}
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
                  ? "Aucune tranche ne correspond à vos critères"
                  : "Aucune tranche de frais enregistrée"}
              </h3>
              <p>
                {hasActiveFilters
                  ? "Essayez avec d'autres termes de recherche ou modifiez les filtres."
                  : "Commencez par ajouter votre première tranche"}
              </p>
             
            </div>
          </div>
        )}
      </div>

      {/* Modal d'ajout/édition de tranche */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaWeightHanging style={{ color: '#28a458', fontSize: '1.2rem' }} />
                <h2>{editingId ? "Modifier la tranche" : "Ajouter une nouvelle tranche"}</h2>
              </div>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaRuler /> Poids minimum (kg)
                    </label>
                    <input
                      type="number"
                      name="poidsMin"
                      value={form.poidsMin}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="Ex: 0"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaRuler /> Poids maximum (kg)
                    </label>
                    <input
                      type="number"
                      name="poidsMax"
                      value={form.poidsMax}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="Ex: 10"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaMoneyBill /> Frais de livraison (Ar)
                    </label>
                    <input
                      type="number"
                      name="frais"
                      value={form.frais}
                      onChange={handleChange}
                      required
                      step="100"
                      min="0"
                      className="form-control"
                      placeholder="5000"
                    />
                  </div>
                </div>

                {/* Vérification de chevauchement */}
                {form.poidsMin && form.poidsMax && checkIfTrancheExists(parseFloat(form.poidsMin), parseFloat(form.poidsMax), editingId) && (
                  <div className="alert alert-warning" style={{ 
                    backgroundColor: '#fff3cd',
                    borderColor: '#ffeaa7',
                    color: '#856404',
                    padding: '12px',
                    borderRadius: '6px',
                    marginTop: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <FaExclamationTriangle />
                    <div>
                      <strong>Attention :</strong> Cette tranche existe déjà.
                    </div>
                  </div>
                )}

                {/* Aperçu de la tranche */}
                {form.poidsMin && form.poidsMax && form.frais && (
                  <div className="preview-card" style={{
                    backgroundColor: '#e8f5e9',
                    padding: '15px',
                    borderRadius: '8px',
                    marginTop: '15px',
                    border: '1px solid #c8e6c9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <FaCalculator style={{ color: '#28a458' }} />
                      <strong>Aperçu de la tranche :</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Plage de poids</div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                          {form.poidsMin} kg - {form.poidsMax} kg
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Frais</div>
                        <div style={{ fontWeight: 'bold', color: '#28a458' }}>
                          {parseFloat(form.frais).toLocaleString()} Ar
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAllModals} style={{ padding: '12px 30px' }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px' }}
                  disabled={form.poidsMin && form.poidsMax && checkIfTrancheExists(parseFloat(form.poidsMin), parseFloat(form.poidsMax), editingId)}>
                  {editingId ? "Mettre à jour la tranche" : "Ajouter la tranche"}
                </button>
                
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de régénération */}
      {showRegenerateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiRefreshCw style={{ color: '#28a458', fontSize: '1.2rem' }} />
                <h2>Régénérer toutes les tranches</h2>
              </div>
              <button className="modal-close" onClick={() => setShowRegenerateModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleRegenerateSubmit} className="modal-form">
              <div className="modal-body" style={{marginTop:"20px"}}>
              

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Poids minimum (kg)</label>
                    <input
                      type="number"
                      name="poidsMin"
                      value={regenerateForm.poidsMin}
                      onChange={handleRegenerateChange}
                      required
                      className="form-control"
                      placeholder="0"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Poids maximum (kg)</label>
                    <input
                      type="number"
                      name="poidsMax"
                      value={regenerateForm.poidsMax}
                      onChange={handleRegenerateChange}
                      required
                      className="form-control"
                      placeholder="10"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Frais (Ar)</label>
                    <input
                      type="number"
                      name="frais"
                      value={regenerateForm.frais}
                      onChange={handleRegenerateChange}
                      required
                      step="100"
                      min="0"
                      className="form-control"
                     
                    />
                  </div>
                 
                </div>

              
              
              </div>

              <div className="modal-footer" style={{ margin:"10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegenerateModal(false)} style={{ padding: '12px 25px' }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" >
                  <FiRefreshCw style={{ marginRight: '8px' }} /> Générer les nouvelles tranches
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de régénération */}
      {modalData.type === "confirmRegenerate" && (
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
              <p style={{ 
                fontSize: "16px", 
                lineHeight: "1.5", 
                marginBottom: "20px",
                whiteSpace: "pre-line",
                color: "#721c24",
                backgroundColor: "#f8d7da",
                padding: "15px",
                borderRadius: "4px"
              }}>
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
                  className="btn btn-danger"
                  onClick={async () => {
                    if (modalData.onConfirm) {
                      await modalData.onConfirm();
                    }
                    closeAllModals();
                  }}
                  style={{ padding: "10px 30px" }}
                >
                  Confirmer la régénération
                </button>
               
              </div>
            </div>
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
                  Cette action est réversible, la tranche sera archivée.
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

      {/* Modal d'information */}
      {showInfoModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaInfoCircle style={{ color: "#17a2b8" }} />
                {modalData.title}
              </h2>
              <button className="modal-close" onClick={() => setShowInfoModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ 
                fontSize: "15px", 
                lineHeight: "1.6", 
                marginBottom: "25px",
                whiteSpace: "pre-line",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "#e3f2fd",
                border: "1px solid #bbdefb"
              }}>
                {modalData.message}
              </p>
              
              <div className="modal-actions" style={{ justifyContent: "center" }}>
                <button
                  className="btn btn-info"
                  onClick={() => setShowInfoModal(false)}
                  style={{ 
                    padding: "12px 35px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none"
                  }}
                >
                  Compris
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
                <FaWeightHanging style={{ color: "#28a458" }} />
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

export default FraisLivraison;