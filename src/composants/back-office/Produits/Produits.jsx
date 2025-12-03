import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaSync, FaEdit, FaTrash, FaBox, FaTag, FaWeightHanging, FaImage, FaFilter, FaPercentage, FaList, FaUtensils, FaExclamationTriangle, FaEye, FaMoneyBillWave } from "react-icons/fa";
import {
  createProduit,
  updateProduit,
  fetchProduits,
  deleteProduit,
} from "../../../services/produitService";
import { getCategories } from "../../../services/categorieService";
import { fetchPromotions } from "../../../services/promotionService";
import { restoreProduit } from "../../../services/produitService";
import { useToast } from "../../../contexts/ToastContext";
import { useNavigate } from "react-router-dom";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/toast.css";
import "../../../styles/back-office/produit.css";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const calculatePromotionalPrice = (originalPrice, discountPercentage) => {
  return Math.round(originalPrice * (1 - discountPercentage / 100));
};

const calculateSavings = (originalPrice, discountPercentage) => {
  return originalPrice - calculatePromotionalPrice(originalPrice, discountPercentage);
};

const Produits = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // États pour les filtres
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtreCategorie, setFiltreCategorie] = useState("tous");
  const [filtrePromotion, setFiltrePromotion] = useState("tous");
  const [filtrePrixMin, setFiltrePrixMin] = useState("");
  const [filtrePrixMax, setFiltrePrixMax] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");

  // États pour les modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    type: "", // "delete", "restore", "success"
    produitId: null,
    produitNom: "",
    onConfirm: null
  });

  const [form, setForm] = useState({
    nomProduit: "",
    prix: "",
    poids: "",
    numCategorie: "",
    numPromotion: "",
    image: null,
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [produitsData, categoriesData, promotionsData] = await Promise.all([
        fetchProduits(),
        getCategories(),
        fetchPromotions()
      ]);
      
      setProduits(produitsData);
      setCategories(categoriesData.filter((c) => !c.deleted_at));
      setPromotions(promotionsData);
    } catch (error) {
      console.error("Erreur chargement des données:", error);
      showModal("error", "Erreur", "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour afficher une modal
  const showModal = (type, title, message, produitId = null, produitNom = "", onConfirm = null) => {
    setModalData({
      type,
      title,
      message,
      produitId,
      produitNom,
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
      produitId: null,
      produitNom: "",
      onConfirm: null
    });
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const resetForm = () => {
    setForm({
      nomProduit: "",
      prix: "",
      poids: "",
      numCategorie: "",
      numPromotion: "",
      image: null,
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nomProduit", form.nomProduit.trim());
    formData.append("prix", form.prix);
    formData.append("poids", form.poids);
    formData.append("numCategorie", form.numCategorie);
    if (form.numPromotion) formData.append("numPromotion", form.numPromotion);
    if (form.image) formData.append("image", form.image);

    try {
      if (editingId) {
        await updateProduit(editingId, formData);
        showModal("success", "Succès", "Produit mis à jour avec succès !");
      } else {
        await createProduit(formData);
        showModal("success", "Succès", "Produit ajouté avec succès !");
      }

      resetForm();
      chargerDonnees();
    } catch (err) {
      console.error("Erreur détaillée:", err);

      // Cas de produit soft-deleted
      if (err.response?.status === 409 && err.response?.data?.soft_deleted) {
        showModal(
          "restore",
          "Produit archivé trouvé",
          `Le produit "${err.response.data.produit_nom}" existe déjà mais est archivé. Voulez-vous le restaurer ?`,
          err.response.data.produit_id,
          err.response.data.produit_nom,
          async () => {
            try {
              await restoreProduit(err.response.data.produit_id);
              showToast("success", "Produit restauré avec succès !");
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

  const handleEdit = (produit) => {
    setForm({
      nomProduit: produit.nomProduit,
      prix: produit.prix,
      poids: produit.poids,
      numCategorie: produit.numCategorie,
      numPromotion: produit.numPromotion || "",
      image: null,
    });
    setEditingId(produit.numProduit);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id, nom) => {
    showModal(
      "delete",
      "Confirmer la suppression",
      `Êtes-vous sûr de vouloir supprimer le produit "${nom}" ?`,
      id,
      nom,
      async () => {
        try {
          await deleteProduit(id);
          chargerDonnees();
          showToast("success", "Produit supprimé temporairement !");
        } catch (error) {
          showToast("error", "Erreur lors de la suppression");
        }
      }
    );
  };

  // Filtrer les produits
  const filteredProduits = produits.filter(produit => {
    // Filtre par recherche
    const searchMatch = 
      produit.nomProduit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.categorie?.nomCategorie.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par catégorie
    const categorieMatch = 
      filtreCategorie === "tous" || 
      produit.numCategorie === parseInt(filtreCategorie);
    
    // Filtre par promotion
    let promotionMatch = true;
    if (filtrePromotion === "avec") {
      promotionMatch = produit.numPromotion !== null && produit.promotion !== null;
    } else if (filtrePromotion === "sans") {
      promotionMatch = produit.numPromotion === null || produit.promotion === null;
    }
    
    // Filtre par prix minimum
    const prixMinMatch = !filtrePrixMin || produit.prix >= parseFloat(filtrePrixMin);
    
    // Filtre par prix maximum
    const prixMaxMatch = !filtrePrixMax || produit.prix <= parseFloat(filtrePrixMax);
    
    // Filtre par statut
    const statutMatch = 
      filtreStatut === "tous" || 
      (filtreStatut === "actif" && produit.statut === 'actif') ||
      (filtreStatut === "inactif" && produit.statut === 'inactif');
    
    return searchMatch && categorieMatch && promotionMatch && prixMinMatch && prixMaxMatch && statutMatch;
  });

  const produitsEnPromotion = produits.filter(p => p.promotion).length;
  const produitsActifs = produits.filter(p => p.statut === 'actif').length;

  // Réinitialiser tous les filtres
  const reinitialiserFiltres = () => {
    setFiltreCategorie("tous");
    setFiltrePromotion("tous");
    setFiltrePrixMin("");
    setFiltrePrixMax("");
    setFiltreStatut("tous");
    setSearchTerm("");
    showToast("info", "Filtres réinitialisés");
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = 
    searchTerm || 
    filtreCategorie !== "tous" || 
    filtrePromotion !== "tous" || 
    filtrePrixMin || 
    filtrePrixMax ||
    filtreStatut !== "tous";

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestion des Produits</h1>
          <div className="stats-container" style={{ marginTop: '10px' }}>
            <span className="stat-item">
              {filteredProduits.length} produit{filteredProduits.length !== 1 ? 's' : ''} trouvé{filteredProduits.length !== 1 ? 's' : ''}
            </span>
            <span className="stat-item" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
              {produitsActifs} actif{produitsActifs !== 1 ? 's' : ''}
            </span>
            <span className="stat-item" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
              {produitsEnPromotion} en promotion
            </span>
            <span className="stat-item" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
              {produits.length} total
            </span>
          </div>
        </div>
        <button className="ajout" onClick={() => setIsFormOpen(true)}>
          <FaPlus style={{marginRight:"10px"}}/> Ajouter un produit
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="navigation-tabs">
        <button className="tab-active">
          <FaBox style={{marginRight:"8px"}} /> Produits
        </button>
        <button className="tab-inactive" onClick={() => navigate("/admin/categories")}>
          <FaList style={{marginRight:"8px"}} /> Catégories
        </button>
        <button className="tab-inactive" onClick={() => navigate("/admin/decoupes")}>
          <FaUtensils style={{marginRight:"8px"}} /> Découpes
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom de produit ou catégorie..."
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
              <label><FaBox className="meta-icon"/> Catégorie</label>
              <select 
                className="form-control"
                value={filtreCategorie} 
                onChange={(e) => setFiltreCategorie(e.target.value)}
              >
                <option value="tous">Toutes les catégories</option>
                {categories.map(categorie => (
                  <option key={categorie.numCategorie} value={categorie.numCategorie}>
                    {categorie.nomCategorie}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label><FaPercentage className="meta-icon"/> Promotion</label>
              <select 
                className="form-control"
                value={filtrePromotion} 
                onChange={(e) => setFiltrePromotion(e.target.value)}
              >
                <option value="tous">Tous les produits</option>
                <option value="avec">Produits en promotion</option>
                <option value="sans">Produits sans promotion</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Statut</label>
              <select 
                className="form-control"
                value={filtreStatut} 
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Prix minimum (Ar)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                value={filtrePrixMin}
                onChange={(e) => setFiltrePrixMin(e.target.value)}
                min="0"
                step="100"
              />
            </div>
            
            <div className="filter-group">
              <label>Prix maximum (Ar)</label>
              <input
                type="number"
                className="form-control"
                placeholder="1000000"
                value={filtrePrixMax}
                onChange={(e) => setFiltrePrixMax(e.target.value)}
                min="0"
                step="100"
              />
            </div>
          </div>
          
          {/* Affichage des filtres actifs */}
          <div className="active-filters">
            {filtreCategorie !== "tous" && (
              <span className="active-filter-tag">
                Catégorie: {categories.find(c => c.numCategorie === parseInt(filtreCategorie))?.nomCategorie}
                <button onClick={() => setFiltreCategorie("tous")}>×</button>
              </span>
            )}
            {filtrePromotion !== "tous" && (
              <span className="active-filter-tag">
                Promotion: {filtrePromotion === "avec" ? "Avec promotion" : "Sans promotion"}
                <button onClick={() => setFiltrePromotion("tous")}>×</button>
              </span>
            )}
            {filtreStatut !== "tous" && (
              <span className="active-filter-tag">
                Statut: {filtreStatut}
                <button onClick={() => setFiltreStatut("tous")}>×</button>
              </span>
            )}
            {filtrePrixMin && (
              <span className="active-filter-tag">
                Prix min: {filtrePrixMin} Ar
                <button onClick={() => setFiltrePrixMin("")}>×</button>
              </span>
            )}
            {filtrePrixMax && (
              <span className="active-filter-tag">
                Prix max: {filtrePrixMax} Ar
                <button onClick={() => setFiltrePrixMax("")}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Formulaire */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "800px" }}>
            <div className="modal-header">
              <h2>{editingId ? "Modifier le produit" : "Ajouter un produit"}</h2>
              <button className="modal-close" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form" encType="multipart/form-data">
              <div className="form-row">
                <div className="form-group">
                  <label><FaImage  /> Image du produit</label>
                  <input 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label><FaBox /> Nom du produit</label>
                  <input
                    type="text"
                    name="nomProduit"
                    value={form.nomProduit}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Ex: Carotte, Steak, etc."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaMoneyBillWave /> Prix (Ar)</label>
                  <input
                    type="number"
                    name="prix"
                    value={form.prix}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="Ex: 1000"
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label><FaWeightHanging /> Poids (kg)</label>
                  <input
                    type="number"
                    name="poids"
                    value={form.poids}
                    placeholder="Ex: 2"
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <select 
                    name="numCategorie" 
                    value={form.numCategorie} 
                    onChange={handleChange} 
                    required
                    className="form-control"
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {categories.map((cat) => (
                      <option key={cat.numCategorie} value={cat.numCategorie}>
                        {cat.nomCategorie}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label><FaTag /> Promotion</label>
                  <select 
                    name="numPromotion" 
                    value={form.numPromotion} 
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Aucune promotion</option>
                    {promotions.map((p) => (
                      <option key={p.numPromotion} value={p.numPromotion}>
                        {p.nomPromotion} ({p.valeur}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Mettre à jour" : "Ajouter le produit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

   <div className="grid-container grid-3">
  {filteredProduits.length > 0 ? (
    filteredProduits.map((produit) => {
      const hasPromotion = produit.promotion && produit.promotion.valeur;
      const promotionalPrice = hasPromotion
        ? calculatePromotionalPrice(produit.prix, produit.promotion.valeur)
        : null;
      const savings = hasPromotion
        ? calculateSavings(produit.prix, produit.promotion.valeur)
        : null;

      return (
        <div key={produit.numProduit} className="card">
          {/* Badge promo (utilise badge-promo du CSS) */}
          {hasPromotion && (
            <span className="badge-promo">-{produit.promotion.valeur}%</span>
          )}

          {/* Image */}
          <div className="image-container">
            {produit.image ? (
              <img
                src={`${IMAGE_BASE_URL}${produit.image}`}
                alt={produit.nomProduit}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `
                    <div class='image-fallback'>
                      <i class='fa fa-box' style='font-size:40px;color:#ccc;'></i>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="image-fallback">
                <FaBox style={{ fontSize: "40px", color: "#ccc" }} />
              </div>
            )}
          </div>

          {/* Corps de la carte */}
          <div className="card-body">
            <h3 className="product-title" style={{ marginBottom: '2px' }}>
              {produit.nomProduit}
            </h3>
          
            
            {produit.categorie && (
              <span className="product-category" style={{ 
                display: 'block', 
                marginBottom: '10px',
                backgroundColor: 'rgba(40, 164, 88, 0.1)',
                color: '#28a458',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '500',
                alignSelf: 'flex-start',
                width: 'fit-content'
              }}>
                {produit.categorie.nomCategorie}
              </span>
            )}

            {/* Section prix et poids alignés */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '10px',
              borderTop: '1px dashed #e0e0e0',
              paddingTop: '15px'
            }}>
              {/* Prix */}
              <div style={{ flex: 1 }}>
                {hasPromotion ? (
                  <>
                    <div style={{ 
                      fontSize: '1rem',
                      color: '#6c757d',
                      textDecoration: 'line-through',
                      marginBottom: '5px'
                    }}>
                      {produit.prix.toLocaleString()} Ar
                    </div>
                    <div style={{ 
                      fontSize: '1.4rem',
                      fontWeight: '800',
                      color: '#dc3545',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span>{promotionalPrice.toLocaleString()}</span>
                      <span style={{ fontSize: '1rem', fontWeight: '600' }}>Ar</span>
                    </div>
                   
                  </>
                ) : (
                  <div style={{ 
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: '#28a458',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span>{produit.prix.toLocaleString()}</span>
                    <span style={{ fontSize: '1rem', fontWeight: '600' }}>Ar</span>
                  </div>
                )}
              </div>

              {/* Poids aligné à droite */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                marginLeft: '20px'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6c757d',
                  fontSize: '0.9rem'
                }}>
                  <FaWeightHanging style={{ color:"#28a458"}}/>
                  <span style={{ color:"#28a458",fontWeight: '500' }}>{produit.poids} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="card-footer">
            <div className="table-actions">
              <button className="edit" onClick={() => handleEdit(produit)}>
                <FaEdit /> Modifier
              </button>
              <button
                className="delete"
                onClick={() =>
                  handleDeleteClick(produit.numProduit, produit.nomProduit)
                }
              >
                <FaTrash /> Supprimer
              </button>
            </div>
          </div>
        </div>
      );
    })
  ) : (
    <div className="loading-state">
      <h3>Aucun produit trouvé</h3>
      <p>Commencez par ajouter votre premier produit</p>
      <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
        <FaPlus /> Ajouter un produit
      </button>
    </div>
  )}
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
                   Ce produit sera supprimée temporairement.
                </span>
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
                <FaBox style={{ color: "#28a458" }} />
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

export default Produits;