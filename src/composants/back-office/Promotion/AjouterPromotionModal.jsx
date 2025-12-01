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

    useEffect(() => {
        if (promotionAEditer) {
            setCode(promotionAEditer.codePromo);
            setNom(promotionAEditer.nomPromotion);
            setType(promotionAEditer.typePromotion || 'Pourcentage');
            setValeur(promotionAEditer.valeur);
            setDateDebut(promotionAEditer.dateDebut ? promotionAEditer.dateDebut.split(' ')[0] : '');
            setDateFin(promotionAEditer.dateFin ? promotionAEditer.dateFin.split(' ')[0] : '');
            setMontantMinimum(promotionAEditer.montantMinimum || '');
        } else {
            setCode('');
            setNom('');
            setType('Pourcentage');
            setValeur('');
            setDateDebut('');
            setDateFin('');
            setMontantMinimum('');
        }
    }, [promotionAEditer, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const promotionEnregistree = {
            codePromo: code,
            nomPromotion: nom,
            typePromotion: type, 
            valeur: parseFloat(valeur),
            dateDebut,
            dateFin,
            montantMinimum: montantMinimum ? parseFloat(montantMinimum) : 0,
            statutPromotion: 'Active',
        };

        onSave(promotionEnregistree);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content modal-promotion">
                <div className="modal-header">
                    <h3>{promotionAEditer ? 'Éditer la promotion' : 'Nouvelle promotion'}</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Code Promo *</label>
                        <input 
                            type="text" 
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            required 
                            placeholder="EXEMPLE20"
                        />
                    </div>

                    <div className="form-group">
                        <label>Nom de l'événement / Description *</label>
                        <input 
                            type="text" 
                            value={nom} 
                            onChange={(e) => setNom(e.target.value)} 
                            required 
                            placeholder="Promotion spéciale été"
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Type de réduction *</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} required>
                                <option value="Pourcentage">Pourcentage (%)</option>
                                <option value="Montant fixe">Montant fixe (Ar)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Valeur {type === 'Pourcentage' ? '(%) *' : '(Ar) *'}</label>
                            <input 
                                type="number" 
                                value={valeur} 
                                onChange={(e) => setValeur(e.target.value)} 
                                required 
                                min="0" 
                                step={type === 'Pourcentage' ? "1" : "0.01"}
                                placeholder={type === 'Pourcentage' ? "10" : "5000"}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Montant minimum d'achat (Ar)</label>
                        <input 
                            type="number" 
                            value={montantMinimum} 
                            onChange={(e) => setMontantMinimum(e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="0"
                        />
                        <small className="form-help">Laissez 0 pour aucun minimum</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Date de Début *</label>
                            <input 
                                type="date" 
                                value={dateDebut} 
                                onChange={(e) => setDateDebut(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Date de Fin *</label>
                            <input 
                                type="date" 
                                value={dateFin} 
                                onChange={(e) => setDateFin(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary">
                            {promotionAEditer ? 'Sauvegarder' : 'Créer la promotion'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AjouterPromotionModal;