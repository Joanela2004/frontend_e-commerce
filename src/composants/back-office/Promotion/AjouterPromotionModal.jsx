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
  const [type, setType] = useState('Pourcentage');
  const [valeur, setValeur] = useState('');
  const [dateDebut, setDateDebut] = useState(null);
  const [dateFin, setDateFin] = useState(null);
  const [montantMinimum, setMontantMinimum] = useState('');
  const [statut, setStatut] = useState('Active');
  const [loading, setLoading] = useState(false);

  // Date du jour (minuit) → fixée automatiquement comme date de début
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (promotionAEditer) {
      setCode(promotionAEditer.codePromo || '');
      setNom(promotionAEditer.nomPromotion || '');
      setType(promotionAEditer.typePromotion || 'Pourcentage');
      setValeur(promotionAEditer.valeur || '');
      setDateDebut(promotionAEditer.dateDebut ? new Date(promotionAEditer.dateDebut) : today);
      setDateFin(promotionAEditer.dateFin ? new Date(promotionAEditer.dateFin) : null);
      setMontantMinimum(promotionAEditer.montantMinimum || '');
      setStatut(promotionAEditer.statutPromotion || 'Active');
    } else {
      // Création : date de début = aujourd'hui (fixe)
      setCode('');
      setNom('');
      setType('Pourcentage');
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
      codePromo: code.trim().toUpperCase(),
      nomPromotion: nom.trim(),
      typePromotion: type,
      valeur: parseFloat(valeur),
      dateDebut: dateDebut ? dateDebut.toISOString().split('T')[0] : null,
      dateFin: dateFin ? dateFin.toISOString().split('T')[0] : null,
      montantMinimum: montantMinimum ? parseFloat(montantMinimum) : null,
      statutPromotion: statut,
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
          <button onClick={onClose} className="modal-close" disabled={loading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">

            {/* Code & Nom */}
            <div className="form-row">
              <div className="form-group">
                <label className="required"><FaTag /> Code Promo</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required placeholder="EXEMPLE20" maxLength="20" className="form-control" />
              </div>
              <div className="form-group">
                <label className="required"><FaTag /> Nom / Description</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required placeholder="Black Friday 2025" className="form-control" />
              </div>
            </div>

            {/* Type & Valeur */}
            <div className="form-row">
              <div className="form-group">
                <label className="required">Type de réduction</label>
                <select value={type} onChange={(e) => setType(e.target.value)} required className="form-control">
                  <option value="Pourcentage">Pourcentage (%)</option>
                  <option value="Montant fixe">Montant fixe (Ar)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="required">
                  Valeur {type === 'Pourcentage' ? '(%)' : '(Ar)'}
                </label>
                <input
                  type="number"
                  value={valeur}
                  onChange={(e) => setValeur(e.target.value)}
                  required
                  min="0"
                  step={type === 'Pourcentage' ? "1" : "100"}
                  placeholder={type === 'Pourcentage' ? "20" : "10000"}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><FaMoneyBillWave /> Montant minimum d'achat (Ar)</label>
                <input type="number" value={montantMinimum} onChange={(e) => setMontantMinimum(e.target.value)} min="0" step="100" placeholder="0 (aucun minimum)" className="form-control" />
                <small style={{ color: '#718096', fontSize: '0.85rem' }}>Laissez vide ou 0 pour désactiver</small>
              </div>
              <div className="form-group">
                <label><FaCheckCircle /> Statut</label>
                <select value={statut} onChange={(e) => setStatut(e.target.value)} className="form-control">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>       
                </select>
              </div>
            </div>

            {/* DATES */}
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
                  cursor: "not-allowed",
                  userSelect: "none"
                }}>
                  {today.toLocaleDateString("fr-FR")}
                </div>
                <small style={{ color: "#28a745", fontSize: "0.8rem", marginTop: "6px" }}>
                  La promotion démarre automatiquement aujourd’hui
                </small>
              </div>

              <div className="form-group">
                <label className="required"><FaCalendarAlt /> Date de fin</label>
                <DatePicker
                  selected={dateFin}
                  onChange={(date) => setDateFin(date)}
                  minDate={today}                     // Commence à partir d’aujourd’hui
                  dateFormat="dd/MM/yyyy"
                  locale={fr}
                  placeholderText="jj/mm/aaaa"
                  className="form-control"
                  isClearable
                  showPopperArrow={false}
                />
              </div>
            </div>

          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !dateFin}>
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Enregistrement...
                </>
              ) : (
                promotionAEditer ? 'Sauvegarder' : 'Créer la promotion'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterPromotionModal;