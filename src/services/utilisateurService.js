
import api from "./api";

export const getClients = async () => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("Utilisateur non authentifié");

    const res = await api.get("/utilisateurs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const clients = res.data
      .filter(user => user.role !== "admin")
      .map(user => ({
        id: user.numUtilisateur,
        nom: user.nomUtilisateur,
        email: user.email,
        contact: user.contact || "-",
        dateInscription: new Date(user.created_at).toISOString().slice(0, 10)
      }));

    return clients;
  } catch (err) {
    console.error("Erreur lors de la récupération des clients :", err);
    throw err;
  }
};
