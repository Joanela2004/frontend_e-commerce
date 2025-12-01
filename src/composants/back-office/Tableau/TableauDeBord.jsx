import React, { useState, useEffect, useMemo } from "react";
import KPISection from "./KPISection";
import GraphiquesSection from "./GraphiquesSection";
import ClientsStats from "./ClientsStats";
import { getClients } from "../../../services/utilisateurService";
import { fetchProduits } from "../../../services/produitService";
import { fetchPromotions } from "../../../services/promotionService";
import { fetchModesActifs } from "../../../services/paiementService";
import { fetchCommandes } from "../../../services/commandeService";
import { AlertCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../styles/back-office/TableauDeBord.css";

const formatDate = (date) => date.toISOString().split("T")[0];

const getPeriodDates = (periode) => {
  const fin = new Date();
  const debut = new Date(fin);
  
  switch(periode) {
    case "24h":
      debut.setDate(fin.getDate() - 1);
      break;
    case "7j":
      debut.setDate(fin.getDate() - 7);
      break;
    case "30j":
      debut.setDate(fin.getDate() - 30);
      break;
    case "3m":
      debut.setDate(fin.getDate() - 90);
      break;
    case "1an":
      debut.setDate(fin.getDate() - 365);
      break;
    default:
      debut.setDate(fin.getDate() - 7);
  }
  
  return { debut: formatDate(debut), fin: formatDate(fin) };
};

const prepareData = (commandes, dateDebutStr, dateFinStr, periodeRapide) => {
  const debut = dateDebutStr ? new Date(dateDebutStr) : new Date("1970-01-01");
  const fin = dateFinStr ? new Date(dateFinStr) : new Date();
  fin.setHours(23, 59, 59, 999);

  const commandesFiltrees = commandes.filter(cmd => {
    const dateCmd = new Date(cmd.dateCommande);
    return dateCmd >= debut && dateCmd <= fin;
  });

  const ventesParCategorieMap = new Map();
  commandesFiltrees.forEach(cmd => {
    cmd.detail_commandes?.forEach(ligne => {
      const montant = parseFloat(ligne.sousTotal || 0);
      const categorie = ligne.produit?.categorie?.nomCategorie || "Catégorie Inconnue";
      if (montant > 0) {
        ventesParCategorieMap.set(categorie, (ventesParCategorieMap.get(categorie) || 0) + montant);
      }
    });
  });
  
  const ventesParCategorie = Array.from(ventesParCategorieMap, ([name, value]) => ({ 
    name, 
    value: parseFloat(value.toFixed(2)) 
  }));

  // Évolution des ventes selon la période
  const evolutionVentesMap = new Map();
  
  if (periodeRapide === "24h" || periodeRapide === "7j") {
    const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    commandesFiltrees.forEach(c => {
      const dateCmd = new Date(c.dateCommande);
      const dayIndex = dateCmd.getDay();
      const nomJour = jours[dayIndex === 0 ? 6 : dayIndex - 1];
      evolutionVentesMap.set(nomJour, (evolutionVentesMap.get(nomJour) || 0) + parseFloat(c.montantTotal || 0));
    });
    
    const evolutionVentes = jours.map(j => ({ 
      label: j, 
      ventes: evolutionVentesMap.get(j) || 0 
    }));
    
    return { commandesFiltrees, evolutionVentes, ventesParCategorie };
    
  } else if (periodeRapide === "30j" || periodeRapide === "3m") {
    const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    commandesFiltrees.forEach(c => {
      const key = new Date(c.dateCommande).getMonth();
      evolutionVentesMap.set(key, (evolutionVentesMap.get(key) || 0) + parseFloat(c.montantTotal || 0));
    });
    
    return { 
      commandesFiltrees, 
      evolutionVentes: mois.map((m, i) => ({ 
        label: m, 
        ventes: evolutionVentesMap.get(i) || 0 
      })), 
      ventesParCategorie 
    };
    
  } else if (periodeRapide === "1an") {
    commandesFiltrees.forEach(c => {
      const year = new Date(c.dateCommande).getFullYear();
      evolutionVentesMap.set(year, (evolutionVentesMap.get(year) || 0) + parseFloat(c.montantTotal || 0));
    });
    
    const evolutionVentes = Array.from(evolutionVentesMap, ([label, ventes]) => ({ 
      label: `${label}`, 
      ventes 
    }));
    
    return { commandesFiltrees, evolutionVentes, ventesParCategorie };
  }
  
  return { commandesFiltrees, evolutionVentes: [], ventesParCategorie };
};

const TableauDeBord = () => {
  const [periode, setPeriode] = useState("7j");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [modesActifs, setModesActifs] = useState([]);
  const [commandes, setCommandes] = useState([]);

  // Calcul des dates basé sur la période
  const { debut: dateDebut, fin: dateFin } = useMemo(() => 
    getPeriodDates(periode), 
    [periode]
  );

  useEffect(() => {
    chargerDonnees();
  }, [periode]);

 const chargerDonnees = async () => {
  setLoading(true);
  try {
    const clientsData = await getClients();
    const produitsData = await fetchProduits();
    const promotionsData = await fetchPromotions();

    let modesData = [];
    try {
      modesData = await fetchModesActifs();
    } catch (err) {
      console.warn("Impossible de charger les modes de paiement actifs :", err);
    }

    const commandesData = await fetchCommandes();

    setClients(clientsData);
    setProduits(produitsData);
    setPromotions(promotionsData);
    setModesActifs(modesData);
    setCommandes(commandesData);
  } catch (error) {
    console.error("Erreur chargement données:", error);
    toast.error("Erreur lors du chargement des données");
  } finally {
    setLoading(false);
  }
};


  // Calcul des données filtrées
  const { commandesFiltrees, evolutionVentes, ventesParCategorie } = useMemo(() =>
    prepareData(commandes, dateDebut, dateFin, periode),
    [commandes, dateDebut, dateFin, periode]
  );

  // Alertes simulées (à adapter avec vos vraies données)
  const alertes = useMemo(() => {
    const produitsRupture = produits.filter(p => p.quantiteStock <= 0).length;
    const commandesEnAttente = commandes.filter(c => c.statut === "en attente").length;
    
    return [
      ...(produitsRupture > 0 ? [{
        type: 'stock', 
        message: `${produitsRupture} produits en rupture de stock`, 
        niveau: 'danger' 
      }] : []),
      ...(commandesEnAttente > 0 ? [{
        type: 'commande', 
        message: `${commandesEnAttente} commandes en attente`, 
        niveau: 'warning' 
      }] : [])
    ];
  }, [produits, commandes]);

  // Préparation des stats pour KPISection
  const stats = useMemo(() => {
    const revenuTotal = commandesFiltrees.reduce((total, cmd) => total + parseFloat(cmd.montantTotal || 0), 0);
    const totalCommandesPrecedentes = 0; // À calculer avec les données précédentes
    const totalClientsPrecedents = 0; // À calculer avec les données précédentes
    
    return {
      revenuTotal: revenuTotal.toFixed(2),
      evolutionRevenu: 12.5, // À calculer avec les données précédentes
      totalCommandes: commandesFiltrees.length,
      evolutionCommandes: 8.3, // À calculer avec les données précédentes
      totalClients: clients.length,
      evolutionClients: 15.2, // À calculer avec les données précédentes
      produitsActifs: produits.filter(p => p.quantiteStock > 0).length,
      evolutionProduits: 5.0, // À calculer avec les données précédentes
      promotionsActives: promotions.filter(p => p.statutPromotion).length,
      modesPaiementActifs: modesActifs.length
    };
  }, [commandesFiltrees, clients, produits, promotions, modesActifs]);

 

  return (
    <div className="dashboard">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Tableau de Bord E-commerce</h1>
          <p>Vue d'ensemble de vos performances commerciales</p>
        </div>
        <select 
          value={periode} 
          onChange={(e) => setPeriode(e.target.value)} 
          className="periode-select"
        >
          <option value="24h">Dernières 24h</option>
          <option value="7j">7 derniers jours</option>
          <option value="30j">30 derniers jours</option>
          <option value="3m">3 derniers mois</option>
          <option value="1an">1 an</option>
        </select>
      </header>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="alertes-container">
          {alertes.map((alerte, idx) => (
            <div key={idx} className={`alerte alerte-${alerte.niveau}`}>
              <AlertCircle size={20} />
              <span>{alerte.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      <KPISection stats={stats} />

      {/* Graphiques */}
      <GraphiquesSection 
        evolutionVentes={evolutionVentes}
        ventesParCategorie={ventesParCategorie}
      />

      {/* Tableau Clients avec Modal Promo */}
      <ClientsStats 
        clients={clients}
        commandes={commandesFiltrees}
      />
    </div>
  );
};

export default TableauDeBord;