import React, { useState, useEffect } from "react";
import { appliquerPromotionAutomatique } from "../../../services/promotionService";
import "../../../styles/front-office/Accueil/HeroSection.css";
import "../../../styles/front-office/global.css";
import viandeImage from '../../../assets/images/market-Photoroom.png';
import { useNavigate } from "react-router-dom";
export default function HeroSection() {
  const [promoActive, setPromoActive] = useState(null);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
 useEffect(() => {
  const checkPromoAuto = async () => {
    try {
      const result = await appliquerPromotionAutomatique(10000); // montant fictif OK
      if (result && result.promotion && result.promotion.statut === "active") {
        setPromoActive(result.promotion);
      }
    } catch (err) {
      console.error("Erreur promo auto :", err);
    } finally {
      setLoading(false);
    }
  };
  checkPromoAuto();
}, []);
  const handleVoirProduits = () => {
    navigate("/produit");
  };

  return (
    <>
      {promoActive && !loading && (
        <div className="promo-banner">
          <div className="promo-content">
            <span className="fire">PROMOTION EXCLUSIVE</span>
            <strong>
              {promoActive.typePromotion === "Pourcentage"
                ? `${promoActive.valeur}% de réduction`
                : `${Number(promoActive.valeur).toLocaleString()} Ar offerts`}
            </strong>
            <span className="promo-name"> — {promoActive.nomPromotion.toUpperCase()} — </span>
            {promoActive.montantMinimum > 0 && (
              <span className="min-amount">
                Dès {promoActive.montantMinimum.toLocaleString()} Ar d'achat
              </span>
            )}
          </div>
        </div>
      )}

      {/* HERO CLASSIQUE */}
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
            style={{ cursor: "pointer",width:"175px" }} 
          >
            Voir les produits
          </button>
                </div>
        <div className="hero-image">
          <img src={viandeImage} alt="paniers" className="image" />
        </div>
      </section>
    </>
  );
}