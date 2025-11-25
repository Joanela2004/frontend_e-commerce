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

export const fetchPromotions = async () => {
    try {
        const res = await api.get(PROMOTION_URL);
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
        return res.data;
    } catch (error) {
        console.error("Erreur envoi e-mails promo ciblé:", error.response?.data || error.message);
        throw error;
    }
};

export const validerCodePromo = async (codePromo) => {
    try {
        const token = localStorage.getItem("userToken");
        const numUtilisateur = JSON.parse(atob(token.split('.')[1])).sub; // Décoder l'ID utilisateur depuis JWT
        const res = await api.post(
            `${PROMOTION_URL}/valider-code`,
            { codePromo, numUtilisateur },
            getConfig()
        );
        return res.data; // { valid: true/false, remise: number }
    } catch (error) {
        console.error("Erreur validation code promo:", error.response?.data || error.message);
        throw error;
    }
};
