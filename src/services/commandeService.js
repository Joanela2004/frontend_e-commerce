import api from "./api";

const COMMANDE_URL = "/commandes";
const MES_COMMANDES_URL = "/mesCommandes";

const getConfig = (isFormData = false) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Utilisateur non authentifié");

  const headers = { Authorization: `Bearer ${token}` };
  if (isFormData) headers["Content-Type"] = "multipart/form-data";

  return { headers, withCredentials: true };
};
export const fetchCommandesClient = async () => {
  const res = await api.get(MES_COMMANDES_URL, getConfig());
  return res.data;
};
export const fetchCommandeClientById = async (id) => {
  const res = await api.get(`${MES_COMMANDES_URL}/${id}`, getConfig());
  return res.data;
};
export const createCommande = async (data) => {
  const res = await api.post(COMMANDE_URL, data, getConfig());
  return res.data;
};

export const fetchCommandes = async () => {
  const res = await api.get(COMMANDE_URL, getConfig());
  return res.data;
};
export const fetchCommandeById = async (id) => {
  const res = await api.get(`${COMMANDE_URL}/${id}`, getConfig());
  return res.data;
};
export const getClientsAvecCommandes = async () => {
  const res = await api.get("/clients/avec-commandes", getConfig());
  return res.data;
};

export const updateCommandeAdmin = async (id, data) => {
  const res = await api.post(
    `${COMMANDE_URL}/${id}?_method=PUT`,
    data,
    getConfig()
  );
  return res.data;
};
