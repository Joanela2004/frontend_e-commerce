import api from "./api";

const CATEGORIE_URL = "/categories";

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

export const getCategories = async () => {
    try {
        const res = await api.get(CATEGORIE_URL);
        return res.data;
    } catch (error) {
        console.error("Erreur chargement catégories: ", error.response?.data || error.message);
        throw error;
    }
};

export const createCategorie = async (nomCategorie) => {
    try {
        const res = await api.post(CATEGORIE_URL, { nomCategorie }, getConfig());
        return res.data;
    } catch (error) {
        console.error("Erreur création catégorie: ", error.response?.data || error.message);
        throw error;
    }
};

export const updateCategorie = async (id, nomCategorie) => {
    try {
        const res = await api.put(`${CATEGORIE_URL}/${id}`, { nomCategorie }, getConfig());
        return res.data;
    } catch (error) {
        console.error("Erreur mise à jour catégorie: ", error.response?.data || error.message);
        throw error;
    }
};

export const deleteCategorie = async (id) => {
    try {
        const res = await api.delete(`${CATEGORIE_URL}/${id}`, getConfig());
        return res.data;
    } catch (error) {
        console.error("Erreur suppression catégorie: ", error.response?.data || error.message);
        throw error;
    }
};
export const restoreCategorie = async (id) => {
    const res = await api.post(`${CATEGORIE_URL}/${id}/restore`, {}, getConfig());
    return res.data;
};