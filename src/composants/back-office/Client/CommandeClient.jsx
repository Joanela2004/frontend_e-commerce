import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../services/api";

const CommandesClient = () => {
  const { id } = useParams(); // id du client
  const [commandes, setCommandes] = useState([]);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const fetchCommandesClient = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const res = await api.get(`/utilisateurs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClient(res.data);
        setCommandes(res.data.commandes || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCommandesClient();
  }, [id]);

  return (
    <div className="commandes-client-container">
      <h2>Commandes de {client?.nomUtilisateur}</h2>
      <Link to="/clients">← Retour à la liste des clients</Link>

      {commandes.length === 0 ? (
        <p>Aucune commande pour ce client.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Statut</th>
              <th>Sous-total</th>
              <th>Frais livraison</th>
              <th>Montant total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map(c => (
              <tr key={c.numCommande}>
                <td>{c.numCommande}</td>
                <td>{c.statut}</td>
                <td>{c.sousTotal}</td>
                <td>{c.fraisLivraison}</td>
                <td>{c.montantTotal}</td>
                <td>{new Date(c.dateCommande).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CommandesClient;
