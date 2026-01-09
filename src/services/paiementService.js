import api from "./api";

const MODES_PAIEMENT_URL = "/mode_paiements";

const getConfig = (isFormData = false) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Utilisateur non authentifié");
  const headers = { Authorization: `Bearer ${token}` };
  if (isFormData) headers["Content-Type"] = "multipart/form-data";
  return { headers, withCredentials: true };
};


export const fetchModes = async () => {
  const res = await api.get(MODES_PAIEMENT_URL, getConfig(false));
  return res.data;
};

export const createMode = async (data) => {

  const res = await api.post(MODES_PAIEMENT_URL, data, getConfig(true));
  return res.data;
};
export const confirmerPaiement = async (numCommande) => {
  const res = await api.post(
    `/commandes/${numCommande}/confirmer-paiement`,
    {},
    getConfig()
  );
  return res.data;
};
export const updateMode = async (id, data) => {
   const res = await api.post(`${MODES_PAIEMENT_URL}/${id}?_method=PUT`, data, getConfig(true));
  return res.data;
};

export const deleteMode = async (id) => {
  const res = await api.delete(`${MODES_PAIEMENT_URL}/${id}`, getConfig(false));
  return res.data;
};

export const createPaiement = async (data) => {
  const res = await api.post("/paiements", data, getConfig(true));
  return res.data;
};

export const fetchPaiements = async () => {
  const res = await api.get("/paiements", getConfig(false));
  return res.data;
};

export const updatePaiement = async (id, data) => {
  const res = await api.put(`/paiements/${id}`, data, getConfig(true));
  return res.data;
};
export const updateCommandeModePaiement = async (reference, numMode) => {
  return await api.patch(`/commandes/${reference}/mode-paiement`, { numModePaiement: numMode }, getConfig());
};
export const deletePaiement = async (id) => {
  const res = await api.delete(`/paiements/${id}`, getConfig(false));
  return res.data;
};
export const fetchModesActifs = async () => {
  const res = await api.get(`${MODES_PAIEMENT_URL}/actifs`, getConfig(false));
  return res.data;
};
export const fetchPaiementByCommande = async (reference) => {
  const res = await api.get(`/paiements/commande/${reference}`, getConfig());
  return res.data;
};
