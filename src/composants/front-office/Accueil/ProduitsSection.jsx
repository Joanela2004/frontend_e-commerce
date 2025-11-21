import React, { useEffect, useState, useContext } from "react";
import panierIcon from "../../../assets/icones/panier.png";
import "../../../styles/front-office/global.css";
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
  const [errorModalData, setErrorModalData] = useState(null); // { nom: 'Tomate', maxPoids: 10 }
  const [showErrorModal, setShowErrorModal] = useState(false);
  const IMAGE_BASE_URL =import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8000";

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
  const produitsAffiches = produitsFiltre.slice(
    indexDepart,
    indexDepart + produitsParPage
  );

  const handleAddToCart = (produit) => {
    const existingItem = cartItems.find(
      (item) => item.nom === produit.nomProduit
    );
    const increment = 1;

    if (existingItem) {
      const nextPoids = existingItem.poids + increment;
      if (nextPoids > existingItem.poidsDisponible) {
        setErrorModalData({
          nom: existingItem.nom,
          maxPoids: existingItem.poidsDisponible,
        });
        setShowErrorModal(true);
        return;
      }
      updateQuantity(existingItem.id, nextPoids);
    } else {
      const poidsDispo = Number(produit.poids);
      if (increment > poidsDispo) {
        setErrorModalData({
          nom: produit.nomProduit,
          maxPoids: poidsDispo,
        });

        setShowErrorModal(true);
        return;
      }
      const produitAjouter = {
        numProduit: produit.numProduit,
        nom: produit.nomProduit,
        prixPerKg: Number(produit.prix) || 0,
        image: produit.image
          ? `${IMAGE_BASE_URL}${produit.image}`
          : "/placeholder.png",
        nomCategorie: produit.categorie?.nomCategorie,
        poids: increment,
        poidsDisponible: poidsDispo,
        id: produit.numProduit,
      };
      addToCart(produitAjouter);
    }
  };

  return (
    <section className="produit-section">
      {showHeader && (
        <div className="produit-header">
          <h3>Nos produits</h3>
          <p>
            Découvrez nos produits frais et de qualité directement depuis nos
            champs et élevages
          </p>
        </div>
      )}

      <div className="produit-grid">
        {produitsAffiches.length > 0 ? (
          produitsAffiches.map((produit) => {
            const inCart = cartItems.some(
              (item) => item.nom === produit.nomProduit
            );
            const cartItem = cartItems.find(
              (item) => item.nom === produit.nomProduit
            );

            return (
              <div key={produit.numProduit} className="produit-card">
                {produit.promotion?.valeur && (
                  <span className="promo-cercle">
                    {produit.promotion.valeur}
                    {produit.promotion.typePromotion === "Pourcentage"
                      ? "%"
                      : "Ar"}
                  </span>
                )}

                <div className="produit-image-container">
                  <img
                    src={
                      produit.image
                        ? `${IMAGE_BASE_URL}${produit.image}`
                        : "/placeholder.png"
                    }
                    alt={produit.nomProduit || "Produit"}
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                </div>

                <div className="produit-text">
                  <h2>{produit.nomProduit}</h2>

                  <div className="produit-text-icon">
                    <p>{Number(produit.prix || 0).toLocaleString()} Ar/kg</p>

                    {inCart ? (
                      <div className="quantite-control-group">
                        <button
                          onClick={() => {
                            if (cartItem.poids > 1) {
                              updateQuantity(cartItem.id, cartItem.poids - 1);
                            }
                          }}
                          className="quantity-btn"
                        >
                          -
                        </button>

                        <h1 className="quantity">{cartItem.poids}</h1>

                        <button
                          onClick={() =>
                            updateQuantity(cartItem.id, cartItem.poids + 1)
                          }
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <a href="#"
                        onClick={() => handleAddToCart(produit)}
                        className="add-to-cart-btn"
                      >
                        <img
                          src={panierIcon}
                          className="header-icons"
                          alt="Panier"
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: "center", width: "100%" }}>
            Aucun produit disponible
          </p>
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
