import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import { fetchArticleById } from "../../../services/articleService";
import "../../../styles/front-office/Actualite/ActualiteDetail.css";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL ;

const ActualiteDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        const data = await fetchArticleById(id);
        setArticle(data);
      } catch (err) {
        setError("Article introuvable ou erreur de chargement.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="actualite-detail-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de l'article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="actualite-detail-error">
        <p>{error || "Article non trouvé."}</p>
        <Link to="/actualite" className="btn-back">
          Retour aux actualités
        </Link>
      </div>
    );
  }

  const dateFormatee = new Date(article.datePublication).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <article className="actualite-detail">

      {/* Bouton retour */}
      <div className="detail-back">
        <Link to="/actualite" className="btn-back-article">
          <FaArrowLeft /> Retour aux actualités
        </Link>
      </div>

      {/* Image principale */}
      <div className="detail-image-container">
        <img
          src={article.image ? `${IMAGE_BASE_URL}/${article.image}` : "/placeholder.png"}
          alt={article.titre}
          className="detail-image"
          onError={(e) => e.target.src = "/placeholder.png"}
        />
      </div>

      {/* Contenu */}
      <div className="detail-content">

        <header className="detail-header">
          <h1 className="detail-title">{article.titre}</h1>

          <div className="detail-meta">
            <span className="meta-item">
              <FaUser /> {article.auteur || "Anonyme"}
            </span>
            <span className="meta-item">
              <FaCalendarAlt /> {dateFormatee}
            </span>
          </div>
        </header>

        {/* Description courte */}
        {article.description && (
          <p className="detail-extrait">{article.description}</p>
        )}

       <div
  className="detail-body"
  dangerouslySetInnerHTML={{ __html: article.contenu }}
></div>


        {/* Bouton retour en bas */}
        <div className="detail-footer">
          <Link to="/actualite" className="btn-back-article large">
            <FaArrowLeft /> Retour aux actualités
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ActualiteDetail;