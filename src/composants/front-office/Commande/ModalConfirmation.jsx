import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

const ModalConfirmation = ({ show, onClose, onConfirm, children }) => {
  if (!show) return null;

  const handleContentClick = (e) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <div className="modal-header">
         
          <h3 className="modal-title">Annulation</h3>
        </div>
        <div className="modal-body">
          {children || <p>Êtes-vous sûr de vouloir continuer ?</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmation;