import React, { createContext, useState, useEffect } from "react";
import {
  fetchPanier,
  addProduitPanier,
  updateProduitPanier,
  removeProduitPanier,
  clearPanier
} from "../services/PanierService";

export const CartContext = createContext();

const getCartItemId = (item) => {
  return item.id || item.numDetailPanier || item.numProduit;
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ⭐️ DÉFINITION DE IMAGE_BASE_URL DANS LE CONTEXTE
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8000";

  const loadCart = async () => {
    setLoading(true);
    try {
      const data = await fetchPanier();
      let normalizedItems = [];

      console.log("Données brutes du panier:", data);

      if (Array.isArray(data)) {
        normalizedItems = data.map(item => {
          if (!item) return null;
          
          // Cas 1: Données complètes avec produit
          if (item.produit && item.produit.nomProduit) {
            return {
              id: item.numDetailPanier || item.numProduit,
              numProduit: item.numProduit,
              poids: Number(item.poids) || 0,
              prixPerKg: Number(item.produit.prix) || 0,
              prixApresDecoupe: Number(item.prixUnitaire || item.produit.prix) || 0,
              cuttingOption: item.decoupe || null,
              nom: item.produit.nomProduit,
              // ⭐️ MAINTENANT IMAGE_BASE_URL EST DÉFINIE
              image: item.produit.image ? 
                `${IMAGE_BASE_URL}${item.produit.image.startsWith('/') ? item.produit.image.substring(1) : item.produit.image}` 
                : '/placeholder.png',
              nomCategorie: item.produit.categorie?.nomCategorie || 'Non spécifié',
              poidsDisponible: Number(item.produit.poids) || 0
            };
          } 
          // Cas 2: Données minimales (seulement numProduit et poids)
          else if (item.numProduit) {
            return {
              id: item.numProduit,
              numProduit: item.numProduit,
              poids: Number(item.poids) || 0,
              prixPerKg: 0,
              prixApresDecoupe: 0,
              cuttingOption: null,
              nom: `Produit ${item.numProduit}`,
              image: '/placeholder.png',
              nomCategorie: 'Non spécifié',
              poidsDisponible: 0
            };
          }
          return null;
        }).filter(item => item !== null);
      } else {
        console.warn("Format de réponse inattendu:", data);
        normalizedItems = [];
      }

      console.log("Articles normalisés:", normalizedItems);
      setCartItems(normalizedItems);

    } catch (error) {
      console.error("Erreur de chargement du panier:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const addToCart = async (item) => {
    try {
      const payload = {
        numProduit: item.numProduit,
        poids: Number(item.poids || 1),
        cuttingOption: item.cuttingOption,
        coefficient: item.coefficient,
      };
      await addProduitPanier(payload);
      await loadCart();
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await removeProduitPanier(itemId);
      await loadCart();
    } catch (error) {
      console.error("Erreur lors de la suppression du panier:", error);
      throw error;
    }
  };

  const updateQuantity = async (id, newPoids, newCuttingOption, newPrixApresDecoupe) => {
    const item = cartItems.find(i => getCartItemId(i) === id);
    if (!item) return;

    try {
      const payload = {
        poids: newPoids,
        cuttingOption: newCuttingOption || item.cuttingOption,
        prixUnitaire: newPrixApresDecoupe,
      };
      await updateProduitPanier(id, payload);
      await loadCart();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await clearPanier();
      setCartItems([]);
    } catch (error) {
      console.error("Erreur lors du vidage du panier:", error);
      throw error;
    }
  };

  const totalWeight = cartItems.reduce(
    (sum, item) => sum + Number(item.poids || 0),
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) => total + (Number(item.prixApresDecoupe || item.prixPerKg || 0) * Number(item.poids)),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalWeight,
        subtotal,
        loading,
        loadCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};