import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaSync,
  FaFilter,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaImage,
  FaToggleOn,
  FaToggleOff,
  FaCreditCard,
  FaMoneyBillWave
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/toast.css";
import {
  fetchModes,
  createMode,
  updateMode,

} from "../../../services/paiementService";
import { useToast } from "../../../contexts/ToastContext";

const ModesPaiement = () => {
  const [modes, setModes] = useState([]);
  const [form, setForm] = useState({ 
    nomModePaiement: "", 
    actif: true, 
    image: null,
    typePaiement: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    modeId: null,
    modeName: "",
    onConfirm: null
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  // États pour les filtres
  const [filtreStatut, setFiltreStatut] = useState("tous");

  useEffect(() => {
    loadModes();
  }, []);

  const loadModes = async () => {
    setLoading(true);
    try {
      const data = await fetchModes();
      setModes(data);
    } catch (error) {
      console.error("Erreur lors du chargement des modes de paiement:", error);
      showToast("error", "Erreur lors du chargement des modes de paiement");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast("error", "L'image ne doit pas dépasser 2MB");
        return;
      }
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        showToast("error", "Veuillez sélectionner une image valide");
        return;
      }
      
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm({ 
      nomModePaiement: "", 
      actif: true, 
      image: null 
    });
    setPreview(null);
    setEditingId(null);
  };

  const openFormModal = (mode = null) => {
    if (mode) {
      setForm({
        nomModePaiement: mode.nomModePaiement,
        typePaiement: mode.typePaiement || "",
        actif: mode.actif === 1 || mode.actif === true,
        image: null,
      });
      setPreview(mode.image ? `${IMAGE_BASE_URL}${mode.image}` : null);
      setEditingId(mode.numModePaiement);
    } else {
      resetForm();
    }
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nomModePaiement.trim()) {
      showToast("error", "Veuillez saisir un nom pour le mode de paiement");
      return;
    }

    const formData = new FormData();
    formData.append("nomModePaiement", form.nomModePaiement);
    if (form.typePaiement) {
  formData.append("typePaiement", form.typePaiement);
}
    formData.append("actif", form.actif ? "1" : "0");
    if (form.image) formData.append("image", form.image);

    try {
      if (editingId) {
        await updateMode(editingId, formData);
        showToast("success", "Mode de paiement mis à jour avec succès !");
      } else {
        await createMode(formData);
        showToast("success", "Mode de paiement ajouté avec succès !");
      }
      
      closeFormModal();
      loadModes();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      showToast("error", err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };


  const closeModal = () => {
    setShowConfirmModal(false);
    setModalData({
      title: "",
      message: "",
      modeId: null,
      modeName: "",
      onConfirm: null
    });
  };

  // Filtrer les modes de paiement
  const filteredModes = modes.filter(mode => {
    const searchMatch = 
      mode.nomModePaiement.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statutMatch = filtreStatut === "tous" || 
      (filtreStatut === "actif" && mode.actif) ||
      (filtreStatut === "inactif" && !mode.actif);
    
    return searchMatch && statutMatch;
  });

  // Réinitialiser tous les filtres
  const reinitialiserFiltres = () => {
    setFiltreStatut("tous");
    setSearchTerm("");
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchTerm || filtreStatut !== "tous";

  // Statistiques
  const modesActifs = modes.filter(m => m.actif).length;
  const modesInactifs = modes.filter(m => !m.actif).length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des modes de paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestion des Modes de Paiement</h1>
          <div className="stats-container" style={{ marginTop: '10px' }}>
            <span className="stat-item">
              {filteredModes.length} mode{filteredModes.length !== 1 ? 's' : ''} trouvé{filteredModes.length !== 1 ? 's' : ''}
            </span>
            <span className="stat-item" style={{ background: 'rgba(40, 164, 88, 0.1)', color: '#28a458' }}>
              <FaToggleOn style={{marginRight: '5px'}} /> {modesActifs} actif{modesActifs !== 1 ? 's' : ''}
            </span>
            <span className="stat-item" style={{ background: 'rgba(108, 117, 125, 0.1)', color: '#6c757d' }}>
              <FaToggleOff style={{marginRight: '5px'}} /> {modesInactifs} inactif{modesInactifs !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <button 
          className="ajout" 
          onClick={() => openFormModal()}
        >
          <FaPlus style={{marginRight:"10px"}}/> 
          Ajouter un mode
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="navigation-tabs">
        <button 
          className={location.pathname.includes("/admin/paiements") && !location.pathname.includes("/modes") ? "tab-active" : "tab-inactive"}
          onClick={() => navigate("/admin/paiements")}
        >
          <FaMoneyBillWave style={{marginRight:"8px"}} /> Paiements
        </button>
        <button className="tab-active">
          <FaCreditCard style={{marginRight:"8px"}} /> Modes de paiement
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch  style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }} />
          <input
            type="text"
            placeholder="Rechercher un mode de paiement..."
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
              <label>Statut</label>
              <select
                className="form-control"
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Tous les statuts</option>
                <option value="actif">Actifs seulement</option>
                <option value="inactif">Inactifs seulement</option>
              </select>
            </div>
          </div>
          
          {/* Affichage des filtres actifs */}
          <div className="active-filters">
            {filtreStatut !== "tous" && (
              <span className="active-filter-tag">
                Statut: {filtreStatut === "actif" ? "Actif" : "Inactif"}
                <button onClick={() => setFiltreStatut("tous")}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tableau des modes de paiement */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Nom du mode</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredModes.length > 0 ? (
              filteredModes.map((mode) => (
                <tr key={mode.numModePaiement}>
                  <td>
                    {mode.image ? (
                      <div className="image-container" style={{ width: '80px', height: '50px' }}>
                        <img
                          src={`${IMAGE_BASE_URL}${mode.image}`}
                          alt={mode.nomModePaiement}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        width: '80px', 
                        height: '50px', 
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        color: '#6c757d'
                      }}>
                        <FaImage />
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>{mode.nomModePaiement}</div>
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                       
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {mode.actif ? (
                      <span className="status validée">
                        <FaCheckCircle style={{marginRight: '5px'}} /> Actif
                      </span>
                    ) : (
                      <span className="status annulée">
                        <FaTimesCircle style={{marginRight: '5px'}} /> Inactif
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="edit"
                        onClick={() => openFormModal(mode)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <FaEdit /> Modifier
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
                        ? "Aucun mode de paiement ne correspond à vos critères" 
                        : "Aucun mode de paiement trouvé"}
                    </h3>
                    <p>
                      {hasActiveFilters
                        ? "Essayez avec d'autres termes de recherche ou modifiez les filtres."
                        : "Commencez par ajouter votre premier mode de paiement"}
                    </p>
                    {!hasActiveFilters && (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => openFormModal()}
                        style={{ marginTop: "20px" }}
                      >
                        <FaPlus /> Ajouter un mode de paiement
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal d'ajout/édition */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaCreditCard style={{ color: "#28a458" }} />
                {editingId ? "Modifier le mode de paiement" : "Ajouter un mode de paiement"}
              </h2>
              <button className="modal-close" onClick={closeFormModal}>×</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="image" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FaImage /> Logo du mode de paiement
                    </label>
                    <input 
                      type="file" 
                      id="image"
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="form-control"
                      style={{ padding: '10px' }}
                    />
                    {preview && (
                      <div style={{ marginTop: '15px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Aperçu:</p>
                        <img 
                          src={preview} 
                          alt="Preview" 
                          style={{ 
                            width: '150px', 
                            height: '90px', 
                            objectFit: 'contain',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            padding: '8px',
                            backgroundColor: '#f8f9fa'
                          }} 
                        />
                      </div>
                    )}
                    <small style={{ color: '#6c757d', display: 'block', marginTop: '8px' }}>
                      Formats acceptés: JPG, PNG, SVG. Taille max: 2MB
                    </small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nom du mode de paiement *</label>
                    <input
                      type="text"
                      value={form.nomModePaiement}
                      onChange={(e) => setForm({ ...form, nomModePaiement: e.target.value })}
                      required
                      className="form-control"
                      placeholder="Ex: Carte Bancaire, PayPal, Virement..."
                      style={{ padding: '12px' }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '15px' }}>
                      <input
                        type="checkbox"
                        checked={form.actif}
                        onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <span style={{ fontWeight: '500' }}>Activer ce mode de paiement</span>
                    </label>
                   
                  </div>
                </div>
                <div className="form-row">
  <div className="form-group">
    <label>Type de paiement </label>
    <select
      value={form.typePaiement}
      onChange={(e) => setForm({ ...form, typePaiement: e.target.value })}
      className="form-control"
      style={{ padding: '12px' }}
    >
      <option value=""> Sélectionner un type —</option>
      <option value="cash">Espèces (cash)</option>
      <option value="mvola">MVola</option>
      <option value="stripe">Carte bancaire / Stripe</option>
      <option value="orange_money">Orange Money</option>
      <option value="airtel_money">Airtel Money</option>
    </select>
   
  </div>
</div>

                <div className="modal-actions" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeFormModal}
                    style={{ padding: "10px 20px" }}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ padding: "10px 30px" }}
                  >
                    {editingId ? "Mettre à jour" : "Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaTrash style={{ color: "#dc3545" }} />
                {modalData.title}
              </h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
                {modalData.message}
              </p>
              
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    if (modalData.onConfirm) {
                      await modalData.onConfirm();
                    }
                    closeModal();
                  }}
                  style={{ padding: "10px 30px" }}
                >
                  <FaTrash style={{marginRight:"8px"}} /> Supprimer
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={closeModal}
                  style={{ padding: "10px 30px" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModesPaiement;