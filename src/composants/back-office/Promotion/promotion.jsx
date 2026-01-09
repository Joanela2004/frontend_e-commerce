import React, { useState, useEffect } from "react";
import AjouterPromotionModal from "./AjouterPromotionModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import "../../../styles/back-office/promotion.css";
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
          prev.map((p) => (p.numPromotion === result.numPromotion ? result : p))
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
  const toggleStatutPromotion = async (promo) => {
    const statutActuel = getStatutAffichage(promo);
    if (statutActuel.texte === "Expirée") {
      showToast("warning", "Impossible d'activer une promotion expirée.");
      return;
    }

    try {
      const nouveauStatut = !promo.statutPromotion;
      const updatedData = { ...promo, statutPromotion: nouveauStatut };
      const updatedPromo = await updatePromotion(promo.numPromotion, updatedData);

      setPromotions((prev) =>
        prev.map((p) => (p.numPromotion === updatedPromo.numPromotion ? updatedPromo : p))
      );
    } catch (error) {
      showToast("error", "Erreur lors du changement de statut");
    }
  };

  // Calcul du statut réel
  const getStatutAffichage = (promo) => {
    const aujourdHui = new Date();
    const dateFin = promo.dateFin ? new Date(promo.dateFin) : null;
    if (dateFin && dateFin < aujourdHui) {
      return { texte: "Expirée", classe: "expiree" };
    }
    if (promo.statutPromotion === true) {
      return { texte: "Active", classe: "active" };
    }
    return { texte: "Inactive", classe: "inactive" };
  };

  // Filtrage
  const filteredPromotions = promotions.filter((promo) => {
    const searchMatch =
      (promo.codePromo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (promo.nomPromotion?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (promo.typePromotion?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const statutActuel = getStatutAffichage(promo);
    const statutMatch =
      filtreStatut === "tous" ||
      (filtreStatut === "active" && statutActuel.texte === "Active") ||
      (filtreStatut === "inactive" && statutActuel.texte === "Inactive") ||
      (filtreStatut === "expiree" && statutActuel.texte === "Expirée");

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
    searchTerm ||
    filtreStatut !== "tous" ||
    filtreType !== "tous" ||
    filtreDateMin ||
    filtreDateMax;

  const stats = {
    total: filteredPromotions.length,
    active: promotions.filter((p) => getStatutAffichage(p).texte === "Active").length,
    inactive: promotions.filter((p) => getStatutAffichage(p).texte === "Inactive").length,
    expiree: promotions.filter((p) => getStatutAffichage(p).texte === "Expirée").length,
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
          <FaSearch style={{ marginLeft: "8px", color: "#28a458" }} />
          <input
            type="text"
            placeholder="Rechercher par code, nom ou type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`filter-toggle ${showAdvancedFilters ? "active" : ""}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              border: "none",
              background: "white",
              color: "#28a458",
              padding: "0 12px",
              cursor: "pointer",
            }}
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
              <select
                className="form-control"
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Tous</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expiree">Expirée</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Type</label>
              <select
                className="form-control"
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
              >
                <option value="tous">Tous</option>
                <option value="Pourcentage">Pourcentage</option>
                <option value="Montant fixe">Montant fixe</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Date début</label>
              <DatePicker
                selected={filtreDateMin ? new Date(filtreDateMin) : null}
                onChange={(date) =>
                  setFiltreDateMin(date ? date.toISOString().split("T")[0] : "")
                }
                dateFormat="dd/MM/yyyy"
                locale={fr}
                placeholderText="jj/mm/aaaa"
                className="form-control"
                isClearable
              />
            </div>
            <div className="filter-group">
              <label>Date fin</label>
              <DatePicker
                selected={filtreDateMax ? new Date(filtreDateMax) : null}
                onChange={(date) =>
                  setFiltreDateMax(date ? date.toISOString().split("T")[0] : "")
                }
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
                Statut: {filtreStatut === "active" ? "Active" : filtreStatut === "inactive" ? "Inactive" : "Expirée"}
                <button onClick={() => setFiltreStatut("tous")}>×</button>
              </span>
            )}
            {filtreType !== "tous" && (
              <span className="active-filter-tag">
                Type: {filtreType} <button onClick={() => setFiltreType("tous")}>×</button>
              </span>
            )}
            {filtreDateMin && (
              <span className="active-filter-tag">
                Début {filtreDateMin} <button onClick={() => setFiltreDateMin("")}>×</button>
              </span>
            )}
            {filtreDateMax && (
              <span className="active-filter-tag">
                Fin {filtreDateMax} <button onClick={() => setFiltreDateMax("")}>×</button>
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
              <th>Activer/Désactiver</th> {/* Nouvelle colonne */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.length > 0 ? (
              filteredPromotions.map((promo) => {
                const statut = getStatutAffichage(promo);
                return (
                  <tr
                    key={promo.numPromotion}
                    className={statut.texte === "Active" ? "active-row" : ""}
                  >
                    <td>
                      <strong style={{ fontFamily: "monospace", color: "#8b5e3c" }}>
                        {promo.codePromo || "—"}
                      </strong>
                    </td>
                    <td>{promo.nomPromotion}</td>
                    <td>
                      <span
                        className={`badge-type ${
                          promo.typePromotion === "Pourcentage" ? "badge-percent" : "badge-amount"
                        }`}
                      >
                        {promo.typePromotion}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {promo.typePromotion === "Pourcentage"
                          ? `${promo.valeur}%`
                          : `${promo.valeur.toLocaleString()} Ar`}
                      </strong>
                    </td>
                    <td>
                      {promo.montantMinimum
                        ? `${promo.montantMinimum.toLocaleString()} Ar`
                        : "—"}
                    </td>
                    <td>
                      {promo.dateDebut
                        ? new Date(promo.dateDebut).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td>
                      {promo.dateFin
                        ? new Date(promo.dateFin).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td>
                      <span className={`status ${statut.classe}`}>
                        {statut.texte}
                      </span>
                    </td>
                    {/* Nouvelle colonne Toggle */}
                   <td>
  <label className="switch" title={promo.statutPromotion ? "Désactiver la promotion" : "Activer la promotion"}>
    <input
      type="checkbox"
      checked={promo.statutPromotion}
      onChange={() => toggleStatutPromotion(promo)}
      disabled={statut.texte === "Expirée"}
    />
    <span className="slider round"></span>
  </label>
</td>
                    <td>
                      <div className="table-actions">
                        {statut.texte !== "Expirée" && (
                          <button className="edit" onClick={() => handleEdit(promo)}>
                            <FaEdit style={{ color: "#28a458", marginRight: "8px" }} /> Modifier
                          </button>
                        )}
                        <button
                          className="delete"
                          onClick={() => openDeleteModal(promo)}
                        >
                          <FaTrash style={{ marginRight: "8px" }} /> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="empty-table">
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
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
                Êtes-vous sûr de vouloir supprimer la promotion{" "}
                <strong>{promotionASupprimer?.nomPromotion}</strong>
              </p>
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px", marginTop: "20px" }}>
                <button
                  className="edit"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Annuler
                </button>
                <button className="delete" onClick={confirmerSuppression}>
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