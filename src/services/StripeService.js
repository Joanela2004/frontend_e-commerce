export const createStripeSession = async ({ referenceCommande, montantTotal, numModePaiement }) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/paiement/stripe/create-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        referenceCommande: referenceCommande,
        montantTotal: Number(montantTotal), 
        
        numModePaiement: numModePaiement,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("Erreur Stripe API :", error);
    throw new Error(error.error || "Échec paiement");
  }

  const data = await response.json();
  console.log("Session Stripe créée →", data.url);
  return data; // { url, session_id }
};