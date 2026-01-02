import React, { useState, useEffect, useContext } from "react";
import { CartContext } from "../../contexts/CartContext";
import { fetchPromotionsAutomatiquesActives } from "../../services/promotionService";
import "../../styles/front-office/Accueil/HeroSection.css";

const PromoBanner = () => {
  const [promoActive, setPromoActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const { totalAmount = 0 } = useContext(CartContext);

  useEffect(() => {
    const chargerPromoActive = async () => {
      try {
        const promo = await fetchPromotionsAutomatiquesActives();

        if (promo) {
          const minimum = promo.montantMinimum || 0;
          const estApplicable = totalAmount >= minimum;
          const montantManquant = estApplicable ? 0 : minimum - totalAmount;

          setPromoActive({
            ...promo,
            estApplicable,
            montantManquant: montantManquant > 0 ? montantManquant : 0,
          });
        }
      } catch (err) {
        console.error("Erreur chargement bannière promo :", err);
      } finally {
        setLoading(false);
      }
    };

    chargerPromoActive();
  }, [totalAmount]);
  if (loading || !promoActive) return null;

  const {
    nomPromotion,
    typePromotion,
    valeur,
    montantMinimum,
    estApplicable,
    montantManquant,
  } = promoActive;

  return (
    <div className={`promo-banner ${estApplicable ? "applicable" : "encourage"}`}>
      <div className="promo-content">
             <span className="promo-name">
          {" — " + nomPromotion.toUpperCase() + " — "}
        </span>
              <strong>
          {typePromotion === "Pourcentage"
            ? `${valeur}% de réduction`
            : `${Number(valeur).toLocaleString("fr-FR")} Ar offerts`}
        </strong>

       

        {montantMinimum > 0 && (
          <span className="min-amount">
            {estApplicable ? (
              <>Réduction appliquée automatiquement !</>
            ) : (
              <>
                Plus de {" "}
                <strong>{montantManquant.toLocaleString("fr-FR")} Ar</strong>{" "}
                pour en profiter !
              </>
            )}
          </span>
        )}

        <span className="blink">Valable maintenant !</span>
      </div>

      <style jsx>{`
        .promo-banner {
          background: linear-gradient(90deg, #c62828, #f44336);
          color: white;
          text-align: center;
          padding: 14px 20px;
          font-size: 1.15rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .promo-banner.encourage {
          background:  #5ebb82;
        }

        .promo-content {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }

        .fire {
          font-weight: bold;
          animation: pulse 2s infinite;
        }

        .promo-name {
          font-style: italic;
          font-weight: bold;
        }

        .min-amount {
          background: rgba(0, 0, 0, 0.3);
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 1rem;
        }

        .blink {
          animation: blink 1.8s infinite;
          font-weight: bold;
          color: #8B5E3C;
          margin-left: 10px;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @media (max-width: 768px) {
          .promo-content {
            flex-direction: column;
            gap: 8px;
          }
          .promo-banner {
            font-size: 1rem;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default PromoBanner;