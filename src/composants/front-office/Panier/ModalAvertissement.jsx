
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
                    <FaExclamationTriangle size={24} style={{ marginRight: '10px' }} />
                    <h4 className="modal-title">Stock Limité</h4>
                </div>
                <div className="modal-body" >
                    <p >
                        Vous avez atteint la quantité maximale disponible pour **{nom}**.
                    </p>
                    <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#dc3545' }}>
                        Stock restant : {maxPoids} kg
                    </p>
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