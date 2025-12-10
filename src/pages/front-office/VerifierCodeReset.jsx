import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifierCodeEtReset, envoyerCodeReset } from '../../services/AuthService';

const VerifierCodeReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');

  const [code, setCode] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [estExpire, setEstExpire] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
const [showNouveauMdp, setShowNouveauMdp] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  useEffect(() => {
    if (!email) {
      showToast('error', 'Aucun e-mail spécifié. Veuillez recommencer la procédure.');
    }
  }, [email, showToast]);

 

  const handleRenvoyerCode = async () => {
    if (!email) return;
    setEnvoiEnCours(true);
    setErreur('');
    setMessage('');
    try {
      await envoyerCodeReset({ email });
      setMessage('Un nouveau code a été envoyé !');
      setTempsRestant(600);     
      setEstExpire(false);      
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du renvoi du code');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErreur('E-mail manquant.');
      return;
    }
    if (nouveauMdp !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await verifierCodeEtReset({
        email,
        code,
        password: nouveauMdp,
        password_confirmation: confirmation
      });
      setMessage('Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.');
         } catch (err) {
      setErreur(err.response?.data?.message || 'Code incorrect ou expiré');
    }
  };

   if (!email) {
    return (
      <div className="conteneur-formulaire">
        <div className="message-erreur">
          <p>Aucun e-mail trouvé dans l'URL.</p>
          <button
            onClick={() => navigate('/mot-de-passe-oublie')}
            className="bouton bouton-secondaire"
          >
            ← Retour à "Mot de passe oublié"
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="conteneur-formulaire">
      <form onSubmit={handleSubmit}>
        <h1 style={{marginBottom:"20px"}}>Vérification du code</h1>
      
        <div className="groupe-formulaire">
          <label>Code de vérification</label>
          <input
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            required
            disabled={estExpire}
          />
        </div>

        <div className="groupe-formulaire">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={nouveauMdp}
            onChange={(e) => setNouveauMdp(e.target.value)}
            required
            minLength={6}
            disabled={estExpire}
          />
          
        </div>

        <div className="groupe-formulaire">
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
            disabled={estExpire}
          />
        </div>

       

        
        {message && <div className="message-succes">{message}</div>}
        {erreur && <div className="message-erreur">{erreur}</div>}

        {/* Bouton principal de réinitialisation */}
        <button
          type="submit"
          className="bouton bouton-primaire fond-vert"
          disabled={estExpire || envoiEnCours}
        >
          Réinitialiser le mot de passe
        </button>

       
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleRenvoyerCode}
              disabled={envoiEnCours}
              className="bouton bouton-secondaire"
              style={{ padding: '12px 24px', fontSize: '1em' }}
            >
              {envoiEnCours ? 'Envoi en cours...' : 'Renvoyer un nouveau code'}
            </button>
          </div>
       
      </form>
    </div>
  );
};

export default VerifierCodeReset;