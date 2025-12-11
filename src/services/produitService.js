import api from "./api";

const PRODUIT_URL = "/produits";

const getConfig = (isFormData = false) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Utilisateur non authentifié");

  const headers = { Authorization: `Bearer ${token}` };
  if (isFormData) headers["Content-Type"] = "multipart/form-data";

  return { headers, withCredentials: true };
};

export const fetchProduits = async () => {
  try {
    const res = await api.get(PRODUIT_URL);
    return res.data;
  } catch (error) {
    console.error("Erreur fetchProduits:", error);
    throw error;
  }
};

export const fetchProduitsById = async (id) => {
  try {
    const res = await api.get(`PRODUIT_URL)/${id}`);
    return res.data;
  } catch (error) {
    console.error("Erreur fetchProduits:", error);
    throw error;
  }
};
export const createProduit = async (data) => {
  const res = await api.post(PRODUIT_URL, data, getConfig(true));
  return res.data;
};

export const updateProduit = async (id, data) => {
  const res = await api.post(`${PRODUIT_URL}/${id}?_method=PUT`, data, getConfig(true));
  return res.data;
};

export const deleteProduit = async (id) => {
  const res = await api.delete(`${PRODUIT_URL}/${id}`, getConfig());
  return res.data;
};
export const restoreProduit = async (id) => (await api.post(`${PRODUIT_URL}/${id}/restore`, {}, getConfig())).data;

