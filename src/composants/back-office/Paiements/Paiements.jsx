import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaSync,
  FaFilter,
  FaCheckCircle,
  FaMoneyBillWave,
  FaUser,
  FaCalendarAlt,
  FaCreditCard,
  FaFileInvoiceDollar
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/toast.css";
import { fetchPaiements, updatePaiement,confirmerPaiement } from "../../../services/paiementService";
import { useToast } from "../../../contexts/ToastContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

const Paiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  // États pour les filtres
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreDateMin, setFiltreDateMin] = useState("");
  const [filtreDateMax, setFiltreDateMax] = useState("");
  const [filtreMontantMin, setFiltreMontantMin] = useState("");
  const [filtreMontantMax, setFiltreMontantMax] = useState("");

  // Modal de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    paiementId: null,
    onConfirm: null
  });

  useEffect(() => {
    loadPaiements();
  }, []);

  const loadPaiements = async () => {
    setLoading(true);
    try {
      const data = await fetchPaiements();
      setPaiements(data);
    } catch (error) {
      console.error("Erreur lors du chargement des paiements:", error);
      showToast("error", "Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (title, message, paiementId, onConfirm) => {
    setModalData({
      title,
      message,
      paiementId,
      onConfirm
    });
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setModalData({
      title: "",
      message: "",
      paiementId: null,
      onConfirm: null
    });
  };

  const handleMarkAsPaid = async (paiement) => {
  const numCommande = paiement.commande?.numCommande;
  
  if (!numCommande) {
    showToast("error", "Numéro de commande introuvable");
    return;
  }

  showModal(
    "Confirmer le paiement",
    `Marquer la commande #${paiement.commande?.referenceCommande} comme payée ?`,
    paiement.numPaiement,
    async () => {
      try {
        await confirmerPaiement(numCommande);

        // Mise à jour locale (optimiste)
        setPaiements(prev => 
          prev.map(p => 
            p.numPaiement === paiement.numPaiement
              ? {
                  ...p,
                  statut: "effectué",
                  datePaiement: new Date().toISOString(),
                  // Bonus : on peut aussi mettre à jour le statut commande si tu l'affiches
                }
              : p
          )
        );

        showToast("success", "Paiement confirmé avec succès !");

        // Option très sûre : recharger toute la liste
        // await loadPaiements();

      } catch (err) {
        console.error("Erreur confirmation paiement:", err);
        showToast("error", err.response?.data?.message || "Échec de la confirmation");
      }
    }
  );
};

  // Filtrer les paiements
  const filteredPaiements = paiements.filter(paiement => {
    const searchMatch =
      (paiement.numPaiement?.toString() || "").includes(searchTerm) ||
      (paiement.numCommande?.toString() || "").includes(searchTerm) ||
      (paiement.commande?.utilisateur?.prenom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (paiement.commande?.utilisateur?.nom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (paiement.commande?.utilisateur?.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const statutMatch = filtreStatut === "tous" || paiement.statut === filtreStatut;

    const dateMinMatch = !filtreDateMin || 
      (paiement.datePaiement && new Date(paiement.datePaiement) >= new Date(filtreDateMin));

    const dateMaxMatch = !filtreDateMax || 
      (paiement.datePaiement && new Date(paiement.datePaiement) <= new Date(filtreDateMax));

    const montantMinMatch = !filtreMontantMin || 
      (paiement.montantApayer || 0) >= parseFloat(filtreMontantMin);

    const montantMaxMatch = !filtreMontantMax || 
      (paiement.montantApayer || 0) <= parseFloat(filtreMontantMax);

    return searchMatch && statutMatch && dateMinMatch && dateMaxMatch && montantMinMatch && montantMaxMatch;
  });

  // Réinitialiser tous les filtres
  const reinitialiserFiltres = () => {
    setFiltreStatut("tous");
    setFiltreDateMin("");
    setFiltreDateMax("");
    setFiltreMontantMin("");
    setFiltreMontantMax("");
    setSearchTerm("");
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters =
    searchTerm ||
    filtreStatut !== "tous" ||
    filtreDateMin ||
    filtreDateMax ||
    filtreMontantMin ||
    filtreMontantMax;

  // Statistiques
  const paiementsEffectues = paiements.filter(p => p.statut === "effectué").length;
  const paiementsEnAttente = paiements.filter(p => p.statut === "en attente").length;
 
 

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestion des Paiements</h1>
          <div className="stats-container" style={{ marginTop: '10px' }}>
            <span className="stat-item">
              {filteredPaiements.length} paiement{filteredPaiements.length !== 1 ? 's' : ''} trouvé{filteredPaiements.length !== 1 ? 's' : ''}
            </span>
            <span className="stat-item" style={{ background: 'rgba(40, 164, 88, 0.1)', color: '#28a458' }}>
              <FaCheckCircle style={{marginRight: '5px'}} /> {paiementsEffectues} effectué{paiementsEffectues !== 1 ? 's' : ''}
            </span>
            <span className="stat-item" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#856404' }}>
              <FaFileInvoiceDollar style={{marginRight: '5px'}} /> {paiementsEnAttente} en attente
            </span>
            
          </div>
        </div>
      </div>

      <div className="navigation-tabs">
        <button className="tab-active">
          <FaMoneyBillWave style={{marginRight:"8px"}} /> Paiements
        </button>
        <button 
          className="tab-inactive"
          onClick={() => navigate("/admin/paiements/modes")}
        >
          <FaCreditCard style={{marginRight:"8px"}} /> Modes de paiement
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }}  />
                 
          <input
            type="text"
            placeholder="Rechercher par ID, commande, client ou email..."
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
                <option value="effectué">Effectué</option>
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
              <label><FaMoneyBillWave style={{marginRight:"5px"}} /> Montant min</label>
              <input
                type="number"
                className="form-control"
                value={filtreMontantMin}
                onChange={(e) => setFiltreMontantMin(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="filter-group">
              <label><FaMoneyBillWave style={{marginRight:"5px"}} /> Montant max</label>
              <input
                type="number"
                className="form-control"
                value={filtreMontantMax}
                onChange={(e) => setFiltreMontantMax(e.target.value)}
                min="0"
                step="0.01"
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
                Montant : {filtreMontantMax} Ar
                <button onClick={() => setFiltreMontantMax("")}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tableau des paiements */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Commande</th>
              <th>Client</th>
              <th>Montant (en Ar)</th>
              <th>Mode de paiement</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPaiements.length > 0 ? (
              filteredPaiements.map((paiement) => (
                <tr key={paiement.numPaiement}>
                 
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>{paiement.commande?.referenceCommande || "N/A"}</div>
                      
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                   
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {paiement.commande?.utilisateur?.prenom || ''} {paiement.commande?.utilisateur?.nom || ''}
                        </div>
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {paiement.commande?.utilisateur?.email || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      
                      <span style={{ fontWeight: "bold", color: "#8b5e3c" }}>
                        {parseFloat(paiement.montantApayer || 0).toFixed(2)} 
                      </span>
                    </div>
                  </td>
                  <td>
                    {paiement.mode_paiement?.image ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={`${IMAGE_BASE_URL}${paiement.mode_paiement.image}`}
                          alt={paiement.mode_paiement.nomMode}
                          style={{ width: "40px", height: "25px", objectFit: "contain" }}
                        />
                        <span>{paiement.mode_paiement?.nomMode }</span>
                      </div>
                    ) : (
                      <span>{paiement.mode_paiement?.nomMode || "—"}</span>
                    )}
                  </td>
                  <td>
                    <span className={`status ${paiement.statut === "effectué" ? "validée" : "en-attente"}`}>
                      {paiement.statut === "effectué" ? "Payé" : "En attente"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                         {paiement.datePaiement
                        ? new Date(paiement.datePaiement).toLocaleDateString("fr-FR")
                        : "—"}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      {paiement.statut !== "effectué" && (
                        <button
                          className="btn-validate"
                          onClick={() => handleMarkAsPaid(paiement)}
                          disabled={loadingAction === paiement.numPaiement}
                          style={{
                            opacity: loadingAction === paiement.numPaiement ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          {loadingAction === paiement.numPaiement ? (
                            <>
                              <div className="loading-spinner" style={{width: '16px', height: '16px', borderWidth: '2px'}}></div>
                              Traitement...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle style={{marginRight:"5px"}} /> Marquer payé
                            </>
                          )}
                        </button>
                      )}
                      {paiement.statut === "effectué" && (
                        <button className="btn-expediee" disabled>
                          <FaCheckCircle style={{marginRight:"5px"}} /> Déjà payé
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-table">
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <h3>
                      {hasActiveFilters
                        ? "Aucun paiement ne correspond à vos critères"
                        : "Aucun paiement trouvé"}
                    </h3>
                    <p>
                      {hasActiveFilters
                        ? "Essayez avec d'autres termes de recherche ou modifiez les filtres."
                        : "Les paiements apparaîtront ici lorsqu'ils seront enregistrés."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaCheckCircle style={{ color: "#28a458" }} />
                {modalData.title}
              </h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ 
                fontSize: "16px", 
                lineHeight: "1.5", 
                marginBottom: "20px",
                whiteSpace: 'pre-line'
              }}>
                {modalData.message}
              </p>
              
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                <button
                  className="btn btn-secondary"
                  onClick={closeModal}
                  style={{ padding: "10px 30px" }}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    if (modalData.onConfirm) {
                      await modalData.onConfirm();
                    }
                    closeModal();
                  }}
                  style={{ padding: "10px 30px" }}
                >
                  <FaCheckCircle style={{marginRight:"8px"}} /> Confirmer
                </button>
               
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Paiements;