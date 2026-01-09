import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import dashboardApi from "../../../services/dashboardApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function SalesOverTime({ start, end, interval = "day" }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await dashboardApi.salesOverTime(start, end, interval);
        const labels = res.data.map((d) => d.period);
        const values = res.data.map((d) => d.total);

        setChartData({
          labels,
          datasets: [{
            label: "Chiffre d'affaires (Ar)",
            data: values,
            borderColor: "#28a458",
            backgroundColor: "rgba(40, 164, 88, 0.1)",
            tension: 0.3,
            fill: true,
          }],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [start, end, interval]);

 
  const options = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="chart-card full-width">
      <h2>Évolution des ventes</h2>
      {chartData && <Line data={chartData} options={options} />}
    </div>
  );
}