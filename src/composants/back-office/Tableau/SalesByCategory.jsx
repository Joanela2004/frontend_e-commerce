import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

import dashboardApi from "../../../services/dashboardApi";
import "../../../styles/back-office/SalesByCategory.css";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SalesByCategory() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await dashboardApi.salesByCategory(
        "2025-01-01",
        "2025-01-31",
        "ca"
      );

      const labels = res.data.map(item => item.nomCategorie);
      const values = res.data.map(item => item.total);

      setChartData({
        labels,
        datasets: [
          {
            label: "Chiffre d’affaires",
            data: values
          }
        ]
      });

    } catch (err) {
      console.error("Erreur API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="sales-category-container">
      <h2>Ventes par Catégorie</h2>

      {chartData && (
        <div className="chart-wrapper">
          <Pie data={chartData} />
        </div>
      )}
    </div>
  );
}
