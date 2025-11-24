import React from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Mail } from "lucide-react";

export const KPICard = ({ titre, valeur, evolution = 0, icone: Icon, format = 'nombre' }) => {
  const isPositif = evolution >= 0;
  
  let valeurFormatee;
  if (format === 'devise') {
    valeurFormatee = `${valeur.toLocaleString('fr-FR')} Ar`;
  } else if (format === 'pourcent') {
    valeurFormatee = `${valeur.toFixed(1)}%`;
  } else {
    valeurFormatee = valeur.toLocaleString('fr-FR');
  }

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-titre">{titre}</span>
        <Icon className="kpi-icon" />
      </div>
      <div className="kpi-valeur">{valeurFormatee}</div>
      
      
    </div>
  );
};

const KPISection = ({ stats }) => {
  // Icons mapping
  const icons = {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    Mail
  };

  return (
    <section className="kpis-grid">
      <KPICard 
        titre="Revenu Total" 
        valeur={stats.revenuTotal || 0} 
        evolution={stats.evolutionRevenu || 0}
        icone={DollarSign} 
        format="devise" 
      />
      
      <KPICard 
        titre="Total Commandes" 
        valeur={stats.totalCommandes || 0} 
        evolution={stats.evolutionCommandes || 0}
        icone={ShoppingCart} 
      />
      
      <KPICard 
        titre="Total Clients" 
        valeur={stats.totalClients || 0} 
        evolution={stats.evolutionClients || 0}
        icone={Users} 
      />
      
      <KPICard 
        titre="Produits Actifs" 
        valeur={stats.produitsActifs || 0} 
        evolution={stats.evolutionProduits || 0}
        icone={Package} 
      />
      
      <KPICard 
        titre="Promotions Actives" 
        valeur={stats.promotionsActives || 0} 
        icone={Mail} 
      />
      
      <KPICard 
        titre="Modes Paiement" 
        valeur={stats.modesPaiementActifs || 0} 
        icone={DollarSign} 
      />
    </section>
  );
};

export default KPISection;