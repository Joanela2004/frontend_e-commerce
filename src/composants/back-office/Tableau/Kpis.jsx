import { useEffect, useState } from "react";
import dashboardApi from "../../../services/dashboardApi";
import "../../../styles/back-office/KPIs.css";

export default function Kpis({ range = "30d", start = null, end = null }) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKpis = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.Kpis(start, end, range);
      setKpis(res.data.kpis || {});
    } catch (err) {
      console.error("Erreur API KPIs:", err);
      setKpis({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, [range, start, end]);

  if (!kpis) return <div className="kpis-error">Erreur de chargement des KPIs</div>;

  const formatNumber = (num) => (num ?? 0).toLocaleString("fr-FR");

  return (
    <div className="kpis-grid">
    
      <div className="kpi-card total-global" style={{background:"#28a458"}}>
        <h3 style={{color:"white"}}>Chiffre d'affaires total</h3>
        <div className="kpi-value " style={{color:"white"}} >
          {formatNumber(kpis.revenuTotalGlobal)} Ar
        </div>
      </div>

      {/* 2. Chiffre d'affaires de la période sélectionnée */}
      <div className="kpi-card period-ca">
        <h3>Chiffre d'affaire de la période</h3>
        <div className="kpi-value">
          {formatNumber(kpis.revenu)} Ar
        </div>
      </div>

      {/* Commandes livrées (période) */}
      <div className="kpi-card">
        <h3>Commandes livrées</h3>
        <div className="kpi-value">
          {formatNumber(kpis.totalCommandes)}
        </div>
      </div>

     

      {/* Nouveaux clients */}
      <div className="kpi-card">
        <h3> Clients</h3>
        <div className="kpi-value">
          {formatNumber(kpis.clientsNouveaux)}
        </div>
      </div>

      
    </div>
  );
}