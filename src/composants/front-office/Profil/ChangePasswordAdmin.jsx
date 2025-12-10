import React, { useState } from 'react';
import { changeAdminPassword } from '../../../services/AuthService';
import "../../../styles/back-office/admin.css";
import { useToast } from "../../../contexts/ToastContext";
import "../../../styles/front-office/Profil/profil.css";
import {  FiEye, FiEyeOff} from 'react-icons/fi';

const ChangePasswordAdmin = ({ onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      showToast('error', 'Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const res = await changeAdminPassword({
        currentPassword,
        newPassword,
        newPasswordConfirmation: confirmPassword
      });

      const msg = res.message || 'Mot de passe changé avec succès !';
      setMessage(msg);
      showToast('success', msg);

      if (onSuccess) onSuccess();

      setTimeout(() => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        window.location.href = '/profil';
      }, 2000);

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du changement de mot de passe';
      setMessage(errorMsg);
      showToast('error', errorMsg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="conteneur-formulaire">
      <form onSubmit={handleSubmit}>

        <div className="groupe-formulaire">
          <label>
            Mot de passe actuel <span className="etoile-obligatoire">*</span>
          </label>
           <div className="champ-mot-de-passe" style={{display:"flex",flexDirection:"row",alignItems:"center"}}>
    
          <input
             type={afficherMotDePasse ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <span
                className="icone-oeil" style={{marginLeft:"5px"}}
                onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
              >
                {afficherMotDePasse ? <FiEye /> : <FiEyeOff />}
              </span>
        </div>
</div>
        <div className="groupe-formulaire">
          <label>
            Nouveau mot de passe <span className="etoile-obligatoire">*</span>
          </label>
          <div className="champ-mot-de-passe" style={{display:"flex",flexDirection:"row",alignItems:"center"}}>
    
          <input
            type={afficherMotDePasse ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading}
          />
            <span
                className="icone-oeil" style={{marginLeft:"5px"}}
                onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
              >
                {afficherMotDePasse ? <FiEye /> : <FiEyeOff />}
              </span>
        </div>
</div>
        <div className="groupe-formulaire">
          <label>
            Confirmer le nouveau mot de passe <span className="etoile-obligatoire">*</span>
          </label>
          <div className="champ-mot-de-passe" style={{display:"flex",flexDirection:"row",alignItems:"center"}}>
    
          <input
            type={afficherMotDePasse ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
            <span
                className="icone-oeil" style={{marginLeft:"5px"}}
                onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
              >
                {afficherMotDePasse ? <FiEye /> : <FiEyeOff />}
              </span>
              </div>
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
 <p style={{ display:"flex", marginTop: "10px"}}><span className='etoile-obligatoire'>* </span> : champ obligatoire</p>

      

      </form>
    </div>
  );
};

export default ChangePasswordAdmin;
