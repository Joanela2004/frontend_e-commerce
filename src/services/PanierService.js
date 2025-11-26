import api from "./api";
import { createContext } from 'react'; // Ajouté pour éviter l'erreur de référence

const PANIER_URL = "/panier";
const USER_TOKEN_KEY = 'userToken'; 
const LOCAL_CART_KEY = 'localCart';

// Pour éviter les erreurs de référence dans un service, même si CartContext n'est pas utilisé ici
const CartContext = createContext();

const getConfig = (isFormData = false) => {
    const token = localStorage.getItem(USER_TOKEN_KEY);
    if (!token) throw new Error("Utilisateur non authentifié");

    const headers = { Authorization: `Bearer ${token}` };
    if (isFormData) headers["Content-Type"] = "multipart/form-data";

    return { headers };
};

// Récupère le panier local
const getLocalCart = () => {
    const cartData = localStorage.getItem(LOCAL_CART_KEY);
    try {
        // Le panier local stocke maintenant l'objet produit complet
        return cartData ? JSON.parse(cartData) : [];
    } catch (e) {
        return [];
    }
};

const saveLocalCart = (cart) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
};

const isAuthenticated = () => {
    return localStorage.getItem(USER_TOKEN_KEY) !== null;
};

export const fetchPanier = async () => {
    if (isAuthenticated()) {
        try {
            // Utilisateur connecté: Appel à l'API (BDD)
            const response = await api.get(PANIER_URL, getConfig());
             console.log("Réponse API Panier:", response.data);
            return response.data;
        } catch (error) {
            console.error("Erreur fetchPanier (API):", error.response?.data || error.message);
            throw error;
        }
    } else {
        // Utilisateur déconnecté: Lecture du localStorage (qui contient maintenant les détails riches)
        return getLocalCart();
    }
};

// Ajouter un produit (BDD ou LOCAL)
// L'objet 'produit' doit contenir à la fois les données pour l'API (numProduit, poids) 
// et les données riches du produit (nom, prix, image, etc.) pour le local.
export const addProduitPanier = async (produit) => {
    // produit doit être de la forme: 
    // { numProduit: X, poids: Y, produit: {...détails riches...}, cuttingOption: Z, prixApresDecoupe: P }
    
    if (isAuthenticated()) {
        // Utilisateur connecté: Appel à l'API (BDD)
        try {
            // L'API a seulement besoin de numProduit et poids/découpe
            const apiPayload = { 
                numProduit: produit.numProduit, 
                poids: produit.poids,
                // Assurez-vous d'inclure les options de découpe si elles existent pour l'API
                decoupe: produit.cuttingOption || null, 
            };
            const response = await api.post(PANIER_URL, apiPayload, getConfig());
            return response.data;
        } catch (error) {
            console.error("Erreur addProduitPanier (API):", error.response?.data || error.message);
            throw error;
        }
    } else {

        const cart = getLocalCart();
        // Dans le panier local, numProduit est l'identifiant unique
        const existingItem = cart.find(item => item.numProduit === produit.numProduit);
        
        if (existingItem) {
            existingItem.poids = parseFloat(existingItem.poids) + produit.poids;
            // Ne pas oublier de mettre à jour d'autres champs si besoin (ex: decoupe)
            if(produit.cuttingOption) existingItem.decoupe = produit.cuttingOption;
        } else {
            // ⭐️ CORRECTION CRUCIALE : On stocke l'objet complet
            // y compris les détails riches du produit (produit.produit)
            const newItemForLocalStorage = {
                id: produit.id || produit.numProduit,
  numProduit: produit.numProduit,
  nom: produit.nomProduit,
  poids: produit.poids,
  prixPerKg: produit.prixPerKg,
  prixApresDecoupe: produit.prixApresDecoupe || produit.prixPerKg,
  cuttingOption: produit.cuttingOption,
  image: produit.image,
  nomCategorie: produit.nomCategorie,
  poidsDisponible: produit.poidsDisponible            };
            cart.push(newItemForLocalStorage);
        }
        
        saveLocalCart(cart);
        console.log("Données brutes stockées dans localStorage (enrichies):", cart);
        
        // Retourne le panier local mis à jour
        return cart; 
    }
};

export const updateProduitPanier = async (id, produit) => {
    // Note: 'id' est le numDetailPanier pour l'API, ou numProduit pour le local
    if (isAuthenticated()) {
        // Utilisateur connecté: Appel à l'API (BDD)
        try {
            const response = await api.put(`${PANIER_URL}/${id}`, produit, getConfig());
            return response.data;
        } catch (error) {
            console.error("Erreur updateProduitPanier (API):", error.response?.data || error.message);
            throw error;
        }
    } else {
         // Utilisateur déconnecté: Sauvegarde dans localStorage
         const cart = getLocalCart();
         const index = cart.findIndex(item => item.numProduit === id); // 'id' est ici numProduit
         
         if (index !== -1) {
             // Mise à jour du poids seulement (les autres détails sont déjà présents)
             cart[index].poids = produit.poids; 
             saveLocalCart(cart);
             return cart[index];
         }
         throw new Error("Produit non trouvé dans le panier local pour la mise à jour.");
    }
};
// Supprimer un produit du panier
export const removeProduitPanier = async (id) => {
    // Note: 'id' est le numDetailPanier pour l'API, ou numProduit pour le local
    if (isAuthenticated()) {
        // Utilisateur connecté: Appel à l'API (BDD)
        try {
            const response = await api.delete(`${PANIER_URL}/${id}`, getConfig());
            return response.data;
        } catch (error) {
            console.error("Erreur removeProduitPanier (API):", error.response?.data || error.message);
            throw error;
        }
    } else {
        // Utilisateur déconnecté: Suppression dans localStorage
        let cart = getLocalCart();
        const initialLength = cart.length;
        cart = cart.filter(item => item.numProduit !== id); // 'id' est ici numProduit
        
        if (cart.length < initialLength) {
            saveLocalCart(cart);
            return { message: 'Produit retiré du panier local' };
        }
        throw new Error("Produit non trouvé dans le panier local pour la suppression.");
    }
};

// Vider le panier entier
// NOTE: Cette fonction n'est pas gérée pour le mode déconnecté.
export const clearPanier = async () => {
    if (isAuthenticated()) {
        try {
            const response = await api.delete(PANIER_URL, getConfig());
            return response.data;
        } catch (error) {
            console.error("Erreur clearPanier:", error.response?.data || error.message);
            throw error;
        }
    } else {
        // Vider le panier local si déconnecté
        saveLocalCart([]);
        return { message: 'Panier local vidé' };
    }
};

// Exportation des fonctions utilitaires pour usage externe si nécessaire
export { getLocalCart, saveLocalCart, isAuthenticated, CartContext };