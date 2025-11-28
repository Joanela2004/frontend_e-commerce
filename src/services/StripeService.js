
import api from "./api";

export const createStripeSession = async (commandeData) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Vous devez être connecté");

  const response = await api.post("/create-checkout-session", commandeData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data; // { url, session_id, montant_ariary }
};
