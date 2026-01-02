import React, { useContext, useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaSync,
  FaTag,
  FaWeightHanging,
} from "react-icons/fa";

import { fetchProduits } from "../../../services/produitService";
import { getCategories } from "../../../services/categorieService";
import panierIcon from "../../../assets/icones/panier.png";
import { CartContext } from "../../../contexts/CartContext";
import ModalAvertissement from "../Panier/ModalAvertissement";
import { useToast } from "../../../contexts/ToastContext";
import PaginationProduits from "../../../composants/front-office/Accueil/PaginationProduits";

import "../../../styles/front-office/Accueil/produitSection.css";
import "../../../styles/back-office/produit.css";
import "../../../styles/front-office/Produits/categorieSection.css";
import "../../../styles/front-office/global.css";
import "../../../styles/back-office/global.css";
import "../../../styles/front-office/Produits/heroSection.css";

const CategorieSection = () => {
  // États
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtreCategorie, setFiltreCategorie] = useState("tous");
  const [filtrePromotion, setFiltrePromotion] = useState("tous");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pagination & panier
  const [page, setPage] = useState(1);
  const [errorModalData, setErrorModalData] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const produitsParPage = 8;
  const IMAGE_BASE_URL =
    import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8000";

  const { cartItems, addToCart, updateQuantity } = useContext(CartContext);
  const { showToast } = useToast();

  // Chargement des données
  useEffect(() => {
    const chargerDonnees = async () => {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          fetchProduits(),
          getCategories(),
        ]);

        const produitsRecus = Array.isArray(prods.data) ? prods.data : prods;
        const categoriesRecues = Array.isArray(cats.data) ? cats.data : cats;

        setProduits(produitsRecus || []);
        setCategories(categoriesRecues.filter((c) => !c.deleted_at) || []);
      } catch (err) {
        console.error(err);
        showToast("error", "Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    };
    chargerDonnees();
  }, [showToast]);
useEffect(() => {
    setPage(1);
  }, [searchTerm, filtreCategorie, filtrePromotion]);

  const aUnePromotionActive = (produit) => {
    if (!produit?.promotion) return false;
    const maintenant = new Date();
    const debut = new Date(produit.promotion.dateDebut);
    const fin = new Date(produit.promotion.dateFin);
    return (
      produit.promotion.statutPromotion === true &&
      debut <= maintenant &&
      fin >= maintenant
    );
  };

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
        setErrorModalData({ nom: produit.nomProduit, maxPoids: poidsDispo });
        setShowErrorModal(true);
        return;
      }
      addToCart({
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
      });
    }
  };

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltreCategorie("tous");
    setFiltrePromotion("tous");
    setShowAdvancedFilters(false);
  };

  const filteredProduits = produits.filter((p) => {
    if (!p) return false;

    const matchSearch =
      searchTerm.trim() === "" ||
      p.nomProduit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categorie?.nomCategorie?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategorie =
      filtreCategorie === "tous" ||
      p.numCategorie === Number(filtreCategorie);

    const matchPromotion =
      filtrePromotion === "tous" ||
      (filtrePromotion === "avec" && aUnePromotionActive(p)) ||
      (filtrePromotion === "sans" && !aUnePromotionActive(p));

    return matchSearch && matchCategorie && matchPromotion;
  });

  // Pagination
  const indexDepart = (page - 1) * produitsParPage;
  const produitsAffiches = filteredProduits.slice(
    indexDepart,
    indexDepart + produitsParPage
  );

 

  return (
    <section >
    

      {/* Barre de recherche */}
      <div className="heroProduit-middle">
      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458" }} />
          <input
            type="text"
            placeholder="Rechercher par nom ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`filter-toggle ${showAdvancedFilters ? "active" : ""}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={{ border:"none", display:"flex", alignItems:"center", background:"white", color:"#28a458", paddingRight:"10px"}}
          >
            <FaFilter />
          </button>

          {(searchTerm || filtreCategorie !== "tous" || filtrePromotion !== "tous") && (
            <FaSync
              style={{ marginLeft: "8px", cursor: "pointer", color: "#28a458" }}
              onClick={reinitialiserFiltres}
            />
          )}
        </div>
      </div>
     

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="filters-container"   >
          <div className="filters-row">
            <div className="filter-group" >
              <label>Catégorie</label>
              <select
                value={filtreCategorie}
                onChange={(e) => setFiltreCategorie(e.target.value)}
              
              >
                <option value="tous">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.numCategorie} value={cat.numCategorie}>
                    {cat.nomCategorie}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <FaTag style={{ marginRight: "6px" }} />
                Promotion
              </label>
              <select
                value={filtrePromotion}
                onChange={(e) => setFiltrePromotion(e.target.value)}
              >
                <option value="tous">Toutes</option>
                <option value="avec">En promotion</option>
                <option value="sans">Sans promotion</option>
              </select>
            </div>
          </div>
        </div>
      )}
 </div>
      {/* Grille des produits */}
      <div className="produits-section">
        <div className="produits-grid ">
          {produitsAffiches.length > 0 ? (
            produitsAffiches.map((produit) => {
              const promo = produit.promotion;
              const prixPromo = calculatePromotionalPrice(produit.prix, promo);
              const hasPromo = prixPromo !== null && prixPromo < produit.prix;

              const inCart = cartItems.some(
                (item) => item.nom === produit.nomProduit
              );
              const cartItem = cartItems.find(
                (item) => item.nom === produit.nomProduit
              );

              return (
                <div
                  key={produit.numProduit}
                  className="produit-card back-office-card"
                >
                  {hasPromo && (
                    <span className="badge-promo">
                      -{promo.valeur}
                      {promo.typePromotion === "Pourcentage" ? "%" : " Ar"}
                    </span>
                  )}

                  <div className="produit-image">
                    <img
                      src={
                        produit.image
                          ? `${IMAGE_BASE_URL}${produit.image}`
                          : "/placeholder.png"
                      }
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
                            <span className="ancien-prix">
                              {Number(produit.prix).toLocaleString()} Ar
                            </span>
                            <span className="nouveau-prix">
                              {prixPromo.toLocaleString()} Ar
                            </span>
                          </>
                        ) : (
                          <span className="prix-normal">
                            {Number(produit.prix).toLocaleString()} Ar
                          </span>
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
                            onClick={() =>
                              cartItem.poids > 1 &&
                              updateQuantity(cartItem.id, cartItem.poids - 1)
                            }
                            className="btn-moins"
                          >
                            −
                          </button>
                          <span className="quantity">{cartItem.poids}</span>
                          <button
                            onClick={() => handleAddToCart(produit)}
                            className="btn-plus"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(produit)}
                          className="btn-add-cart"
                        >
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
              <p>Aucun produit disponible pour ces critères</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredProduits.length > produitsParPage && (
          <div className="pagination-container">
            <PaginationProduits
              totalProduits={filteredProduits.length}
              produitsParPage={produitsParPage}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modal erreur stock */}
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

export default CategorieSection;