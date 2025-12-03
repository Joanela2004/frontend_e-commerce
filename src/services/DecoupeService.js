import api from "./api";

const DECOUPE_URL = "/decoupes";

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

export const fetchDecoupes = async () => {
    try {
        const res = await api.get(DECOUPE_URL);
        return res.data;
    } catch (error) {
        console.error("Erreur chargement découpes: ", error.response?.data || error.message);
        throw error;
    }
};


export const createDecoupe = async (data) => {
    try {
        const res = await api.post(DECOUPE_URL, data, getConfig());
        return res.data;
    } catch (error) {
        console.error("Erreur création découpe: ", error.response?.data || error.message);
        throw error;
    }
};

export const updateDecoupe = async (id, data) => {
    try {
        const res = await api.put(`${DECOUPE_URL}/${id}`, data, getConfig());
        return res.data;
    } catch (error) {
        console.error("Erreur mise à jour découpe: ", error.response?.data || error.message);
        throw error;
    }
};

export const deleteDecoupe = async (id) => {
    try {
        const res = await api.delete(`${DECOUPE_URL}/${id}`, getConfig());
        return res.data;
    } catch (error) {
        console.error("Erreur suppression découpe: ", error.response?.data || error.message);
        throw error;
    }
};
export const restoreDecoupe = async (id) => {
    const res = await api.post(`${DECOUPE_URL}/${id}/restore`, {}, getConfig());
    return res.data;
};
