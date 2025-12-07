import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaSync,
  FaCalendarAlt,
  FaUser,
  FaFilter,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";
import { fetchArticles, deleteArticle } from "../../../services/articleService";
import AjouterArticleModal from "./AjouterArticleModal";
import { useToast } from "../../../contexts/ToastContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

import "../../../styles/back-office/article.css";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/toast.css";
// Tu peux aussi importer le CSS du front si tu veux 100% même style :
import "../../../styles/front-office/Actualite/ActualiteSection.css";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8000";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtreAuteur, setFiltreAuteur] = useState("tous");
  const [filtreDate, setFiltreDate] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleAEditer, setArticleAEditer] = useState(null);

  // Modal suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState({ id: null, titre: "" });

  const { showToast } = useToast();

  useEffect(() => {
    chargerArticles();
  }, []);

  const chargerArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticles();
      setArticles(data || []);
    } catch (err) {
      showToast("error", "Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage
  const filteredArticles = articles.filter((article) => {
    const texte = `${article.titre} ${article.description} ${article.contenu} ${article.auteur}`.toLowerCase();
    const searchOk = texte.includes(searchTerm.toLowerCase());
    const auteurOk = filtreAuteur === "tous" || article.auteur === filtreAuteur;
    const dateOk = !filtreDate || new Date(article.datePublication).toISOString().slice(0, 10) === filtreDate;

    let statutOk = true;
    if (filtreStatut === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      statutOk = new Date(article.datePublication) >= weekAgo;
    } else if (filtreStatut === "ancien") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      statutOk = new Date(article.datePublication) < monthAgo;
    }

    return searchOk && auteurOk && dateOk && statutOk;
  });

  const auteursUniques = [...new Set(articles.map(a => a.auteur))];
  const articlesRecents = articles.filter(a => new Date(a.datePublication) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltreAuteur("tous");
    setFiltreDate("");
    setFiltreStatut("tous");
    setShowAdvancedFilters(false);
    showToast("info", "Filtres réinitialisés");
  };

  const handleSupprimer = (id, titre) => {
    setArticleToDelete({ id, titre });
    setShowDeleteModal(true);
  };

  const confirmerSuppression = async () => {
    try {
      await deleteArticle(articleToDelete.id);
      chargerArticles();
      showToast("success", `Article "${articleToDelete.titre}" supprimé avec succès`);
    } catch {
      showToast("error", "Erreur lors de la suppression");
    } finally {
      setShowDeleteModal(false);
      setArticleToDelete({ id: null, titre: "" });
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* En-tête */}
      <div className="page-header">
        <div>
          <h1>Gestion des Articles</h1>
          <div className="stats-container">
            <span className="stat-item">{articles.length} article{articles.length > 1 ? "s" : ""}</span>
            <span className="stat-item recent">{articlesRecents} récent{articlesRecents > 1 ? "s" : ""}</span>
          </div>
        </div>
        <button className="ajout" onClick={() => { setArticleAEditer(null); setIsModalOpen(true); }}>
          <FaPlus style={{ marginRight: "10px" }} /> Ajouter un article
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458" }} />
          <input
            type="text"
            placeholder="Rechercher par titre, description, auteur..."
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
          <FaSync onClick={reinitialiserFiltres} style={{ marginLeft: "8px", cursor: "pointer", color: "#28a458" }} />
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Auteur</label>
              <select value={filtreAuteur} onChange={(e) => setFiltreAuteur(e.target.value)} className="form-control">
                <option value="tous">Tous les auteurs</option>
                {auteursUniques.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Date précise</label>
              <DatePicker
                selected={filtreDate ? new Date(filtreDate) : null}
                onChange={(date) => setFiltreDate(date ? date.toISOString().slice(0, 10) : "")}
                dateFormat="dd/MM/yyyy"
                locale={fr}
                placeholderText="jj/mm/aaaa"
                className="form-control"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
              />
            </div>
            <div className="filter-group">
              <label>Statut</label>
              <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className="form-control">
                <option value="tous">Tous</option>
                <option value="recent">Récents (7 jours)</option>
                <option value="ancien">Anciens (+1 mois)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grille d'articles - MÊME STYLE QUE FRONT */}
      <div className="articles-grid">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => {
            const date = new Date(article.datePublication).toLocaleDateString("fr-FR");
            return (
              <div key={article.numArticle} className="article-card">

                <div className="image-container">
                  <img
                    src={`${IMAGE_BASE_URL}${article.image}`}
                    alt={article.titre}
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                </div>

                <div className="article-info">
                  <h3>{article.titre}</h3>
                  <p className="article-info-extrait">
                    {article.description?.substring(0, 150) || "Aucune description"}...
                  </p>
                  <span className="article-meta">
                    <FaUser style={{ marginRight: "6px" }} /> {article.auteur} - 
                    <FaCalendarAlt style={{ margin: "0 6px" }} /> {date}
                  </span>

                  {/* BOUTONS MODIFIER ET SUPPRIMER - STYLE INCHANGÉ */}
                  <div className="table-actions" style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                    <button className="edit" onClick={() => { setArticleAEditer(article); setIsModalOpen(true); }}>
                      <FaEdit style={{ marginRight: "8px" }} /> Modifier
                    </button>
                    <button className="delete" onClick={() => handleSupprimer(article.numArticle, article.titre)}>
                      <FaTrash style={{ marginRight: "8px" }} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 20px", color: "#666" }}>
            <h3>Aucun article trouvé</h3>
            <p>Modifiez vos critères ou ajoutez un nouvel article.</p>
            <button className="ajout" onClick={() => setIsModalOpen(true)} style={{ marginTop: "20px" }}>
              <FaPlus style={{ marginRight: "10px" }} /> Ajouter un article
            </button>
          </div>
        )}
      </div>

      {/* Modal Ajout/Édition */}
      {isModalOpen && (
        <AjouterArticleModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setArticleAEditer(null); }}
          onSave={chargerArticles}
          articleAEditer={articleAEditer}
        />
      )}

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaExclamationTriangle style={{ color: "#dc3545" }} />
                Confirmer la suppression
              </h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer l'article :<br />
                <strong>"{articleToDelete.titre}"</strong> ?
              </p>
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px", marginTop: "20px" }}>
                <button className="btn btn-danger" onClick={confirmerSuppression}>
                  Supprimer
                </button>
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
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

export default Articles;