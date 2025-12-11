import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

const ModalConfirmation = ({ show, onClose, onConfirm }) => {
    if (!show) {
        return null;
    }

    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
            <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={handleContentClick}>
                <div className="modal-header" >
                    <FaQuestionCircle />
                    <h4 className="modal-title">Confirmer la Commande</h4>
                </div>
                <div className="modal-body" >
                    <p >
                        Êtes-vous sûr de vouloir valider cette commande ?
                    </p>
                    <p >
                        Veuillez vérifier attentivement les informations de livraison et de paiement avant de confirmer.
                    </p>
                </div>
                <div className="modal-footer">
                    <button 
                        className="btn btn-secondary"     onClick={onClose} 
                       
                    >
                        Annuler
                    </button>
                    <button 
                        className="btn btn-primary " 
                        onClick={onConfirm}
                      
                    >
                        valider
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmation;