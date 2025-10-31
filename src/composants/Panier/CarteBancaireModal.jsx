import React from 'react';
import { FaTimes } from 'react-icons/fa';

const CarteBancaireModal = ({ montant, onClose }) => {
    const montantAr = montant.replace('€', 'Ar');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Carte Bancaire</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="modal-body">
                    <div className="montant-a-payer">
                        <label>Montant à payer</label>
                        <p>{montantAr}</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="card-number">Numéro de carte</label>
                        <input
                            id="card-number"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="card-name">Nom sur la carte</label>
                        <input
                            id="card-name"
                            type="text"
                            placeholder="JEAN RAKOTO"
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label htmlFor="expiry-date">Date d'expiration</label>
                            <input
                                id="expiry-date"
                                type="text"
                                placeholder="MM/AA"
                            />
                        </div>
                        <div className="form-group half-width">
                            <label htmlFor="cvv">CVV</label>
                            <input
                                id="cvv"
                                type="text"
                                placeholder="123"
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="payer-btn carte-btn">Payer {montantAr}</button>
                </div>
            </div>
        </div>
    );
};

export default CarteBancaireModal;