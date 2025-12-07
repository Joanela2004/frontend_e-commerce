// Fichier : AjouterPromotionModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaTag, FaMoneyBillWave, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import "../../../styles/back-office/modal.css";

const AjouterPromotionModal = ({ isOpen, onClose, onSave, promotionAEditer }) => {
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [typePromotion, setTypePromotion] = useState('Pourcentage'); // Type de réduction
  const [typeMode, setTypeMode] = useState('code'); // "code" ou "automatique"
  const [valeur, setValeur] = useState('');
  const [dateDebut, setDateDebut] = useState(null);
  const [dateFin, setDateFin] = useState(null);
  const [montantMinimum, setMontantMinimum] = useState('');
  const [statut, setStatut] = useState('Active');
  const [loading, setLoading] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (promotionAEditer) {
      setCode(promotionAEditer.codePromo || '');
      setNom(promotionAEditer.nomPromotion || '');
      setTypePromotion(promotionAEditer.typePromotion || 'Pourcentage');
      setTypeMode(promotionAEditer.automatique ? 'automatique' : 'code');
      setValeur(promotionAEditer.valeur || '');
      setDateDebut(promotionAEditer.dateDebut ? new Date(promotionAEditer.dateDebut) : today);
      setDateFin(promotionAEditer.dateFin ? new Date(promotionAEditer.dateFin) : null);
      setMontantMinimum(promotionAEditer.montantMinimum || '');
      setStatut(promotionAEditer.statutPromotion ? 'Active' : 'Inactive');
    } else {
      setCode('');
      setNom('');
      setTypePromotion('Pourcentage');
      setTypeMode('code');
      setValeur('');
      setDateDebut(today);
      setDateFin(null);
      setMontantMinimum('');
      setStatut('Active');
    }
  }, [promotionAEditer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const promotionData = {
      nomPromotion: nom.trim(),
      typePromotion: typePromotion, // CORRIGÉ ICI
      valeur: parseFloat(valeur),
      automatique: typeMode === "automatique",
      codePromo: typeMode === "automatique" ? null : (code.trim().toUpperCase() || null),
      dateDebut: dateDebut ? dateDebut.toISOString().split('T')[0] : null,
      dateFin: dateFin ? dateFin.toISOString().split('T')[0] : null,
      montantMinimum: montantMinimum ? parseFloat(montantMinimum) : 0,
      statutPromotion: statut === "Active",
    };

    onSave(promotionData);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-promotion" style={{ maxWidth: "720px" }}>
        <div className="modal-header">
          <h3>
            <FaTag style={{ marginRight: "10px", color: "#28a745" }} />
            {promotionAEditer ? 'Modifier la promotion' : 'Nouvelle promotion'}
          </h3>
          <button onClick={onClose} className="modal-close" disabled={loading}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">

            {/* Type de promotion : Automatique ou Code */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Type de promotion</label>
                <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="typeMode"
                      checked={typeMode === "automatique"}
                      onChange={() => {
                        setTypeMode("automatique");
                        setCode("");
                      }}
                    />
                    <span>Automatique (appliquée à tous)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="typeMode"
                      checked={typeMode === "code"}
                      onChange={() => setTypeMode("code")}
                    />
                    <span>Code unique (à envoyer manuellement)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Code Promo */}
            <div className="form-row">
              <div className="form-group">
                <label className={typeMode === "code" ? "required" : ""}>
                  <FaTag /> Code Promo {typeMode === "automatique" && "(non requis)"}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required={typeMode === "code"}
                  disabled={typeMode === "automatique"}
                  placeholder={typeMode === "automatique" ? "Laisser vide" : "BLACKFRIDAY2025"}
                  maxLength="20"
                  className="form-control"
                  style={{
                    backgroundColor: typeMode === "automatique" ? "#f8f9fa" : "white",
                    cursor: typeMode === "automatique" ? "not-allowed" : "text"
                  }}
                />
                {typeMode === "automatique" && (
                  <small style={{ color: "#28a745" }}>Promo automatique → pas de code requis</small>
                )}
              </div>
            </div>

            {/* Nom */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Nom de la promotion</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  placeholder="Soldes d'été 2025"
                  className="form-control"
                />
              </div>
            </div>

            {/* Type de réduction + Valeur */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Type de réduction</label>
                <select value={typePromotion} onChange={(e) => setTypePromotion(e.target.value)} className="form-control">
                  <option value="Pourcentage">Pourcentage (%)</option>
                  <option value="Montant fixe">Montant fixe (Ar)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="required">
                  Valeur {typePromotion === 'Pourcentage' ? '(%)' : '(Ar)'}
                </label>
                <input
                  type="number"
                  value={valeur}
                  onChange={(e) => setValeur(e.target.value)}
                  required
                  min="0"
                  step={typePromotion === 'Pourcentage' ? "1" : "100"}
                  placeholder={typePromotion === 'Pourcentage' ? "20" : "15000"}
                  className="form-control"
                />
              </div>
            </div>

            {/* Montant min + Statut */}
            <div className="form-row">
              <div className="form-group">
                <label><FaMoneyBillWave /> Montant minimum d'achat (Ar)</label>
                <input
                  type="number"
                  value={montantMinimum}
                  onChange={(e) => setMontantMinimum(e.target.value)}
                  min="0"
                  step="100"
                  placeholder="0 (aucun minimum)"
                  className="form-control"
                />
                <small style={{ color: '#718096' }}>Laissez vide ou 0 pour désactiver</small>
              </div>
              <div className="form-group">
                <label><FaCheckCircle /> Statut</label>
                <select value={statut} onChange={(e) => setStatut(e.target.value)} className="form-control">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="form-group">
                <label className="required"><FaCalendarAlt /> Date de début</label>
                <div style={{
                  padding: "14px 16px",
                  background: "#f8f9fa",
                  border: "2px solid #e9ecef",
                  borderRadius: "14px",
                  color: "#495057",
                  fontWeight: "600",
                  fontSize: "1rem",
                  cursor: "not-allowed"
                }}>
                  {today.toLocaleDateString("fr-FR")}
                </div>
                <small style={{ color: "#28a745" }}>Démarre aujourd’hui</small>
              </div>
              <div className="form-group">
                <label className="required"><FaCalendarAlt /> Date de fin</label>
                <DatePicker
                  selected={dateFin}
                  onChange={(date) => setDateFin(date)}
                  minDate={today}
                  dateFormat="dd/MM/yyyy"
                  locale={fr}
                  placeholderText="jj/mm/aaaa"
                  className="form-control"
                  isClearable
                />
              </div>
            </div>

          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !dateFin}>
              {loading ? "Enregistrement..." : (promotionAEditer ? 'Sauvegarder' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterPromotionModal;