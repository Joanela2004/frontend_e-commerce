// Fichier : ClientsStats.jsx

import React, { useMemo, useState } from "react"; // Suppression d'useEffect inutile ici
import { usePagination } from "../../../pages/hooks/hooks";
import { sendPromoEmail } from "../../../services/promotionService";
import { fetchPromotions } from "../../../services/promotionService";
import { toast } from "react-toastify";
import { X, Gift, Calendar, Percent } from "lucide-react";
import '../../../styles/front-office/Accueil/Pagination.css';
import "../../../styles/back-office/clients.css";

const ClientsStats = ({ clients, commandes }) => {
  const [loadingClient, setLoadingClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [sending, setSending] = useState(false);

  const clientsAvecStats = useMemo(() => {
    if (!clients) return [];
    const clientsNormaux = clients.filter(c => c.role !== "admin");
    const mapTotalParClient = new Map();

    commandes?.forEach(cmd => {
      const clientId = cmd.numUtilisateur;
      const totalCmd = parseFloat(cmd.montantTotal || 0);
      mapTotalParClient.set(clientId, (mapTotalParClient.get(clientId) || 0) + totalCmd);
    });

    return clientsNormaux.map(client => ({
      id: client.numUtilisateur,
      nom: client.nomUtilisateur,
      email: client.email,
      // NOTE : Ajout du total dépensé pour l'affichage (si votre besoin inclut cette info)
      totalDepense: mapTotalParClient.get(client.numUtilisateur) || 0,
    }));
  }, [clients, commandes]);

  const { currentRows, goToPage, currentPage, totalPages } = usePagination(clientsAvecStats, 5);

  const handleOpenModal = async (client) => {
    setSelectedClient(client);
    setShowModal(true);
    setLoadingPromos(true);
    setSelectedPromo(null);

    try {
        const promos = await fetchPromotions();
        
        // CORRECTION 1 : Filtre robuste et insensible à la casse + vérification de date.
        const promosActives = promos.filter(p => {
            const statut = p.statutPromotion?.toLowerCase();
            const dateFin = new Date(p.dateFin);
            const maintenant = new Date();

            // La promotion est active si statut est 'active' OU 'actif' ET n'est pas expirée
            return (statut === "active" || statut === "actif") && dateFin > maintenant;
        });
        
        setPromotions(promosActives);

    // CORRECTION 2 : Gestion d'erreur déplacée dans le bloc catch
    } catch (err) {
      toast.error("Erreur lors du chargement des promotions.");
      console.error(err);
      setPromotions([]);
    } finally {
      setLoadingPromos(false);
    }
  };

  const handleEnvoyerPromo = async () => {
    if (!selectedPromo) {
      toast.warning("Veuillez sélectionner une promotion");
      return;
    }

    try {
      setSending(true);
      
      // Les données envoyées DOIVENT correspondre à ce que le contrôleur Laravel attend
      const res = await sendPromoEmail({
        email: selectedClient.email,
        codePromo: selectedPromo.codePromo,
        // Les champs 'valeur' et 'nomClient' sont utiles mais pas critiques pour l'API Laravel si elle trouve la promo par codePromo.
        valeur: selectedPromo.valeur, 
        nomClient: selectedClient.nom, // Utilisez 'nom' défini dans useMemo
      });

      if (res.success || res.message) {
        toast.success(`Code promo ${selectedPromo.codePromo} envoyé à ${selectedClient.nom} !`);
        setShowModal(false);
        setSelectedClient(null);
        setSelectedPromo(null);
      } else {
        toast.error(res.message || "Erreur lors de l'envoi du code promo");
      }
    } catch (err) {
      toast.error("Erreur serveur lors de l'envoi du code promo.");
      console.error(err.response?.data || err);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // ... (Reste du composant inchangé, excepté les ajustements d'affichage)

  return (
    <>
      <div className="clients-stats">
        <h3>Statistiques par client</h3>
        
        <table className="clients-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map(c => (
              <tr key={c.id}>
                {/* CORRECTION 3: Utilisez les clés définies dans useMemo */}
                <td><strong>{c.nom}</strong></td> 
                <td>{c.email}</td>
                
                <td>
                  <button
                    className="btn-action-view"
                    onClick={() => handleOpenModal(c)}
                    disabled={loadingClient === c.id}
                  >
                    {loadingClient === c.id ? (
                      <>
                        <span className="loading-spinner"></span>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Gift size={16} style={{ marginRight: '0.5rem' }} />
                        Envoyer code promo
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* ... (Pagination) ... */}

      </div>

      {/* MODAL DE SÉLECTION DE PROMOTION */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Gift size={28} color="#28a458" />
                Sélectionner une promotion
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-client-info">
              {/* CORRECTION 4: Utilisez les clés correctes */}
              <p><strong>Client :</strong> {selectedClient?.nom}</p>
              <p><strong>Email :</strong> {selectedClient?.email}</p>
              {/* NOTE : La ligne 'Total dépenses' est laissée en commentaire si vous ne la calculez pas ici */}
              {/* <p><strong>Total dépenses :</strong> {parseFloat(selectedClient?.totalDepense || 0).toLocaleString('fr-FR')} Ar</p> */}
            </div>

                   {loadingPromos ? (

              <div style={{ textAlign: 'center', padding: '3rem' }}>

                <div className="loading-spinner" style={{ 

                  width: '40px', 

                  height: '40px', 

                  borderWidth: '4px',

                  margin: '0 auto'

                }}></div>

                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Chargement des promotions...</p>

              </div>

            ) : promotions.length === 0 ? (

              <div style={{ 

                textAlign: 'center', 

                padding: '3rem', 

                background: '#f9fafb',

                borderRadius: '12px',

                border: '2px dashed #d1d5db'

              }}>

                <Gift size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />

                <p style={{ color: '#6b7280', fontWeight: '600' }}>

                  Aucune promotion active disponible

                </p>

              </div>

            ) : (

              <>
                <div className="promo-list">
                  {promotions.map((promo) => (
                    <div
                      key={promo.numPromotion || promo.id}
                      className={`promo-item ${selectedPromo?.numPromotion === promo.numPromotion ? 'selected' : ''}`}
                      onClick={() => setSelectedPromo(promo)}
                    >
                      <div className="promo-code">
                         <Percent size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                         {promo.codePromo}
                      </div>
                      <div className="promo-valeur">
                        {/* Affichage correct de la valeur si c'est un pourcentage, sinon ajuster */}
                        -{promo.valeur} {promo.typePromotion === 'Pourcentage' ? '%' : '€'} 
                      </div>
                      <div className="promo-nomPromotion">
                        {promo.nomPromotion || "Promotion spéciale"}
                      </div>
                      <div className="promo-dates">
                        <Calendar size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
                        Du {formatDate(promo.dateDebut)} au {formatDate(promo.dateFin)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-actions">
                  {/* ... (Boutons) ... */}
                  <button 
                    className="btn-modal btn-secondary" 
                    onClick={() => setShowModal(false)}
                    disabled={sending}
                  >
                    Annuler
                  </button>
                  <button 
                    className="btn-modal btn-primary" 
                    onClick={handleEnvoyerPromo}
                    disabled={!selectedPromo || sending}
                  >
                    {sending ? (
                      <>
                        <span className="loading-spinner"></span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>Envoyer le code promo</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ClientsStats;