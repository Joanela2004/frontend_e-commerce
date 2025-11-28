
import React, { useState } from "react";
import { createStripeSession } from "../../../services/StripeService";
import toast from "react-hot-toast";

const CheckoutPayment = ({ commandeData, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      const { url } = await createStripeSession({
        panier: commandeData.panier,
        fraisLivraison: commandeData.fraisLivraison || 0,
        remise: commandeData.remise || 0,
        numCommande: commandeData.referenceCommande,
        user_id: JSON.parse(localStorage.getItem("userData"))?.numUtilisateur,
      });

     
      window.location.href = url;
    } catch (err) {
      toast.error("Erreur paiement carte bancaire. Réessayez.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleMVolaPayment = () => {
    const message = `
NOUVELLE COMMANDE - ARATO AGRI

Référence : ${commandeData.referenceCommande}
Montant total : ${commandeData.montantTotal.toLocaleString()} Ar

Merci de payer via :
MVola → 034 35 000 00
Au nom de : RASOANIRINA Jean

Indiquez en description : ${commandeData.referenceCommande}
    `.trim();

    const whatsappUrl = `https://wa.me/261343500000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Redirection vers WhatsApp pour paiement MVola");
    onSuccess?.();
  };

  const handlePaiementLivraison = () => {
    toast.success("Commande validée ! Paiement à la livraison.");
    onSuccess?.();
  };

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Choisissez votre moyen de paiement
      </h2>

      {/* CARTE BANCAIRE - STRIPE */}
      <button
        onClick={handleStripePayment}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg disabled:opacity-70"
      >
        {loading ? "Redirection en cours..." : "Payer par carte bancaire"}
      </button>

      {/* MVOLA */}
      <button
        onClick={handleMVolaPayment}
        className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition shadow-lg"
      >
        Payer par MVola / Orange Money
      </button>

      {/* PAIEMENT À LA LIVRAISON */}
      <button
        onClick={handlePaiementLivraison}
        className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition shadow-lg"
      >
        Payer à la livraison (Espèces)
      </button>

      <p className="text-center text-sm text-gray-600 mt-6">
        Montant total :{" "}
        <span className="font-bold text-2xl text-green-600">
          {commandeData.montantTotal.toLocaleString()} Ar
        </span>
      </p>
    </div>
  );
};

export default CheckoutPayment;