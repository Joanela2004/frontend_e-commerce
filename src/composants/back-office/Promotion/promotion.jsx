import React, { useState, useEffect } from "react";
import AjouterPromotionModal from "./AjouterPromotionModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

import {
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../../../services/promotionService";

import {
  FaGift,
  FaSearch,
  FaEdit,
  FaSync,
  FaFilter,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";

import { useToast } from "../../../contexts/ToastContext";

import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/toast.css";

const Promotions = () => {
  const { showToast } = useToast();

  const [promotions, setPromotions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promotionAEditer, setPromotionAEditer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filtres
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreType, setFiltreType] = useState("tous");
  const [filtreDateMin, setFiltreDateMin] = useState("");
  const [filtreDateMax, setFiltreDateMax] = useState("");

  // Modal suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promotionASupprimer, setPromotionASupprimer] = useState(null);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await fetchPromotions();
      setPromotions(data);
    } catch (error) {
      showToast("error", "Erreur lors du chargement des promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleSavePromotion = async (promotionData) => {
    try {
      let result;
      if (promotionAEditer) {
        result = await updatePromotion(promotionAEditer.numPromotion, promotionData);
        setPromotions((prev) =>
          prev.map((p) => (p.numPromotion === promotionAEditer.numPromotion ? result : p))
        );
        showToast("success", "Promotion mise à jour avec succès !");
      } else {
        result = await createPromotion(promotionData);
        setPromotions((prev) => [...prev, result]);
        showToast("success", "Promotion ajoutée avec succès !");
      }
      setIsModalOpen(false);
      setPromotionAEditer(null);
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de la sauvegarde";
      showToast("error", msg);
    }
  };

  const handleEdit = (promo) => {
    setPromotionAEditer(promo);
    setIsModalOpen(true);
  };

  const openDeleteModal = (promo) => {
    setPromotionASupprimer(promo);
    setShowDeleteModal(true);
  };

  const confirmerSuppression = async () => {
    if (!promotionASupprimer) return;

    try {
      await deletePromotion(promotionASupprimer.numPromotion);
      setPromotions((prev) =>
        prev.filter((p) => p.numPromotion !== promotionASupprimer.numPromotion)
      );
      showToast("success", "Promotion supprimée avec succès !");
    } catch (error) {
      showToast("error", "Erreur lors de la suppression");
    } finally {
      setShowDeleteModal(false);
      setPromotionASupprimer(null);
    }
  };

  // Filtrage
  const filteredPromotions = promotions.filter((promo) => {
    const searchMatch =
      (promo.codePromo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (promo.nomPromotion?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (promo.typePromotion?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const statutMatch =
      filtreStatut === "tous" ||
      (filtreStatut === "active" && promo.statutPromotion === "Active") ||
      (filtreStatut === "inactive" && promo.statutPromotion === "Inactive") ||
      (filtreStatut === "expiree" && promo.statutPromotion === "Expirée");

    const typeMatch =
      filtreType === "tous" ||
      promo.typePromotion?.toLowerCase() === filtreType.toLowerCase();

    const debut = promo.dateDebut ? new Date(promo.dateDebut) : null;
    const fin = promo.dateFin ? new Date(promo.dateFin) : null;

    const dateMinOk =
      !filtreDateMin ||
      (debut && debut >= new Date(filtreDateMin)) ||
      (fin && fin >= new Date(filtreDateMin));

    const dateMaxOk =
      !filtreDateMax ||
      (debut && debut <= new Date(filtreDateMax)) ||
      (fin && fin <= new Date(filtreDateMax));

    return searchMatch && statutMatch && typeMatch && dateMinOk && dateMaxOk;
  });

  const reinitialiserFiltres = () => {
    setSearchTerm("");
    setFiltreStatut("tous");
    setFiltreType("tous");
    setFiltreDateMin("");
    setFiltreDateMax("");
    showToast("info", "Filtres réinitialisés");
  };

  const hasActiveFilters =
    searchTerm || filtreStatut !== "tous" || filtreType !== "tous" || filtreDateMin || filtreDateMax;

  const stats = {
    total: filteredPromotions.length,
    active: promotions.filter((p) => p.statutPromotion === "Active").length,
    inactive: promotions.filter((p) => p.statutPromotion === "Inactive").length,
    expiree: promotions.filter((p) => p.statutPromotion === "Expirée").length,
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>
            <FaGift style={{ marginRight: "10px" }} /> Gestion des Promotions
          </h1>
          <div className="stats-container" style={{ marginTop: "10px" }}>
            <span className="stat-item">
              {stats.total} promotion{stats.total > 1 ? "s" : ""}
            </span>
            <span className="stat-item" style={{ backgroundColor: "#d4edda", color: "#155724" }}>
              {stats.active} active{stats.active > 1 ? "s" : ""}
            </span>
            <span className="stat-item" style={{ backgroundColor: "#fff3cd", color: "#856404" }}>
              {stats.inactive} inactive{stats.inactive > 1 ? "s" : ""}
            </span>
            <span className="stat-item" style={{ backgroundColor: "#f8d7da", color: "#721c24" }}>
              {stats.expiree} expirée{stats.expiree > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <button
          className="ajout"
          onClick={() => {
            setPromotionAEditer(null);
            setIsModalOpen(true);
          }}
        >
          <FaGift style={{ marginRight: "8px" }} /> Ajouter une promotion
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="search-container">
              <div className="search-bar">
                <FaSearch style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }} />
          <input
            type="text"
            placeholder="Rechercher par code, nom ou type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`filter-toggle ${showAdvancedFilters ? "active" : ""}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
             style={{ border:"none", display:"flex", alignItems:"center", background:"white", color:"#28a458", paddingRight:"10px"}}
                    >
                      <FaFilter />
                    </button>
          <FaSync
            onClick={reinitialiserFiltres}
            style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }}
            title="Réinitialiser les filtres"
          />
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Statut</label>
              <select className="form-control" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
                <option value="tous">Tous</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expiree">Expirée</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Type</label>
              <select className="form-control" value={filtreType} onChange={(e) => setFiltreType(e.target.value)}>
                <option value="tous">Tous</option>
                <option value="pourcentage">Pourcentage</option>
                <option value="montant fixe">Montant fixe</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Date début </label>
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
              <label>Date fin </label>
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

          {/* Tags filtres actifs */}
          <div className="active-filters">
            {filtreStatut !== "tous" && (
              <span className="active-filter-tag">
                Statut: {filtreStatut} <button onClick={() => setFiltreStatut("tous")}>×</button>
              </span>
            )}
            {filtreType !== "tous" && (
              <span className="active-filter-tag">
                Type: {filtreType} <button onClick={() => setFiltreType("tous")}>×</button>
              </span>
            )}
            {filtreDateMin && (
              <span className="active-filter-tag">
                Début  {filtreDateMin} <button onClick={() => setFiltreDateMin("")}>×</button>
              </span>
            )}
            {filtreDateMax && (
              <span className="active-filter-tag">
                Fin  {filtreDateMax} <button onClick={() => setFiltreDateMax("")}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Type</th>
              <th>Valeur</th>
              <th>Montant min.</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.length > 0 ? (
              filteredPromotions.map((promo) => (
                <tr key={promo.numPromotion} className={promo.statutPromotion === "Active" ? "active-row" : ""}>
                  <td><strong style={{ fontFamily: "monospace", color: "#8b5e3c" }}>{promo.codePromo}</strong></td>
                  <td>{promo.nomPromotion}</td>
                  <td>
                    <span className={`badge-type ${promo.typePromotion === "Pourcentage" ? "badge-percent" : "badge-amount"}`}>
                      {promo.typePromotion}
                    </span>
                  </td>
                  <td>
                    <strong>
                      {promo.typePromotion === "Pourcentage" ? `${promo.valeur}%` : `${promo.valeur.toLocaleString()} Ar`}
                    </strong>
                  </td>
                  <td>{promo.montantMinimum ? `${promo.montantMinimum.toLocaleString()} Ar` : "—"}</td>
                  <td>{promo.dateDebut ? new Date(promo.dateDebut).toLocaleDateString("fr-FR") : "—"}</td>
                  <td>{promo.dateFin ? new Date(promo.dateFin).toLocaleDateString("fr-FR") : "—"}</td>
                  <td>
                    <span className={`status ${promo.statutPromotion?.toLowerCase().replace("é", "e") || "inactive"}`}>
                      {promo.statutPromotion || "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="edit" onClick={() => handleEdit(promo)}>
                        <FaEdit style={{ color: "#28a458", marginRight: "8px" }} /> Modifier
                      </button>
                      <button className="delete" onClick={() => openDeleteModal(promo)}>
                        <FaTrash style={{ marginRight: "8px" }} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="empty-table">
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <h3>
                      {hasActiveFilters
                        ? "Aucune promotion ne correspond à vos critères"
                        : "Aucune promotion trouvée"}
                    </h3>
                    <p>
                      {hasActiveFilters
                        ? "Modifiez vos filtres pour voir plus de résultats."
                        : "Commencez par ajouter votre première promotion !"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout/Édition */}
      {isModalOpen && (
        <AjouterPromotionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setPromotionAEditer(null);
          }}
          onSave={handleSavePromotion}
          promotionAEditer={promotionAEditer}
        />
      )}

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaExclamationTriangle style={{ color: "#dc3545" }} />
                Confirmer la suppression
              </h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
                Êtes-vous sûr de vouloir supprimer la promotion <strong>{promotionASupprimer?.nomPromotion}</strong> (code : <strong>{promotionASupprimer?.codePromo}</strong>) ?
              </p>
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px", marginTop: "20px" }}>
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-danger" onClick={confirmerSuppression}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;