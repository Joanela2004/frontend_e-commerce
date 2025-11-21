import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { createProduit,updateProduit,fetchProduits, deleteProduit } from "../../../services/produitService";
import { getCategories } from "../../../services/categorieService";
import "../../../styles/back-office/fraisLivraison.css";
import { useNavigate } from "react-router-dom";
const Produits = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [form, setForm] = useState({
    nomProduit: "",
    prix: "",
    poids: "",
    quantiteStock: "",
    numCategorie: "",
    numPromotion: "",
    image: null
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    loadProduits();
    loadCategories();
    loadPromotions();
  }, []);

  const loadProduits = async () => {
    try {
      const data = await fetchProduits();
      setProduits(data);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      alert("Erreur lors du chargement des produits");
    }
  };

  const loadCategories = async () => {
     const data = await getCategories();
     setCategories(data);
  };

  const loadPromotions = async () => {
    const data = await fetchPromotions();
    setPromotions(data);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nomProduit", form.nomProduit);
    formData.append("prix", form.prix);
    formData.append("poids", form.poids);
    formData.append("quantiteStock", form.quantiteStock);
    formData.append("numCategorie", form.numCategorie);
    if (form.numPromotion) {
      formData.append("numPromotion", form.numPromotion);
    }
    
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (editingId) {
         await updateProduit(editingId, formData);
        alert("Produit mis à jour !");
      } else {
         await createProduit(formData);
        alert("Produit ajouté !");
      }
      
      setForm({
        nomProduit: "",
        prix: "",
        poids: "",
        quantiteStock: "",
        numCategorie: "",
        numPromotion: "",
        image: null
      });
      setEditingId(null);
      loadProduits();

    } catch (err) {
      console.error("Erreur détaillée:", err);
      alert("Erreur lors de l'enregistrement: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (produit) => {
    setForm({
      nomProduit: produit.nomProduit,
      prix: produit.prix,
      poids: produit.poids,
      quantiteStock: produit.quantiteStock,
      numCategorie: produit.numCategorie,
      numPromotion: produit.numPromotion || "",
      image: null
    });
    setEditingId(produit.numProduit || produit.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduit(id);
      loadProduits();
      alert("Produit supprimé !");
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const filteredProduits = produits.filter(p =>
    p.nomProduit.toLowerCase().includes(search.toLowerCase()) ||
    p.categorie?.nomCategorie.toLowerCase().includes(search.toLowerCase())
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

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="frais-form" encType="multipart/form-data">
        <div className="form-row">
          <div className="form-group">
            <label>Image</label>
            <input 
              type="file" 
              name="image" 
              accept="image/*" 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Nom du produit</label>
            <input
              type="text"
              name="nomProduit"
              value={form.nomProduit}
              onChange={handleChange}
              required
              placeholder="Nom du produit"
            />
          </div>

          <div className="form-group">
            <label>Prix (Ar)</label>
            <input
              type="number"
              name="prix"
              value={form.prix}
              onChange={handleChange}
              required
              placeholder="Prix"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Poids (kg)</label>
            <input
              type="number"
              name="poids"
              value={form.poids}
              onChange={handleChange}
              required
              placeholder="Poids"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Quantité en stock</label>
            <input
              type="number"
              name="quantiteStock"
              value={form.quantiteStock}
              onChange={handleChange}
              required
              placeholder="Quantité"
            />
          </div>

          <div className="form-group">
            <label>Catégorie</label>
            <select
              name="numCategorie"
              value={form.numCategorie}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(cat => (
                <option key={cat.numCategorie} value={cat.numCategorie}>
                  {cat.nomCategorie}
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
              <option value="">Aucune promotion</option>
              {promotions.map(promo => (
                <option key={promo.numPromotion} value={promo.numPromotion}>
                  {promo.nomPromotion} ({promo.valeur}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn-save" type="submit">
          {editingId ? "Mettre à jour" : "Ajouter"}
        </button>
        
        {editingId && (
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => {
              setEditingId(null);
              setForm({
                nomProduit: "",
                prix: "",
                poids: "",
                quantiteStock: "",
                numCategorie: "",
                numPromotion: "",
                image: null
              });
            }}
          >
            Annuler
          </button>
        )}
      </form>

      {/* Barre de recherche */}
      <div className="frais-search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Rechercher un produit ou catégorie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button className="btn-clear" onClick={() => setSearch("")}>✕</button>}
      </div>

      {/* Tableau */}
      <table className="frais-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Nom</th>
            <th>Prix</th>
            <th>Poids</th>
            <th>Stock</th>
            <th>Catégorie</th>
            <th>Promotion</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProduits.map((p) => (
            <tr key={p.numProduit || p.id}>
              <td>
                {p.image ? (
                  <img
                    src={`${import.meta.env.VITE_IMAGE_BASE_URL}${p.image}`}
                    alt={p.nomProduit}
                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                  />
                ) : "—"}
              </td>

              <td>{p.nomProduit}</td>
              
              <td>{p.prix} Ar</td>
              
              <td>{p.poids} kg</td>
              
              <td>
                <span className={`status ${p.quantiteStock > 0 ? 'active' : 'inactive'}`}>
                  {p.quantiteStock}
                </span>
              </td>

              <td>{p.categorie?.nomCategorie || "—"}</td>
              
              <td>
                {p.promotion ? (
                  <span className="status active">
                    {p.promotion.valeur}%
                  </span>
                ) : "—"}
              </td>

              <td>
                <button className="btn-edit" onClick={() => handleEdit(p)}>✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(p.numProduit || p.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Produits;