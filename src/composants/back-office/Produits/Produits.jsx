import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import {
  createProduit,
  updateProduit,
  fetchProduits,
  deleteProduit,
} from "../../../services/produitService";
import { getCategories } from "../../../services/categorieService";
import { fetchPromotions } from "../../../services/promotionService"; // ← AJOUTÉ !
import "../../../styles/back-office/fraisLivraison.css";
import { useNavigate } from "react-router-dom";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Produits = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    nomProduit: "",
    prix: "",
    poids: "",
    quantiteStock: "",
    numCategorie: "",
    numPromotion: "",
    image: null,
  });

  useEffect(() => {
    loadProduits();
    loadCategories();
    loadPromotions();
  }, []);

  const loadProduits = async () => {
    try {
      const data = await fetchProduits();
      setProduits(data);
    } catch (err) {
      alert("Erreur chargement produits");
    }
  };

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const loadPromotions = async () => {
    try {
      const data = await fetchPromotions();
      setPromotions(data);
    } catch (err) {
      console.error("Promotions non chargées", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nomProduit", form.nomProduit);
    formData.append("prix", form.prix);
    formData.append("poids", form.poids);
    formData.append("quantiteStock", form.quantiteStock);
    formData.append("numCategorie", form.numCategorie);
    if (form.numPromotion) formData.append("numPromotion", form.numPromotion);
    if (form.image) formData.append("image", form.image);

    try {
      if (editingId) {
        await updateProduit(editingId, formData);
        alert("Produit mis à jour !");
      } else {
        await createProduit(formData);
        alert("Produit ajouté !");
      }
      resetForm();
      loadProduits();
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setForm({
      nomProduit: "",
      prix: "",
      poids: "",
      quantiteStock: "",
      numCategorie: "",
      numPromotion: "",
      image: null,
    });
    setEditingId(null);
    setPreviewImage(null);
  };

  const handleEdit = (produit) => {
    setForm({
      nomProduit: produit.nomProduit,
      prix: produit.prix,
      poids: produit.poids,
      quantiteStock: produit.quantiteStock,
      numCategorie: produit.numCategorie || "",
      numPromotion: produit.numPromotion || "",
      image: null,
    });
    setEditingId(produit.numProduit);
    setPreviewImage(produit.image ? `${IMAGE_BASE_URL}${produit.image}` : null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    await deleteProduit(id);
    loadProduits();
  };

  const filteredProduits = produits.filter((p) =>
    p.nomProduit.toLowerCase().includes(search.toLowerCase()) ||
    p.categorie?.nomCategorie?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="frais-container">
      <div className="frais-header">
        <h2>Gestion des Produits</h2>
        <div className="livraison-tabs">
          <button className="tab-active">Produits</button>
          <button className="tab-inactive" onClick={() => navigate("/admin/categories")}>
            Catégories
          </button>
          <button className="tab-inactive" onClick={() => navigate("/admin/decoupes")}>
            Découpes
          </button>
        </div>
      </div>

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="frais-form">
        <div className="form-row">
          <div className="form-group">
            <label>Image {form.image || previewImage ? "(modifiée)" : ""}</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {(previewImage || form.image) && (
              <img
                src={previewImage || `${IMAGE_BASE_URL}${form.image}`}
                alt="Preview"
                style={{ width: 100, height: 100, objectFit: "cover", marginTop: 8, borderRadius: 8 }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Nom du produit *</label>
            <input
              name="nomProduit"
              value={form.nomProduit}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Prix (Ar) *</label>
            <input
              type="number"
              name="prix"
              value={form.prix}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Poids (kg) *</label>
            <input
              type="number"
              name="poids"
              value={form.poids}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Stock *</label>
            <input
              type="number"
              name="quantiteStock"
              value={form.quantiteStock}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Catégorie *</label>
            <select
              name="numCategorie"
              value={form.numCategorie}
              onChange={handleChange}
              required
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
            <label>Promotion</label>
            <select
              name="numPromotion"
              value={form.numPromotion}
              onChange={handleChange}
            >
              <option value="">Aucune</option>
              {promotions
                .filter(p => p.statutPromotion?.toLowerCase().includes('active'))
                .map((p) => (
                  <option key={p.numPromotion} value={p.numPromotion}>
                    {p.nomPromotion} ({p.valeur}{p.typePromotion === "Pourcentage" ? "%" : " Ar"})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" className="btn-save">
            {editingId ? "Mettre à jour" : "Ajouter le produit"}
          </button>
          {editingId && (
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* RECHERCHE */}
      <div className="frais-search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Rechercher produit ou catégorie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button className="btn-clear" onClick={() => setSearch("")}>X</button>}
      </div>

      {/* TABLEAU */}
      <table className="frais-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Produit</th>
            <th>Prix</th>
            <th>Poids</th>
            <th>Stock</th>
            <th>Catégorie</th>
            <th>Promo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProduits.map((p) => {
            const prixReel = p.promotion
              ? p.promotion.typePromotion === "Pourcentage"
                ? p.prix * (1 - p.promotion.valeur / 100)
                : p.prix - p.promotion.valeur
              : p.prix;

            return (
              <tr key={p.numProduit}>
                <td>
                  {p.image ? (
                    <img
                      src={`${IMAGE_BASE_URL}${p.image}`}
                      alt={p.nomProduit}
                      style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }}
                    />
                  ) : "—"}
                </td>
                <td><strong>{p.nomProduit}</strong></td>
                <td>
                  {p.promotion ? (
                    <>
                      <span style={{ textDecoration: "line-through", color: "#999" }}>
                        {parseFloat(p.prix).toFixed(0)} Ar
                      </span>
                      <br />
                      <strong style={{ color: "#28a458" }}>
                        {parseFloat(prixReel).toFixed(0)} Ar
                      </strong>
                    </>
                  ) : (
                    `${parseFloat(p.prix).toFixed(0)} Ar`
                  )}
                </td>
                <td>{p.poids} kg</td>
                <td>
                  <span className={`status ${p.quantiteStock > 0 ? "active" : "inactive"}`}>
                    {p.quantiteStock}
                  </span>
                </td>
                <td>{p.categorie?.nomCategorie || "—"}</td>
                <td>
                  {p.promotion ? (
                    <span className="status active">
                      -{p.promotion.valeur}
                      {p.promotion.typePromotion === "Pourcentage" ? "%" : " Ar"}
                    </span>
                  ) : "—"}
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(p)} title="Modifier">
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(p.numProduit)} title="Supprimer">
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filteredProduits.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#777" }}>
          {search ? "Aucun produit trouvé" : "Aucun produit"}
        </div>
      )}
    </div>
  );
};

export default Produits;