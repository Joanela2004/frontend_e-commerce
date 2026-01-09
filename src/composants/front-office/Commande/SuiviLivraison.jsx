import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaSignOutAlt, 
  FaTruck, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaBox,
  FaCheckCircle,
  FaShippingFast,
  FaHome,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { fetchCommandeById } from '../../../services/commandeService';
import "../../../styles/front-office/Commande/suiviLivraison.css";
import "../../../styles/front-office/global.css";

// Composant Timeline amélioré
const TimelineItem = ({ status, label, description, date, icon: Icon, isActive, isCompleted, isLast }) => {
  return (
    <div className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
      <div className="timeline-step-icon">
        <div className="timeline-icon-circle">
          {isCompleted ? <FaCheckCircle /> : <Icon />}
        </div>
        {!isLast && <div className="timeline-connector"></div>}
      </div>
      <div className="timeline-step-content">
        <h4 className="step-title">{label}</h4>
        <p className="step-description">{description}</p>
        {date && (
          <p className="step-date">
            <FaCalendarAlt /> {new Date(date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    </div>
  );
};

// Composant StatusCard pour afficher le statut actuel
const StatusCard = ({ status, title, message, icon: Icon, color }) => {
  const statusColors = {
    'en attente': { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
    'payée': { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
    'validée': { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' },
    'expédiée': { bg: '#cce5ff', border: '#b8daff', text: '#004085' },
    'livrée': { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
    'annulée': { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
  };

  const style = statusColors[status] || { bg: '#f8f9fa', border: '#e9ecef', text: '#495057' };

  return (
    <div className="status-card" style={{ 
      backgroundColor: style.bg,
      borderColor: style.border,
      color: style.text
    }}>
      <div className="status-icon">
        <Icon size={28} />
      </div>
      <div className="status-content">
        <h3 className="status-title">{title}</h3>
        <p className="status-message">{message}</p>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, title, children, variant = 'default' }) => (
  <div className={`info-card ${variant}`}>
    <div className="info-card-header">
      <div className="info-card-icon-wrapper">
        <Icon />
      </div>
      <h3>{title}</h3>
    </div>
    <div className="info-card-body">{children}</div>
  </div>
);

const SuiviLivraison = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [commande, setCommande] = useState(null);
  const [livraison, setLivraison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const data = await fetchCommandeById(id);

        if (!data) {
          setError({ message: "Commande introuvable." });
          return;
        }

        setCommande(data);

        if (data.livraisons?.length > 0) {
          setLivraison(data.livraisons[0]); 
        } else {
          setError({ message: "Aucune livraison trouvée pour cette commande." });
        }

      } catch (err) {
        console.error(err);
        setError({ message: "Erreur lors de la récupération des données." });
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des détails de votre commande...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaExclamationTriangle size={48} />
        <h3>Erreur</h3>
        <p>{error.message}</p>
        <button className="btn-primary" onClick={() => navigate('/client/mesCommandes')}>
          <FaSignOutAlt /> Retour à mes commandes
        </button>
      </div>
    );
  }



  const lieuLivraison = commande.lieu?.nomLieu || livraison?.lieuLivraison || "Adresse à confirmer";
  const dateCommande = new Date(commande.dateCommande).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const total = Number(commande.montantTotal).toLocaleString('fr-FR') + " Ar";
  const currentStatut = commande.statut?.toLowerCase() || "en attente";

  // Définition des statuts avec leurs descriptions
  const statusConfig = {
    'en attente': {
      title: 'Commande en attente',
      message: 'Votre commande est en attente de validation.',
      icon: FaClock,
      color: 'warning'
    },
    'payée': {
      title: 'Paiement confirmé',
      message: 'Votre paiement a été confirmé. La préparation de votre commande va commencer.',
      icon: FaCheckCircle,
      color: 'success'
    },
    'validée': {
      title: 'Commande validée',
      message: 'Votre commande est validée et en cours de préparation.',
      icon: FaCheckCircle,
      color: 'info'
    },
    'expédiée': {
      title: 'Commande expédiée',
      message: 'Votre commande a été expédiée et est en cours de livraison.',
      icon: FaShippingFast,
      color: 'primary'
    },
    'livrée': {
      title: 'Commande livrée',
      message: 'Votre commande a été livrée avec succès !',
      icon: FaHome,
      color: 'success'
    },
    'annulée': {
      title: 'Commande annulée',
      message: 'Votre commande a été annulée.',
      icon: FaExclamationTriangle,
      color: 'danger'
    }
  };

  // Timeline basée sur le statut
  const timelineSteps = [
    {
      status: 'en attente',
      label: 'En attente',
      description: 'Commande reçue',
      icon: FaClock,
      date: commande.dateCommande
    },
    {
      status: 'payée',
      label: 'Payée',
      description: 'Paiement confirmé',
      icon: FaMoneyBillWave,
      date: commande.paiement?.datePaiement
    },
    {
      status: 'validée',
      label: 'Validée',
      description: 'Commande confirmée',
      icon: FaCheckCircle,
      date: livraison?.dateExpedition
    },
    {
      status: 'expédiée',
      label: 'Expédiée',
      description: 'Colis envoyé',
      icon: FaShippingFast,
      date: livraison?.dateExpedition
    },
    {
      status: 'livrée',
      label: 'Livrée',
      description: 'Commande délivrée',
      icon: FaHome,
      date: livraison?.dateLivraison
    }
  ];

  // Filtrer les étapes en fonction du statut actuel
  const currentIndex = timelineSteps.findIndex(step => step.status === currentStatut);
  const visibleSteps = timelineSteps.slice(0, currentIndex + 1);

  return (
    <div className="suivi-livraison-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-info">
          <h1>Suivi de la commande #{commande.referenceCommande || commande.numCommande}</h1>
          <p className="order-date">Commandé le {dateCommande}</p>
        </div>
        <button className="btn-back" onClick={() => navigate('/client/mesCommandes')}>
          <FaSignOutAlt /> Retour à mes commandes
        </button>
        
      </div>

      <div className="main-status-section">
        <StatusCard
          status={currentStatut}
          title={statusConfig[currentStatut]?.title || 'Statut inconnu'}
          message={statusConfig[currentStatut]?.message || ''}
          icon={statusConfig[currentStatut]?.icon || FaInfoCircle}
          color={statusConfig[currentStatut]?.color}
        />
      </div>
      <div className="content-grid">
      
        <div className="left-column">
          <InfoCard icon={FaBox} title="Détails de la commande" variant="primary">
            <div className="detail-item">
              <span className="detail-label">Référence :</span>
              <span className="detail-value">#{commande.referenceCommande || commande.numCommande}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date commande :</span>
              <span className="detail-value">{dateCommande}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date de livraison souhaitée :</span>
              <span className="detail-value"> {commande.dateLivraisonSouhaitee 
          ? new Date(commande.dateLivraisonSouhaitee).toLocaleDateString('fr-FR', {
             
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          : "Non définie"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Montant total :</span>
              <span className="detail-value total-amount">{total}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mode de paiement :</span>
              <span className="detail-value">{commande.mode_paiement?.nomModePaiement || "Non spécifié"}</span>
            </div>
            {commande.codePromo && (
              <div className="detail-item promo">
                <span className="detail-label">Code promo :</span>
                <span className="detail-value">{commande.codePromo}</span>
              </div>
            )}
          </InfoCard>

          <InfoCard icon={FaMapMarkerAlt} title="Adresse de livraison" variant="secondary">
            <div className="address-card">
              <div className="address-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="address-details">
                <p className="address-title">Livraison à :</p>
                <p className="address-text">{lieuLivraison}</p>
              </div>
            </div>
          </InfoCard>

          {livraison && (
            <InfoCard icon={FaTruck} title="Informations de livraison" variant="accent">
              <div className="delivery-info">
                <div className="delivery-item">
                  <span className="delivery-label">Transporteur :</span>
                  <span className="delivery-value">{livraison.transporteur || "Non disponible"}</span>
                </div>
                <div className="delivery-item">
                  <span className="delivery-label">Référence colis :</span>
                  <span className="delivery-value ">{livraison.referenceColis || "Non disponible"}</span>
                </div>
                <div className="delivery-item">
                  <span className="delivery-label">Contact transporteur :</span>
                  <span className="delivery-value">{livraison.contactTransporteur || "Non disponible"}</span>
                </div>
                {livraison.statutLivraison === 'en cours' && livraison.dateLivraisonEstimee && (
                  <div className="delivery-item estimated">
                    <span className="delivery-label">Livraison estimée :</span>
                    <span className="delivery-value">
                      {new Date(livraison.dateLivraisonEstimee).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </InfoCard>
          )}
        </div>

       
        <div className="right-column">
          <InfoCard icon={FaCalendarAlt} title="Progression de la commande" variant="timeline">
            <div className="timeline-container">
              {visibleSteps.map((step, index) => (
                <TimelineItem
                  key={step.status}
                  status={step.status}
                  label={step.label}
                  description={step.description}
                  date={step.date}
                  icon={step.icon}
                  isActive={step.status === currentStatut}
                  isCompleted={index < currentIndex}
                  isLast={index === visibleSteps.length - 1}
                />
              ))}
            </div>
            
            {/* Indicateur de progression */}
            <div className="progress-indicator">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentIndex + 1) / timelineSteps.length) * 100}%` }}
                ></div>
              </div>
              
            </div>
          </InfoCard>

         
        </div>
      </div>

      {/* Bouton de retour fixe */}
      <div className="footer-actions">
        <button className="btn-back" onClick={() => navigate('/client/mesCommandes')}>
          <FaSignOutAlt /> Retour à toutes mes commandes
        </button>
      </div>
    </div>
  );
};

export default SuiviLivraison;