import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaSync,
  FaEdit,
  FaTrash,
  FaBox,
  FaTag,
  FaWeightHanging,
  FaImage,
  FaFilter,
  FaList,
  FaUtensils,
  FaExclamationTriangle,
  FaMoneyBillWave,
} from "react-icons/fa";

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
import "../../../styles/front-office/Accueil/produitSection.css"; 
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
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

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtreCategorie, setFiltreCategorie] = useState("tous");
  const [filtrePromotion, setFiltrePromotion] = useState("tous");
  const [filtrePrixMin, setFiltrePrixMin] = useState("");
  const [filtrePrixMax, setFiltrePrixMax] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");

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
      const [prods, cats, promos] = await Promise.all([
        fetchProduits(),
        getCategories(),
        fetchPromotions(),
      ]);
      setProduits(prods);
      setCategories(cats.filter((c) => !c.deleted_at));
      setPromotions(promos);
    } catch {
      showToast("error", "Erreur lors du chargement");
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
        showToast("success", "Produit mis à jour !");
      } else {
        await createProduit(formData);
        showToast("success", "Produit ajouté !");
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
      showToast("error", err.response?.data?.message || "Erreur");
    }
  };

  const handleEdit = (p) => {
    setForm({
      nomProduit: p.nomProduit,
      prix: p.prix,
      poids: p.poids,
      numCategorie: p.numCategorie,
      numPromotion: p.numPromotion || "",
      image: null,
    });
    setEditingId(p.numProduit);
    setIsFormOpen(true);
  };

  const openDeleteModal = (id, nom) => {
    setProduitEnCours({ id, nom });
    setShowDeleteModal(true);
  };

  const confirmerSuppression = async () => {
    await deleteProduit(produitEnCours.id);
    chargerDonnees();
    showToast("success", "Produit supprimé (soft delete)");
    setShowDeleteModal(false);
  };

  const confirmerRestauration = async () => {
    await restoreProduit(produitEnCours.id);
    chargerDonnees();
    
    showToast("success", `Produit "${produitEnCours.nom}" restauré !`);
    resetForm();
    setShowRestoreModal(false);
  };

  const filteredProduits = produits.filter((p) => {
    const matchSearch =
      p.nomProduit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categorie?.nomCategorie
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchCat =
      filtreCategorie === "tous" ||
      p.numCategorie === parseInt(filtreCategorie);
    const matchPromo =
      filtrePromotion === "tous" ||
      (filtrePromotion === "avec" && p.numPromotion) ||
      (filtrePromotion === "sans" && !p.numPromotion);
    const matchMin = !filtrePrixMin || p.prix >= parseFloat(filtrePrixMin);
    const matchMax = !filtrePrixMax || p.prix <= parseFloat(filtrePrixMax);
    const matchStatut =
      filtreStatut === "tous" ||
      (filtreStatut === "actif" && p.statut === "actif") ||
      (filtreStatut === "inactif" && p.statut === "inactif");

    return (
      matchSearch &&
      matchCat &&
      matchPromo &&
      matchMin &&
      matchMax &&
      matchStatut
    );
  });

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltreCategorie("tous");
    setFiltrePromotion("tous");
    setFiltrePrixMin("");
    setFiltrePrixMax("");
    setFiltreStatut("tous");
  };

  const stats = {
    total: produits.length,
    actifs: produits.filter((p) => p.statut === "actif").length,
    enPromo: produits.filter((p) => p.promotion).length,
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
      <div className="page-header">
        <div>
          <h1>Gestion des Produits</h1>
          <div className="stats-container">
            <span className="stat-item">
              {stats.filtered} trouvé{stats.filtered > 1 ? "s" : ""}
            </span>
           
            <span className="stat-item warning">{stats.enPromo} en promo</span>
            <span className="stat-item info">{stats.total} total</span>
          </div>
        </div>
        <button className="ajout" onClick={() => setIsFormOpen(true)}>
          <FaPlus /> Ajouter un produit
        </button>
      </div>
      <div className="navigation-tabs">
        <button className="tab-active">
          <FaBox /> Produits
        </button>
        <button
          className="tab-inactive"
          onClick={() => navigate("/admin/categories")}
        >
          <FaList /> Catégories
        </button>
        <button
          className="tab-inactive"
          onClick={() => navigate("/admin/decoupes")}
        >
          <FaUtensils /> Découpes
        </button>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch
            style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }}
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`filter-toggle ${showAdvancedFilters ? "active" : ""}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              border: "none",
              display: "flex",
              alignItems: "center",
              background: "white",
              color: "#28a458",
              paddingRight: "10px",
            }}
          >
            <FaFilter />
          </button>
          <FaSync
            style={{ marginLeft: "8px", cursor: "pointer", color: "#28a458" }}
            onClick={reinitialiserFiltres}
          />
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Catégorie</label>
              <select
                value={filtreCategorie}
                onChange={(e) => setFiltreCategorie(e.target.value)}
              >
                <option value="tous">Toutes</option>
                {categories.map((c) => (
                  <option key={c.numCategorie} value={c.numCategorie}>
                    {c.nomCategorie}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Promotion</label>
              <select
                value={filtrePromotion}
                onChange={(e) => setFiltrePromotion(e.target.value)}
              >
                <option value="tous">Toutes</option>
                <option value="avec">Avec promotion</option>
                <option value="sans">Sans promotion</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Statut</label>
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Tous</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Prix min (Ar)</label>
              <input
                type="number"
                value={filtrePrixMin}
                onChange={(e) => setFiltrePrixMin(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Prix max (Ar)</label>
              <input
                type="number"
                value={filtrePrixMax}
                onChange={(e) => setFiltrePrixMax(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="produits-grid back-office-grid">
        {filteredProduits.length > 0 ? (
          filteredProduits.map((produit) => {
            const hasPromo =
              produit.promotion && produit.promotion.statutPromotion === true;
            const prixPromo = hasPromo
              ? produit.promotion.typePromotion === "Pourcentage"
                ? Math.round(
                    produit.prix * (1 - produit.promotion.valeur / 100)
                  )
                : produit.prix - produit.promotion.valeur
              : null;

            return (
              <div
                key={produit.numProduit}
                className="produit-card back-office-card"
              >
               
                {hasPromo && (
                  <span className="badge-promo">
                    -{produit.promotion.valeur}%
                  </span>
                )}

                <div className="produit-image">
                  <img
                    src={
                      produit.image
                        ? `${IMAGE_BASE_URL}${produit.image}`
                        : "/placeholder.png"
                    }
                    alt={produit.nomProduit}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </div>

               
                <div className="produit-body">
                  <h3 className="produit-title">{produit.nomProduit}</h3>
                  {produit.categorie && (
                    <span className="produit-categorie">
                      {produit.categorie.nomCategorie}
                    </span>
                  )}

                  <div className="produit-prix-poids">
                    <div>
                      {hasPromo ? (
                        <>
                          <span className="ancien-prix">
                            {Number(produit.prix).toLocaleString()} Ar
                          </span>
                          <span className="nouveau-prix">
                            {prixPromo.toLocaleString()} Ar
                          </span>
                        </>
                      ) : (
                        <span className="prix-normal">
                          {Number(produit.prix).toLocaleString()} Ar
                        </span>
                      )}
                    </div>
                    <div className="poids-disponible">
                      <FaWeightHanging /> <strong>{produit.poids} kg</strong>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="table-actions">
                      <button
                        className="edit"
                        onClick={() => handleEdit(produit)}
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        className="delete"
                        onClick={() =>
                          openDeleteModal(
                            produit.numProduit,
                            produit.nomProduit
                          )
                        }
                      >
                        <FaTrash /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-products">
            <p>Aucun produit trouvé</p>
           
          </div>
        )}
      </div>

       {isFormOpen && (
        <div className="modal-overlay" onClick={resetForm}>
          <div
            className="modal-content"
            style={{ maxWidth: "800px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {editingId ? "Modifier le produit" : "Ajouter un produit"}
              </h2>
              <button className="modal-close" onClick={resetForm}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-body">
             
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaImage /> Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}

                  className="form-control"
                  />
                   <small style={{ color: '#6c757d', display: 'block', marginTop: '8px' }}>
                      Formats acceptés: JPG, PNG, SVG. Taille max: 2MB
                    </small>
                </div>
                <div className="form-group">
                  <label>
                    <FaBox /> Nom
                  </label>
                  <input
                    type="text"
                    name="nomProduit"
                    value={form.nomProduit}
                    onChange={handleChange}
                    required

                  className="form-control"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaMoneyBillWave /> Prix (Ar)
                  </label>
                  <input
                    type="number"
                    name="prix"
                    value={form.prix}
                    onChange={handleChange}
                    required

                  className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FaWeightHanging /> Poids (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="poids"
                    value={form.poids}
                    onChange={handleChange}
                    required

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
                    <option value="">Choisir...</option>
                    {categories.map((c) => (
                      <option key={c.numCategorie} value={c.numCategorie}>
                        {c.nomCategorie}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    <FaTag /> Promotion
                  </label>
                  <select
                    name="numPromotion"
                    value={form.numPromotion}
                    onChange={handleChange}

                  className="form-control"
                  >
                    <option value="">Aucune</option>
                    {promotions
  .filter(promo => 
    promo.statutPromotion === true &&      
    !promo.automatique &&                  
    promo.codePromo == null               
  )
  .map((p) => (
    <option key={p.numPromotion} value={p.numPromotion}>
      {p.nomPromotion} : -{p.codePromo} ({p.valeur}{p.typePromotion === "Pourcentage" ? "%" : " Ar"})
    </option>
  ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Mettre à jour" : "Ajouter"}
                </button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>
                <FaExclamationTriangle style={{ color: "#dc3545" }} /> Confirmer
                la suppression
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Voulez-vous vraiment supprimer le produit{" "}
                <strong>{produitEnCours?.nom}</strong> ?
              </p>
              <div className="modal-actions">
                <button
                  className="edit"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Annuler
                </button>
                <button
                  className="delete"
                  onClick={confirmerSuppression}
                >
                  Supprimer
                </button>
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
              <h2>
                <FaExclamationTriangle style={{ color: "#ffc107" }} /> Produit
                archivé
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowRestoreModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Le produit "<strong>{produitEnCours?.nom}</strong>" est archivé.
                <br />
                Voulez-vous le restaurer ?
              </p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRestoreModal(false)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-success"
                  onClick={confirmerRestauration}
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

export default Produits;
