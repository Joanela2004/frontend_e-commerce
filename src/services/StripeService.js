
import api from "./api";

export const createStripeSession = async (panier, total) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Utilisateur non connecté");

  try {
    const response = await api.post(
      "/stripe/checkout",
      { panier, total },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response.data; // { url: "..." }
  } catch (err) {
    console.error("Erreur lors de la création de la session Stripe:", err);
    throw err;
  }
};
