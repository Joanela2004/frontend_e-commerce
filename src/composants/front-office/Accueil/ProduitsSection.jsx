
import React, { useEffect, useState, useContext } from "react";
import { FaWeightHanging, FaTag } from "react-icons/fa";
import panierIcon from "../../../assets/icones/panier.png";
import "../../../styles/front-office/Accueil/produitSection.css";
import PaginationProduits from "./PaginationProduits";
import { fetchProduits } from "../../../services/produitService";
import { CartContext } from "../../../contexts/CartContext";
import ModalAvertissement from "../Panier/ModalAvertissement";

const ProduitsSection = ({ categorieActive, showHeader = true }) => {
  const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
  const [produits, setProduits] = useState([]);
  const [page, setPage] = useState(1);
  const produitsParPage = 8;
  const [errorModalData, setErrorModalData] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL ;

  useEffect(() => {
    const loadProduits = async () => {
      try {
        const data = await fetchProduits();
        setProduits(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur récupération produits :", err);
        setProduits([]);
      }
    };
    loadProduits();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [categorieActive]);

  const produitsFiltre = categorieActive
    ? produits.filter((p) => p.numCategorie === categorieActive)
    : produits;

  const indexDepart = (page - 1) * produitsParPage;
  const produitsAffiches = produitsFiltre.slice(indexDepart, indexDepart + produitsParPage);

const calculatePromotionalPrice = (prix, promotion) => {
    if (!promotion) return null;

    const maintenant = new Date();
    const debut = new Date(promotion.dateDebut);
    const fin = new Date(promotion.dateFin);

    const estActive =
      promotion.statutPromotion === true &&  
      debut <= maintenant &&
      fin >= maintenant;

    if (!estActive) return null;

    if (promotion.typePromotion === "Pourcentage") {
      return Math.round(prix * (1 - promotion.valeur / 100));
    }
    return Math.max(0, prix - promotion.valeur);
  };
  const handleAddToCart = (produit) => {
    const existingItem = cartItems.find((item) => item.nom === produit.nomProduit);
    const increment = 1;

    if (existingItem) {
      const nextPoids = existingItem.poids + increment;
      if (nextPoids > existingItem.poidsDisponible) {
        setErrorModalData({ nom: existingItem.nom, maxPoids: existingItem.poidsDisponible });
        setShowErrorModal(true);
        return;
      }
      updateQuantity(existingItem.id, nextPoids);
    } else {
      const poidsDispo = Number(produit.poids);
      if (increment > poidsDispo) {
        setErrorModalData({ nom: produit.nomProduit, maxPoids: poidsDispo });
        setShowErrorModal(true);
        return;
      }
      addToCart({
        numProduit: produit.numProduit,
        nom: produit.nomProduit,
        prixPerKg: Number(produit.prix) || 0,
        image: produit.image ? `${IMAGE_BASE_URL}${produit.image}` : "/placeholder.png",
        nomCategorie: produit.categorie?.nomCategorie,
        poids: increment,
        poidsDisponible: poidsDispo,
        id: produit.numProduit,
      });
    }
  };

  return (
    <section className="produits-section">
      {showHeader && (
        <div className="produits-header">
          <h3>Nos produits </h3>
          <p>
            « Nous mettons un point d’honneur à vous offrir des produits d’une fraîcheur irréprochable.
            Légumes, viandes ou volailles : tout provient de producteurs locaux et est préparé le jour même
            pour garantir un goût authentique et naturel. »
          </p>
        </div>
      )}

      <div className="produits-grid">
        {produitsAffiches.length > 0 ? (
          produitsAffiches.map((produit) => {
         const promo = produit.promotion;
            const prixPromo = calculatePromotionalPrice(produit.prix, promo);
            const hasPromo = prixPromo !== null && prixPromo < produit.prix;
            const inCart = cartItems.some((item) => item.nom === produit.nomProduit);
            const cartItem = cartItems.find((item) => item.nom === produit.nomProduit);

            return (
              <div key={produit.numProduit} className="produit-card back-office-card">
                
                {hasPromo && (
                  <span className="badge-promo">
                    -{produit.promotion.valeur}
                    {produit.promotion.typePromotion === "Pourcentage" ? "%" : " Ar"}
                  </span>
                )}

              
                <div className="produit-image">
                  <img
                    src={produit.image ? `${IMAGE_BASE_URL}${produit.image}` : "/placeholder.png"}
                    alt={produit.nomProduit}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </div>

               
                <div className="produit-body">
                  <h3 className="produit-title">{produit.nomProduit}</h3>

                  {produit.categorie && (
                    <span className="produit-categorie">
                      <FaTag /> {produit.categorie.nomCategorie}
                    </span>
                  )}

                  <div className="produit-prix-poids">
                    <div className="prix-container">
                      {hasPromo ? (
                        <>
                          <span className="ancien-prix">{Number(produit.prix).toLocaleString()} Ar</span>
                          <span className="nouveau-prix">{prixPromo.toLocaleString()} Ar</span>
                        </>
                      ) : (
                        <span className="prix-normal">{Number(produit.prix).toLocaleString()} Ar</span>
                      )}
                    </div>

                    <div className="poids-disponible">
                      <FaWeightHanging />
                      <strong>{produit.poids} kg</strong>
                    </div>
                  </div>

                  
                  <div className="panier-actions">
                    {inCart ? (
                      <div className="quantity-control">
                        <button
                          onClick={() => cartItem.poids > 1 && updateQuantity(cartItem.id, cartItem.poids - 1)}
                          className="btn-moins"
                        >
                          −
                        </button>
                        <span className="quantity">{cartItem.poids}</span>
                        <button onClick={() => handleAddToCart(produit)} className="btn-plus">
                          +
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleAddToCart(produit)} className="btn-add-cart">
                        <img src={panierIcon} alt="Ajouter" />
                        Ajouter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-products">
            <p>Aucun produit disponible pour le moment</p>
          </div>
        )}
      </div>

      <div className="pagination-container">
        <PaginationProduits
          totalProduits={produitsFiltre.length}
          produitsParPage={produitsParPage}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>

      {showErrorModal && errorModalData && (
        <ModalAvertissement
          show={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          nom={errorModalData.nom}
          maxPoids={errorModalData.maxPoids}
        />
      )}
    </section>
  );
};

export default ProduitsSection;