// services/panierService.js
import api from "./api";

const USER_TOKEN_KEY = 'userToken';
const LOCAL_CART_KEY = 'localCart';

const getLocalCart = () => {
  const cartData = localStorage.getItem(LOCAL_CART_KEY);
  try {
    return cartData ? JSON.parse(cartData) : [];
  } catch (e) {
    console.error("Erreur parsing panier local", e);
    return [];
  }
};

const saveLocalCart = (cart) => {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
};

const isAuthenticated = () => {
  return !!localStorage.getItem(USER_TOKEN_KEY);
};

export const addProduitPanier = async (produit) => {
  if (isAuthenticated()) {
    
    const payload = {
      numProduit: produit.numProduit,
      poids: produit.poids,
      decoupe: produit.cuttingOption || null,
    };
    const res = await api.post("/panier", payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem(USER_TOKEN_KEY)}` }
    });
    return res.data;
  } else {
    // Déconnecté → localStorage (TOUT sauvegardé)
    const cart = getLocalCart();
    const existing = cart.find(item => item.numProduit === produit.numProduit);

    if (existing) {
      existing.poids = Number(existing.poids) + Number(produit.poids);
      if (produit.cuttingOption) {
        existing.cuttingOption = produit.cuttingOption;
        existing.prixApresDecoupe = produit.prixApresDecoupe;
      }
    } else {
      cart.push({
        id: Date.now() + Math.random(),
        numProduit: produit.numProduit,
        nom: produit.nomProduit || produit.nom,
        image: produit.image,
        prixPerKg: Number(produit.prix),
        prixApresDecoupe: produit.prixApresDecoupe || Number(produit.prix),
        poids: Number(produit.poids),
        cuttingOption: produit.cuttingOption || "entier",
        nomCategorie: produit.nomCategorie,
        poidsMax: produit.poids || Infinity,
      });
    }

    saveLocalCart(cart);
    return cart;
  }
};

export const removeProduitPanier = async (idOrNumProduit) => {
  if (isAuthenticated()) {
    await api.delete(`/panier/${idOrNumProduit}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(USER_TOKEN_KEY)}` }
    });
  } else {
    let cart = getLocalCart();
    cart = cart.filter(item => item.numProduit !== idOrNumProduit);
    saveLocalCart(cart);
  }
};

export const clearPanier = () => {
  if (!isAuthenticated()) {
    localStorage.removeItem(LOCAL_CART_KEY);
  }
  // Si connecté → l'API videra le panier au moment de la commande
};

export const getLocalCartForMerge = () => getLocalCart();