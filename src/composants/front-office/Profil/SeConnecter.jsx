// src/composants/front-office/Profil/SeConnecter.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../../services/AuthService';
import "../../../styles/front-office/Profil/profil.css";
import { useToast } from "../../../contexts/ToastContext";

import {  FiEye, FiEyeOff} from 'react-icons/fi';
const SeConnecter = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
const { showToast } = useToast();
  const navigate = useNavigate();

  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    try {
      const response = await loginUser({ email, motDePasse });
      localStorage.setItem('userToken', response.access_token);
      localStorage.setItem('userData', JSON.stringify(response.user));
    
      navigate(response.user?.role === 'admin' ? '/admin' : '/profil');
    } catch (err) {
      showToast('error', err.response?.status === 401 
      ? 'Email ou mot de passe incorrect' 
      : err.response?.data?.message || 'Erreur de connexion'
    );
    }
  };

  return (
    <div className="conteneur-formulaire">
      <form onSubmit={handleSubmit}>
        <div className="titre">
          <h1>Déjà client ?</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        <div className="groupe">

          <div className="groupe-formulaire">
            <label>Adresse e-mail <span className="etoile-obligatoire">*</span></label>

            <input
              type="email"
              
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

         

         <div className="groupe-formulaire">
   <label>Mot de passe <span className="etoile-obligatoire">*</span></label>

  <div className="champ-mot-de-passe" style={{display:"flex",flexDirection:"row",alignItems:"center"}}>
    <input
      type={afficherMotDePasse ? "text" : "password"}
      
      value={motDePasse}
      onChange={(e) => setMotDePasse(e.target.value)}
      required
      minLength={6}
    />
    <span
      className="icone-oeil" style={{marginLeft:"5px"}}
      onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
    >
      {afficherMotDePasse ? <FiEye /> : <FiEyeOff />}
    </span>
  </div>
</div>

          <div className="lien-mot-de-passe">
            <a href="/mot-de-passe-oublie">Mot de passe oublié ?</a>
          </div>

          {erreur && <div className="message-erreur">{erreur}</div>}

          <button type="submit" className="bouton bouton-primaire fond-vert">
            SE CONNECTER
          </button>
          <p style={{ display:"flex", marginTop: "10px"}}><span className='etoile-obligatoire'>* </span> : champ obligatoire</p>

        </div>
      </form>
    </div>
  );
};

export default SeConnecter;