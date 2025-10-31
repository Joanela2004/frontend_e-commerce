import React from 'react';
import { FaTimes } from 'react-icons/fa';

const MVolaModal = ({ montant, onClose }) => {
    const montantAr = montant.replace('€', 'Ar');
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>MVola</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                
                <div className="modal-body">
                    <div className="montant-a-payer">
                        <label>Montant à payer</label>
                        <p>{montantAr}</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="mvola-number">Numéro MVola</label>
                        <input
                            id="mvola-number"
                            type="text"
                            placeholder="034 00 000 00"
                            defaultValue="034 00 000 00"
                        />
                    </div>
                    
                    <div className="warning-box">
                        <p>Vous recevrez un code USSD sur votre téléphone. Entrez votre code PIN MVola pour confirmer le paiement.</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="payer-btn mvola-btn">Payer {montantAr}</button>
                </div>
            </div>
        </div>
    );
};

export default MVolaModal;