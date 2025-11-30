
import api from "./api";

const getConfig = (isFormData = false) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Utilisateur non authentifié");

  const headers = { Authorization: `Bearer ${token}` };
  if (isFormData) headers["Content-Type"] = "multipart/form-data";

  return { headers, withCredentials: true };
};


export const getProfilUtilisateur = async (numUtilisateur) => {
  const res = await api.get(`/utilisateurs/${numUtilisateur}`, getConfig());
  return res.data;
};

export const updateProfilUtilisateur = async (id, formData) => {
   const res = await api.post(`/utilisateurs/${id}?_method=PUT`, formData, getConfig(true));
  return res.data;
};


export const getClients = async () => {
  try {
    const res = await api.get("/utilisateurs", getConfig());
    console.log("Requête envoyée avec token :", getConfig().headers.Authorization);
    return res.data.filter(user => user.role !== "admin");
  } catch (err) {
    console.error("Erreur récupération clients :", err.response?.data || err);
    throw err;
  }
};

export const getUtilisateurById = async (id) => {
  try {
    const response = await api.get(`/utilisateurs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};
export const getStatistiquesUtilisateurs = async () => {
  try {
    const clients = await getClients();
    const clientsAvecCommandes = await api.get("/clients/avec-commandes", getConfig());
    
    return {
      totalClients: clients.length,
      clientsAvecCommandes: clientsAvecCommandes.data.length,
      nouveauxClientsMois: clients.filter(client => {
        const dateInscription = new Date(client.created_at);
        const maintenant = new Date();
        return dateInscription.getMonth() === maintenant.getMonth() && 
               dateInscription.getFullYear() === maintenant.getFullYear();
      }).length
    };
  } catch (error) {
    console.error("Erreur statistiques utilisateurs:", error);
    throw error;
  }
};