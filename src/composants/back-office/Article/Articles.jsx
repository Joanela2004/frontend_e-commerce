import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus, FaSync, FaCalendarAlt, FaUser, FaFilter, FaEdit, FaTrash, FaExclamationTriangle, FaBox } from "react-icons/fa";
import { fetchArticles, deleteArticle } from "../../../services/articleService";
import AjouterArticleModal from "./AjouterArticleModal";
import { useToast } from "../../../contexts/ToastContext";
import "../../../styles/back-office/article.css"
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/toast.css";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [articleAEditer, setArticleAEditer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtreAuteur, setFiltreAuteur] = useState("tous");
  const [filtreDate, setFiltreDate] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États pour les modals (comme dans Produits)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    type: "",
    articleId: null,
    articleTitle: "",
    onConfirm: null
  });

  const { showToast } = useToast();

  useEffect(() => {
    chargerArticles();
  }, []);

  const chargerArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticles();
      setArticles(data);
    } catch (err) {
      console.error("Erreur chargement articles:", err);
      showToast("error", "Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour afficher une modal (comme dans Produits)
  const showModal = (type, title, message, articleId = null, articleTitle = "", onConfirm = null) => {
    setModalData({
      type,
      title,
      message,
      articleId,
      articleTitle,
      onConfirm
    });
    
    if (type === "delete") {
      setShowDeleteModal(true);
    } else if (type === "success") {
      setShowSuccessModal(true);
    }
  };

  // Fermer toutes les modals (comme dans Produits)
  const closeAllModals = () => {
    setShowDeleteModal(false);
    setShowSuccessModal(false);
    setModalData({
      title: "",
      message: "",
      type: "",
      articleId: null,
      articleTitle: "",
      onConfirm: null
    });
  };

  const filteredArticles = articles.filter(article => {
    const searchMatch = [
      article.titre,
      article.description,
      article.contenu,
      article.auteur
    ].join(" ").toLowerCase().includes(searchTerm.toLowerCase());
    
    const auteurMatch = filtreAuteur === "tous" || article.auteur === filtreAuteur;
    
    const dateMatch = !filtreDate || 
      new Date(article.datePublication).toISOString().split('T')[0] === filtreDate;
    
    let statutMatch = true;
    if (filtreStatut === "recent") {
      const articleDate = new Date(article.datePublication);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      statutMatch = articleDate >= oneWeekAgo;
    } else if (filtreStatut === "ancien") {
      const articleDate = new Date(article.datePublication);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      statutMatch = articleDate < oneMonthAgo;
    }
    
    return searchMatch && auteurMatch && dateMatch && statutMatch;
  });

  const handleSupprimerClick = (id, titre) => {
    showModal(
      "delete",
      "Confirmer la suppression",
      `Êtes-vous sûr de vouloir supprimer l'article "${titre}" ?`,
      id,
      titre,
      async () => {
        try {
          await deleteArticle(id);
          chargerArticles();
          showToast("success", "Article supprimé avec succès !");
        } catch (error) {
          showToast("error", "Erreur lors de la suppression de l'article.");
        }
      }
    );
  };

  const handleModifier = (article) => {
    setArticleAEditer(article);
    setIsModalOpen(true);
  };

  const handleAjout = () => {
    setArticleAEditer(null);
    setIsModalOpen(true);
  };

  const auteurs = [...new Set(articles.map(article => article.auteur))];

  const totalArticles = articles.length;
  const articlesRecents = articles.filter(article => {
    const articleDate = new Date(article.datePublication);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return articleDate >= oneWeekAgo;
  }).length;

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
              {totalArticles} article{totalArticles !== 1 ? 's' : ''}
            </span>
            <span className="stat-item recent">
              {articlesRecents} récent{articlesRecents !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <button className="ajout" onClick={handleAjout}>
          <FaPlus style={{marginRight:"10px"}}/> Ajouter un article
        </button>
      </div>

      <div className="search-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par titre, description, contenu ou auteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className={` ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ border:"none", display:"flex", alignItems:"center", background:"white", color:"#28a458", paddingRight:"10px"}}
          >
            <FaFilter />
          </button>

          <FaSync  
            onClick={() => {
              setFiltreAuteur('tous');
              setFiltreDate('');
              setFiltreStatut('tous');
              setSearchTerm('');
              showToast("info", "Filtres réinitialisés");
            }} 
            style={{ marginRight: '8px', border:"none", color:"#28a458", cursor: "pointer" }} 
          />
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label><FaUser className="meta-icon" /> Auteur</label>
              <select 
                className="form-control"
                value={filtreAuteur} 
                onChange={(e) => setFiltreAuteur(e.target.value)}
              >
                <option value="tous">Tous les auteurs</option>
                {auteurs.map(auteur => (
                  <option key={auteur} value={auteur}>{auteur}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label><FaCalendarAlt style={{ border:"none", color:"#28a458" }} /> Date précise</label>
              <input
                type="date"
                className="form-control"
                value={filtreDate}
                onChange={(e) => setFiltreDate(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Statut</label>
              <select 
                className="form-control"
                value={filtreStatut} 
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Tous les articles</option>
                <option value="recent">Articles récents (7 derniers jours)</option>
                <option value="ancien">Articles anciens (+1 mois)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {filteredArticles.length > 0 ? (
        <div className="grid-container grid-3">
          {filteredArticles.map((article) => {
            const articleDate = new Date(article.datePublication);
            const isRecent = (new Date() - articleDate) / (1000 * 60 * 60 * 24) <= 7;
            
            return (
              <div className="card" key={article.numArticle}>
                {isRecent && (
                  <div className="badge badge-new">
                    NOUVEAU
                  </div>
                )}
                
                <div className="image-container">
                  <img
                    src={`${IMAGE_BASE_URL}${article.image}`}
                    alt={article.titre}
                    className="card-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="image-fallback">
                          Pas d'image
                        </div>
                      `;
                    }}
                  />
                </div>
                
                <div className="card-body">
                  <h3 className="article-title">
                    {article.titre}
                  </h3>
                  
                  <p className="article-description">
                    {article.description?.substring(0, 150)}...
                  </p>
                  
                  <div className="meta-info">
                    <div className="meta-item">
                      <FaUser className="meta-icon" />
                      <span>{article.auteur}</span>
                    </div>
                    <div className="meta-item">
                      <FaCalendarAlt className="meta-icon" />
                      <span>{articleDate.toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="actions-container">
                  <button 
                    className="edit"
                    onClick={() => handleModifier(article)}
                  >
                    <FaEdit style={{color:"#28a458", marginRight:"10px"}} /> Modifier
                  </button>
                  
                  <button 
                    className="delete" 
                    onClick={() => handleSupprimerClick(article.numArticle, article.titre)}
                  >
                    <FaTrash style={{marginRight:"10px"}} /> Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h3>
            {searchTerm || filtreAuteur !== "tous" || filtreDate || filtreStatut !== "tous" 
              ? "Aucun article ne correspond à vos critères" 
              : "Aucun article trouvé"}
          </h3>
          <p>
            {searchTerm || filtreAuteur !== "tous" || filtreDate || filtreStatut !== "tous"
              ? "Essayez avec d'autres termes de recherche ou modifiez les filtres."
              : "Cliquez sur 'Ajouter un article' pour commencer à publier."}
          </p>
          <button 
            className="btn btn-primary" 
            onClick={handleAjout}
            style={{ marginTop: "20px" }}
          >
            <FaPlus /> Ajouter un article
          </button>
        </div>
      )}

      {isModalOpen && (
        <AjouterArticleModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setArticleAEditer(null); }}
          onSave={chargerArticles}
          articleAEditer={articleAEditer}
        />
      )}

      {/* Modal de suppression - Même style que Produits */}
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
              </p>
              
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
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
                <button
                  className="btn btn-secondary"
                  onClick={closeAllModals}
                  style={{ padding: "10px 30px" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès (optionnel pour articles) */}
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

export default Articles;