import React, { useState, useEffect } from 'react';
import { FaSearch, FaSync, FaUser, FaCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { fetchArticles } from "../../../services/articleService";
import PaginationProduits from '../Accueil/PaginationProduits';
import "../../../styles/front-office/Actualite/ActualiteSection.css";
import "../../../styles/front-office/Produits/heroSection.css"; // ← On réutilise le hero des produits

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8000";

const ActualiteSection = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const articlesParPage = 6;

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await fetchArticles();
        setArticles(data || []);
        setFilteredArticles(data || []);
      } catch (err) {
        console.error("Erreur chargement articles:", err);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

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

  const indexDebut = (page - 1) * articlesParPage;
  const articlesAffiches = filteredArticles.slice(indexDebut, indexDebut + articlesParPage);

  const reinitialiserRecherche = () => setRecherche("");

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

  return (
    <section className="actualite-section">

      {/* HERO IDENTIQUE À CELUI DES PRODUITS */}
      <div className="heroProduit">
        <div className="heroProduit-header">
          <h2 className="heroProduit-header-text">
            Retrouvez ici toutes nos actualités : conseils, innovations et reportages autour de nos produits, de nos éleveurs et de nos producteurs partenaires.
          </h2>
        </div>

        <div className="heroProduit-middle">
          {/* BARRE DE RECHERCHE IDENTIQUE À CATEGORIESECTION */}
          <form className="heroProduit-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            <button type="submit">
              <FaSearch className="heroProduit-search" />
            </button>
            {recherche && (
              <FaSync
                className="heroProduit-reset"
                onClick={reinitialiserRecherche}
                title="Réinitialiser"
              />
            )}
          </form>
        </div>
      </div>

      {/* GRILLE D'ARTICLES – MÊME STYLE QUE LES PRODUITS */}
      <div className="produits-grid">
        {articlesAffiches.length > 0 ? (
          articlesAffiches.map(article => {
            const date = article.datePublication
              ? new Date(article.datePublication).toLocaleDateString("fr-FR")
              : "Date inconnue";

            return (
              <div key={article.numArticle} className="produit-card article-card">

                {/* Image */}
                <div className="produit-image">
                  <img
                    src={article.image ? `${IMAGE_BASE_URL}${article.image}` : "/placeholder.png"}
                    alt={article.titre}
                    onError={e => e.target.src = "/placeholder.png"}
                  />
                </div>

                {/* Corps */}
                <div className="produit-body">
                  <h3 className="produit-title">{article.titre}</h3>

                  <div className="produit-categorie article-meta">
                    <span><FaUser /> {article.auteur || "Anonyme"}</span>
                    <span><FaCalendarAlt /> {date}</span>
                  </div>

                  <p className="article-extrait">
                    {article.description?.substring(0, 130) || "Aucune description disponible."}
                    {article.description?.length > 130 && "..."}
                  </p>

                  <div className="panier-actions">
                    <Link to={`/actualite/${article.numArticle}`} className="btn-add-cart lire-btn">
                      Lire la suite
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-products">
            <p>
              {recherche ? "Aucun article ne correspond à votre recherche." : "Aucune actualité pour le moment."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredArticles.length > articlesParPage && (
        <div className="pagination-container">
          <PaginationProduits
            totalProduits={filteredArticles.length}
            produitsParPage={articlesParPage}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      )}
    </section>
  );
};

export default ActualiteSection;