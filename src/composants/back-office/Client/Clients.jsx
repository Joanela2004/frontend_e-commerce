import React, { useState, useEffect } from "react";
import { FaEye, FaSearch, FaUsers, FaCalendarAlt, FaPhone, FaEnvelope, FaSync, FaFilter } from "react-icons/fa";
import { usePagination } from "../../../pages/hooks/hooks";
import { getClients } from "../../../services/utilisateurService";
import { useNavigate } from "react-router-dom";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Clients = () => {
  const [clientsData, setClientsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const navigate = useNavigate();
  const [dateMinPicker, setDateMinPicker] = useState(null);
const [dateMaxPicker, setDateMaxPicker] = useState(null);

  const [filtreDateMin, setFiltreDateMin] = useState("");
  const [filtreDateMax, setFiltreDateMax] = useState("");
  const [filtreHasContact, setFiltreHasContact] = useState("tous");

  useEffect(() => {
  setDateMinPicker(filtreDateMin ? new Date(filtreDateMin) : null);
  setDateMaxPicker(filtreDateMax ? new Date(filtreDateMax) : null);
}, [filtreDateMin, filtreDateMax]);

  useEffect(() => {
    const fetchClientsData = async () => {
      try {
        setLoading(true);
        const clients = await getClients();
        setClientsData(clients);
      } catch (err) {
        console.error("Erreur récupération clients :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClientsData();
  }, []);

  const handleVoirCommande = (client) => {
    navigate(`/admin/clients/${client.numUtilisateur}/commandes`);
  };

  // Filtrer les clients
  const filteredClients = clientsData.filter(client => {
    const searchMatch =
      (client.numUtilisateur?.toString() || "").includes(searchTerm) ||
      (client.nomUtilisateur?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (client.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (client.contact?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const contactMatch = 
      filtreHasContact === "tous" ||
      (filtreHasContact === "avec" && client.contact) ||
      (filtreHasContact === "sans" && !client.contact);
    
    const createdDate = client.created_at ? new Date(client.created_at) : null;
    
    const dateMinMatch = !filtreDateMin || 
      (createdDate && createdDate >= new Date(filtreDateMin));
    
    const dateMaxMatch = !filtreDateMax || 
      (createdDate && createdDate <= new Date(filtreDateMax));
    
    return searchMatch && contactMatch && dateMinMatch && dateMaxMatch;
  });

  const { currentRows: clientsDataRows, goToPage, currentPage, totalPages } =
    usePagination(filteredClients, 10); // Augmenté à 10 pour une meilleure visibilité

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltreDateMin("");
    setFiltreDateMax("");
    setFiltreHasContact("tous");
  };

  const hasActiveFilters = 
    searchTerm || 
    filtreDateMin || 
    filtreDateMax || 
    filtreHasContact !== "tous";

  // Statistiques
  const totalClients = clientsData.length;
  const clientsAvecContact = clientsData.filter(c => c.contact).length;
  const clientsSansContact = clientsData.filter(c => !c.contact).length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1><FaUsers style={{marginRight: '10px'}} /> Gestion des Clients</h1>
          <div className="stats-container" style={{ marginTop: '10px' }}>
          
            <span className="stat-item" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
              {totalClients} total
            </span>
           
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }}  />
          <input
            type="text"
            placeholder="Rechercher par nom, email, contact ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`filter-toggle ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ border:"none", display:"flex", alignItems:"center", background:"white", color:"#28a458", paddingRight:"10px"}}
          >
            <FaFilter />
          </button>
          <FaSync
            onClick={reinitialiserFiltres}
            style={{ marginRight: '8px', border:"none", color:"#28a458", cursor: "pointer" }}
            title="Réinitialiser tous les filtres"
          />
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label><FaCalendarAlt style={{marginRight:"5px"}} /> Date inscription min</label>
             <DatePicker
    selected={dateMinPicker}
    onChange={(date) => {
      setDateMinPicker(date);
      setFiltreDateMin(date ? date.toISOString().split("T")[0] : "");
    }}
    dateFormat="dd/MM/yyyy"
    locale={fr}
    placeholderText="jj/mm/aaaa"
    className="form-control"
    showMonthDropdown
    showYearDropdown
    dropdownMode="select"
    isClearable
  />
            </div>
            
            <div className="filter-group">
              <label><FaCalendarAlt style={{marginRight:"5px"}} /> Date inscription max</label>
              <DatePicker
    selected={dateMaxPicker}
    onChange={(date) => {
      setDateMaxPicker(date);
      setFiltreDateMax(date ? date.toISOString().split("T")[0] : "");
    }}
    dateFormat="dd/MM/yyyy"
    locale={fr}
    placeholderText="jj/mm/aaaa"
    className="form-control"
    showMonthDropdown
    showYearDropdown
    dropdownMode="select"
    minDate={dateMinPicker}
    isClearable
  />
            </div>
            

          </div>
          
          {/* Affichage des filtres actifs */}
          <div className="active-filters">
            {filtreDateMin && (
              <span className="active-filter-tag">
                Date min: {filtreDateMin}
                <button onClick={() => setFiltreDateMin("")}>×</button>
              </span>
            )}
            {filtreDateMax && (
              <span className="active-filter-tag">
                Date max: {filtreDateMax}
                <button onClick={() => setFiltreDateMax("")}>×</button>
              </span>
            )}
           
          </div>
        </div>
      )}

      {/* Tableau des clients */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Client</th>
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
                  <td>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#8b5e3c',
                      fontFamily: 'monospace'
                    }}>
                      {client.numUtilisateur}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {client.image ? (
  <img 
    src={`${IMAGE_BASE_URL}${client.image}`}
    alt={client.nomUtilisateur} 
    style={{
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      objectFit: "cover"
    }}
  />
) : (
  <div style={{ 
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#e3f2fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1565c0",
    fontWeight: "bold"
  }}>
    {client.nomUtilisateur?.charAt(0)?.toUpperCase() || "C"}
  </div>
)}

                      <div>
                        <div style={{ fontWeight: "bold" }}>{client.nomUtilisateur || "N/A"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaEnvelope style={{ color: "#6c757d" }} />
                      <span>{client.email || "N/A"}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaPhone style={{ color:  "#28a458" }} />
                      <span>
                        {client.contact}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaCalendarAlt style={{ color: "#6c757d" }} />
                      <span>
                        {client.created_at
                          ? new Date(client.created_at).toLocaleDateString("fr-FR", {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : "---"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-consulter"
                        onClick={() => handleVoirCommande(client)}
                        title="Voir les commandes"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <FaEye /> Voir commandes
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-table">
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <h3>
                      {hasActiveFilters
                        ? "Aucun client ne correspond à vos critères"
                        : "Aucun client trouvé"}
                    </h3>
                    <p>
                      {hasActiveFilters
                        ? "Essayez avec d'autres termes de recherche ou modifiez les filtres."
                        : "Les clients apparaîtront ici lorsqu'ils s'inscriront."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination-zone" style={{ marginTop: '20px' }}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn prev"
          >
            &lt; Précédent
          </button>

          <div className="pagination-info">
            <span>Page {currentPage} sur {totalPages}</span>
            <span style={{ marginLeft: '15px', color: '#6c757d' }}>
              {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
            </span>
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn next"
          >
            Suivant &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default Clients;