
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import "../../../styles/front-office/modal.css";
const ModalAvertissement = ({ show, onClose, nom, maxPoids }) => {
    if (!show) {
        return null;
    }

       return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <FaExclamationTriangle size={15} style={{ marginRight: '10px' }} />
                    <h4 className="modal-title">Stock Limité</h4>
                </div>
                <div className="modal-body" >
                    <h1 >
                        Vous avez atteint la quantité maximale disponible pour {nom}.
                    </h1>
                    <span style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#d9534f' }}>
                        Stock restant : {maxPoids} kg
                    </span>
                </div>
                <div className="modal-footer" >
                    <button className="btn btn-primary" onClick={onClose}>
                        Compris
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalAvertissement;