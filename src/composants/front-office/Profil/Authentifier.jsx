// src/composants/front-office/Profil/Authentifier.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/AuthService';
import "../../../styles/front-office/Profil/profil.css";
import { useToast } from "../../../contexts/ToastContext";
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Authentifier = () => {

  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);

  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [notification, setNotification] = useState('');
  const { showToast } = useToast();

  const [validationMotDePasse, setValidationMotDePasse] = useState({
    longueur: false,
    majuscule: false,
    chiffre: false
  });

  const navigate = useNavigate();

  // Redirection si connecté
  useEffect(() => {
    if (localStorage.getItem('userToken')) {
      navigate('/profil');
    }
  }, [navigate]);

  // Vérification du mot de passe
  useEffect(() => {
    setValidationMotDePasse({
      longueur: motDePasse.length >= 6,
      majuscule: /[A-Z]/.test(motDePasse),
      chiffre: /[0-9]/.test(motDePasse)
    });
  }, [motDePasse]);

  const handleContactChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) setContact(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setNotification('');

    if (!Object.values(validationMotDePasse).every(v => v)) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères, une majuscule et un chiffre.');
      return;
    }
    if (motDePasse !== confirmerMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }
    if (contact.length !== 10) {
      setErreur('Le numéro de téléphone doit contenir exactement 10 chiffres.');
      return;
    }

    try {
      await registerUser({
        nomUtilisateur,
        email,
        contact,
        motDePasse,
        motDePasse_confirmation: confirmerMotDePasse
      });

      showToast('success', 'Inscription réussie ! Vérifiez votre boîte mail pour activer votre compte.');
      setNomUtilisateur('');
      setEmail('');
      setContact('');
      setMotDePasse('');
      setConfirmerMotDePasse('');
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  const toutEstValide = Object.values(validationMotDePasse).every(v => v);

  return (
    <div className="conteneur-formulaire">
      <form onSubmit={handleSubmit}>
        <div className="titre">
          <h1>Créer un compte</h1>
          <p>Pour passer commande, nous avons besoin de vos informations</p>
        </div>

        <div className="groupe">

          <div className="groupe-formulaire">
            <label>Nom <span className="etoile-obligatoire">*</span></label>
            <input
              type="text"
              value={nomUtilisateur}
              onChange={(e) => setNomUtilisateur(e.target.value)}
              required
            />
          </div>

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
            <label>Téléphone </label>
            <input
              type="tel"
              value={contact}
              onChange={handleContactChange}
              
              maxLength={10}
            />
          </div>

          <div className="groupe-formulaire">
            <label>Mot de passe <span className="etoile-obligatoire">*</span></label>
            <div className="champ-mot-de-passe" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <input
                type={afficherMotDePasse ? "text" : "password"}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                minLength={6}
              />
              <span
                className="icone-oeil"
                style={{ marginLeft: "5px" }}
                onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
              >
                {afficherMotDePasse ? <FiEye /> : <FiEyeOff />}
              </span>
            </div>

            {motDePasse && (
              <div className={`validation-mot-de-passe ${toutEstValide ? 'valide' : ''}`}>
                <p className={validationMotDePasse.longueur ? 'valide' : ''}>Au moins 6 caractères</p>
                <p className={validationMotDePasse.majuscule ? 'valide' : ''}>Une lettre majuscule</p>
                <p className={validationMotDePasse.chiffre ? 'valide' : ''}>Un chiffre</p>
              </div>
            )}
          </div>

          <div className="groupe-formulaire">
            <label>Confirmer le mot de passe <span className="etoile-obligatoire">*</span></label>
            <div className="champ-mot-de-passe" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <input
                type={afficherMotDePasse ? "text" : "password"}
                value={confirmerMotDePasse}
                onChange={(e) => setConfirmerMotDePasse(e.target.value)}
                required
                minLength={6}
              />
              <span
                className="icone-oeil"
                style={{ marginLeft: "5px" }}
                onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
              >
                {afficherMotDePasse ? <FiEye /> : <FiEyeOff />}
              </span>
            </div>
          </div>

          {erreur && <div className="message-erreur">{erreur}</div>}
          {notification && <div className="message-succes">{notification}</div>}

        </div>

        
        <button type="submit" className="bouton bouton-primaire fond-vert">
          CRÉER MON COMPTE
        </button>
        <p style={{ display:"flex", marginTop: "10px"}}><span className='etoile-obligatoire'>* </span> : champ obligatoire</p>

      </form>
    </div>
  );
};

export default Authentifier;
