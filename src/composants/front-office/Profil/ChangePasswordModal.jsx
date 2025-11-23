import React from 'react'; // ← AJOUTE ÇA EN PREMIÈRE LIGNE (même si pas utilisé directement)
import ChangePasswordAdmin from './ChangePasswordAdmin';
import "../../../styles/back-office/ChangePasswordModal.css";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSuccess = () => {
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Changer le mot de passe</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <ChangePasswordAdmin onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal; // ← bien présent