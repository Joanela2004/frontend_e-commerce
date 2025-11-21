import React, { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../../services/AuthService';
import "../../../styles/front-office/Profil/profil.css";

const SeConnecter = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    try {
      const response = await loginUser({ email, motDePasse: motDePasse }); 
      
      localStorage.setItem('userToken', response.access_token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      navigate(response.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      if (err.response?.status === 401) {
        setErreur('Email ou mot de passe incorrect.');
      } else if (err.response?.data?.message) {
        setErreur(err.response.data.message);
      } else {
        setErreur('Erreur de connexion.');
      }
      console.error(err);
    }
  };

  return (
    <div className="conteneur-formulaire">
      <form onSubmit={handleSubmit}>
        <div className='titre'>
          <h1>Déjà client ?</h1>
          <p>Connectez-vous</p>
        </div>

        <div className='groupe'>
         
          <div className="groupe-formulaire">
                        <div className="champ-avec-icone">
              <FiMail className="icone-champ" />
              <input 
                type="email" 
                placeholder="votre@courriel.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="groupe-formulaire">
            
            <div className="champ-avec-icone">
              <FiLock className="icone-champ" />
              <input 
                type={afficherMotDePasse ? "text" : "password"}
                placeholder="••••••••" 
                value={motDePasse} 
                onChange={(e) => setMotDePasse(e.target.value)} 
                required 
                minLength={6} 
              />
              <div 
                className="icone-oeil" 
                onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
              >
                {afficherMotDePasse ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>
            

          </div>

          <div className="lien-mot-de-passe">
            <a href="/mot-de-passe-oublie">Mot de passe oublié ?</a>
          </div>

         

          <button type="submit" className="bouton bouton-primaire fond-vert">
            S'IDENTIFIER
          </button>
           {erreur && (
            <div className="message-erreur">
              {erreur}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SeConnecter;