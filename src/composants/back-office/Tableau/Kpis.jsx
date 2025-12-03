import { useEffect, useState } from "react";
import dashboardApi from "../../../services/dashboardApi";  // <-- FIX
import "../../../styles/back-office/KPIs.css";

export default function Kpis({ range = "30d", start = null, end = null }) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKpis = async () => {
    try {
      const res = await dashboardApi.Kpis(start, end, range); // <-- FIX
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

  if (loading) return <div className="loading">Chargement KPIs...</div>;
  if (!kpis) return <div className="loading">Aucun KPI disponible</div>;

  return (
    <div className="kpis-container">
      <div className="kpi-card">
        <h3>Chiffre d'affaires</h3>
        <p>{kpis.totalRevenu.toLocaleString()} €</p>
        <span className={kpis.totalRevenuChangePct >= 0 ? "up" : "down"}>
          {kpis.totalRevenuChangePct >= 0 ? "▲" : "▼"} {Math.abs(kpis.totalRevenuChangePct)}%
        </span>
      </div>

      <div className="kpi-card">
        <h3>Commandes</h3>
        <p>{kpis.commandesCount}</p>
        <span className={kpis.commandesCountChangePct >= 0 ? "up" : "down"}>
          {kpis.commandesCountChangePct >= 0 ? "▲" : "▼"} {Math.abs(kpis.commandesCountChangePct)}%
        </span>
      </div>

      <div className="kpi-card">
        <h3>Nouveaux clients</h3>
        <p>{kpis.clientsNouveaux}</p>
        <span className={kpis.clientsNouveauxChangePct >= 0 ? "up" : "down"}>
          {kpis.clientsNouveauxChangePct >= 0 ? "▲" : "▼"} {Math.abs(kpis.clientsNouveauxChangePct)}%
        </span>
      </div>

     

      <div className="kpi-card">
        <h3>CA produits vendus</h3>
        <p>{kpis.produitsVendusCA.toLocaleString()} €</p>
        <span className={kpis.produitsVendusChangePct >= 0 ? "up" : "down"}>
          {kpis.produitsVendusChangePct >= 0 ? "▲" : "▼"} {Math.abs(kpis.produitsVendusChangePct)}%
        </span>
      </div>
    </div>
  );
}
