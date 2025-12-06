// Fichier : ProduitsSection.jsx (Front-office)
import React, { useEffect, useState, useContext } from "react";
import { FaWeightHanging, FaTag } from "react-icons/fa";
import panierIcon from "../../../assets/icones/panier.png";
import "../../../styles/front-office/global.css";
import "../../../styles/front-office/Accueil/produitSection.css";
import PaginationProduits from "./PaginationProduits";
import { fetchProduits } from "../../../services/produitService";
import { CartContext } from "../../../contexts/CartContext";
import ModalAvertissement from "../Panier/ModalAvertissement";
import "../../../styles/back-office/tableau.css";
const ProduitsSection = ({ categorieActive, showHeader = true }) => {
  const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
  const [produits, setProduits] = useState([]);
  const [page, setPage] = useState(1);
  const produitsParPage = 8;
  const [errorModalData, setErrorModalData] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8000";

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
    if (promotion.typePromotion === "Pourcentage") {
      return Math.round(prix * (1 - promotion.valeur / 100));
    }
    return prix - promotion.valeur;
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
    <section className="produit-section">
      {showHeader && (
        <div className="produit-header">
          <h3>Nos produits frais</h3>
          <p>« Nous mettons un point d’honneur à vous offrir des produits d’une fraîcheur irréprochable. légumes, viandes ou volailles : tout provient de producteurs locaux et est préparé le jour même pour garantir un goût authentique et naturel. »</p>
        </div>
      )}

      <div className="products-grid-container" style={{height:"400px"}}>
        {produitsAffiches.length > 0 ? (
          produitsAffiches.map((produit) => {
            const hasPromo = produit.promotion && produit.promotion.valeur;
            const prixPromo = hasPromo ? calculatePromotionalPrice(produit.prix, produit.promotion) : null;
            const inCart = cartItems.some((item) => item.nom === produit.nomProduit);
            const cartItem = cartItems.find((item) => item.nom === produit.nomProduit);
            return (
              <div key={produit.numProduit} className="card">
                {/* Badge promotion */}
                {hasPromo && (
                  <span className="badge-promo">
                    -{produit.promotion.valeur}
                    {produit.promotion.typePromotion === "Pourcentage" ? "%" : " Ar"}
                  </span>
                )}

                {/* Image */}
                <div className="image-container">
                  <img
                    src={produit.image ? `${IMAGE_BASE_URL}${produit.image}` : "/placeholder.png"}
                    alt={produit.nomProduit}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                </div>

                {/* Contenu */}
                <div className="card-body">
                  <h3 className="product-title">{produit.nomProduit}</h3>
                  {produit.categorie && (
                    <span className="product-category">
                      <FaTag style={{ fontSize: "0.8rem", marginRight: "5px" }} />
                      {produit.categorie.nomCategorie}
                    </span>
                  )}

                  <div className="prix-poids">
                    {/* Prix */}
                    <div>
                      {hasPromo ? (
                        <div style={{display:"flex",flexDirection:"column"}}>
                          <div style={{ textDecoration: "line-through", color: "#888", fontSize: "0.9rem" }}>
                            {Number(produit.prix).toLocaleString()} Ar
                          </div>
                          <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#dc3545" }}>
                            {prixPromo.toLocaleString()} Ar
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#28a458" }}>
                          {Number(produit.prix).toLocaleString()} Ar
                        </div>
                      )}
                    </div>

                    {/* Poids disponible */}
                    <div style={{ marginLeft:"60px",textAlign: "right", color: "#8b5e3c" }}>
                      <FaWeightHanging style={{ color:"#8b5e3c",marginRight: "6px" }} />
                      <strong>{produit.poids} kg</strong> 
                    </div>
                  </div>

                  {/* Bouton panier */}
                  <div className="btn" style={{backgroundColor:"white",marginTop:"40px"}} >
                    {inCart ? (
                      <div className="quantite-control-group" >
                        <button onClick={() => cartItem.poids > 1 && updateQuantity(cartItem.id, cartItem.poids - 1)} className="quantity-btn">
                          −
                        </button>
                        <span className="quantity">{cartItem.poids} </span>
                        <button onClick={() => handleAddToCart(produit)} className="quantity-btn">
                          +
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleAddToCart(produit)} className="add-to-cart-btn" style={{ backgroundColor:"transparent",border:"none" }}>
                        <img src={panierIcon} alt="Ajouter au panier" style={{ width: "20px", marginRight: "8px" }} />
                       
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "1.2rem", color: "#666" }}>Aucun produit disponible pour le moment</p>
          </div>
        )}
      </div>

      <PaginationProduits
        totalProduits={produitsFiltre.length}
        produitsParPage={produitsParPage}
        currentPage={page}
        onPageChange={setPage}
      />

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