import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/back-office/commandes.css";
import { fetchDetailCommande } from "../../../services/commandeService";

const CommandeDetails = () => {
  const { id } = useParams();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  useEffect(() => {
    const loadCommande = async () => {
      try {
        const data = await fetchDetailCommande(id);
        setCommande(data);
      } catch (error) {
        console.error("Erreur lors du chargement de la commande", error);
      } finally {
        setLoading(false);
      }
    };

    loadCommande();
  }, [id]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "0 Ar";
    return Number(price).toLocaleString() + " Ar";
  };

  const getLivraisonStatus = (payerLivraison) => {
    return payerLivraison ? (
        <span className="text-green-600">OUI (Payé)</span>
    ) : (
        <span className="text-red-600">NON (Non Payé)</span>
    );
  };
  
  const getStatusClass = (statut) => {
    switch (statut) {
        case 'validée':
        case 'livrée':
            return 'statut-reussi';
        case 'expédiée':
            return 'statut-expediee';
        case 'en attente':
            return 'statut-attente';
        case 'annulée':
            return 'statut-annule';
        default:
            return 'statut-default';
    }
};

  if (loading) return <p>Chargement...</p>;
  if (!commande) return <p>Commande introuvable.</p>;

  const totalPoids = commande.detail_commandes?.reduce(
    (total, item) => total + Number(item.poids || 0),
    0
  ) || 0;
  
  const nombreProduits = commande.detail_commandes?.length || 0; 
  
  const lieuLivraison = commande.livraisons?.[0]?.lieuLivraison || 'Non spécifié';

  const livraisonPayee = commande.payerLivraison;
  const codePromo = commande.codePromo;
 

  return (
    <div className="details-container">

      <h2>Détails de la commande n° {commande.referenceCommande}</h2>

      <div className="commande-info">
        <p><strong>Client :</strong> {commande.utilisateur?.nomUtilisateur || 'Inconnu'}</p>
        <p><strong>Date :</strong> {commande.dateCommande}</p>
        
        <p><strong>Statut :</strong> <span className={`statut-badge ${getStatusClass(commande.statut)}`}>{commande.statut}</span></p>
        
        <p><strong>Nombre de produits commandés :</strong> {nombreProduits}</p>
        
        <p><strong>Lieu de livraison :</strong> {lieuLivraison}</p>
      </div>

      <table className="table-produits">
        <thead>
          <tr>
            <th>Image</th>
            <th>Nom du produit</th>
            <th>Poids</th>
            <th>Découpe</th>
            <th>Prix unitaire</th>
            <th>Promotion</th>
            <th>Sous Total</th>
          </tr>
        </thead>

        <tbody>
          {commande.detail_commandes?.map((item) => (
            <tr key={item.numDetailCommande}>
              <td>
                <img
                  src={
                    item.produit?.image
                      ? `${IMAGE_BASE_URL}/${item.produit.image}`
                      : "/placeholder.png"
                  }
                  alt={item.produit?.nomProduit || "Produit"}
                  className="img-produit"
                />
              </td>

              <td>{item.produit?.nomProduit}</td>

              <td>{item.poids} kg</td>
              
              <td>{item.decoupe || "Pas de découpe"}</td> 
              
              <td>{formatPrice(item.prixUnitaire)}</td>

              <td>
                {item.produit?.promotion?.valeur 
                  ? `${item.produit.promotion.valeur}${item.produit.promotion.typePromotion === "Pourcentage" ? "%" : "Ar"}`
                  : "Aucune"}
              </td>

              <td>{formatPrice(item.sousTotal || (item.poids * item.prixUnitaire))}</td>
            </tr>
          ))}
        </tbody>
      </table>

       <div className="recap-financier">
        <h3>Récapitulatif financier et logistique 💸🚚</h3>
        
        <p>
          <strong>Poids Total des produits :</strong> <span>{totalPoids} kg</span>
        </p>
        <p>
          <strong>Sous-Total des produits :</strong> <span>{formatPrice(commande.sousTotal)}</span>
        </p>
        
        <p>
          <strong>Frais de Livraison :</strong> <span>{formatPrice(commande.fraisLivraison)}</span>
        </p>
        <p>
          <strong>Code Promo Appliqué :</strong>{" "}
          <span style={{ color: codePromo ? 'var(--color-green-primary)' : 'var(--color-danger-dark)' }}>
             {codePromo || "Aucun"}
          </span>
        </p>
        <p>
          <strong>Livraison Payée :</strong>{" "}
          <span style={{ color: livraisonPayee ? 'var(--color-green-primary)' : 'var(--color-danger-dark)' }}>
            {getLivraisonStatus(livraisonPayee)}
          </span>
        </p>
        <hr/>
        <p className="montant-total">
          <strong>Montant Total (Net) :</strong> <span>{formatPrice(commande.montantTotal)}</span>
        </p>
      </div>
    </div>
  );
};

export default CommandeDetails;