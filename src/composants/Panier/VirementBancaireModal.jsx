import React from 'react';
import { FaTimes } from 'react-icons/fa';

const VirementBancaireModal = ({ montant, onClose }) => {
    const montantAr = montant.replace('€', 'Ar');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Virement Bancaire</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="modal-body">
                    <div className="montant-a-payer">
                        <label>Montant à payer</label>
                        <p>{montantAr}</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="account-number">Numéro de compte</label>
                        <input
                            id="account-number"
                            type="text"
                            placeholder="00001234567890"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="account-name">Nom du titulaire</label>
                        <input
                            id="account-name"
                            type="text"
                            placeholder="JEAN RAKOTO"
                        />
                    </div>
                    
                    <div className="info-box">
                        <p>Le virement sera traité sous 24-48h. Vous recevrez une confirmation par email une fois le paiement vérifié.</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="payer-btn virement-btn">Confirmer le virement</button>
                </div>
            </div>
        </div>
    );
};

export default VirementBancaireModal;