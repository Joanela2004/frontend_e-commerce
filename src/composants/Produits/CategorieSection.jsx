import React, { useState } from "react";
import ProduitsSection from "../Accueil/ProduitsSection";
import { FaSearch, FaFilter } from "react-icons/fa";
import "../../styles/front-office/Produits/categorieSection.css";
import "../../styles/front-office/Produits/heroSection.css";
import "../../styles/front-office/global.css";

const categories = [
  { id: 1, nomCategorie: "Légumes" },
  { id: 2, nomCategorie: "Viandes" },
];

const CategorieSection = () => {
  const [categorieActive, setCategorieActive] = useState(null);
  const [recherche, setRecherche] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Recherche :", recherche);
  };

  return (
    <section className="heroProduit">
      <div className="heroProduit-header">
        <h2 className="heroProduit-header-text">
          Découvrez nos produits agricoles et viandes fraîches, cultivés et
          élevés avec passion, pour une alimentation saine et naturelle.
        </h2>
 </div>
 <div className="heroProduit-middle">
        <form className="heroProduit-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Rechercher un produit"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <button type="submit">
            <FaSearch className="heroProduit-search" />
          </button>
        </form>
     

      <div className="categorie-menu">
         <div className="categorie-filter">
            <FaFilter size={24}  />
          </div>
          <p>Catégories :</p>
        <ul>
          <li>
            <button
              onClick={() => setCategorieActive(null)}
              className={`categorie-btn ${
                categorieActive === null ? "active" : ""
              }`}
            >
              Tous les produits
            </button>
          </li>

          {categories.map((categorie) => (
            <li key={categorie.id}>
              <button
                onClick={() => setCategorieActive(categorie.id)}
                className={`categorie-btn ${
                  categorieActive === categorie.id ? "active" : ""
                }`}
              >
                {categorie.nomCategorie}
              </button>
            </li>
          ))}
        </ul>
      </div>
</div>
      <ProduitsSection
        categorieActive={categorieActive}
        recherche={recherche}
        showHeader={false}
      />
    </section>
  );
};

export default CategorieSection;
