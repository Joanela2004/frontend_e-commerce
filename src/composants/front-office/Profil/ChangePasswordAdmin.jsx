import React, { useState } from 'react';
import { changeAdminPassword } from '../../../services/AuthService';
import "../../../styles/back-office/admin.css";

const ChangePasswordAdmin = ({ onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
     const res = await changeAdminPassword({
  currentPassword,
  newPassword,
  newPasswordConfirmation: confirmPassword
});


      setMessage(res.message || 'Mot de passe changé avec succès!');

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        window.location.href = '/profil';
      }, 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
  };

  return (
    <div className="conteneur-formulaire">
      <form onSubmit={handleSubmit}>
        <div className="groupe-formulaire">
          <label>Mot de passe actuel</label>
          <input 
            type="password" 
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)} 
            required 
            disabled={isLoading}
          />
        </div>
        <div className="groupe-formulaire">
          <label>Nouveau mot de passe</label>
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
            disabled={isLoading}
          />
        </div>
        <div className="groupe-formulaire">
          <label>Confirmer le nouveau mot de passe</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            disabled={isLoading}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="bouton bouton-primaire fond-vert" 
            disabled={isLoading}
          >
            {isLoading ? 'Changement en cours...' : 'Changer le mot de passe'}
          </button>
        </div>
        
        {message && (
          <p className={`message ${message.includes('succès') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default ChangePasswordAdmin;