
import React, { useState, useEffect } from "react";
import { appliquerPromotionAutomatique } from "../../services/promotionService";
import "../../styles/front-office/Accueil/HeroSection.css";

const PromoBanner = () => {
  const [promoActive, setPromoActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPromoAuto = async () => {
      try {
        const result = await appliquerPromotionAutomatique(15000); // ou montant panier réel plus tard
        if (result && result.promotion) {
          const promo = result.promotion;
          const maintenant = new Date();
          const debut = new Date(promo.dateDebut);
          const fin = new Date(promo.dateFin);

          const estActive =
            promo.statutPromotion === true &&
            promo.automatique === true &&
            debut <= maintenant &&
            fin >= maintenant;

          if (estActive) {
            setPromoActive(promo);
          }
        }
      } catch (err) {
        console.log("Pas de promo auto active pour le moment");
      } finally {
        setLoading(false);
      }
    };

    checkPromoAuto();
  }, []);

  // Ne rien afficher si pas de promo ou en cours de chargement
  if (loading || !promoActive) return null;

  return (
    <div className="promo-banner">
      <div className="promo-content">
        <span className="fire">PROMOTION EXCLUSIVE</span>
        <strong>
          {promoActive.typePromotion === "Pourcentage"
            ? `${promoActive.valeur}% de réduction`
            : `${Number(promoActive.valeur).toLocaleString()} Ar offerts`}
        </strong>
        <span className="promo-name">
          {" — " + promoActive.nomPromotion.toUpperCase() + " — "}
        </span>
        {promoActive.montantMinimum > 0 && (
          <span className="min-amount">
            Dès {Number(promoActive.montantMinimum).toLocaleString()} Ar d'achat
          </span>
        )}
        <span className="blink">Valable maintenant !</span>
      </div>

      <style jsx>{`
        .blink {
          animation: blink 1.5s infinite;
          font-weight: bold;
          color: #ff4444;
          margin-left: 10px;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default PromoBanner;