import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaSync,
  FaUser,
  FaCalendarAlt,
  FaTag,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { fetchArticles} from "../../../services/articleService";
import PaginationProduits from "../Accueil/PaginationProduits";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import "../../../styles/back-office/tableau.css";
import "../../../styles/front-office/Actualite/ActualiteSection.css";
import "../../../styles/front-office/Produits/categorieSection.css"; 
import "../../../styles/front-office/Accueil/produitSection.css";
const IMAGE_BASE_URL =import.meta.env.VITE_IMAGE_BASE_URL ;

const ActualiteSection = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // États filtres
  const [recherche, setRecherche] = useState("");
  const [filtreAuteur, setFiltreAuteur] = useState("tous");
  const [filtreDate, setFiltreDate] = useState(""); // format YYYY-MM-DD
  const [filtreStatut, setFiltreStatut] = useState("tous"); // tous | recent | ancien
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
        (a) =>
          new Date(a.datePublication).toISOString().slice(0, 10) === filtreDate
      );
    }

    // Filtre statut (récent / ancien)
    if (filtreStatut === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      resultats = resultats.filter(
        (a) => new Date(a.datePublication) >= weekAgo
      );
    } else if (filtreStatut === "ancien") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      resultats = resultats.filter(
        (a) => new Date(a.datePublication) < monthAgo
      );
    }

    setFilteredArticles(resultats);
    setPage(1);
  }, [recherche, filtreAuteur, filtreDate, filtreStatut, articles]);

  // Liste des auteurs uniques
  const auteursUniques = [...new Set(articles.map((a) => a.auteur).filter(Boolean))];

  const reinitialiserFiltres = () => {
    setRecherche("");
    setFiltreAuteur("tous");
    setFiltreDate("");
    setFiltreStatut("tous");
    setShowAdvancedFilters(false);
  };

  const indexDebut = (page - 1) * articlesParPage;
  const articlesAffiches = filteredArticles.slice(
    indexDebut,
    indexDebut + articlesParPage
  );


  return (
    <section >
    

      {/* Barre de recherche (identique à Produits) */}
      <div className="search-container" style={{marginTop:"150px"}}>
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458" }} />
          <input
            type="text"
            placeholder="Rechercher un article par titre, auteur..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <button
            className={`filter-toggle ${showAdvancedFilters ? "active" : ""}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        style={{ border:"none", display:"flex", alignItems:"center", background:"white", color:"#28a458", paddingRight:"10px"}}
        >
            <FaFilter />
          </button>

          {(recherche || filtreAuteur !== "tous" || filtreDate || filtreStatut !== "tous") && (
            <FaSync
              style={{
                marginLeft: "8px",
                cursor: "pointer",
                color: "#28a458",
              }}
              onClick={reinitialiserFiltres}
              title="Réinitialiser les filtres"
            />
          )}
        </div>
      </div>

        {showAdvancedFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>
                <FaUser style={{ marginRight: "6px" }} />
                Auteur
              </label>
              <select
                value={filtreAuteur}
                onChange={(e) => setFiltreAuteur(e.target.value)}
              >
                <option value="tous">Tous les auteurs</option>
                {auteursUniques.map((auteur) => (
                  <option key={auteur} value={auteur}>
                    {auteur}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaCalendarAlt style={{ marginRight: "6px" }} />
                Date exacte
              </label>
              <DatePicker
                selected={filtreDate ? new Date(filtreDate) : null}
                onChange={(date) =>
                  setFiltreDate(date ? date.toISOString().slice(0, 10) : "")
                }
                dateFormat="dd/MM/yyyy"
                locale={fr}
                placeholderText="Choisir une date"
                className="form-control"
                isClearable
              />
            </div>

            <div className="filter-group">
              <label>
                <FaTag style={{ marginRight: "6px" }} />
                Période
              </label>
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Toutes les périodes</option>
                <option value="recent">Récents (7 derniers jours)</option>
                <option value="ancien">Anciens (plus d'1 mois)</option>
              </select>
            </div>
          </div>
        </div>
      )}

        <div className="produits-grid back-office-grid">
          {articlesAffiches.length > 0 ? (
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

                    <div  style={{position:"absolute",bottom:"0",right:"0",left:"0",marginBottom:"10px",marginTop:"20px"}}>
                       <div className="table-actions" >
                      <Link
                        to={`/actualite/${article.numArticle}`}
                        className="btn-add-cart lire-btn"
                     
                     >
                        Lire la suite
                      </Link>
                      </div>
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
        </div>)}
    
    </section>
  );
};

export default ActualiteSection;