import { useState, useEffect } from "react";
import Kpis from "./Kpis";
import SalesByCategory from "./SalesByCategory";
import SalesOverTime from "./SalesOverTime";
import TopProducts from "./TopProducts";
import TopClients from "./TopClients";
import StockAlerts from "./StockAlerts";
import GetKpis from "./GetKpis";
import DateRange from "./DateRange";
import "../../../styles/back-office/Dashboard.css";
import "../../../styles/back-office/modal.css";

export default function Dashboard() {
  // Les vraies dates sélectionnées par l'utilisateur
  const [dates, setDates] = useState({ start: null, end: null });

  // Optionnel : état de chargement global
  const [loading, setLoading] = useState(false);

  return (
    <div className="dashboard-container">
      <h1>Tableau de bord</h1>

      {/* Le sélecteur de dates */}
      <DateRange onChange={setDates} />

      {/* Petite indication visuelle */}
      {dates.start && dates.end && (
        <p className="text-sm text-gray-600 mb-4">
          Période sélectionnée : {dates.start} → {dates.end}
        </p>
      )}

      {/* === TOUS LES COMPOSANTS REÇOIVENT MAINTENANT LES BONNES DATES === */}
      <section className="kpis-section">
        <GetKpis start={dates.start} end={dates.end} />
      </section>

      <section className="kpis-section">
        <Kpis start={dates.start} end={dates.end} />
      </section>

      <section className="charts-section">
        <SalesByCategory start={dates.start} end={dates.end} />
        <SalesOverTime start={dates.start} end={dates.end} interval="day" />
      </section>

      <section className="top-section">
        <TopProducts start={dates.start} end={dates.end} limit={10} metric="ca" />
        <TopClients start={dates.start} end={dates.end} limit={10} />
      </section>

      <section className="stock-section">
        <StockAlerts threshold={1} />
      </section>
    </div>
  );
}