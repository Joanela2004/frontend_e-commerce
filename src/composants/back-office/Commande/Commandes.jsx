import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaSync,
  FaFilter,
  FaEye,
  FaCheck,
  FaTruck,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useNouvelleCommande } from "../../../contexts/Actualisation";
import {
  fetchCommandes,
  updateCommandeAdmin,
  verifierEtExpedierCommande, // Nouvelle fonction à créer dans commandeService
} from "../../../services/commandeService";
import { updateLivraison } from "../../../services/livraisonService";
import { useToast } from "../../../contexts/ToastContext";
import ModalLivraison from "./ModalLivraison";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/toast.css";
import { fetchPaiementByCommande } from "../../../services/paiementService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Commandes = () => {
  const { newOrdersCount, markAsConsulted } = useNouvelleCommande();
  const { showToast } = useToast();
  const [commandes, setCommandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const navigate = useNavigate();

  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreDateMin, setFiltreDateMin] = useState("");
  const [filtreDateMax, setFiltreDateMax] = useState("");
  const [filtrePrixMin, setFiltrePrixMin] = useState("");
  const [filtrePrixMax, setFiltrePrixMax] = useState("");
  const [filtrePaiementFrais, setFiltrePaiementFrais] = useState("tous");

  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showExpedierModal, setShowExpedierModal] = useState(false);
  const [paiement, setPaiement] = useState([]);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    type: "",
    commandeId: null,
    commandeInfo: "",
    onConfirm: null,
  });

  const [isLivraisonModalOpen, setIsLivraisonModalOpen] = useState(false);
  const [currentDeliveryData, setCurrentDeliveryData] = useState({});
  const [currentCmd, setCurrentCmd] = useState(null);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const loadPaiement = async (commande) => {
    try {
      const paiementData = await fetchPaiementByCommande(commande.referenceCommande);
      setPaiement((prev) => ({ ...prev, [commande.numCommande]: paiementData }));
    } catch (err) {
      setPaiement((prev) => ({ ...prev, [commande.numCommande]: null }));
    }
  };

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const data = await fetchCommandes();
      setCommandes(data);
      data.forEach((cmd) => loadPaiement(cmd));
    } catch (error) {
      console.error("Erreur chargement des commandes:", error);
      showToast("error", "Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (type, title, message, commandeId = null, commandeInfo = "", onConfirm = null) => {
    setModalData({ type, title, message, commandeId, commandeInfo, onConfirm });
    if (type === "expedier") setShowExpedierModal(true);
    else if (type === "validate") setShowValidateModal(true);
    else if (type === "cancel") setShowCancelModal(true);
    else if (type === "pay") setShowPayModal(true);
  };

  const closeAllModals = () => {
    setShowExpedierModal(false);
    setShowValidateModal(false);
    setShowCancelModal(false);
    setShowPayModal(false);
    setModalData({ title: "", message: "", type: "", commandeId: null, commandeInfo: "", onConfirm: null });
  };

  const handleMarquerCommeVue = async (commandeId) => {
    try {
      setCommandes((prev) =>
        prev.map((cmd) => (cmd.numCommande === commandeId ? { ...cmd, estConsulte: 1 } : cmd))
      );
      await markAsConsulted(commandeId);
      navigate(`/admin/commandes/${commandeId}`);
    } catch (err) {
      setCommandes((prev) =>
        prev.map((cmd) => (cmd.numCommande === commandeId ? { ...cmd, estConsulte: 0 } : cmd))
      );
      console.error(err);
    }
  };

  const handleValidateClick = (commande) => {
    showModal(
      "validate",
      "Valider la commande",
      `Êtes-vous sûr de vouloir valider la commande #${commande.referenceCommande || commande.numCommande} ?`,
      commande.numCommande,
      `Commande # ${commande.referenceCommande || commande.numCommande} - ${commande.utilisateur?.nomUtilisateur || "Client"}`,
      async () => {
        try {
          await updateCommandeAdmin(commande.numCommande, { statut: "validée" });
          setCommandes((prev) =>
            prev.map((cmd) =>
              cmd.numCommande === commande.numCommande ? { ...cmd, statut: "validée" } : cmd
            )
          );
          showToast("success", "Commande validée avec succès !");
        } catch (error) {
          console.error("Erreur mise à jour statut", error);
          showToast("error", "Erreur lors de la validation de la commande");
        }
      }
    );
  };

  const handleCancelClick = (commande) => {
    showModal(
      "cancel",
      "Annuler la commande",
      `Êtes-vous sûr de vouloir annuler la commande #${commande.referenceCommande || commande.numCommande} ?`,
      commande.numCommande,
      `Commande # ${commande.referenceCommande || commande.numCommande} - ${commande.utilisateur?.nomUtilisateur || "Client"}`,
      async () => {
        try {
          await updateCommandeAdmin(commande.numCommande, { statut: "annulée" });
          setCommandes((prev) =>
            prev.map((cmd) =>
              cmd.numCommande === commande.numCommande ? { ...cmd, statut: "annulée" } : cmd
            )
          );
          showToast("success", "Commande annulée avec succès !");
        } catch (error) {
          console.error("Erreur mise à jour statut", error);
          showToast("error", "Erreur lors de l'annulation de la commande");
        }
      }
    );
  };

  // Nouvelle fonction : vérification stock + expédition + annulation si insuffisant
  const handleExpedierAvecVerification = async (cmd) => {
    const livraison = cmd.livraisons?.[0] || {};
    setCurrentCmd(cmd);
    setCurrentDeliveryData({
      numCommande: cmd.numCommande,
      referenceColis: livraison.referenceColis || "",
      lieuLivraison: livraison.lieuLivraison || "",
      transporteur: livraison.transporteur || "",
      contactTransporteur: livraison.contactTransporteur || "",
    });
    setIsLivraisonModalOpen(true);
  };

  const handleDeliverySubmit = async (data) => {
    if (!currentCmd) {
      showToast("error", "Aucune commande sélectionnée.");
      return;
    }

    const livraison = currentCmd.livraisons?.[0];
    if (!livraison?.numLivraison) {
      showToast("error", "Livraison introuvable.");
      return;
    }

    try {
      // Appel à la nouvelle API qui vérifie le stock + expédie + annule si besoin
      const response = await verifierEtExpedierCommande(currentCmd.numCommande, data);

      if (response.success) {
        // Succès : commande expédiée
        setCommandes((prev) =>
          prev.map((cmd) =>
            cmd.numCommande === currentCmd.numCommande
              ? { ...cmd, statut: "expédiée", livraisons: [{ ...livraison, ...data }] }
              : cmd
          )
        );
        showToast("success", "Commande expédiée avec succès !");
      } else if (response.annulee) {
        // Stock insuffisant → commande annulée automatiquement
        setCommandes((prev) =>
          prev.map((cmd) =>
            cmd.numCommande === currentCmd.numCommande
              ? { ...cmd, statut: "annulée" }
              : cmd
          )
        );
        showToast(
          "warning",
          `Stock insuffisant ! La commande #${currentCmd.referenceCommande} a été annulée automatiquement et un email a été envoyé au client.`
        );
      }

      setIsLivraisonModalOpen(false);
      setCurrentCmd(null);
    } catch (err) {
      console.error("Erreur expédition :", err);
      showToast("error", err.message || "Erreur lors de l'expédition de la commande");
    }
  };

  const handlePayLivraisonClick = (commande) => {
    showModal(
      "pay",
      "Payer les frais de livraison",
      `Confirmez-vous le paiement des frais de livraison pour la commande #${commande.referenceCommande || commande.numCommande} ?`,
      commande.numCommande,
      `Commande #${commande.referenceCommande || commande.numCommande} - Montant: ${commande.montantTotal || 0} Ar`,
      async () => {
        const nouveauTotal = parseFloat(commande.montantTotal || 0) + parseFloat(commande.fraisLivraison || 0);
        try {
          await updateCommandeAdmin(commande.numCommande, {
            payerLivraison: 1,
            montantTotal: nouveauTotal,
          });
          setCommandes((prev) =>
            prev.map((cmd) =>
              cmd.numCommande === commande.numCommande
                ? { ...cmd, payerLivraison: 1, montantTotal: nouveauTotal }
                : cmd
            )
          );
          showToast("success", "Frais de livraison payés avec succès !");
        } catch (err) {
          console.error("Erreur paiement livraison", err);
          showToast("error", "Erreur lors du paiement des frais de livraison");
        }
      }
    );
  };

  const filteredCommandes = commandes.filter((commande) => {
    const searchMatch =
      (commande.referenceCommande?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (commande.utilisateur?.nomUtilisateur?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (commande.dateCommande?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (commande.mode_paiement?.nomModePaiement?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    // Gestion du nouveau filtre combiné "En attente de validation"
    let statutMatch = true;
    if (filtreStatut === "tous") {
      statutMatch = true;
    } else if (filtreStatut === "attente-validation") {
      statutMatch = commande.statut === "en attente" || commande.statut === "payée";
    } else {
      statutMatch = commande.statut === filtreStatut;
    }

    const dateMinMatch = !filtreDateMin || new Date(commande.dateCommande) >= new Date(filtreDateMin);
    const dateMaxMatch = !filtreDateMax || new Date(commande.dateCommande) <= new Date(filtreDateMax);
    const prixMinMatch = !filtrePrixMin || (commande.montantTotal || 0) >= parseFloat(filtrePrixMin);
    const prixMaxMatch = !filtrePrixMax || (commande.montantTotal || 0) <= parseFloat(filtrePrixMax);

    const paiementFraisMatch =
      filtrePaiementFrais === "tous" ||
      (filtrePaiementFrais === "payé" && commande.payerLivraison) ||
      (filtrePaiementFrais === "non payé" && !commande.payerLivraison);

    return searchMatch && statutMatch && dateMinMatch && dateMaxMatch && prixMinMatch && prixMaxMatch && paiementFraisMatch;
  });

  const reinitialiserFiltres = () => {
    setFiltreStatut("tous");
    setFiltreDateMin("");
    setFiltreDateMax("");
    setFiltrePrixMin("");
    setFiltrePrixMax("");
    setFiltrePaiementFrais("tous");
    setSearchTerm("");
  };

  const hasActiveFilters =
    searchTerm ||
    filtreStatut !== "tous" ||
    filtreDateMin ||
    filtreDateMax ||
    filtrePrixMin ||
    filtrePrixMax ||
    filtrePaiementFrais !== "tous";

  // Statistiques mises à jour
  const commandesEnAttenteDeValidation = commandes.filter(
    (c) => c.statut === "en attente" || c.statut === "payée"
  ).length;
  const commandesValidees = commandes.filter((c) => c.statut === "validée").length;
  const commandesExpediees = commandes.filter((c) => c.statut === "expédiée").length;
  const commandesAnnulees = commandes.filter((c) => c.statut === "annulée").length;
  const commandesFraisNonPayes = commandes.filter(
    (c) => !c.payerLivraison && c.statut !== "annulée"
  ).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestion des Commandes</h1>
          {newOrdersCount > 0 && (
            <div className="stats-container">
              <span className="stat-item new-orders">
                {newOrdersCount} nouvelle{newOrdersCount !== 1 ? "s" : ""} commande{newOrdersCount !== 1 ? "s" : ""} non consultée{newOrdersCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div className="stats-container" style={{ marginTop: "10px" }}>
            <span className="stat-item">
              {filteredCommandes.length} commande{filteredCommandes.length !== 1 ? "s" : ""} trouvée{filteredCommandes.length !== 1 ? "s" : ""}
            </span>
            <span className="stat-item attente-validation">
              {commandesEnAttenteDeValidation} en attente de validation
            </span>
            <span className="stat-item validee">{commandesValidees} validée{commandesValidees !== 1 ? "s" : ""}</span>
            <span className="stat-item expediee">{commandesExpediees} expédiée{commandesExpediees !== 1 ? "s" : ""}</span>
            <span className="stat-item annulee">{commandesAnnulees} annulée{commandesAnnulees !== 1 ? "s" : ""}</span>
            <span className="stat-item frais-non-paye" style={{ color: "#dc3545", fontWeight: "bold" }}>
              {commandesFraisNonPayes} frais livraison non payés
            </span>
          </div>
        </div>
      </div>

      <div className="search-container">
        <div className="search-bar">
          <FaSearch style={{ marginLeft: "8px", color: "#28a458", cursor: "pointer" }} />
          <input
            type="text"
            placeholder="Rechercher par référence, nom client ou mode de paiement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`filter-toggle ${showAdvancedFilters ? "active" : ""}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ border: "none", display: "flex", alignItems: "center", background: "white", color: "#28a458", paddingRight: "10px" }}
          >
            <FaFilter />
          </button>
          <FaSync
            onClick={reinitialiserFiltres}
            style={{ marginRight: "8px", border: "none", color: "#28a458", cursor: "pointer" }}
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
                <option value="attente-validation">En attente de validation</option>
                <option value="validée">Validée</option>
                <option value="expédiée">Expédiée</option>
                <option value="annulée">Annulée</option>
              </select>
            </div>
            <div className="filter-group">
              <label><FaCalendarAlt style={{ marginRight: "5px" }} /> Date min</label>
              <DatePicker
                selected={filtreDateMin ? new Date(filtreDateMin) : null}
                onChange={(date) => setFiltreDateMin(date ? date.toISOString().split("T")[0] : "")}
                dateFormat="dd/MM/yyyy"
                locale={fr}
                placeholderText="jj/mm/aaaa"
                className="form-control"
                isClearable
                popperPlacement="bottom"
              />
            </div>
            <div className="filter-group">
              <label><FaCalendarAlt style={{ marginRight: "5px" }} /> Date max</label>
              <DatePicker
                selected={filtreDateMax ? new Date(filtreDateMax) : null}
                onChange={(date) => setFiltreDateMax(date ? date.toISOString().split("T")[0] : "")}
                dateFormat="dd/MM/yyyy"
                locale={fr}
                placeholderText="jj/mm/aaaa"
                className="form-control"
                isClearable
                popperPlacement="bottom"
              />
            </div>
            
            <div className="filter-group">
              <label>Paiement Frais</label>
              <select
                className="form-control"
                value={filtrePaiementFrais}
                onChange={(e) => setFiltrePaiementFrais(e.target.value)}
              >
                <option value="tous">Tous</option>
                <option value="payé">Payé</option>
                <option value="non payé">Non payé</option>
              </select>
            </div>
          </div>
          <div className="active-filters">
            {filtreStatut !== "tous" && (
              <span className="active-filter-tag">
                Statut: {
                  filtreStatut === "attente-validation" ? "En attente de validation" :
                  filtreStatut === "validée" ? "Validée" :
                  filtreStatut === "expédiée" ? "Expédiée" :
                  filtreStatut === "annulée" ? "Annulée" : filtreStatut
                } <button onClick={() => setFiltreStatut("tous")}>×</button>
              </span>
            )}
            {filtreDateMin && (
              <span className="active-filter-tag">
                Date min: {filtreDateMin} <button onClick={() => setFiltreDateMin("")}>×</button>
              </span>
            )}
            {filtreDateMax && (
              <span className="active-filter-tag">
                Date max: {filtreDateMax} <button onClick={() => setFiltreDateMax("")}>×</button>
              </span>
            )}
            {filtrePrixMin && (
              <span className="active-filter-tag">
                Prix min: {filtrePrixMin} Ar <button onClick={() => setFiltrePrixMin("")}>×</button>
              </span>
            )}
            {filtrePrixMax && (
              <span className="active-filter-tag">
                Prix max: {filtrePrixMax} Ar <button onClick={() => setFiltrePrixMax("")}>×</button>
              </span>
            )}
            {filtrePaiementFrais !== "tous" && (
              <span className="active-filter-tag">
                Frais: {filtrePaiementFrais === "payé" ? "Payé" : "Non payé"} <button onClick={() => setFiltrePaiementFrais("tous")}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Client</th>
              <th>Date Commande</th>
              <th>Date souhaitée</th>
              <th>Montant (en Ar)</th>
              <th>Statut</th>
              <th>Paiement Frais</th>
              <th>Mode Paiement</th>
              <th>Consulter</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCommandes.length > 0 ? (
              filteredCommandes.map((commande, index) => (
                <tr
                  key={`${commande.numCommande}-${index}`}
                  className={!commande.estConsulte ? "new-order-row" : ""}
                >
                  <td>{commande.referenceCommande || commande.numCommande}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {commande.utilisateur?.nomUtilisateur || "Inconnu"}
                        </div>
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {commande.utilisateur?.email || ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {commande.dateCommande
                      ? new Date(commande.dateCommande).toLocaleDateString("fr-FR")
                      : "_"}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaCalendarAlt style={{ color: "#28a458" }} />
                      <div style={{ fontWeight: "500" }}>
                        {commande.dateLivraisonSouhaitee
                          ? new Date(commande.dateLivraisonSouhaitee).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Non définie"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: "bold", color: "#8b5e3c" }}>
                      {Number(commande.montantTotal || 0).toLocaleString("fr-FR")} 
                    </span>
                  </td>
                  <td>
                    <span className={`status ${commande.statut?.replace(/\s+/g, "-") || "default"}`}>
                      {commande.statut || "Non défini"}
                    </span>
                  </td>
                  <td>
                    {commande.payerLivraison ? (
                      <span className="badge-paid">Payé</span>
                    ) : (
                      <span className="badge-unpaid">Non Payé</span>
                    )}
                  </td>
                  <td>
                    {commande.mode_paiement?.image ? (
                      <img
                        src={`${IMAGE_BASE_URL}${commande.mode_paiement.image}`}
                        alt="Mode de paiement"
                        style={{ width: "40px", height: "40px", objectFit: "contain" }}
                      />
                    ) : (
                      <span>{commande.mode_paiement?.nomModePaiement || "_"}</span>
                    )}
                  </td>
                  <td>
                    <Link
                      className={`btn-consulter ${commande.estConsulte ? "vu" : ""}`}
                      to={`/admin/commandes/${commande.numCommande}`}
                      onClick={() => handleMarquerCommeVue(commande.numCommande)}
                      style={{ textDecoration: "none", display: "inline-block" }}
                    >
                      {commande.estConsulte ? (
                        <>
                          <FaCheckCircle style={{ marginRight: "5px" }} /> Vu
                        </>
                      ) : (
                        <>
                          <FaEye style={{ marginRight: "5px" }} /> Voir
                        </>
                      )}
                    </Link>
                  </td>
                 <td>
                    <div className="table-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
                      {!commande.payerLivraison && commande.statut !== "annulée" && (
                        <button className="btn-pay" onClick={() => handlePayLivraisonClick(commande)}>
                          Payer Frais
                        </button>
                      )}
                      {(commande.statut === "en attente" || commande.statut === "payée") && (
                        <button className="btn-validate" onClick={() => handleValidateClick(commande)}>
                          <FaCheck style={{ marginRight: "5px" }} /> Valider
                        </button>
                      )}
                      {commande.statut === "validée" && (
                        <button
                          className="btn-expedier"
                          onClick={() => handleExpedierAvecVerification(commande)}
                        >
                          <FaTruck style={{ marginRight: "5px" }} /> Expédier
                        </button>
                      )}
                      {commande.statut === "validée" && (
                        <button className="btn-cancel" onClick={() => handleCancelClick(commande)}>
                          Annuler
                        </button>
                      )}
                      {commande.statut === "expédiée" && (
                        <button className="btn-expediee" disabled>
                          <FaTruck style={{ marginRight: "5px" }} /> Expédiée
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="empty-table">
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <h3>
                      {hasActiveFilters
                        ? "Aucune commande ne correspond à vos critères"
                        : "Aucune commande trouvée"}
                    </h3>
                    <p>
                      {hasActiveFilters
                        ? "Essayez avec d'autres termes de recherche ou modifiez les filtres."
                        : "Les commandes apparaitront ici lorsqu'elles seront passées par les clients."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalLivraison
        isOpen={isLivraisonModalOpen}
        onClose={() => setIsLivraisonModalOpen(false)}
        onSubmit={handleDeliverySubmit}
        initialData={currentDeliveryData}
      />

      {/* Les modals de confirmation restent identiques */}
      {showValidateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaCheck style={{ color: "#28a458" }} />
                {modalData.title}
              </h2>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
                {modalData.message}
              </p>
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                <button className="btn btn-secondary" onClick={closeAllModals} style={{ padding: "10px 30px" }}>
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    if (modalData.onConfirm) await modalData.onConfirm();
                    closeAllModals();
                  }}
                  style={{ padding: "10px 30px" }}
                >
                  <FaCheck style={{ marginRight: "8px" }} /> Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>{modalData.title}</h2>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
                {modalData.message}
              </p>
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                <button className="btn btn-secondary" onClick={closeAllModals} style={{ padding: "10px 30px" }}>
                  Retour
                </button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    if (modalData.onConfirm) await modalData.onConfirm();
                    closeAllModals();
                  }}
                  style={{ padding: "10px 30px" }}
                >
                  Oui
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>{modalData.title}</h2>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
                {modalData.message}
              </p>
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    if (modalData.onConfirm) await modalData.onConfirm();
                    closeAllModals();
                  }}
                  style={{ padding: "10px 30px" }}
                >
                  Confirmer le paiement
                </button>
                <button className="btn btn-secondary" onClick={closeAllModals} style={{ padding: "10px 30px" }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExpedierModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaTruck style={{ color: "#ffc107" }} />
                {modalData.title}
              </h2>
              <button className="modal-close" onClick={closeAllModals}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
                {modalData.message}
              </p>
              <div className="modal-actions" style={{ justifyContent: "center", gap: "15px" }}>
                <button
                  className="btn btn-warning"
                  onClick={async () => {
                    if (modalData.onConfirm) await modalData.onConfirm();
                    closeAllModals();
                  }}
                  style={{ padding: "10px 30px" }}
                >
                  <FaTruck style={{ marginRight: "8px" }} /> Confirmer Expédition
                </button>
                <button className="btn btn-secondary" onClick={closeAllModals} style={{ padding: "10px 30px" }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commandes;