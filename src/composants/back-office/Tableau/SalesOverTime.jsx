import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import dashboardApi from "../../../services/dashboardApi";

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
            label: "Chiffre d'affaires",
            data: values,
            fill: true,
            backgroundColor: "rgba(40, 164, 88, 0.1)",
            borderColor: "#28a458",
            pointBackgroundColor: "#4B733D",
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
    <>
      <h2>Ventes dans le temps</h2>
      {chartData && (
        <div style={{width:"100%",height:"90%",padding:"20px"}}>
          <Line data={chartData} />
        </div>
      )}
    </>
  );
}