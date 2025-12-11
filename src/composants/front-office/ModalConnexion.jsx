
import React from 'react';
import { FaUserLock } from 'react-icons/fa';
import '../../styles/front-office/modal.css'; 

const ModalConnexion = ({ show, onClose, onLoginRedirect }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <FaUserLock className="modal-icon" />
          <h2>Action Requise</h2>
         
        </div>
        <div className="modal-body">
          <p>Veuillez vous connecter à votre compte .</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Continuer</button>
          <button className="btn btn-primary" onClick={onLoginRedirect}>Se Connecter / S'inscrire</button>
        </div>
      </div>
    </div>
  );
};

export default ModalConnexion;
