import React, { useState, useEffect } from 'react';
import { FaSearch, FaSync, FaUser, FaCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { fetchArticles } from "../../../services/articleService";
import PaginationProduits from '../Accueil/PaginationProduits';
import "../../../styles/front-office/global.css";
import "../../../styles/front-office/Actualite/ActualiteSection.css";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8000";

const ActualiteSection = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const articlesParPage = 6;

  // Chargement des articles
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await fetchArticles();
        setArticles(data || []);
        setFilteredArticles(data || []);
      } catch (err) {
        console.error("Erreur chargement articles:", err);
        setError("Impossible de charger les actualités.");
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  // Filtrage uniquement par recherche (comme dans le back-office)
  useEffect(() => {
    let resultats = [...articles];

    if (recherche.trim()) {
      const terme = recherche.toLowerCase();
      resultats = resultats.filter(a =>
        (a.titre?.toLowerCase().includes(terme)) ||
        (a.description?.toLowerCase().includes(terme)) ||
        (a.auteur?.toLowerCase().includes(terme))
      );
    }

    setFilteredArticles(resultats);
    setPage(1);
  }, [recherche, articles]);

  // Pagination
  const indexDebut = (page - 1) * articlesParPage;
  const articlesAffiches = filteredArticles.slice(indexDebut, indexDebut + articlesParPage);

  // Réinitialiser la recherche
  const reinitialiserRecherche = () => {
    setRecherche("");
  };

  if (loading) {
    return (
      <section className="actualite-section">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des actualités...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="actualite-section">
        <div style={{ textAlign: "center", padding: "100px 20px", color: "#dc3545" }}>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="actualite-section">

      {/* Header + Barre de recherche (style back-office) */}
      <div className="actualite-header">
        <h2>
          Retrouvez ici toutes nos actualités : conseils, innovations et reportages autour de nos produits, de nos éleveurs et de nos producteurs partenaires.
        </h2>

        {/* BARRE DE RECHERCHE IDENTIQUE AU BACK-OFFICE */}
        <div className="search-container" style={{ maxWidth: "600px", margin: "20px auto 0" }}>
          <div className="search-bar" style={{
            display: "flex",
            alignItems: "center",
            border: "2px solid #e0e0e0",
            borderRadius: "12px",
            padding: "8px 12px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}>
            <FaSearch style={{ marginLeft: "8px", color: "#28a458" }} />
            <input
              type="text"
              placeholder="Rechercher un article par titre, description ou auteur..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                padding: "8px 12px",
                fontSize: "1rem"
              }}
            />
            {recherche && (
              <FaSync
                onClick={reinitialiserRecherche}
                style={{
                  marginRight: "8px",
                  color: "#28a458",
                  cursor: "pointer",
                  fontSize: "1.2rem"
                }}
                title="Réinitialiser la recherche"
              />
            )}
          </div>
        </div>
      </div>

      {/* Plus de menu de catégories */}

      {/* Grille d'articles */}
      <div className="articles-grid">
        {articlesAffiches.length > 0 ? (
          articlesAffiches.map(article => {
            const date = article.datePublication
              ? new Date(article.datePublication).toLocaleDateString("fr-FR")
              : "Date inconnue";

            return (
              <div key={article.numArticle} className="article-card">
                <div className="image-container">
                  <img
                    src={article.image ? `${IMAGE_BASE_URL}${article.image}` : "/placeholder.png"}
                    alt={article.titre}
                    onError={e => e.target.src = "/placeholder.png"}
                  />
                </div>

                <div className="article-info">
                  <h3>{article.titre}</h3>
                  <p className="article-info-extrait">
                    {article.description || "Aucune description disponible."}
                  </p>
                  <span className="article-meta">
                    Par <FaUser style={{ marginRight: "4px" }} /> {article.auteur || "Anonyme"} - 
                    <FaCalendarAlt style={{ marginLeft: "8px", marginRight: "4px" }} /> {date}
                  </span>
                  <Link to={`/actualite/${article.numArticle}`} className="lire-btn">
                    Lire la suite →
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 20px", color: "#666", fontSize: "1.1rem" }}>
            {recherche ? "Aucun article ne correspond à votre recherche." : "Aucune actualité pour le moment."}
          </p>
        )}
      </div>

      {/* Pagination */}
      {filteredArticles.length > articlesParPage && (
        <PaginationProduits
          totalProduits={filteredArticles.length}
          produitsParPage={articlesParPage}
          currentPage={page}
          onPageChange={setPage}
        />
      )}
    </section>
  );
};

export default ActualiteSection;