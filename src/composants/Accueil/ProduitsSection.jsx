import React, { useState } from "react";
import carotte from "../../assets/images/carotte.png";
import tomate from "../../assets/images/tomate.png";
import chou from "../../assets/images/chou.png";
import pommeDeTerre from "../../assets/images/pommeDeTerre.png";
import viande from "../../assets/images/viandeImage.png";
import panier from "../../assets/icones/panier.png";
import "../../styles/front-office/global.css";
import "../../styles/front-office/Accueil/produitSection.css";

import PaginationProduits from './PaginationProduits';
const produits = [
  { id: 1, nom: "Carotte", prix: "500Ar/kg", image: carotte, promotion:{valeur:'-50%'}},
  { id: 2, nom: "Tomate", prix: "500Ar/kg", image: tomate },
  { id: 3, nom: "chou", prix: "500Ar/kg", image: chou },
  { id: 4, nom: "Pomme de Terre", prix: "500Ar/kg", image: pommeDeTerre ,promotion: { valeur: '-20%' },},
  { id: 5, nom: "Viande", prix: "500Ar/kg", image: viande ,promotion: { valeur: '-20%' },},
];
const ProduitsSection = () => {
const [page,setPage]=useState(1);
const produitsParPage=4;
const indexDepart =(page - 1) * produitsParPage;
const produitsAffiches = produits.slice(indexDepart,indexDepart + produitsParPage);
return (
    <section className="produit-section">
      <div className="produit-header">
      <h3>Nos produits</h3>
      <p>
        Découvrez nos produits frais et de qualité directement depuis nos champs
        et élévages
      </p>
      </div>
      <div className="produit-grid">
        {produitsAffiches.map((produit) => (
        
          <div key={produit.id} className="produit-card">
            {produit.promotion && produit.promotion.valeur && (<span className="promo-cercle">{produit.promotion.valeur}</span>)}
            
            <div className="produit-image-container">
            <img src={produit.image} alt={produit.nom}  />
            </div>
            <div className="produit-text">
            <h2>{produit.nom}</h2>
            <div className="produit-text-icon">
            <p>{produit.prix}</p>
           
            <a>
              <img src={panier} className="header-icons" />
            </a>
             </div>
             </div>
          </div>
          
          
        ))}

        
      </div>
      {/* Pagination */}
      <PaginationProduits totalProduits={produits.length}
      produitsParPage={produitsParPage}
      onPageChange={setPage}/>
    </section>
  );
};

export default ProduitsSection;
