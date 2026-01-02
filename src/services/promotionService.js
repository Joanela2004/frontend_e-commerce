import api from "./api";

const PROMOTION_URL = "/promotions";

const getConfig = () => {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("Utilisateur non authentifié");
    
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        }
    };
};
export const fetchPromotionsAutomatiquesActives = async () => {
  try {
    const res = await api.get("/promotions/automatiques/actives");
    return res.data;
  } catch (err) {
    console.error("Erreur bannière promo :", err);
    return null;
  }
};
export const fetchPromotions = async () => {
    try {
        const res = await api.get(PROMOTION_URL,getConfig());
        return res.data;
    } catch (error) {
        console.error("Erreur chargement promotions:", error.response?.data || error.message);
        throw error;
    }
};

export const createPromotion = async (promotionData) => {
    try {
        const res = await api.post(PROMOTION_URL, promotionData, getConfig());
        return res.data;
    } catch (error) {
        console.error("Erreur création promotion:", error.response?.data || error.message);
        throw error;
    }
};

export const updatePromotion = async (id, promotionData) => {
    try {
        const res = await api.put(`${PROMOTION_URL}/${id}`, promotionData, getConfig());
        return res.data;
    } catch (error) {
        console.error("Erreur mise à jour promotion:", error.response?.data || error.message);
        throw error;
    }
};

export const deletePromotion = async (id) => {
    try {
        const res = await api.delete(`${PROMOTION_URL}/${id}`, getConfig());
        return res.data;
    } catch (error) {
        console.error("Erreur suppression promotion:", error.response?.data || error.message);
        throw error;
    }
};
export const sendPromoEmail = async (emailData) => {
    try {
        const res = await api.post(`/send-promo-to-client`, emailData, getConfig());
        return res.data; // { success: true, message: "..." }
    } catch (error) {
        console.error("Erreur envoi promo:", error.response?.data || error.message);
        throw error;
    }
};
export const validerCodePromo = async (code, numUtilisateur,montantPanier) => {
  const response = await api.post(
    `/promotions/valider`,
    { codePromo: code, numUtilisateur:numUtilisateur,montantPanier: montantPanier },
    getConfig()
  );
  return response.data;
};
export const appliquerPromotionAutomatique = async (montantPanier) => {
  try {
    const res = await api.post(
      "/promotions/auto",
      { montantPanier },
      { headers: { "Content-Type": "application/json" } }
     
    );
    return res.data; 
  } catch (err) {
    return null; 
  }
};


export const checkPromoSent = async (numPromotion, numUtilisateur) => {
    try {
        const res = await api.get(
            `/promotions/deja-envoye/${numPromotion}/${numUtilisateur}`,
            getConfig()
        );
        return res.data.sent;
    } catch (error) {
        console.error("Erreur vérification promo:", error);
        return false;
    }
};
