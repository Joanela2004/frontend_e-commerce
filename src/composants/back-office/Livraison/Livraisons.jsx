import React, { useEffect, useState } from "react";
import {
  fetchLivraisons,
  updateLivraison,
} from "../../../services/livraisonService";
import {
  FaTruck,
  FaSearch,
  FaSync,
  FaFilter,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaWeightHanging,
  FaCheckCircle,
  FaEdit,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { updateCommandeAdmin } from "../../../services/commandeService";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";

const LivraisonModal = ({ isOpen, onClose, livraison, onSave }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (livraison) {
      setFormData({
        ...livraison,
        transporteur: livraison.transporteur || "",
        referenceColis: livraison.referenceColis || "",
        lieuLivraison: livraison.lieuLivraison || "",
        contactTransporteur: livraison.contactTransporteur || "",
        statutLivraison: livraison.statutLivraison || "en cours",
      });
    }
  }, [livraison]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = { ...formData };

      if (
        updatedData.statutLivraison === "livrée" &&
        !updatedData.dateLivraison
      ) {
        updatedData.dateLivraison = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      }

      await updateLivraison(updatedData.numLivraison, updatedData);

      if (updatedData.statutLivraison === "livrée") {
        await updateCommandeAdmin(updatedData.numCommande, {
          statut: "livrée",
          dateLivraison: updatedData.dateLivraison,
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Une erreur est survenue lors de la mise à jour de la livraison.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h2>
            <FaEdit style={{ color: "var(--color-primary, #28a458)" }} />
            Modifier la Livraison #{livraison?.numCommande}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>Transporteur</label>
                <input
                  type="text"
                  name="transporteur"
                  value={formData.transporteur}
                  onChange={handleChange}
                  required
                  placeholder="Nom du transporteur"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Référence Colis</label>
                <input
                  type="text"
                  name="referenceColis"
                  value={formData.referenceColis}
                  onChange={handleChange}
                  required
                  placeholder="Numéro de suivi"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Lieu de livraison</label>
                <input
                  type="text"
                  name="lieuLivraison"
                  value={formData.lieuLivraison}
                  onChange={handleChange}
                  required
                  placeholder="Adresse de livraison"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Contact Transporteur</label>
                <input
                  type="text"
                  name="contactTransporteur"
                  value={formData.contactTransporteur}
                  onChange={handleChange}
                  placeholder="Téléphone ou email du transporteur"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row" style={{ paddingBottom: "20px" }}>
              <div className="form-group" style={{ flex: "1 1 100%" }}>
                <label>Statut de la livraison</label>
                <select
                  name="statutLivraison"
                  value={formData.statutLivraison}
                  onChange={handleChange}
                  required
                  className="form-control"
                >
                  <option value="en cours">En cours</option>
                  <option value="livrée">Livrée</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Livraisons = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLivraison, setCurrentLivraison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const navigate = useNavigate();

  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreDateMin, setFiltreDateMin] = useState("");
  const [filtreDateMax, setFiltreDateMax] = useState("");
  const [filtreTransporteur, setFiltreTransporteur] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchLivraisons();
      setLivraisons(data);
    } catch (error) {
      console.error("Erreur lors du chargement des livraisons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const transporteursUniques = [
    ...new Set(
      livraisons.filter((l) => l.transporteur).map((l) => l.transporteur)
    ),
  ];

  // Filtrage des livraisons
  const filteredLivraisons = livraisons
    .filter((livraison) => {
      // NOUVELLE RÈGLE : on n'affiche que celles qui ont une date d'expédition
      if (!livraison.dateExpedition) return false;

      const searchMatch =
        (livraison.numCommande?.toString() || "").includes(searchTerm.toLowerCase()) ||
        (livraison.transporteur?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (livraison.referenceColis?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (livraison.lieuLivraison?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (livraison.commande?.referenceCommande?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (livraison.commande?.utilisateur?.nomUtilisateur?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const statutMatch = filtreStatut === "tous" || livraison.statutLivraison === filtreStatut;
      const transporteurMatch =
        !filtreTransporteur ||
        livraison.transporteur?.toLowerCase() === filtreTransporteur.toLowerCase();

      const dateExpedition = livraison.dateExpedition ? new Date(livraison.dateExpedition) : null;
      const dateLivraison = livraison.dateLivraison ? new Date(livraison.dateLivraison) : null;

      const dateMinMatch =
        !filtreDateMin ||
        (dateExpedition && dateExpedition >= new Date(filtreDateMin)) ||
        (dateLivraison && dateLivraison >= new Date(filtreDateMin));

      const dateMaxMatch =
        !filtreDateMax ||
        (dateExpedition && dateExpedition <= new Date(filtreDateMax)) ||
        (dateLivraison && dateLivraison <= new Date(filtreDateMax));

      return searchMatch && statutMatch && transporteurMatch && dateMinMatch && dateMaxMatch;
    });

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltreStatut("tous");
    setFiltreDateMin("");
    setFiltreDateMax("");
    setFiltreTransporteur("");
  };

  const hasActiveFilters =
    searchTerm || filtreStatut !== "tous" || filtreDateMin || filtreDateMax || filtreTransporteur;

  const livraisonsEnCours = livraisons.filter(
    (l) => l.dateExpedition && l.statutLivraison === "en cours"
  ).length;
  const livraisonsLivrees = livraisons.filter(
    (l) => l.dateExpedition && l.statutLivraison === "livrée"
  ).length;
  const transporteursCount = transporteursUniques.length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des livraisons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaTruck /> Gestion des Livraisons
          </h1>
          <div className="stats-container" style={{ marginTop: "10px" }}>
            <span className="stat-item">
              {filteredLivraisons.length} livraison{filteredLivraisons.length !== 1 ? "s" : ""} trouvée{filteredLivraisons.length !== 1 ? "s" : ""}
            </span>
            <span className="stat-item" style={{ backgroundColor: "#fff3cd", color: "#856404" }}>
              {livraisonsEnCours} en cours
            </span>
            <span className="stat-item" style={{ backgroundColor: "#d4edda", color: "#155724" }}>
              {livraisonsLivrees} livrée{livraisonsLivrees !== 1 ? "s" : ""}
            </span>
            <span className="stat-item" style={{ backgroundColor: "#e3f2fd", color: "#1565c0" }}>
              {transporteursCount} transporteur{transporteursCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="navigation-tabs" style={{ marginBottom: "20px" }}>
        <button className="tab-active">
          <FaTruck style={{ marginRight: "8px" }} /> Livraisons
        </button>
        <button className="tab-inactive" onClick={() => navigate("/admin/livraisons/frais")}>
          <FaWeightHanging style={{ marginRight: "8px" }} /> Frais
        </button>
        <button className="tab-inactive" onClick={() => navigate("/admin/livraisons/lieux")}>
          <FaMapMarkerAlt style={{ marginRight: "8px" }} /> Lieux de livraison
        </button>
      </div>

      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }} />
          <input
            type="text"
            placeholder="Rechercher par commande, transporteur, référence ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`filter-toggle ${showAdvancedFilters ? "active" : ""}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              border: "none",
              display: "flex",
              alignItems: "center",
              background: "white",
              color: "#28a458",
              paddingRight: "10px",
            }}
          >
            <FaFilter />
          </button>
          <FaSync
            onClick={reinitialiserFiltres}
            style={{
              marginRight: "8px",
              border: "none",
              color: "#28a458",
              cursor: "pointer",
            }}
            title="Réinitialiser tous les filtres"
          />
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Statut</label>
              <select className="form-control" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
                <option value="tous">Tous les statuts</option>
                <option value="en cours">En cours</option>
                <option value="livrée">Livrée</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Transporteur</label>
              <select className="form-control" value={filtreTransporteur} onChange={(e) => setFiltreTransporteur(e.target.value)}>
                <option value="">Tous les transporteurs</option>
                {transporteursUniques.map((transporteur, index) => (
                  <option key={index} value={transporteur}>
                    {transporteur}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>
                <FaCalendarAlt style={{ marginRight: "5px" }} /> Date min
              </label>
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
              <label>
                <FaCalendarAlt style={{ marginRight: "5px" }} /> Date max
              </label>
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
          </div>

          <div className="active-filters">
            {filtreStatut !== "tous" && (
              <span className="active-filter-tag">
                Statut: {filtreStatut}
                <button onClick={() => setFiltreStatut("tous")}>×</button>
              </span>
            )}
            {filtreTransporteur && (
              <span className="active-filter-tag">
                Transporteur: {filtreTransporteur}
                <button onClick={() => setFiltreTransporteur("")}>×</button>
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
          </div>
        </div>
      )}

      <div className="table-container">
        {filteredLivraisons.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Transporteur</th>
                <th>Référence Colis</th>
                <th>Lieu de livraison</th>
                <th>Date d'expédition</th>
                <th>Date de livraison</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLivraisons.map((livraison) => (
                <tr key={livraison.numLivraison}>
                  <td>
                    {livraison.commande?.referenceCommande || livraison.numCommande}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: "500" }}>
                          {livraison.commande?.utilisateur?.nomUtilisateur || "-"}
                        </div>
                        <div style={{ fontSize: "0.85em", color: "#666" }}>
                          {livraison.commande?.utilisateur?.contact || ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{livraison.transporteur || "-"}</td>
                  <td>
                    <span style={{ fontFamily: "monospace" }}>{livraison.referenceColis || "-"}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaMapMarkerAlt style={{ color: "#dc3545" }} />
                      <span>{livraison.lieuLivraison || "-"}</span>
                    </div>
                  </td>
                  <td>{livraison.dateExpedition || "-"}</td>
                  <td>{livraison.dateLivraison || "-"}</td>
                  <td>
                    <span
                      className={`status ${
                        livraison.statutLivraison === "livrée" ? "livrée" : "en-cours"
                      }`}
                    >
                      {livraison.statutLivraison === "livrée" ? (
                        <>
                          <FaCheckCircle style={{ marginRight: "5px" }} /> Livrée
                        </>
                      ) : (
                        "En cours"
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions" style={{ gap: "8px" }}>
                      {livraison.statutLivraison === "en cours" && (
                        <button
                          className="edit"
                          onClick={() => {
                            setCurrentLivraison(livraison);
                            setIsModalOpen(true);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <FaEdit style={{ color: "#28a458" }} /> Modifier
                        </button>
                      )}
                      {livraison.statutLivraison === "livrée" && (
                        <span style={{ color: "#666", fontStyle: "italic", fontSize: "0.9em" }}>
                          Terminée
                        </span>
                      )}
                    </div>
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
                  ? "Aucune livraison ne correspond à vos critères"
                  : "Aucune livraison expédiée pour le moment"}
              </h3>
              <p>
                Les livraisons apparaîtront ici dès qu'une date d'expédition sera définie.
              </p>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && currentLivraison && (
        <LivraisonModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentLivraison(null);
          }}
          livraison={currentLivraison}
          onSave={loadData}
        />
      )}
    </div>
  );
};

export default Livraisons;