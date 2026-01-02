import { useEffect, useState } from "react";
import dashboardApi from "../../../services/dashboardApi";
import "../../../styles/back-office/KPIs.css";

export default function Kpis({ range = "30d", start = null, end = null }) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKpis = async () => {
    try {
      const res = await dashboardApi.Kpis(start, end, range);
      setKpis(res.data.kpis);
    } catch (err) {
      console.error("Erreur API KPIs:", err);
      setKpis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, [range, start, end]);

  if (loading || !kpis) return <div className="loading">Chargement...</div>;

  return (
    <div className="kpis-container">
      {/* Chiffre d'affaires total */}
      <div className="kpi-card">
        <h3>Chiffre d'affaires</h3>
        <p>{kpis.totalRevenu.toLocaleString()} Ar</p>
      </div>

      {/* Nombre de produits vendus */}
      <div className="kpi-card">
        <h3>Produits vendus</h3>
        <p>{kpis.produitsVendus.toLocaleString()}</p>
      </div>

      {/* Nombre de commandes */}
      <div className="kpi-card">
        <h3>Commandes</h3>
        <p>{kpis.commandesCount.toLocaleString()}</p>
      </div>

      {/* Nouveaux clients */}
      <div className="kpi-card">
        <h3>Nouveaux clients</h3>
        <p>{kpis.clientsNouveaux.toLocaleString()}</p>
      </div>
    </div>
  );
}