import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/back-office/commandes.css";
import { fetchCommandeById } from "../../../services/commandeService";

const CommandeDetails = () => {
  const { id } = useParams();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  useEffect(() => {
    const loadCommande = async () => {
      try {
        const data = await fetchCommandeById(id);
        setCommande(data);
      } catch (error) {
        console.error("Erreur lors du chargement de la commande", error);
      } finally {
        setLoading(false);
      }
    };

    loadCommande();
  }, [id]);

  // --- Fonctions utilitaires ---
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "0 Ar";
    return Number(price).toLocaleString() + " Ar";
  };

  const getLivraisonStatus = (payerLivraison) => {
    return payerLivraison ? "OUI (Payé)" : "NON (Non Payé)";
  };

  if (loading) return <p>Chargement...</p>;
  if (!commande) return <p>Commande introuvable.</p>;

  // Calculs :
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

      <h2>Détails de la commande n° {commande.numCommande}</h2>

      <div className="commande-info">
        <p><strong>Client :</strong> {commande.utilisateur?.nomUtilisateur || 'Inconnu'}</p>
        <p><strong>Date :</strong> {commande.dateCommande}</p>
        
        {/* Ligne du statut */}
        <p><strong>Statut :</strong> **{commande.statut}**</p>
        
        {/* Nombre de produits commandés */}
        <p><strong>Nombre de produits commandés :</strong> {nombreProduits}</p>
        
        {/* Lieu de livraison mis à jour */}
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
          <strong>Poids Total des produits :</strong> **{totalPoids} kg**
        </p>
        <p>
          <strong>Sous-Total des produits :</strong> {formatPrice(commande.sousTotal)}
        </p>
        
        <p>
          <strong>Frais de Livraison :</strong> {formatPrice(commande.fraisLivraison)}
        </p>
        <p>
          <strong>Code Promo Appliqué :</strong>{" "}
          <span style={{ color: codePromo ? 'green' : 'red' }}>
             {codePromo || "Aucun"}
          </span>
        </p>
        <p>
          <strong>Livraison Payée :</strong>{" "}
          <span style={{ color: livraisonPayee ? 'green' : 'red' }}>
            {getLivraisonStatus(livraisonPayee)}
          </span>
        </p>
        <hr/>
        <p className="montant-total">
          <strong>Montant Total (Net) :</strong> **{formatPrice(commande.montantTotal)}**
        </p>
      </div>

      <style jsx="true">{`
        .recap-financier {
          margin-top: 30px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
        }
        .recap-financier h3 {
          border-bottom: 2px solid #ccc;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .recap-financier p {
          margin: 5px 0;
        }
        .montant-total {
          font-size: 1.2em;
          color: #004d40;
          margin-top: 15px !important;
          border-top: 1px dashed #aaa;
          padding-top: 10px;
        }
        .table-produits {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .table-produits th, .table-produits td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .img-produit {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default CommandeDetails;