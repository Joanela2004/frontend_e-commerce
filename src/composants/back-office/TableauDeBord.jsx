import React, { useState, useEffect } from "react";
import { fetchProduits } from "../../services/produitService";
import { getClients } from "../../services/utilisateurService";
import { fetchPromotions, sendPromoEmail } from "../../services/promotionService";
import { fetchModesActifs } from "../../services/paiementService";
import { fetchCommandeById,fetchCommandes } from "../../services/commandeService";
import {
LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, AlertCircle, Mail } from "lucide-react";
import "../../styles/back-office/TableauDeBord.css";

const COULEURS_PIE = ["#20b2aa", "#ffa500", "#9400d3", "#696969"];
const COULEURS_BAR = ["#28a458", "#5ebb82", "#ff6347"];

const TableauDeBord = () => {
const [clients, setClients] = useState([]);
const [produits, setProduits] = useState([]);
const [promotions, setPromotions] = useState([]);
const [modesActifs, setModesActifs] = useState([]);
const [clientsSelectionnes, setClientsSelectionnes] = useState([]);
const [montantMin, setMontantMin] = useState("");
const [commandeAffichee, setCommandeAffichee] = useState(null);
const [clientCommandeId, setClientCommandeId] = useState(null);
const [chargementCommande, setChargementCommande] = useState(false);
const [envoisEnCours, setEnvoisEnCours] = useState(false);

useEffect(() => {
const chargerDashboard = async () => {
try {
const clientsData = await getClients();
setClients(clientsData);

    const produitsData = await fetchProduits();  
    setProduits(produitsData);  

    const promotionsData = await fetchPromotions();  
    setPromotions(promotionsData);  

    const modesData = await fetchModesActifs();  
    setModesActifs(modesData);  

  } catch (err) {  
    console.error("Erreur chargement dashboard:", err);  
  }  
};  
chargerDashboard();  

}, []);

// Filtrer clients par montant minimum
const clientsFiltresParMontant = () => {
if (!montantMin) return clients;
const min = parseFloat(montantMin);
if (isNaN(min)) return clients;
return clients.filter(c => (c.totalMontant || 0) >= min);
};

// KPIs
const totalCommandes = clients.reduce((sum, c) => sum + (c.commandes_count || 0), 0);
const revenuTotal = clients.reduce((sum, c) => sum + (c.totalMontant || 0), 0);
const panierMoyen = clients.length > 0 ? revenuTotal / clients.length : 0;
const tauxConversion = clients.length > 0 ? (totalCommandes / clients.length) * 100 : 0;
const produitsActifs = produits.length;
const promotionsActives = promotions.length;
const modesPaiementActifs = modesActifs.length;

const KPICard = ({ titre, valeur, icone: Icon, format = 'nombre', evolution = 0 }) => {
const isPositif = evolution >= 0;
const valeurFormatee = format === 'devise' ? `${valeur.toLocaleString()} €` :
format === 'pourcent' ? `${valeur.toFixed(1)}%` : valeur.toLocaleString();

return (  
  <div className="kpi-card">  
    <div className="kpi-header">  
      <span className="kpi-titre">{titre}</span>  
      <Icon className="kpi-icon" />  
    </div>  
    <div className="kpi-valeur">{valeurFormatee}</div>  
    {format !== 'nombre' && (  
      <div className={`kpi-evolution ${isPositif ? 'positif' : 'negatif'}`}>  
        {isPositif ? <TrendingUp size={16} /> : <TrendingDown size={16} />}  
        <span>{Math.abs(evolution)}% vs période précédente</span>  
      </div>  
    )}  
  </div>  
);  

};

// Graphiques
const ventesParJour = clients.map((c, i) => ({ jour: `Client ${i + 1}`, ventes: c.totalMontant || 0, commandes: c.commandes_count || 0 }));
const repartitionCommandes = [
{ name: "Expédiées", value: clients.filter(c => c.derniereCommande?.statut === "expédiée").length },
{ name: "En cours", value: clients.filter(c => c.derniereCommande?.statut === "en cours").length },
{ name: "Annulées", value: clients.filter(c => c.derniereCommande?.statut === "annulée").length }
];

const toggleSelection = (clientId) => {
setClientsSelectionnes(prev => prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]);
};

const handleAfficherCommandes = async (clientId) => {
if (clientCommandeId === clientId && commandeAffichee) {
setCommandeAffichee(null);
setClientCommandeId(null);
return;
}

setChargementCommande(true);  
setClientCommandeId(clientId);  
setCommandeAffichee(null);  

try {  
  const client = clients.find(c => c.id === clientId);  
  if (client && client.derniereCommande) {  
    const commande = await fetchCommandeById(client.derniereCommande.numCommande);  
    setCommandeAffichee(commande);  
  } else {  
    setCommandeAffichee({ message: "Le client n'a pas de commandes récentes." });  
  }  
} catch (error) {  
  console.error("Erreur chargement commande:", error);  
  setCommandeAffichee({ error: "Erreur lors du chargement des commandes." });  
} finally {  
  setChargementCommande(false);  
}  

};

const handleEnvoyerPromo = async (email) => {
try {
setEnvoisEnCours(true);
await sendPromoEmail({ email });
setClientsSelectionnes(prev => [...prev, email]);
setTimeout(() => setClientsSelectionnes(prev => prev.filter(e => e !== email)), 3000);
} catch (e) {
alert("Erreur lors de l'envoi");
console.error("Erreur envoi promo:", e);
} finally {
setEnvoisEnCours(false);
}
};

const clientsAffiches = clientsFiltresParMontant();
const tousSelectionnes = clientsAffiches.length > 0 && clientsSelectionnes.length === clientsAffiches.length;

const CommandesDetail = ({ commande }) => {
if (commande.error) return <p className="error-message">{commande.error}</p>;
if (commande.message) return <p>{commande.message}</p>;

return (  
  <div className="commande-detail-container">  
    <h4>Détail Commande #{commande.numCommande}</h4>  
    <p>Statut: <strong>{commande.statut}</strong></p>  
    <p>Montant Total: <strong>{commande.montantTotal?.toFixed(2)} €</strong></p>  
    <p>Lieu: {commande.lieu?.nomLieu || 'Non spécifié'}</p>  
    <table className="details-table">  
      <thead>  
        <tr>  
          <th>Produit</th><th>Poids</th><th>Prix Unitaire</th><th>Sous-Total</th>  
        </tr>  
      </thead>  
      <tbody>  
        {commande.detailCommandes?.map((detail, i) => (  
          <tr key={i}>  
            <td>{detail.produit?.nomProduit || 'Produit inconnu'}</td>  
            <td>{detail.poids} kg</td>  
            <td>{detail.prixUnitaire?.toFixed(2) || 0} €</td>  
            <td>{detail.sousTotal?.toFixed(2) || 0} €</td>  
          </tr>  
        ))}  
      </tbody>  
    </table>  
  </div>  
);  

};

const alertes = [
{ type: 'stock', message: `${produits.filter(p => p.quantite === 0).length} produits en rupture de stock`, niveau: 'danger' },
{ type: 'commande', message: `${clients.filter(c => c.commandes_count > 5).length} clients avec commandes en retard`, niveau: 'warning' }
];

return ( <div className="dashboard"> <header className="dashboard-header"> <h1>Tableau de Bord E-commerce</h1> <p>Vue d'ensemble de vos performances</p> </header>

  {alertes.length > 0 && (  
    <div className="alertes-container">  
      {alertes.map((alerte, idx) => (  
        <div key={idx} className={`alerte alerte-${alerte.niveau}`}>  
          <AlertCircle size={18} /> <span>{alerte.message}</span>  
        </div>  
      ))}  
    </div>  
  )}  

  <section className="kpis-grid">  
    <KPICard titre="Revenu Total" valeur={revenuTotal} icone={DollarSign} format="devise" />  
    <KPICard titre="Total Commandes" valeur={totalCommandes} icone={ShoppingCart} />  
    <KPICard titre="Total Clients" valeur={clients.length} icone={Users} />  
    <KPICard titre="Panier Moyen" valeur={panierMoyen} icone={Package} format="devise" />  
    <KPICard titre="Produits Actifs" valeur={produitsActifs} icone={Package} />  
    <KPICard titre="Promotions Actives" valeur={promotionsActives} icone={Mail} />  
    <KPICard titre="Modes Paiement Actifs" valeur={modesPaiementActifs} icone={DollarSign} />  
  </section>  

  <section className="graphiques-grid">  
    <div className="chart-card large">  
      <h3>Évolution des Ventes et Commandes</h3>  
      <ResponsiveContainer width="100%" height={300}>  
        <AreaChart data={ventesParJour}>  
          <defs>  
            <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">  
              <stop offset="5%" stopColor="#28a458" stopOpacity={0.8} />  
              <stop offset="95%" stopColor="#28a458" stopOpacity={0} />  
            </linearGradient>  
          </defs>  
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />  
          <XAxis dataKey="jour" /> <YAxis yAxisId="left" /> <YAxis yAxisId="right" orientation="right" />  
          <Tooltip /> <Legend />  
          <Area yAxisId="left" type="monotone" dataKey="ventes" stroke="#28a458" fill="url(#colorVentes)" name="Ventes (€)" />  
          <Line yAxisId="right" type="monotone" dataKey="commandes" stroke="#ff6347" strokeWidth={2} name="Commandes" />  
        </AreaChart>  
      </ResponsiveContainer>  
    </div>  

    <div className="chart-card">  
      <h3>Répartition des Commandes</h3>  
      <ResponsiveContainer width="100%" height={300}>  
        <BarChart data={repartitionCommandes}>  
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />  
          <XAxis dataKey="name" /> <YAxis /> <Tooltip /> <Legend />  
          <Bar dataKey="value" fill={COULEURS_BAR[0]} name="Nombre de commandes" />  
        </BarChart>  
      </ResponsiveContainer>  
    </div>  
  </section>  

  <section className="bottom-grid">  
    <div className="table-card full-width">  
      <h3>Liste des Clients</h3>  
      <div className="filters">  
        <label>Montant minimum: </label>  
        <input type="number" value={montantMin} onChange={e => setMontantMin(e.target.value)} placeholder="€" min="0" />  
        <button onClick={() => setClientsSelectionnes(clientsAffiches.map(c => c.id))}>Tout sélectionner</button>  
      </div>  
      <table className="data-table">  
        <thead>  
          <tr>  
            <th><input type="checkbox" checked={tousSelectionnes} onChange={() => tousSelectionnes ? setClientsSelectionnes([]) : setClientsSelectionnes(clientsAffiches.map(c => c.id))} /></th>  
            <th>Nom</th><th>Email</th><th>Total Commandes</th><th>Montant Total</th><th>Actions</th>  
          </tr>  
        </thead>  
        <tbody>  
          {clientsAffiches.map(client => (  
            <tr key={client.id}>  
              <td><input type="checkbox" checked={clientsSelectionnes.includes(client.id)} onChange={() => toggleSelection(client.id)} /></td>  
              <td>{client.nom}</td> <td>{client.email}</td>  
              <td>{client.commandes_count || 0}</td> <td>{(client.totalMontant || 0).toFixed(2)} €</td>  
              <td className="actions-cell">  
                <button onClick={() => handleAfficherCommandes(client.id)}>  
                  {clientCommandeId === client.id && commandeAffichee ? "Masquer commande" : "Voir commande"}  
                </button>  
                <button onClick={() => handleEnvoyerPromo(client.email)} disabled={envoisEnCours || clientsSelectionnes.includes(client.email)}>  
                  <Mail size={16} /> Promo  
                </button>  
              </td>  
            </tr>  
          ))}  
        </tbody>  
      </table>  

      {chargementCommande && <p>Chargement de la commande...</p>}  
      {commandeAffichee && <CommandesDetail commande={commandeAffichee} />}  
    </div>  
  </section>  
</div>  

);
};

export default TableauDeBord;
