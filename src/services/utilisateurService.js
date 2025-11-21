import api from "./api";

const getConfig = () => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Utilisateur non authentifié");
  return { headers: { Authorization: `Bearer ${token}` } };
};



export const sendPromoEmail = async (email) => {
  const res = await api.post("/send-email", { email }, getConfig());
  return res.data;
};
