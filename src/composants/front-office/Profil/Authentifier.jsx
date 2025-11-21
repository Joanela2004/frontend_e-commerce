import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/AuthService';
import "../../../styles/front-office/Profil/profil.css";

const Authentifier = () => {
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);
  const [validationMotDePasse, setValidationMotDePasse] = useState({
    longueur: false,
    majuscule: false,
    chiffre: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) navigate('/profil'); 
  }, [navigate]);

  // Validation du mot de passe en temps réel
  useEffect(() => {
    setValidationMotDePasse({
      longueur: motDePasse.length >= 6,
      majuscule: /[A-Z]/.test(motDePasse),
      chiffre: /[0-9]/.test(motDePasse)
    });
  }, [motDePasse]);

  const handleContactChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Supprimer les non-chiffres
    if (value.length <= 8) {
      setContact(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    // Vérification de la validation du mot de passe
    if (!validationMotDePasse.longueur || !validationMotDePasse.majuscule || !validationMotDePasse.chiffre) {
      setErreur('Le mot de passe ne respecte pas les règles de sécurité.');
      return;
    }

    if (motDePasse !== confirmerMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas !');
      return;
    }

    if (contact.length !== 8) {
      setErreur('Le numéro de téléphone doit contenir exactement 8 chiffres.');
      return;
    }

    try {
      const userData = {
        nomUtilisateur,
        email,
        contact,
        motDePasse,
        motDePasse_confirmation: confirmerMotDePasse
      };

      const response = await registerUser(userData);

      sessionStorage.setItem('userToken', response.access_token);
sessionStorage.setItem('userData', JSON.stringify(response.user));

      navigate('/profil');
    } catch (err) {
      if (err.response?.data?.message) setErreur(err.response.data.message);
      else setErreur("Erreur lors de l'inscription.");
      console.error(err);
    }
  };

  const toutesLesValidationsPassent = validationMotDePasse.longueur && 
                                       validationMotDePasse.majuscule && 
                                       validationMotDePasse.chiffre;

  return (
    <div className="conteneur-formulaire">
      <form onSubmit={handleSubmit}>
        <div className='titre'>
          <h1>Vous n'avez pas de compte ?</h1>
          <p>Pour commander, nous avons besoin de vos informations de livraison</p>
        </div>

        <div className='groupe'>
          {/* Nom */}
          <div className="groupe-formulaire">
            <div className="champ-avec-icone">
              <FiUser className="icone-champ" />
              <input 
                type="text" 
                placeholder="Joanella" 
                value={nomUtilisateur} 
                onChange={(e) => setNomUtilisateur(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Contact */}
          <div className="groupe-formulaire">
            <div className="champ-avec-icone">
              <FiPhone className="icone-champ" />
              <input 
                type="tel" 
                placeholder="34000000" 
                value={contact} 
                onChange={handleContactChange} 
                required 
                maxLength={8}
                pattern="[0-9]{8}"
                title="Le numéro doit contenir exactement 8 chiffres"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="groupe-formulaire">
           
                  <div className="champ-avec-icone">
              <FiLock className="icone-champ" />
              <input 
                type={afficherMotDePasse ? "text" : "password"}
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
                     {motDePasse && (
              <div className={`validation-mot-de-passe ${toutesLesValidationsPassent ? 'valide' : ''}`}>
                <p className={validationMotDePasse.longueur ? 'valide' : ''}>
                  Au moins 6 caractères
                </p>
                <p className={validationMotDePasse.majuscule ? 'valide' : ''}>
                  Au moins une lettre majuscule
                </p>
                <p className={validationMotDePasse.chiffre ? 'valide' : ''}>
                  Au moins un chiffre
                </p>
              </div>
            )}
          </div>

          {/* Confirmer mot de passe */}
          <div className="groupe-formulaire">
            
            <div className="champ-avec-icone">
              <FiLock className="icone-champ" />
              <input 
                type={afficherConfirmation ? "text" : "password"}
                value={confirmerMotDePasse} 
                onChange={(e) => setConfirmerMotDePasse(e.target.value)} 
                required 
              />
              <div 
                className="icone-oeil" 
                onClick={() => setAfficherConfirmation(!afficherConfirmation)}
              >
                {afficherConfirmation ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>
          </div>

          {erreur && (
            <div className="message-erreur">
              {erreur}
            </div>
          )}
        </div>

        <button type="submit" className="bouton bouton-primaire fond-vert">
          CRÉER MON COMPTE
        </button>
      </form>
    </div>
  );
};

export default Authentifier;