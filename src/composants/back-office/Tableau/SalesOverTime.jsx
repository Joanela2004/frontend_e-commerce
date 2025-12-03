import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

import dashboardApi from "../../../services/dashboardApi";
import "../../../styles/back-office/SalesOverTime.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function SalesOverTime({ start = null, end = null, interval = "day" }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await dashboardApi.salesOverTime(start, end, interval);

      const labels = res.data.map(item => item.period);
      const values = res.data.map(item => item.total);

      setChartData({
        labels,
        datasets: [
          {
            label: "Chiffre d’affaires",
            data: values,
            fill: true,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            tension: 0.3,
          },
        ],
      });
    } catch (err) {
      console.error("Erreur API SalesOverTime:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [start, end, interval]);

  if (loading) return <div className="loading">Chargement ventes...</div>;

  return (
    <div className="sales-over-time-container">
      <h2>Ventes dans le temps</h2>
      {chartData && (
        <div className="chart-wrapper">
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
}
