import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { usePagination } from "../../../pages/hooks/hooks";
import "../../../styles/front-office/Accueil/Pagination.css";
import "../../../styles/back-office/clients.css";
import { getClients } from "../../../services/utilisateurService";
import { useNavigate } from "react-router-dom";

const Clients = () => {
  const [clientsData, setClientsData] = useState([]);
  const navigate = useNavigate();

  const handleVoirCommande = (client) => {
    navigate(`/clients/${client.numUtilisateur}`);
  };

  useEffect(() => {
    const fetchClientsData = async () => {
      try {
        const clients = await getClients();
        setClientsData(clients);
      } catch (err) {
        console.error("Erreur récupération clients :", err);
      }
    };
    fetchClientsData();
  }, []);

  const { currentRows: clientsDataRows, goToPage, currentPage, totalPages } =
    usePagination(clientsData, 5);

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h1 className="clients-title">Gestion des Clients</h1>
      </div>

      <div className="clients-card">
        <div className="clients-table-wrapper">
          <table className="clients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Inscrit depuis</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientsDataRows && clientsDataRows.length > 0 ? (
                clientsDataRows.map((client) => (
                  <tr key={client.numUtilisateur}>
                    <td>{client.numUtilisateur}</td>
                    <td>{client.nomUtilisateur}</td>
                    <td>{client.email}</td>
                    <td>{client.contact || "---"}</td>
                    <td>
                      {client.created_at
                        ? new Date(client.created_at).toLocaleDateString("fr-FR")
                        : "---"}
                    </td>
                    <td className="client-actions">
                      <button
                        className="btn-action-view"
                        onClick={() => handleVoirCommande(client)}
                      >
                        <FaEye /> Voir commandes
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`pagination-btn ${currentPage === 1 ? "disabled" : "active"}`}
              >
                &lt;
              </button>

              <span className="pagination-info">
                Page {currentPage} sur {totalPages}
              </span>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`pagination-btn ${currentPage === totalPages ? "disabled" : "active"}`}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clients;
