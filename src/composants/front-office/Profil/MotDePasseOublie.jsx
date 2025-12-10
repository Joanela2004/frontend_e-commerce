import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← À AJOUTER
import { envoyerCodeReset } from '../../../services/AuthService';
import '../../../styles/front-office/Profil/profil.css';
import { useToast } from "../../../contexts/ToastContext";
const MotDePasseOublie = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
const { showToast } = useToast();
  const navigate = useNavigate(); // ← Pour faire la redirection

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErreur('');
    setLoading(true);

    try {
      await envoyerCodeReset({ email });

     showToast('success', 'Code envoyé ! Vérifiez votre boîte mail.');
      navigate(`/verifier-code-reset?email=${encodeURIComponent(email)}`);


    } catch (err) {
      showToast('error', err.response?.data?.message || 'Erreur lors de l\'envoi du code');    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="conteneur-formulaire">
      <form onSubmit={handleSubmit}>
        <div className="titre">
          <h1>Mot de passe oublié ?</h1>
          <p>Entrez votre adresse e-mail pour recevoir un code de réinitialisation</p>
        </div>

        <div className="groupe-formulaire">
          <label>Adresse e-mail</label>
          <input
            type="email"
            placeholder="exemple@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {message && <div className="message-succes">{message}</div>}
        {erreur && <div className="message-erreur">{erreur}</div>}

        <button
          type="submit"
          className="bouton bouton-primaire fond-vert"
          disabled={loading}
        >
           Envoyer le code
        </button>

        <div style={{marginTop:"10px"}}>
          <a href="/profil" style={{color:"#28A458"}}>← Retour à la connexion</a> 
        </div>
      </form>
    </div>
  );
};

export default MotDePasseOublie;