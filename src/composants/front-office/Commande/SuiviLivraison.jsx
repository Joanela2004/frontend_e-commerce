import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaBoxOpen } from 'react-icons/fa'; // Ajout de FaBoxOpen pour la timeline
import { fetchCommandeById } from '../../../services/commandeService';
import "../../../styles/front-office/Commande/suiviLivraison.css";
import "../../../styles/front-office/global.css";
const TimelineItem = ({ statusKey, label, date, estimatedDate, currentStatus, isFirst, isLast }) => {
    const isCompleted = statusKey === 'livree' || statusKey === 'expediee' || statusKey === 'entransit' || statusKey === 'preparationencours' || statusKey === 'confirmee'; // Ajoutez tous les statuts "avant"
    const isActive = statusKey === currentStatus;

    return (
        <div className={`timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
            <div className="timeline-icon-wrapper">
                <FaBoxOpen className="timeline-icon" /> {/* Icône générique */}
                {/* Vous pouvez rendre des icônes spécifiques ici si vous le souhaitez */}
            </div>
            <div className="timeline-content">
                <p className="timeline-label">{label}</p>
                {date && <p className="timeline-date">{new Date(date).toLocaleDateString('fr-FR')}, {new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>}
                {estimatedDate && <p className="timeline-date-estimated">{estimatedDate}</p>}
            </div>
        </div>
    );
};

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="info-card">
    <div className="info-card-title">
      {Icon && <Icon className="info-card-icon" />} 
      <h3>{title}</h3>
    </div>
    <div className="info-card-content">{children}</div>
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

  if (loading) return <p className="loading-message">Chargement...</p>;
  if (error) return <p className="error-message">{error.message}</p>;
  if (!commande || !livraison) return <p className="error-message">Détails de commande ou livraison incomplets.</p>;

  const nomClient = commande.utilisateur?.nomUtilisateur || 'Client';
  const lieuLivraison = commande.lieu?.nomLieu || livraison?.lieuLivraison || "Adresse inconnue";
  const dateCommande = new Date(commande.dateCommande).toLocaleDateString('fr-FR');
  const total = Number(commande.montantTotal).toLocaleString() + " Ar";
  const currentStatutLivraison = livraison.statutLivraison?.toLowerCase().replace(/\s/g, '') || "enattente";

    const timelineData = [
    { key: "commandeenregistree", label: "Commande validée", date: commande.dateCommande },
    { key: "preparationencours", label: "Préparation en cours", date: livraison.dateExpedition }, 
      { key: "livree", label: "Livraison effectuée", date: livraison.dateLivraison }
  ];
  let headerStatusText = "Statut inconnu";
  let deliveryExpectedDate = "";
  if (currentStatutLivraison === 'livree') {
      headerStatusText = "Votre commande a été livrée !";
  } else if (currentStatutLivraison === 'expediee' || currentStatutLivraison === 'preparationencours') {
      headerStatusText = "Votre commande est en préparation";
      deliveryExpectedDate = livraison.dateLivraisonEstimee ? `Livraison prévue le ${new Date(livraison.dateLivraisonEstimee).toLocaleDateString('fr-FR')}` : "Date de livraison estimée à venir";
  } else {
      headerStatusText = "Votre commande est confirmée";
  }


  return (
    <div className="suivi-livraison-page">
      <div className="conteneur">
        <div className="timeline-header">
            <div className="timeline-header-icon"><FaTruck /></div>
            <div className="timeline-header-content">
                <h2>{headerStatusText}</h2>
                {deliveryExpectedDate && <p>{deliveryExpectedDate}</p>}
            </div>
        </div>

        <div className="suivi-livraison-conteneur">
          
          <div className="bloc info-cards-col">
            <InfoCard icon={FaMapMarkerAlt} title="Adresse de livraison">
              <p><strong>{nomClient}</strong></p>
              <p>{lieuLivraison}</p>
            </InfoCard>

            <InfoCard icon={FaMoneyBillWave} title="Informations de la commande">
              <p><strong>Date :</strong> {dateCommande}</p>
              <p><strong>Total :</strong> {total}</p>
              <p><strong>Paiement :</strong> {commande.mode_paiement?.nomModePaiement || "N/A"}</p>
            </InfoCard>

            <InfoCard icon={FaTruck} title="Transporteur">
              <p><strong>Transporteur:</strong> {livraison.transporteur || "Non défini"}</p>
              <p><strong>Réf colis :</strong> {livraison.referenceColis || "en attente"}</p>
              <p><strong>Contact :</strong> {livraison.contactTransporteur || "en attente"}</p>
            </InfoCard>
          </div>

          {/* Timeline */}
          <div className="bloc suivi-timeline-bloc">
            <InfoCard icon={FaCalendarAlt} title="Statut de la Livraison">
              <div className="timeline-list">
                {timelineData.map((item, index) => (
                  <TimelineItem
                    key={item.key}
                    statusKey={item.key}
                    label={item.label}
                    date={item.date}
                    currentStatus={currentStatutLivraison}
                    isFirst={index === 0}
                    isLast={index === timelineData.length - 1}
                  />
                ))}
              </div>
            </InfoCard>
          </div>

        </div>
      </div>

      <button className="bouton-retour" onClick={() => navigate('/client/mesCommandes')}>
        <FaSignOutAlt /> Retour
      </button>
    </div>
  );
};

export default SuiviLivraison;