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

  if (loading) return <p>Chargement...</p>;
  if (!commande) return <p>Commande introuvable.</p>;

  return (
    <div className="details-container">

      <h2>Détails de la commande n° {commande.numCommande}</h2>

      <div className="commande-info">
        <p><strong>Client :</strong> {commande.utilisateur?.nomUtilisateur || 'Inconnu'}</p>
        <p><strong>Date :</strong> {commande.dateCommande}</p>
        <p><strong>Statut :</strong> {commande.statut}</p>
        
      </div>

      

      <table className="table-produits">
        <thead>
          <tr>
            <th>Image</th>
            <th>Nom du produit</th>
            <th>Poids</th>
            <th>Decoupe</th>
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
                  src={`${IMAGE_BASE_URL}/${item.produit?.image}`}
                  alt={item.produit?.nomProduit}
                  className="img-produit"
                />
              </td>

              <td>{item.produit?.nomProduit}</td>

              <td>{item.poids} kg</td>
              <td>{item.decoupe} </td>
              <td>{item.prixUnitaire} Ar</td>

              <td>
                {item.promotion
                  ? `${item.promotion.reduction}%`
                  : "Aucune"}
              </td>

              <td>{item.poids * item.prixUnitaire} Ar</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total Commande : {commande.montantTotal} Ar</h3>
    </div>
  );
};

export default CommandeDetails;
