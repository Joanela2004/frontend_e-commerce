import React, { useState, useEffect } from 'react';
import { FaTimes } from "react-icons/fa";

const AjouterPromotionModal = ({ isOpen, onClose, onSave, promotionAEditer }) => {
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [type, setType] = useState('Pourcentage');
  const [valeur, setValeur] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [montantMinimum, setMontantMinimum] = useState('');
  const [statut, setStatut] = useState('Active'); // Nouveau champ

  useEffect(() => {
    if (promotionAEditer) {
      setCode(promotionAEditer.codePromo || '');
      setNom(promotionAEditer.nomPromotion || '');
      setType(promotionAEditer.typePromotion || 'Pourcentage');
      setValeur(promotionAEditer.valeur || '');
      setDateDebut(promotionAEditer.dateDebut ? promotionAEditer.dateDebut.split(' ')[0] : '');
      setDateFin(promotionAEditer.dateFin ? promotionAEditer.dateFin.split(' ')[0] : '');
      setMontantMinimum(promotionAEditer.montantMinimum || '');
      setStatut(promotionAEditer.statutPromotion || 'Active');
    } else {
      // Valeurs par défaut pour création
      setCode('');
      setNom('');
      setType('Pourcentage');
      setValeur('');
      setDateDebut('');
      setDateFin('');
      setMontantMinimum('');
      setStatut('Active');
    }
  }, [promotionAEditer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const promotionData = {
      codePromo: code.trim().toUpperCase(),
      nomPromotion: nom.trim(),
      typePromotion: type,
      valeur: parseFloat(valeur),
      dateDebut: dateDebut || null,
      dateFin: dateFin || null,
      montantMinimum: montantMinimum ? parseFloat(montantMinimum) : null,
      statutPromotion: statut, // On envoie le statut choisi
    };

    onSave(promotionData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-promotion" style={{ maxWidth: "700px" }}>
        <div className="modal-header">
          <h3>
            {promotionAEditer ? 'Modifier la promotion' : 'Nouvelle promotion'}
          </h3>
          <button onClick={onClose} className="modal-close-btn">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">

          {/* Code & Nom */}
          <div className="form-row">
            <div className="form-group">
              <label>Code Promo *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                placeholder="EXEMPLE20"
                maxLength="20"
              />
            </div>
            <div className="form-group">
              <label>Nom / Description *</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                placeholder="Black Friday 2025"
              />
            </div>
          </div>

          {/* Type & Valeur */}
          <div className="form-row">
            <div className="form-group">
              <label>Type de réduction *</label>
              <select value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="Pourcentage">Pourcentage (%)</option>
                <option value="Montant fixe">Montant fixe (Ar)</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                Valeur {type === 'Pourcentage' ? '(%)' : '(Ar)'} *
              </label>
              <input
                type="number"
                value={valeur}
                onChange={(e) => setValeur(e.target.value)}
                required
                min="0"
                step={type === 'Pourcentage' ? "1" : "100"}
                placeholder={type === 'Pourcentage' ? "20" : "10000"}
              />
            </div>
          </div>

          {/* Montant minimum */}
          <div className="form-group">
            <label>Montant minimum d'achat (Ar)</label>
            <input
              type="number"
              value={montantMinimum}
              onChange={(e) => setMontantMinimum(e.target.value)}
              min="0"
              step="100"
              placeholder="0 (aucun minimum)"
            />
            <small className="form-help">Laissez vide ou 0 pour désactiver</small>
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Date de début *</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Date de fin *</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                required
                min={dateDebut} // Empêche de mettre une fin avant le début
              />
            </div>
          </div>

          {/* NOUVEAU : Statut */}
          <div className="form-group">
            <label>Statut de la promotion</label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="form-control"
              style={{
                padding: "10px",
                fontSize: "1rem",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive (brouillon)</option>
              <option value="Expirée">Expirée (terminée)</option>
            </select>
            <small className="form-help">
              {statut === 'Active' && "La promotion est actuellement utilisable"}
              {statut === 'Inactive' && "La promotion est désactivée mais conservée"}
              {statut === 'Expirée' && "La promotion est terminée (automatique après date de fin)"}
            </small>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {promotionAEditer ? 'Sauvegarder les modifications' : 'Créer la promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterPromotionModal;