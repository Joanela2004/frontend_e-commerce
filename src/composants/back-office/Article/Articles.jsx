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

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8000";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtreAuteur, setFiltreAuteur] = useState("tous");
  const [filtreDate, setFiltreDate] = useState(""); // YYYY-MM-DD
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleAEditer, setArticleAEditer] = useState(null);
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
    } catch {
      showToast("error", "Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  // Fonction sécurisée pour obtenir une date valide SANS décalage horaire
  const getValidLocalDate = (dateString) => {
    if (!dateString) return null;
    // Si la date est déjà au format YYYY-MM-DD
    if (typeof dateString === "string" && dateString.length === 10) {
      const [year, month, day] = dateString.split("-").map(Number);
      // monthIndex = month - 1 car janvier = 0 en JS
      return new Date(year, month - 1, day);
    }
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Filtrage des articles
  const filteredArticles = articles.filter((article) => {
    const texte = `${article.titre || ""} ${article.description || ""} ${article.auteur || ""}`.toLowerCase();
    const searchOk = searchTerm === "" || texte.includes(searchTerm.toLowerCase());

    const auteurOk = filtreAuteur === "tous" || article.auteur === filtreAuteur;

    let dateOk = true;
    if (filtreDate) {
      const articleDate = getValidLocalDate(article.datePublication);
      if (!articleDate) {
        dateOk = false;
      } else {
        const articleDateStr = articleDate.toISOString().split("T")[0];
        dateOk = articleDateStr === filtreDate;
      }
    }

    let statutOk = true;
    if (filtreStatut === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const articleDate = getValidLocalDate(article.datePublication);
      statutOk = articleDate && articleDate >= weekAgo;
    } else if (filtreStatut === "ancien") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const articleDate = getValidLocalDate(article.datePublication);
      statutOk = articleDate && articleDate < monthAgo;
    }

    return searchOk && auteurOk && dateOk && statutOk;
  });

  // Liste des auteurs uniques
  const auteursUniques = [...new Set(articles.map((a) => a.auteur).filter(Boolean))];

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltreAuteur("tous");
    setFiltreDate("");
    setFiltreStatut("tous");
    setShowAdvancedFilters(false);
  };

  const handleSupprimer = (id, titre) => {
    setArticleToDelete({ id, titre });
    setShowDeleteModal(true);
  };

  const confirmerSuppression = async () => {
    try {
      await deleteArticle(articleToDelete.id);
      chargerArticles();
      showToast("success", `Article "${articleToDelete.titre}" supprimé`);
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
      <div className="page-header">
        <div>
          <h1>Gestion des Articles</h1>
          <div className="stats-container">
            <span className="stat-item">
              {filteredArticles.length} article{filteredArticles.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <button
          className="ajout"
          onClick={() => {
            setArticleAEditer(null);
            setIsModalOpen(true);
          }}
        >
          <FaPlus /> Ajouter un article
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458" }} />
          <input
            type="text"
            placeholder="Rechercher par titre, auteur..."
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
          {(searchTerm || filtreAuteur !== "tous" || filtreDate || filtreStatut !== "tous") && (
            <FaSync
              className="reset-icon"
              onClick={reinitialiserFiltres}
              style={{ marginLeft: "8px", cursor: "pointer", color: "#28a458" }}
            />
          )}
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Auteur</label>
              <select value={filtreAuteur} onChange={(e) => setFiltreAuteur(e.target.value)}>
                <option value="tous">Tous</option>
                {auteursUniques.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Date</label>
              <DatePicker
                selected={filtreDate ? getValidLocalDate(filtreDate) : null}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    setFiltreDate(`${year}-${month}-${day}`);
                  } else {
                    setFiltreDate("");
                  }
                }}
                dateFormat="dd/MM/yyyy"
                locale={fr}
                placeholderText="jj/mm/aaaa"
                className="form-control"
                isClearable
              />
            </div>

            <div className="filter-group">
              <label>Statut</label>
              <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
                <option value="tous">Tous</option>
                <option value="recent">Récents (7j)</option>
                <option value="ancien">Anciens (+1 mois)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Liste des articles */}
      <div className="produits-grid back-office-grid">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => {
            const articleDate = getValidLocalDate(article.datePublication);
            const dateFormatee = articleDate
              ? articleDate.toLocaleDateString("fr-FR")
              : "Date inconnue";

            return (
              <div key={article.numArticle} className="produit-card back-office-card">
                <div className="produit-image">
                  <img
                    src={article.image ? `${IMAGE_BASE_URL}${article.image}` : "/placeholder.png"}
                    alt={article.titre}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </div>
                <div className="produit-body">
                  <h3 className="produit-title">{article.titre}</h3>
                  <div className="produit-categorie article-meta">
                    <span>
                      <FaUser /> {article.auteur || "Anonyme"}
                    </span>
                    <span>
                      <FaCalendarAlt /> {dateFormatee}
                    </span>
                  </div>
                  <p className="article-extrait">
                    {article.description || "Aucune description disponible."}
                  </p>
                  <div className="card-footer">
                    <div className="table-actions">
                      <button
                        className="edit"
                        onClick={() => {
                          setArticleAEditer(article);
                          setIsModalOpen(true);
                        }}
                      >
                        <FaEdit /> Modifier
                      </button>
                      <button
                        className="delete"
                        onClick={() => handleSupprimer(article.numArticle, article.titre)}
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
            <p>Aucun article trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Ajout/Édition */}
      {isModalOpen && (
        <AjouterArticleModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setArticleAEditer(null);
          }}
          onSave={chargerArticles}
          articleAEditer={articleAEditer}
        />
      )}

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>
                <FaExclamationTriangle style={{ color: "#dc3545" }} /> Confirmer la suppression
              </h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Supprimer l'article :<br />
                <strong>"{articleToDelete.titre}"</strong> ?
              </p>
              <div className="modal-actions">
                <button className="edit" onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </button>
                <button className="delete" onClick={confirmerSuppression}>
                  Supprimer
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