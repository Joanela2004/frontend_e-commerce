import React, { useState, useEffect } from "react";
import { FaEye, FaSearch,FaUsers } from "react-icons/fa";
import { usePagination } from "../../../pages/hooks/hooks";
import "../../../styles/back-office/client.css";
import { getClients } from "../../../services/utilisateurService";
import { useNavigate } from "react-router-dom";

const Clients = () => {
  const [clientsData, setClientsData] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
const handleVoirCommande = (client) => {
  navigate(`/admin/clients/${client.numUtilisateur}/commandes`);
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

  const filteredClients = clientsData.filter(client =>
    [
      client.numUtilisateur?.toString(),
      client.nomUtilisateur,
      client.email,
      client.contact
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const { currentRows: clientsDataRows, goToPage, currentPage, totalPages } =
    usePagination(filteredClients, 5);

  return (
    <div className="livraison-container">
      <div className="livraison-header">
        <h2><FaUsers /> Gestion des Clients</h2>
        <div className="livraison-tabs">
          <button className="tab-active">Tous les clients</button>
          <button>Clients actifs</button>
          <button>Nouveaux clients</button>
        </div>
      </div>

      <div className="livraison-search-bar">
         <FaSearch />
        <input
          type="text"
          placeholder="Rechercher par nom, email, contact ou ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container-bo">
        <table className="livraison-table">
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
                  <td className="client-id">#{client.numUtilisateur}</td>
                  <td>
                    <div className="client-name">{client.nomUtilisateur}</div>
                  </td>
                  <td>
                    <div className="client-email">{client.email}</div>
                  </td>
                  <td>
                    <span className={client.contact ? "client-contact" : "client-no-contact"}>
                      {client.contact || "Non renseigné"}
                    </span>
                  </td>
                  <td>
                    <div className="client-date">
                      {client.created_at
                        ? new Date(client.created_at).toLocaleDateString("fr-FR", {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : "---"}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleVoirCommande(client)}
                      title="Voir les commandes de ce client"
                    >
                      <FaEye /> Voir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  <div className="clients-empty">
                    {search ? 'Aucun client ne correspond à votre recherche.' : 'Aucun client trouvé.'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination-zone">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              &lt;
            </button>

            <span className="pagination-info">
              Page {currentPage} sur {totalPages}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;