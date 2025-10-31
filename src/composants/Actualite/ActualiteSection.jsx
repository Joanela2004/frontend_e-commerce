import React, { useState } from 'react';
import { FaSearch, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../styles/front-office/Actualite/ActualiteSection.css";
import "../../styles/front-office/global.css";
import "../../styles/front-office/Produits/categorieSection.css";
import volaille from "../../assets/images/elevage.jpg";
import boeuf from "../../assets/images/boeuf.jpeg";
import legume from "../../assets/images/legume3.jpg";
import PaginationProduits from '../Accueil/PaginationProduits';

const ActualiteSection = () => {
  const articles = [
    {
      id: 1,
      titre: "L'élevage bio de poulet fermier",
      categorie: "Viande",
      sousCat: "Volaille",
      image: volaille,
      extrait: "Découvrez les secrets d'un élevage de poulets fermiers respectueux du bien-être animal et de l'environnement.",
      auteur: "Marie Dubois",
      contenu: "Découvrez les secrets d'un élevage de poulets fermiers respectueux du bien-être animal et de l'environnement.",
      date: "15 Oct 2025",
    },
    {
      id: 2,
      titre: "Le bœuf de race Charolaise",
      categorie: "Viande",
      sousCat: "Bœuf",
      image: boeuf,
      extrait: "Portrait d'une race emblématique française reconnue pour la qualité exceptionnelle de sa viande.",
      auteur: "Pierre Lefèvre",
      contenu: "Portrait d'une race emblématique française reconnue pour la qualité exceptionnelle de sa viande.",
      date: "16 Oct 2025",
    },
    {
      id: 3,
      titre: "Les légumes bio de saison",
      categorie: "Légumes",
      sousCat: "Légumes",
      image: legume,
      extrait: "Des légumes cultivés naturellement, riches en saveurs et en nutriments.",
      auteur: "Claire Martin",
      contenu: "Des légumes cultivés naturellement, riches en saveurs et en nutriments.",
      date: "17 Oct 2025",
    }
  ];

  const categories = ["Tous", "Viande", "Légumes"];
  const [filtreCategorie, setFiltreCategorie] = useState("Tous");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);

  const articlesFiltres = articles.filter(article => {
    const matchCategorie = filtreCategorie === "Tous" || article.categorie === filtreCategorie;
    const matchRecherche = article.titre.toLowerCase().includes(recherche.toLowerCase()) ||
                           article.extrait.toLowerCase().includes(recherche.toLowerCase());
    return matchCategorie && matchRecherche;
  });

  const actualiteParPage = 4;
  const indexDepart = (page - 1) * actualiteParPage;
  const actualiteAffichees = articlesFiltres.slice(indexDepart, indexDepart + actualiteParPage);

  return (
    <section className="actualite-section">
      <div className="actualite-header">
        <h2>Retrouvez ici toutes nos actualités : conseils, innovations et reportages autour de nos produits, de nos éleveurs et de nos producteurs partenaires.</h2>
        <div className="recherche-container">
          <form className='actualite-form'>
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              className="recherche-input"
            />
            <button type="submit">
              <FaSearch className="recherche-icon" />
            </button>
          </form>
        </div>
      </div>

      <div className="categorie-menu">
        <div className="categorie-filter">
          <FaFilter size={20} />
        </div>
        <p>Catégories :</p>
        {categories.map(cat => (
          <button
            key={cat}
            className={`categorie-btn ${filtreCategorie === cat ? 'active' : ''}`}
            onClick={() => {
              setFiltreCategorie(cat);
              setPage(1);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="articles-grid">
        {actualiteAffichees.map(article => (
          <div key={article.id} className="article-card">
            <div className='image-container'>
            <img src={article.image} alt={article.titre} />
            </div>
            <div className="article-info">
              <h3>{article.titre}</h3>
              <p className='article-info-extrait'>{article.extrait}</p>
              <span>Par {article.auteur} - {article.date}</span>
              <Link to={`/actualite/${article.id}`} className="lire-btn">
                Lire la suite →
              </Link>
            </div>
          </div>
        ))}
        {articlesFiltres.length === 0 && <p>Aucun article trouvé.</p>}
      </div>

      <PaginationProduits 
        totalProduits={articlesFiltres.length} 
        produitsParPage={actualiteParPage}
        onPageChange={setPage}
      />
    </section>
  );
};

export default ActualiteSection;
