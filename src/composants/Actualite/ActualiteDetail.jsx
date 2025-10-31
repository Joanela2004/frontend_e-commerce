import React from "react";
import { useParams } from "react-router-dom";
import legume from "../../assets/images/legume3.jpg";
import volaille from "../../assets/images/elevage.jpg";
import boeuf from "../../assets/images/boeuf.jpeg";
import "../../styles/front-office/Actualite/ActualiteDetail.css";
import "../../styles/front-office/global.css";
const ActualiteDetail = () => {
  const { id } = useParams();
 const articles = [
    {
      id: 1,
      titre: "L'élevage bio de poulet fermier",
      image: volaille,
      contenu: `
        Découvrez les secrets d'un élevage de poulets fermiers respectueux du bien-être animal.
        Les éleveurs travaillent en harmonie avec la nature et privilégient une alimentation saine.
        Ce mode d'élevage permet d’obtenir une viande savoureuse et naturelle, tout en protégeant l’environnement.
      `,
      auteur: "Marie Dubois",
      date: "15 Oct 2025",
    },
    {
      id: 2,
      titre: "Le bœuf de race Charolaise",
      image: boeuf,
      contenu: `
        Le bœuf Charolais est une fierté française reconnue pour sa qualité exceptionnelle.
        Les éleveurs privilégient un élevage extensif dans le respect du bien-être animal.
        Cette viande tendre et goûteuse séduit les amateurs de gastronomie traditionnelle.
      `,
      auteur: "Pierre Lefèvre",
      date: "16 Oct 2025",
    },
    {
      id: 3,
      titre: "Nouvelle récolte de légumes",
      image: legume,
      contenu: `
        Nos producteurs viennent de récolter une nouvelle variété de légumes bio, riches en saveurs et en couleurs.
        Carottes, choux, tomates et pommes de terre arrivent directement du champ à votre table.
        Des produits sains, frais et locaux pour une alimentation équilibrée et responsable.
      `,
      auteur: "Claire Martin",
      date: "17 Oct 2025",
    },
  ];

  const article = articles.find(a => a.id === parseInt(id));

  if (!article) {
    return <p>Article introuvable.</p>;
  }

  return (
    <section className="actualite-detail">
      <h1>{article.titre}</h1>
      <p className="article-meta">Par {article.auteur} — {article.date}</p>
      <img src={article.image} alt={article.titre} className="article-image" />
      <div className="article-contenu">
        {article.contenu.split("\n").map((para, i) => (
          <p key={i}>{para.trim()}</p>
        ))}
      </div>
    </section>
    
  );
};

export default ActualiteDetail;
