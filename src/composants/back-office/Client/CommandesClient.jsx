import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaHistory, 
  FaEye, 
  FaSearch, 
  FaSync, 
  FaFilter,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUser,
  FaEnvelope,
  FaPhone
} from "react-icons/fa";
import api from "../../../services/api";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/commandeClient.css"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
const CommandesClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreDateMin, setFiltreDateMin] = useState("");
  const [filtreDateMax, setFiltreDateMax] = useState("");
  const [filtreMontantMin, setFiltreMontantMin] = useState("");
  const [filtreMontantMax, setFiltreMontantMax] = useState("");

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

  const handleConsulterCommande = (commandeId) => {
    navigate(`/admin/commandes/${commandeId}`);
  };

  const handleRetourClients = () => {
    navigate("/admin/clients");
  };

  // Filtrer les commandes
  const filteredCommandes = commandes.filter(commande => {
    const searchMatch =
      (commande.referenceCommande?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (commande.numCommande?.toString() || "").includes(searchTerm.toLowerCase());
    
    const statutMatch = filtreStatut === "tous" || commande.statut === filtreStatut;
    
    const dateCommande = commande.dateCommande ? new Date(commande.dateCommande) : null;
    const dateMinMatch = !filtreDateMin || (dateCommande && dateCommande >= new Date(filtreDateMin));
    const dateMaxMatch = !filtreDateMax || (dateCommande && dateCommande <= new Date(filtreDateMax));
    
    const montantMatch = (montant) => {
      const montantNum = parseFloat(montant) || 0;
      const minMatch = !filtreMontantMin || montantNum >= parseFloat(filtreMontantMin);
      const maxMatch = !filtreMontantMax || montantNum <= parseFloat(filtreMontantMax);
      return minMatch && maxMatch;
    };
    
    const sousTotalMatch = montantMatch(commande.sousTotal);
    const fraisMatch = montantMatch(commande.fraisLivraison);
    const totalMatch = montantMatch(commande.montantTotal);
    
    return searchMatch && statutMatch && dateMinMatch && dateMaxMatch && 
           (sousTotalMatch || fraisMatch || totalMatch);
  });

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltreStatut("tous");
    setFiltreDateMin("");
    setFiltreDateMax("");
    setFiltreMontantMin("");
    setFiltreMontantMax("");
  };

  const hasActiveFilters = 
    searchTerm || 
    filtreStatut !== "tous" || 
    filtreDateMin || 
    filtreDateMax || 
    filtreMontantMin || 
    filtreMontantMax;

  // Statistiques
  const totalCommandes = commandes.length;
  const commandesEnAttente = commandes.filter(c => c.statut === "en attente").length;
  const commandesValidees = commandes.filter(c => c.statut === "validée").length;
  const commandesExpediees = commandes.filter(c => c.statut === "expédiée").length;
  const commandesLivrees = commandes.filter(c => c.statut === "livrée").length;
  const commandesAnnulees = commandes.filter(c => c.statut === "annulée").length;
  
  const totalMontant = commandes.reduce((sum, cmd) => sum + (parseFloat(cmd.montantTotal) || 0), 0);
  const moyenneMontant = totalCommandes > 0 ? totalMontant / totalCommandes : 0;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des informations du client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaHistory /> Historique des Commandes
          </h1>
          <div style={{ marginTop: '5px', color: '#6c757d' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaUser /> Client : <strong>{client?.nomUtilisateur}</strong>
            </span>
          </div>
          <div className="stats-container" style={{ marginTop: '15px' }}>
            <span className="stat-item">
              {filteredCommandes.length} commande{filteredCommandes.length !== 1 ? 's' : ''} trouvée{filteredCommandes.length !== 1 ? 's' : ''}
            </span>
            <span className="stat-item" style={{ backgroundColor: '#e3f2fd', color: '#1565c0' }}>
              Total: {totalMontant.toLocaleString("fr-FR")} Ar
            </span>
            
           
          </div>
        </div>
          <div className="table-actions">
                  <button 
                    className="btn-details"
                    onClick={() => window.history.back()}
                  >
                    <FaArrowLeft /> Retour
                  </button>
         </div>
      </div>

      
      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }} />
          <input
            type="text"
            placeholder="Rechercher par référence ou ID de commande..."
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
              <label>Statut</label>
              <select
                className="form-control"
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Tous les statuts</option>
                <option value="en attente">En attente</option>
                <option value="validée">Validée</option>
                <option value="expédiée">Expédiée</option>
                <option value="livrée">Livrée</option>
                <option value="annulée">Annulée</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label><FaCalendarAlt style={{marginRight:"5px"}} /> Date min</label>
              <DatePicker
    selected={filtreDateMin ? new Date(filtreDateMin) : null}
    onChange={(date) => setFiltreDateMin(date ? date.toISOString().split("T")[0] : "")}
    dateFormat="dd/MM/yyyy"
    locale={fr}
    placeholderText="jj/mm/aaaa"
    className="form-control"
    isClearable
  />
            </div>
            
            <div className="filter-group">
              <label><FaCalendarAlt style={{marginRight:"5px"}} /> Date max</label>
              <input
                type="date"
                className="form-control"
                value={filtreDateMax}
                onChange={(e) => setFiltreDateMax(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label><FaMoneyBillWave style={{marginRight:"5px"}} /> Montant min</label>
              <DatePicker
    selected={filtreDateMax ? new Date(filtreDateMax) : null}
    onChange={(date) => setFiltreDateMax(date ? date.toISOString().split("T")[0] : "")}
    dateFormat="dd/MM/yyyy"
    locale={fr}
    placeholderText="jj/mm/aaaa"
    className="form-control"
    isClearable
  />
            </div>
            
            <div className="filter-group">
              <label><FaMoneyBillWave style={{marginRight:"5px"}} /> Montant max</label>
              <input
                type="number"
                className="form-control"
                placeholder="1000000"
                value={filtreMontantMax}
                onChange={(e) => setFiltreMontantMax(e.target.value)}
                min="0"
                step="1000"
              />
            </div>
          </div>
          
          {/* Affichage des filtres actifs */}
          <div className="active-filters">
            {filtreStatut !== "tous" && (
              <span className="active-filter-tag">
                Statut: {filtreStatut}
                <button onClick={() => setFiltreStatut("tous")}>×</button>
              </span>
            )}
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
            {filtreMontantMin && (
              <span className="active-filter-tag">
                Montant min: {filtreMontantMin} Ar
                <button onClick={() => setFiltreMontantMin("")}>×</button>
              </span>
            )}
            {filtreMontantMax && (
              <span className="active-filter-tag">
                Montant max: {filtreMontantMax} Ar
                <button onClick={() => setFiltreMontantMax("")}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tableau des commandes */}
      <div className="table-container">
        {filteredCommandes.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Sous-total</th>
                <th>Frais livraison</th>
                <th>Montant total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommandes.map(commande => (
                <tr key={commande.numCommande}>
                  <td>
                    <span >
                      {commande.referenceCommande || commande.numCommande}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${commande.statut?.toLowerCase().replace(/\s+/g, '-') || 'default'}`}>
                      {commande.statut || "Non défini"}
                    </span>
                  </td>
                  <td>
                    {commande.dateCommande ? new Date(commande.dateCommande).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span>
                      {Number(commande.sousTotal || 0).toLocaleString("fr-FR")} Ar
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span >
                      {Number(commande.fraisLivraison || 0).toLocaleString("fr-FR")} Ar
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="montant" >
                      <strong>{Number(commande.montantTotal || 0).toLocaleString("fr-FR")} Ar</strong>
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-consulter"
                      onClick={() => handleConsulterCommande(commande.numCommande)}
                      title="Consulter cette commande"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <FaEye /> Consulter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-table">
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <h3>
                {hasActiveFilters
                  ? "Aucune commande ne correspond à vos critères"
                  : "Ce client n'a pas encore passé de commande"}
              </h3>
              <p>
                {hasActiveFilters
                  ? "Essayez avec d'autres termes de recherche ou modifiez les filtres."
                  : "Les commandes de ce client apparaîtront ici lorsqu'il en passera."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandesClient;