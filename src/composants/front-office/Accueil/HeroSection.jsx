// HeroSection.jsx → Plus de promo ici !
import React from "react";
import "../../../styles/front-office/Accueil/HeroSection.css";
import "../../../styles/front-office/global.css";
import viandeImage from '../../../assets/images/market-Photoroom.png';
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  const handleVoirProduits = () => {
    navigate("/produit");
  };

  return (
    <section className="hero">
      <div className="hero-text">
        <h1>
          Arato Agri, votre partenaire en{" "}
          <span className="green">produits agricoles</span> et{" "}
          <span className="green">viande</span> saine
        </h1>
        <button
          className="btn"
          onClick={handleVoirProduits}
          style={{ cursor: "pointer", width: "175px" }}
        >
          Voir les produits
        </button>
      </div>
      <div className="hero-image">
        <img src={viandeImage} alt="Viande fraîche et produits agricoles" className="image" />
      </div>
    </section>
  );
}