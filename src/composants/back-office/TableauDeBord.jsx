import React, { useState, useEffect } from "react";
import { sendPromoEmail } from "../../services/promotionService";

import { fetchCommandeById,getClientsAvecCommandes } from "../../services/commandeService"; 
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "../../styles/back-office/TableauDeBord.css";

const COULEURS_PIE = ["#20b2aa", "#ffa500", "#9400d3", "#696969"];

const TableauDeBord = () => {
  const [clients, setClients] = useState([]);
  const [clientsSelectionnes, setClientsSelectionnes] = useState([]);
  const [montantMin, setMontantMin] = useState("");
  const [envoisEnCours, setEnvoisEnCours] = useState(false);
  const [emailsEnvoyes, setEmailsEnvoyes] = useState([]);
  const [commandeAffichee, setCommandeAffichee] = useState(null); 
  const [clientCommandeId, setClientCommandeId] = useState(null);
  const [chargementCommande, setChargementCommande] = useState(false);

  useEffect(() => {
    chargerClients();
  }, []);

  const chargerClients = async () => {
    try {
      const res = await getClientsAvecCommandes();
      setClients(res);
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleAfficherCommandes = async (clientId, commandeId) => {
    if (clientCommandeId === clientId && commandeAffichee) {
      setCommandeAffichee(null);
      setClientCommandeId(null);
      return;
    }
    
    setChargementCommande(true);
    setClientCommandeId(clientId);
    setCommandeAffichee(null);

    try {
      const client = clients.find(c => c.numUtilisateur === clientId);
      if (client && client.derniereCommande) { 
                   const commande = await fetchCommandeById(client.derniereCommande.numCommande);
          setCommandeAffichee(commande);
      } else {
          setCommandeAffichee({ message: "Le client n'a pas de commandes récentes." });
      }

    } catch (error) {
      console.error(error);
      setCommandeAffichee({ error: "Erreur lors du chargement des commandes." });
    } finally {
      setChargementCommande(false);
    }
  };

  const handleEnvoyerPromo = async (email) => {
    try {
      setEnvoisEnCours(true);
      await sendPromoEmail({ email });
      setEmailsEnvoyes(prev => [...prev, email]);
      setTimeout(() => {
        setEmailsEnvoyes(prev => prev.filter(e => e !== email));
      }, 3000);
    } catch (e) {
      alert("Erreur lors de l'envoi");
    } finally {
      setEnvoisEnCours(false);
    }
  };

  const handleEnvoyerSelection = async () => {
    if (clientsSelectionnes.length === 0) {
      alert("Veuillez sélectionner au moins un client");
      return;
    }
    
    try {
      setEnvoisEnCours(true);
      for (const clientId of clientsSelectionnes) {
        const client = clients.find(c => c.numUtilisateur === clientId);
        if (client) {
          await sendPromoEmail({ email: client.email });
          setEmailsEnvoyes(prev => [...prev, client.email]);
        }
      }
      alert(`${clientsSelectionnes.length} code(s) promo envoyé(s) avec succès !`);
      setClientsSelectionnes([]);
      setTimeout(() => {
        setEmailsEnvoyes([]);
      }, 3000);
    } catch (e) {
      alert("Erreur lors de l'envoi groupé");
    } finally {
      setEnvoisEnCours(false);
    }
  };

  const toggleSelection = (clientId) => {
    setClientsSelectionnes(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleSelectAll = () => {
    const clientsFiltres = clientsFiltresParMontant();
    if (clientsSelectionnes.length === clientsFiltres.length) {
      setClientsSelectionnes([]);
    } else {
      setClientsSelectionnes(clientsFiltres.map(c => c.numUtilisateur));
    }
  };

  const clientsFiltresParMontant = () => {
    if (!montantMin || montantMin === "") return clients;
    const min = parseFloat(montantMin);
    if (isNaN(min)) return clients;
    
    return clients.filter(c => (c.totalMontant || 0) >= min);
  };

  // SÉCURISATION DES CALCULS CONTRE NaN
  const totalCommandes = clients.reduce((sum, c) => sum + (c.commandes_count || 0), 0);
  const revenuTotal = clients.reduce((sum, c) => sum + (isNaN(c.totalMontant) ? 0 : c.totalMontant || 0), 0);
  const panierMoyen = totalCommandes > 0 ? revenuTotal / totalCommandes : 0;

  const evolutionVentes = clients.map((c, i) => ({
    jour: `Client ${i + 1}`,
    ventes: c.totalMontant || 0,
  }));

  const ventesParCategorie = [
    { name: "Clients", value: clients.length, percent: 100 },
  ];

  const clientsAffiches = clientsFiltresParMontant();
  const tousSelectionnes = clientsAffiches.length > 0 && clientsSelectionnes.length === clientsAffiches.length;

  // Composant pour afficher les détails d'une commande
  const CommandesDetail = ({ commande }) => {
    if (commande.error) return <p className="error-message">{commande.error}</p>;
    if (commande.message) return <p>{commande.message}</p>;
    
    const montantTotal = isNaN(commande.montantTotal) ? 0 : commande.montantTotal;
    
    return (
      <div className="commande-detail-container">
        <h4 className="detail-title">Détail de la Commande #{commande.numCommande}</h4>
        <p>Statut: <strong>{commande.statut}</strong></p>
        <p>Montant Total: <strong>{montantTotal.toFixed(2)} €</strong></p>
        <p>Lieu: {commande.lieu ? commande.lieu.nomLieu : 'Non spécifié'}</p>
        
        <table className="details-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Poids</th>
              <th>Prix Unitaire</th>
              <th>Sous-Total</th>
            </tr>
          </thead>
          <tbody>
            {commande.detailCommandes.map((detail, index) => {
              const prixUnitaire = isNaN(detail.prixUnitaire) ? 0 : detail.prixUnitaire;
              const sousTotal = isNaN(detail.sousTotal) ? 0 : detail.sousTotal;
              
              // UTILISATION DE LA CLÉ UNIQUE (ID ou un fallback sûr)
              const key = detail.numDetailCommande ? detail.numDetailCommande : `${commande.numCommande}-${index}`;

              return (
                <tr key={key}> 
                  <td>{detail.produit ? detail.produit.nomProduit : 'Produit inconnu'}</td>
                  <td>{detail.poids} kg</td>
                  <td>{prixUnitaire.toFixed(2)} €</td>
                  <td>{sousTotal.toFixed(2)} €</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    <div className="conteneur">

      <header className="entete-client">
        <h1 className="titre-section">Statistiques d'Achat (Réelles)</h1>
      </header>

      <section className="section-indicateurs">
        <div className="carte">
          <h1>Revenu Total</h1>
          <p>{(isNaN(revenuTotal) ? 0 : revenuTotal).toFixed(2)} €</p> 
        </div>

        <div className="carte">
          <h1>Total Commandes</h1>
          <p>{totalCommandes}</p>
        </div>

        <div className="carte">
          <h1>Panier Moyen</h1>
          <p>{(isNaN(panierMoyen) ? 0 : panierMoyen).toFixed(2)} €</p> 
        </div>
      </section>

      <section className="section-graphiques">
        <div className="carte graphique-carte">
          <h2 className="titre-graphique">Évolution des ventes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionVentes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="jour" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip formatter={v => [`${v} €`, "Ventes"]} />
              <Legend />
              <Line type="monotone" dataKey="ventes" stroke="#20b2aa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="carte graphique-carte">
          <h2 className="titre-graphique">Ventes par catégorie</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ventesParCategorie}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                <Cell fill={COULEURS_PIE[0]} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section-classement">
        <div className="controles-classement">
          <div className="filtre-recherche">
            <label htmlFor="montantMin"> Montant minimum:</label>
            <input
              id="montantMin"
              type="number"
              placeholder="Ex: 100"
              value={montantMin}
              onChange={(e) => setMontantMin(e.target.value)}
              className="input-recherche"
            />
           
          </div>
          
          {clientsSelectionnes.length > 0 && (
            <div className="actions-groupe">
              <button 
                className="btn-envoyer-groupe"
                onClick={handleEnvoyerSelection}
                disabled={envoisEnCours}
              >
                {envoisEnCours ? " Envoi en cours..." : `Envoyer code promo à ${clientsSelectionnes.length} client(s)`}
              </button>
              <button 
                className="btn-annuler"
                onClick={() => setClientsSelectionnes([])}
              >
                ✖ Annuler sélection
              </button>
            </div>
          )}
        </div>

        <div className="tableau-client">
          <table className="tableau-data">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={tousSelectionnes}
                    onChange={toggleSelectAll}
                    className="checkbox-selection"
                    title="Sélectionner tout"
                  />
                </th>
                <th>Nom</th>
                <th>Email</th>
                <th>Commandes</th>
                <th>Montant Total</th>
                <th>Détail</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {clientsAffiches.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                    {montantMin ? " Aucun client ne correspond à ce montant minimum" : " Aucun client "}
                  </td>
                </tr>
              ) : (
                clientsAffiches.map((client) => ( // Retrait de l'index si non utilisé
                  <React.Fragment key={client.numUtilisateur}> 
                    <tr 
                      className={`ligne-client ${clientsSelectionnes.includes(client.numUtilisateur) ? 'ligne-selectionnee' : ''}`}
                    >
                      <td data-label="Sélection">
                        <input
                          type="checkbox"
                          checked={clientsSelectionnes.includes(client.numUtilisateur)}
                          onChange={() => toggleSelection(client.numUtilisateur)}
                          className="checkbox-selection"
                        />
                      </td>
                      <td className="data nom-client" data-label="Nom">
                                           {client.nomUtilisateur}
                      </td>
                      <td className="data" data-label="Email">{client.email}</td>
                      <td className="data" data-label="Commandes">
                        <span className="badge-commandes">{client.commandes_count}</span>
                      </td>
                      <td className="data" data-label="Montant">
                        {/* Correction NaN */}
                        <span className="montant-total">
                          {(isNaN(client.totalMontant) ? 0 : client.totalMontant || 0).toFixed(2)} €
                        </span>
                      </td>
                      <td className="data" data-label="Détail">
                        <button 
                          className="btn-action btn-detail" 
                          onClick={() => handleAfficherCommandes(client.numUtilisateur, client.derniereCommande?.numCommande)}
                          disabled={chargementCommande && clientCommandeId === client.numUtilisateur}
                        >
                          {clientCommandeId === client.numUtilisateur && chargementCommande
                            ? "Chargement..."
                            : clientCommandeId === client.numUtilisateur 
                            ? "Masquer" 
                            : "Afficher"
                          }
                        </button>
                      </td>
                      <td className="data" data-label="Statut">
                        {emailsEnvoyes.includes(client.email) ? (
                          <span className="statut-envoye">✓ Envoyé</span>
                        ) : (
                          <span className="statut-pret">● Prêt</span>
                        )}
                      </td>
                      <td className="data" data-label="Action">
                        <button 
                          className="btn-action" 
                          onClick={() => handleEnvoyerPromo(client.email)}
                          disabled={envoisEnCours || emailsEnvoyes.includes(client.email)}
                        >
                          {emailsEnvoyes.includes(client.email) ? " Envoyé" : "Envoyer Code"}
                        </button>
                      </td>
                    </tr>
                    
                    {/* LIGNE DÉTAIL DES COMMANDES */}
                    {clientCommandeId === client.numUtilisateur && commandeAffichee && (
                      <tr className="ligne-detail-commande">
                        <td colSpan="8">
                          <CommandesDetail commande={commandeAffichee} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default TableauDeBord;