import React, { useState, useEffect } from 'react';
import { FaTag, FaMoneyBillWave, FaCalendarAlt, FaClock } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import "../../../styles/back-office/modal.css";

const formatDateTimeForServer = (date) => {
  if (!date || !(date instanceof Date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:00`;
};

const AjouterPromotionModal = ({ isOpen, onClose, onSave, promotionAEditer }) => {
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [typePromotion, setTypePromotion] = useState('Pourcentage');
  const [typeMode, setTypeMode] = useState('code');
  const [valeur, setValeur] = useState('');
  const [dateDebut, setDateDebut] = useState(null);
  const [dateFin, setDateFin] = useState(null);
  const [montantMinimum, setMontantMinimum] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (promotionAEditer) {
      setCode(promotionAEditer.codePromo || '');
      setNom(promotionAEditer.nomPromotion || '');
      setTypePromotion(promotionAEditer.typePromotion || 'Pourcentage');
      setTypeMode(promotionAEditer.automatique ? 'automatique' : 'code');
      setValeur(promotionAEditer.valeur || '');
      setDateDebut(promotionAEditer.dateDebut ? new Date(promotionAEditer.dateDebut) : null);
      setDateFin(promotionAEditer.dateFin ? new Date(promotionAEditer.dateFin) : null);
      setMontantMinimum(promotionAEditer.montantMinimum || '');
    } else {
      const now = new Date();
      const madagascarOffset = 3 * 60;
      const localOffset = now.getTimezoneOffset();
      const madagascarTime = new Date(now.getTime() + (madagascarOffset + localOffset) * 60 * 1000);
      setCode('');
      setNom('');
      setTypePromotion('Pourcentage');
      setTypeMode('code');
      setValeur('');
      setDateDebut(madagascarTime);
      setDateFin(null);
      setMontantMinimum('');
    }
  }, [promotionAEditer, isOpen]);

  const handleValeurChange = (e) => {
    let inputValue = e.target.value;
    if (typePromotion === 'Pourcentage') {
      if (inputValue === '' || inputValue === '0') {
        setValeur('');
        return;
      }
      const num = parseInt(inputValue, 10);
      if (!isNaN(num) && num > 100) {
        setValeur('100');
      } else if (!isNaN(num) && num >= 1 && num <= 100) {
        setValeur(num.toString());
      }
    } else {
      setValeur(inputValue);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const finalValeur = typePromotion === 'Pourcentage'
      ? Math.min(parseFloat(valeur) || 0, 100)
      : parseFloat(valeur) || 0;

    const promotionData = {
      nomPromotion: nom.trim(),
      typePromotion: typePromotion,
      valeur: finalValeur,
      automatique: typeMode === "automatique",
      codePromo: typeMode === "automatique" ? null : (code.trim().toUpperCase() || null),
      dateDebut: formatDateTimeForServer(dateDebut),
      dateFin: formatDateTimeForServer(dateFin),
      montantMinimum: montantMinimum ? parseFloat(montantMinimum) : 0,
      statutPromotion: true, // Par défaut : active lors de la création
    };

    onSave(promotionData);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-promotion" style={{ maxWidth: "750px" }}>
        <div className="modal-header">
          <h3>
            <FaTag style={{ marginRight: "10px", color: "#28a745" }} />
            {promotionAEditer ? 'Modifier la promotion' : 'Nouvelle promotion'}
          </h3>
          <button onClick={onClose} className="modal-close" disabled={loading}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="required">Type de promotion</label>
                <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input type="radio" name="typeMode" checked={typeMode === "automatique"}
                      onChange={() => { setTypeMode("automatique"); setCode(""); }} />
                    <span>Automatique</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input type="radio" name="typeMode" checked={typeMode === "code"} onChange={() => setTypeMode("code")} />
                    <span>Code unique</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className={typeMode === "code" ? "required" : ""}>
                  <FaTag /> Code Promo {typeMode === "automatique" && "(non requis)"}
                </label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={typeMode === "automatique"} maxLength="20" className="form-control" />
              </div>
              <div className="form-group">
                <label className="required">Nom</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className="form-control" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="required">Type de réduction</label>
                <select value={typePromotion} onChange={(e) => {
                  setTypePromotion(e.target.value);
                  if (e.target.value === 'Pourcentage' && parseFloat(valeur) > 100) {
                    setValeur('100');
                  }
                }} className="form-control">
                  <option value="Pourcentage">Pourcentage (%)</option>
                  <option value="Montant fixe">Montant fixe (Ar)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="required">
                  Valeur {typePromotion === 'Pourcentage' ? '(max 100%)' : '(Ar)'}
                </label>
                <input
                  type="number"
                  value={valeur}
                  onChange={handleValeurChange}
                  required
                  min="0"
                  max={typePromotion === 'Pourcentage' ? "100" : ""}
                  step={typePromotion === 'Pourcentage' ? "1" : "100"}
                  placeholder={typePromotion === 'Pourcentage' ? "ex: 15" : "ex: 25000"}
                  className="form-control"
                />
                {typePromotion === 'Pourcentage' && valeur > 100 && (
                  <small style={{ color: "#dc3545" }}>La valeur maximale est 100%</small>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label><FaMoneyBillWave /> Montant minimum (Ar)</label>
                <input type="number" value={montantMinimum} onChange={(e) => setMontantMinimum(e.target.value)}
                  min="0" step="100" className="form-control" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="required"><FaCalendarAlt /> <FaClock /> Date et heure de début</label>
                <DatePicker
                  selected={dateDebut}
                  onChange={setDateDebut}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale={fr}
                  className="form-control"
                  placeholderText="Maintenant"
                />
              </div>
              <div className="form-group">
                <label className="required"><FaCalendarAlt /> <FaClock /> Date et heure de fin</label>
                <DatePicker
                  selected={dateFin}
                  onChange={setDateFin}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale={fr}
                  minDate={dateDebut}
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
            <button type="submit" className="btn btn-primary" disabled={loading || !dateDebut || !dateFin || !valeur}>
              {loading ? "Enregistrement..." : (promotionAEditer ? 'Sauvegarder' : 'Créer la promotion')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterPromotionModal;