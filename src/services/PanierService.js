import api from "./api";

const PANIER_URL = "/panier";
const USER_TOKEN_KEY = 'userToken'; 
const LOCAL_CART_KEY = 'localCart';

const getConfig = (isFormData = false) => {
    const token = localStorage.getItem(USER_TOKEN_KEY);
    if (!token) throw new Error("Utilisateur non authentifié");

    const headers = { Authorization: `Bearer ${token}` };
    if (isFormData) headers["Content-Type"] = "multipart/form-data";

    return { headers }; // Supprimé withCredentials: true si non nécessaire
};

// Récupère le panier local
const getLocalCart = () => {
    const cartData = localStorage.getItem(LOCAL_CART_KEY);
    try {
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
        // Utilisateur déconnecté: Lecture du localStorage
        return getLocalCart();
    }
};
// Ajouter un produit (BDD ou LOCAL)
export const addProduitPanier = async (produit) => {
    // produit = { numProduit: X, poids: Y }
    if (isAuthenticated()) {
        // Utilisateur connecté: Appel à l'API (BDD)
        try {
            const response = await api.post(PANIER_URL, produit, getConfig());
            return response.data;
        } catch (error) {
            console.error("Erreur addProduitPanier (API):", error.response?.data || error.message);
            throw error;
        }
    } else {

        const cart = getLocalCart();
        const existingItem = cart.find(item => item.numProduit === produit.numProduit);
        
        if (existingItem) {
            existingItem.poids = parseFloat(existingItem.poids) + produit.poids;
        } else {
            cart.push({ numProduit: produit.numProduit, poids: produit.poids });
        }
        saveLocalCart(cart);
        
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
export const clearPanier = async () => {
try {
const response = await api.delete(PANIER_URL, getConfig());
return response.data;
} catch (error) {
console.error("Erreur clearPanier:", error.response?.data || error.message);
throw error;
}
};
