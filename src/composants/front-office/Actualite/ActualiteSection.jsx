import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaTag,
  FaWeightHanging,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { fetchArticles } from "../../../services/articleService";
import PaginationProduits from "../Accueil/PaginationProduits";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

import "../../../styles/back-office/tableau.css";
import "../../../styles/front-office/Actualite/ActualiteSection.css";
import "../../../styles/front-office/Produits/categorieSection.css"; 
import "../../../styles/front-office/Accueil/produitSection.css";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL ;

const ActualiteSection = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // États filtres
  const [recherche, setRecherche] = useState("");
  const [filtreAuteur, setFiltreAuteur] = useState("tous");
  const [filtreDate, setFiltreDate] = useState(""); // YYYY-MM-DD
  const [filtreStatut, setFiltreStatut] = useState("tous"); // tous | recent | ancien

  const [page, setPage] = useState(1);
  const articlesParPage = 6;

  // Chargement des articles
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await fetchArticles();
        const sorted = (data || []).sort(
          (a, b) => new Date(b.datePublication) - new Date(a.datePublication)
        );
        setArticles(sorted);
        setFilteredArticles(sorted);
      } catch (err) {
        console.error("Erreur chargement articles:", err);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  // Filtrage
  useEffect(() => {
    let resultats = [...articles];

    // Recherche texte
    if (recherche.trim()) {
      const terme = recherche.toLowerCase();
      resultats = resultats.filter(
        (a) =>
          a.titre?.toLowerCase().includes(terme) ||
          a.description?.toLowerCase().includes(terme) ||
          a.auteur?.toLowerCase().includes(terme)
      );
    }

    // Filtre auteur
    if (filtreAuteur !== "tous") {
      resultats = resultats.filter((a) => a.auteur === filtreAuteur);
    }

    // Filtre date exacte
    if (filtreDate) {
      resultats = resultats.filter(
        (a) => new Date(a.datePublication).toISOString().slice(0, 10) === filtreDate
      );
    }

    // Filtre période
    if (filtreStatut === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      resultats = resultats.filter((a) => new Date(a.datePublication) >= weekAgo);
    } else if (filtreStatut === "ancien") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      resultats = resultats.filter((a) => new Date(a.datePublication) < monthAgo);
    }

    setFilteredArticles(resultats);
    setPage(1);
  }, [recherche, filtreAuteur, filtreDate, filtreStatut, articles]);

  // Liste des auteurs uniques
  const auteursUniques = [...new Set(articles.map((a) => a.auteur).filter(Boolean))];

  // Pagination
  const indexDebut = (page - 1) * articlesParPage;
  const articlesAffiches = filteredArticles.slice(indexDebut, indexDebut + articlesParPage);

  return (
    <section>
      {/* Barre de recherche simple et propre */}
      <div className="heroProduit-middle" >
        <div className="search-container">
          <div className="search-bar">
            <FaSearch style={{ marginLeft: "8px", color: "#28a458" }} />
            <input
              type="text"
              placeholder="Rechercher un article par titre, auteur..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filtres affichés directement en boutons stylisés (comme dans Produits) */}
      <div className="categories-filters-section">
        <div className="categories-filters-row">
        

          {/* Période */}
          <button
            className={`filter-category-btn ${filtreStatut === "tous" ? "active" : ""}`}
            onClick={() => setFiltreStatut("tous")}
          >
            Toutes les périodes
          </button>
          <button
            className={`filter-category-btn ${filtreStatut === "recent" ? "active" : ""}`}
            onClick={() => setFiltreStatut("recent")}
          >
            <FaCalendarAlt />
            Récents (7 jours)
          </button>
          <button
            className={`filter-category-btn ${filtreStatut === "ancien" ? "active" : ""}`}
            onClick={() => setFiltreStatut("ancien")}
          >
            <FaCalendarAlt />
            Anciens (+1 mois)
          </button>

          {/* Date exacte avec DatePicker intégré dans un bouton stylisé */}
          <div className="date-filter-wrapper">
            <DatePicker
              selected={filtreDate ? new Date(filtreDate) : null}
              onChange={(date) =>
                setFiltreDate(date ? date.toISOString().slice(0, 10) : "")
              }
              dateFormat="dd/MM/yyyy"
              locale={fr}
              placeholderText="Date exacte"
              isClearable
              customInput={
                <button
                  className={`filter-category-btn ${
                    filtreDate ? "active" : ""
                  } date-picker-btn`}
                >
                  <FaCalendarAlt />
                  {filtreDate
                    ? new Date(filtreDate).toLocaleDateString("fr-FR")
                    : "Date exacte"}
                </button>
              }
            />
          </div>
        </div>
      </div>

      {/* Grille des articles */}
      <div className="produits-section">
        <div className="produits-grid back-office-grid">
          {loading ? (
            <div className="no-products"></div>
          ) : articlesAffiches.length > 0 ? (
            articlesAffiches.map((article) => {
              const date = article.datePublication
                ? new Date(article.datePublication).toLocaleDateString("fr-FR")
                : "Date inconnue";

              return (
                <div key={article.numArticle} className="produit-card back-office-card">
                  <div className="produit-image">
                    <img
                      src={
                        article.image
                          ? `${IMAGE_BASE_URL}${article.image}`
                          : "/placeholder.png"
                      }
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
                        <FaCalendarAlt /> {date}
                      </span>
                    </div>
                    <p className="article-extrait">
                      {article.description?.substring(0, 130) ||
                        "Aucune description disponible."}
                      {article.description?.length > 130 && "..."}
                    </p>
                    <div className="table-actions" style={{ marginTop: "20px" }}>
                      <Link
                        to={`/actualite/${article.numArticle}`}
                        className="btn-add-cart lire-btn"
                      >
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
                {recherche || filtreAuteur !== "tous" || filtreDate || filtreStatut !== "tous"
                  ? "Aucun article ne correspond à vos critères."
                  : "Aucune actualité pour le moment."}
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
      </div>
    </section>
  );
};

export default ActualiteSection;