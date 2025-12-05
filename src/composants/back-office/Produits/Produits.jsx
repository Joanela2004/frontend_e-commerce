import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaSync, FaEdit, FaTrash, FaBox, FaTag, FaWeightHanging, FaImage, FaFilter, FaPercentage, FaList, FaUtensils, FaExclamationTriangle, FaMoneyBillWave } from "react-icons/fa";
import {
  createProduit,
  updateProduit,
  fetchProduits,
  deleteProduit,
  restoreProduit,
} from "../../../services/produitService";
import { getCategories } from "../../../services/categorieService";
import { fetchPromotions } from "../../../services/promotionService";
import { useToast } from "../../../contexts/ToastContext";
import { useNavigate } from "react-router-dom";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/toast.css";
import "../../../styles/back-office/produit.css";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const calculatePromotionalPrice = (originalPrice, discountPercentage) => {
  return Math.round(originalPrice * (1 - discountPercentage / 100));
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

  // Filtres
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtreCategorie, setFiltreCategorie] = useState("tous");
  const [filtrePromotion, setFiltrePromotion] = useState("tous");
  const [filtrePrixMin, setFiltrePrixMin] = useState("");
  const [filtrePrixMax, setFiltrePrixMax] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");

  // Modals suppression / restauration
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [produitEnCours, setProduitEnCours] = useState(null);

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
        fetchPromotions(),
      ]);
      setProduits(produitsData);
      setCategories(categoriesData.filter((c) => !c.deleted_at));
      setPromotions(promotionsData);
    } catch (error) {
      showToast("error", "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
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
        showToast("success", "Produit mis à jour avec succès !");
      } else {
        await createProduit(formData);
        showToast("success", "Produit ajouté avec succès !");
      }
      resetForm();
      chargerDonnees();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.soft_deleted) {
        setProduitEnCours({
          id: err.response.data.produit_id,
          nom: err.response.data.produit_nom,
        });
        setShowRestoreModal(true);
        return;
      }
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement";
      showToast("error", msg);
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

  const openDeleteModal = (id, nom) => {
    setProduitEnCours({ id, nom });
    setShowDeleteModal(true);
  };

  const confirmerSuppression = async () => {
    try {
      await deleteProduit(produitEnCours.id);
      chargerDonnees();
      showToast("success", "Produit supprimé temporairement !");
    } catch (error) {
      showToast("error", "Erreur lors de la suppression");
    } finally {
      setShowDeleteModal(false);
      setProduitEnCours(null);
    }
  };

  const confirmerRestauration = async () => {
    try {
      await restoreProduit(produitEnCours.id);
      chargerDonnees();
      showToast("success", `Produit "${produitEnCours.nom}" restauré avec succès !`);
    } catch (error) {
      showToast("error", "Erreur lors de la restauration");
    } finally {
      setShowRestoreModal(false);
      setProduitEnCours(null);
    }
  };

  const filteredProduits = produits.filter((produit) => {
    const searchMatch =
      produit.nomProduit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.categorie?.nomCategorie.toLowerCase().includes(searchTerm.toLowerCase());

    const categorieMatch = filtreCategorie === "tous" || produit.numCategorie === parseInt(filtreCategorie);
    const promotionMatch =
      filtrePromotion === "tous" ||
      (filtrePromotion === "avec" && produit.numPromotion !== null) ||
      (filtrePromotion === "sans" && produit.numPromotion === null);

    const prixMinMatch = !filtrePrixMin || produit.prix >= parseFloat(filtrePrixMin);
    const prixMaxMatch = !filtrePrixMax || produit.prix <= parseFloat(filtrePrixMax);
    const statutMatch =
      filtreStatut === "tous" ||
      (filtreStatut === "actif" && produit.statut === "actif") ||
      (filtreStatut === "inactif" && produit.statut === "inactif");

    return searchMatch && categorieMatch && promotionMatch && prixMinMatch && prixMaxMatch && statutMatch;
  });

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltreCategorie("tous");
    setFiltrePromotion("tous");
    setFiltrePrixMin("");
    setFiltrePrixMax("");
    setFiltreStatut("tous");
    showToast("info", "Filtres réinitialisés");
  };

  const stats = {
    total: produits.length,
    actifs: produits.filter(p => p.statut === "actif").length,
    enPromo: produits.filter(p => p.promotion).length,
    filtered: filteredProduits.length,
  };

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
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Gestion des Produits</h1>
          <div className="stats-container" style={{ marginTop: "10px" }}>
            <span className="stat-item">{stats.filtered} produit{stats.filtered > 1 ? "s" : ""} trouvé{stats.filtered > 1 ? "s" : ""}</span>
            <span className="stat-item" style={{ backgroundColor: "#d4edda", color: "#155724" }}>
              {stats.actifs} actif{stats.actifs > 1 ? "s" : ""}
            </span>
            <span className="stat-item" style={{ backgroundColor: "#fff3cd", color: "#856404" }}>
              {stats.enPromo} en promotion
            </span>
            <span className="stat-item" style={{ backgroundColor: "#e3f2fd", color: "#1565c0" }}>
              {stats.total} total
            </span>
          </div>
        </div>
        <button className="ajout" onClick={() => setIsFormOpen(true)}>
          <FaPlus style={{ marginRight: "10px" }} /> Ajouter un produit
        </button>
      </div>

      {/* Navigation */}
      <div className="navigation-tabs">
        <button className="tab-active">
          <FaBox style={{ marginRight: "8px" }} /> Produits
        </button>
        <button className="tab-inactive" onClick={() => navigate("/admin/categories")}>
          <FaList style={{ marginRight: "8px" }} /> Catégories
        </button>
        <button className="tab-inactive" onClick={() => navigate("/admin/decoupes")}>
          <FaUtensils style={{ marginRight: "8px" }} /> Découpes
        </button>
      </div>

      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }} />
          <input
            type="text"
            placeholder="Rechercher par nom ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`filter-toggle ${showAdvancedFilters ? "active" : ""}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ border:"none", display:"flex", alignItems:"center", background:"white", color:"#28a458", paddingRight:"10px"}}
                   >
                     <FaFilter />
                   </button>
          <FaSync onClick={reinitialiserFiltres} style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }} />
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Catégorie</label>
              <select className="form-control" value={filtreCategorie} onChange={(e) => setFiltreCategorie(e.target.value)}>
                <option value="tous">Toutes</option>
                {categories.map((c) => (
                  <option key={c.numCategorie} value={c.numCategorie}>{c.nomCategorie}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Promotion</label>
              <select className="form-control" value={filtrePromotion} onChange={(e) => setFiltrePromotion(e.target.value)}>
                <option value="tous">Toutes</option>
                <option value="avec">Avec promotion</option>
                <option value="sans">Sans promotion</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Statut</label>
              <select className="form-control" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
                <option value="tous">Tous</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Prix min (Ar)</label>
              <input type="number" className="form-control" value={filtrePrixMin} onChange={(e) => setFiltrePrixMin(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Prix max (Ar)</label>
              <input type="number" className="form-control" value={filtrePrixMax} onChange={(e) => setFiltrePrixMax(e.target.value)} />
            </div>
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
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label><FaImage /> Image</label>
                  <input type="file" name="image" accept="image/*" onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label><FaBox /> Nom</label>
                  <input type="text" name="nomProduit" value={form.nomProduit} onChange={handleChange} required className="form-control" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><FaMoneyBillWave /> Prix (Ar)</label>
                  <input type="number" name="prix" value={form.prix} onChange={handleChange} required className="form-control" />
                </div>
                <div className="form-group">
                  <label><FaWeightHanging /> Poids (kg)</label>
                  <input type="number" step="0.01" name="poids" value={form.poids} onChange={handleChange} required className="form-control" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <select name="numCategorie" value={form.numCategorie} onChange={handleChange} required className="form-control">
                    <option value="">Choisir...</option>
                    {categories.map((c) => (
                      <option key={c.numCategorie} value={c.numCategorie}>{c.nomCategorie}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label><FaTag /> Promotion</label>
                  <select name="numPromotion" value={form.numPromotion} onChange={handleChange} className="form-control">
                    <option value="">Aucune</option>
                    {promotions.map((p) => (
                      <option key={p.numPromotion} value={p.numPromotion}>
                        {p.nomPromotion} ({p.valeur}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Mettre à jour" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grille des produits */}
      <div className="products-grid-container" >
        {filteredProduits.length > 0 ? (
          filteredProduits.map((produit) => {
            const hasPromo = produit.promotion && produit.promotion.valeur;
            const prixPromo = hasPromo ? calculatePromotionalPrice(produit.prix, produit.promotion.valeur) : null;
            return (
              <div key={produit.numProduit} className="card">
                {hasPromo && <span className="badge-promo">-{produit.promotion.valeur}%</span>}
                <div className="image-container">
                  {produit.image ? (
                    <img src={`${IMAGE_BASE_URL}${produit.image}`} alt={produit.nomProduit} />
                  ) : (
                    <div className="image-fallback"><FaBox style={{ fontSize: "40px", color: "#ccc" }} /></div>
                  )}
                </div>
                <div className="card-body">
                  <h3 className="product-title">{produit.nomProduit}</h3>
                  {produit.categorie && (
                    <span className="product-category">{produit.categorie.nomCategorie}</span>
                  )}
                  <div style={{ display: "flex", gap:"40px", alignItems: "center", marginTop: "10px" }}>
                    <div className="prix-poids">
                      {hasPromo ? (
                        <div style={{display:"flex",flexDirection:"column"}}>
                          <div style={{ textDecoration: "line-through", color: "#888" }}>
                            {produit.prix.toLocaleString()} Ar
                          </div>
                          <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#dc3545" }}>
                            {prixPromo.toLocaleString()} Ar
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#28a458" }}>
                          {produit.prix.toLocaleString()} Ar
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", color: "#28a458" }}>
                      <FaWeightHanging /> {produit.poids} kg
                    </div>
                  </div>
                </div>
                <div >
                  <div className="table-actions" style={{display:"flex",flexDirection:"row",gap:"20px"}}>
                    <button className="edit" onClick={() => handleEdit(produit)}>
                      <FaEdit /> Modifier
                    </button>
                    <button className="delete" onClick={() => openDeleteModal(produit.numProduit, produit.nomProduit)}>
                      <FaTrash /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <h3>Aucun produit trouvé</h3>
            <p>Commencez par ajouter votre premier produit !</p>
            <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
              <FaPlus /> Ajouter un produit
            </button>
          </div>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaExclamationTriangle style={{ color: "#dc3545" }} /> Confirmer la suppression
              </h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Voulez-vous vraiment supprimer le produit <strong>{produitEnCours?.nom}</strong> ?</p>
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                <button className="btn btn-danger" onClick={confirmerSuppression}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Restauration */}
      {showRestoreModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaExclamationTriangle style={{ color: "#ffc107" }} /> Produit archivé
              </h2>
              <button className="modal-close" onClick={() => setShowRestoreModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Le produit "<strong>{produitEnCours?.nom}</strong>" existe déjà mais est archivé.<br />Voulez-vous le restaurer ?</p>
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                <button className="btn btn-secondary" onClick={() => setShowRestoreModal(false)}>Annuler</button>
                <button className="btn btn-success" onClick={confirmerRestauration}>Restaurer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produits;