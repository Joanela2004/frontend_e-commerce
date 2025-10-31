import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import "../../styles/front-office/Commande/suiviLivraison.css";
import { FaSignOutAlt } from 'react-icons/fa'; 
import "../../styles/front-office/global.css";
const InfoCard = ({ icon, title, children }) => (
  <div className="info-card ">
    <div className="info-card-title">
      <h3>{title}</h3>
    </div>
    <div className="info-card-content">{children}</div>
  </div>
);

const SuiviLivraison = () => {
  const { id } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  const { commande } = location.state || {};

 

  const { lieuLivraison, nomClient, date, dateLivraisonEstimee, modePaiement, livraison, products, total } = commande;
  const [adresse, villeCodePostal, pays] = lieuLivraison ? 
    lieuLivraison.split(', ').map(s => s.trim()) : 
    ['', '', ''];

  return (
    <div className="suivi-livraison-page">
      
<div className="conteneur">
        <h1>Suivi de Livraison - Commande : {commande.id}</h1>

        <div className="suivi-livraison-conteneur">
          <div className="bloc">
            <InfoCard title="Adresse de livraison" isGreen={true}>
              <p><strong>{nomClient}</strong></p>
              <p>{adresse}</p>
              <p>{villeCodePostal}</p>
              <p>{pays}</p>
            </InfoCard>

            <InfoCard title="Informations de la commande">
              <p><strong>Date de commande :</strong> {date}</p>
              <p><strong>Livraison estimée :</strong> {dateLivraisonEstimee}</p>
              <p><strong>Paiement :</strong> {modePaiement}</p>
              <p><strong>Total :</strong> {total}</p>
            </InfoCard>

          <InfoCard title="Informations du Transporteur" >
              <p><strong>Transporteur :</strong> {livraison?.transporteur || 'Non déterminé'}</p>
              <p><strong>Référence Colis :</strong> {livraison?.referenceColis || 'N/A'}</p>
              <p><strong>Contact :</strong> {livraison?.contactTransporteur || 'N/A'}</p>
            </InfoCard>
            
            <InfoCard title="Statut de la Livraison">
              <p>
                <strong>Statut :</strong> 
                <span className={`statut-badge-${livraison?.statut?.replace(/[^a-z]/g, '') || 'indisponible'}`}>
                  {livraison?.statut || 'Information indisponible'}
                </span>
              </p>
              <p><strong>Date d'expédition :</strong> {livraison?.dateExpedition ? new Date(livraison.dateExpedition).toLocaleDateString('fr-FR') : 'Non expédiée'}</p>
              <p><strong>Date de livraison :</strong> {livraison?.dateLivraison ? new Date(livraison.dateLivraison).toLocaleDateString('fr-FR') : 'Non livrée'}</p>
            </InfoCard>
          </div>

        </div>
      </div>

        <button 
          className="bouton-retour"
          onClick={() => navigate('/commandes')}
        >
          <FaSignOutAlt style={{ display:"flex" ,alignItems:"center",flexDirection:"row"}} /> Quitter
        </button>
    </div>
  );
};

export default SuiviLivraison;