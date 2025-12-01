import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaHistory } from "react-icons/fa"; // Ajout d'icônes
import api from "../../../services/api";
import "../../../styles/back-office/client.css"; 
import "../../../styles/back-office/commandes.css";

const CommandesClient = () => {
  const { id } = useParams(); // id du client
  const [commandes, setCommandes] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.error("Erreur de chargement des données du client/commandes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandesClient();
  }, [id]);

  if (loading) {
      return (
          <div className="livraison-container">
              <p>Chargement des informations du client...</p>
          </div>
      );
  }

  return (
    <div className="livraison-container">
        
      <div className="livraison-header">
        <h2><FaHistory /> Historique Commandes de {client?.nomUtilisateur}</h2>
        <Link to="/admin/clients" className="btn-back">
            <FaArrowLeft /> Retour aux Clients
        </Link>
      </div>

      <div className="client-details-card">
          <h4>Détails du Client</h4>
          <p><strong>ID:</strong> #{client?.numUtilisateur}</p>
          <p><strong>Email:</strong> {client?.email}</p>
          <p><strong>Contact:</strong> {client?.contact || 'Non renseigné'}</p>
      </div>

      <h3 className="section-title-commandes">Liste des Commandes ({commandes.length})</h3>

      {commandes.length === 0 ? (
        <div className="no-data-card">
            <p>Ce client n'a pas encore passé de commande enregistrée.</p>
        </div>
      ) : (
        <table className="livraison-table table-commandes-client">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Sous-total</th>
              <th>Frais livraison</th>
              <th>Montant total</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map(c => (
              <tr key={c.numCommande}>
                <td>{c.referenceCommande || c.numCommande}</td>
                <td>
                    <span className={`statut-badge ${c.statut?.toLowerCase().replace(/\s/g, '-')}`}>
                        {c.statut}
                    </span>
                </td>
                <td>{new Date(c.dateCommande).toLocaleDateString('fr-FR')}</td>
                <td className="montant-cell">{Number(c.sousTotal).toLocaleString()} Ar</td>
                <td className="montant-cell">{Number(c.fraisLivraison).toLocaleString()} Ar</td>
                <td className="montant-cell total-montant-cell">
                    <strong>{Number(c.montantTotal).toLocaleString()} Ar</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CommandesClient;