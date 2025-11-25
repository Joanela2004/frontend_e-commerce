
import api from "./api";

const getConfig = () => {
  const token = localStorage.getItem("userToken"); 
  if (!token) throw new Error("Utilisateur non authentifié");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const getProfilUtilisateur = async (numUtilisateur) => {
  const res = await api.get(`/utilisateurs/${numUtilisateur}`, getConfig());
  return res.data;
};

export const updateProfilUtilisateur = async (id, formData) => {
  // Ici on envoie en POST mais Laravel traitera comme PUT
  const res = await api.post(`/utilisateurs/${id}`, formData, getConfig());
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