export const createMvolaToken = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/paiement/mvola/create-token`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("Erreur MVola (token) :", error);
    throw new Error(error.error || "Impossible de générer le token MVola");
  }

  const data = await response.json();
  return data.access_token;
};


export const createMvolaPayment = async ({ amount, customerNumber, referenceCommande }) => {

  const userToken = localStorage.getItem("userToken");
  if (!userToken) throw new Error("Token manquant");

  //  Générer token MVOLA
  const mvolaToken = await createMvolaToken();

  //  Envoyer le paiement
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/paiement/mvola/pay`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mvolaToken}`,   // <<< MVOLA TOKEN
        "User-Token": userToken                  // <<< Ton token Laravel
      },
      body: JSON.stringify({
        amount: Number(amount),
        customerNumber: customerNumber,
        referenceCommande: referenceCommande
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("Erreur MVola API :", error);
    throw new Error(error.error || "Paiement MVola échoué");
  }

  const data = await response.json();
  console.log("Paiement MVola →", data);
  return data; 
};
