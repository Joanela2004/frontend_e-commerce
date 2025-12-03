import api from "./api";

const LIVRAISON_URL = "/livraisons";
const FRAIS_URL = "/frais_livraisons";
const LIEUX_URL = "/lieux_livraison";

const getConfig = (isFormData = false) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Utilisateur non authentifié");

  const headers = { Authorization: `Bearer ${token}` };
  if (isFormData) headers["Content-Type"] = "multipart/form-data";

  return { headers, withCredentials: true };
};

export const fetchLivraisons = async () => {
  const res = await api.get(LIVRAISON_URL,getConfig());
  return res.data;
};
export const fetchLivraisonByCommandeId = async (commandeId) => {
  try {
    const res = await api.get(`/mesCommandes/${commandeId}/livraison`, getConfig());
    return res.data;
  } catch (err) {
    console.error("Erreur fetchLivraisonByCommandeId:", err.response?.data || err.message);
    throw err;
  }
};
export const createLivraison = async (data) => {
  const res = await api.post(LIVRAISON_URL, data, getConfig());
  return res.data;
};

export const updateLivraison = async (id, data) => {
  const res = await api.put(`${LIVRAISON_URL}/${id}`, data, getConfig());
  return res.data;
};

export const deleteLivraison = async (id) => {
  const res = await api.delete(`${LIVRAISON_URL}/${id}`, getConfig());
  return res.data;
};

export const fetchFrais = async () => {
  const res = await api.get(FRAIS_URL);
  return res.data;
};

export const createFrais = async (data) => {
  const res = await api.post(FRAIS_URL, data, getConfig());
  return res.data;
};

export const updateFrais = async (id, data) => {
  const res = await api.post(`${FRAIS_URL}/${id}?_method=PUT`, data, getConfig());
  return res.data;
};
export const regenererToutesLesTranches = async (data) => {
  const res = await api.post(`${FRAIS_URL}/regenerer`, data, getConfig());
  return res.data;
};
export const deleteFrais = async (id) => {
  const res = await api.delete(`${FRAIS_URL}/${id}`, getConfig());
  return res.data;
};
export const restoreFrais = async (id) => (await api.post(`${FRAIS_URL}/${id}/restore`, {}, getConfig())).data;

export const fetchLieux = async () => {
  const res = await api.get(LIEUX_URL);
  return res.data;
};

export const createLieu = async (data) => {
  const res = await api.post(LIEUX_URL, data, getConfig());
  return res.data;
};

export const updateLieu = async (numLieu, data) => {
  const res = await api.post(`${LIEUX_URL}/${numLieu}?_method=PUT`, data, getConfig());
  return res.data;
};

export const deleteLieu = async (id) => {
  const res = await api.delete(`${LIEUX_URL}/${id}`, getConfig());
  return res.data;
};
export const restoreLieu = async (id) => (await api.post(`${LIEUX_URL}/${id}/restore`, {}, getConfig())).data;
