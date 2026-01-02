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

export const createCommande = async (data) => {
const res = await api.post(COMMANDE_URL, data, getConfig());
return res.data;
};

export const fetchCommandes = async () => {
const res = await api.get(COMMANDE_URL, getConfig());
return res.data;
};

export const fetchCommandeById = async (id) => {
const res = await api.get(`${MES_COMMANDES_URL}/${id}`, getConfig());
return res.data;
};

export const updateCommandeAdmin = async (id, data) => {
const res = await api.put(`${COMMANDE_URL}/${id}`, data, getConfig());
return res.data;
};

export const fetchMesCommandes = async () => {
try {
const response = await api.get(MES_COMMANDES_URL, getConfig());
return response.data;
} catch (error) {
console.error("Erreur fetchMesCommandes:", error.response?.data || error.message);
throw error;
}
};

export const deleteCommandeClient = async (referenceCommande) => {
  const res = await api.delete(`${MES_COMMANDES_URL}/${referenceCommande}`, getConfig());
  return res.data;
};
export const fetchDetailCommande = async (id) => {
try {
const response = await api.get(`${COMMANDE_URL}/${id}`, getConfig());
return response.data;
} catch (error) {
console.error("Erreur fetchDetailCommande:", error.response?.data || error.message);
throw error;
}
};

export const markCommandeAsConsulted = async (numCommande) => {
    await api.put(`${COMMANDE_URL}/${numCommande}`, { estConsulte: 1 }, getConfig());
};

export const getNewOrdersCount = async () => {
    const commandes = await fetchCommandes();
    return commandes.filter(cmd => !cmd.estConsulte).length;
};
export const verifierEtExpedierCommande = async (numCommande, livraisonData) => {
  const response = await api.post(`/commandes/${numCommande}/verifier-et-expedier`, livraisonData,
    getConfig());
  return response.data;
};