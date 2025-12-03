import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import dashboardApi from "../../../services/dashboardApi";
import "../../../styles/back-office/TopProduct.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function TopProducts({ start = null, end = null, limit = 10, metric = "ca" }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Tooltip personnalisé sécurisé ---
  const customTooltip = (context) => {
    let tooltipEl = document.getElementById("custom-tooltip");

    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.id = "custom-tooltip";
      tooltipEl.className = "custom-tooltip-box";
      document.body.appendChild(tooltipEl);
    }

    const tooltip = context.tooltip;

    if (!tooltip || tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    const dataset = context.chart.data.datasets[0];

    if (!dataset || !dataset.clients) {
      tooltipEl.style.opacity = 0;
      return;
    }

    const index = tooltip.dataPoints[0].dataIndex;
    const client = dataset.clients[index];

    if (!client) {
      tooltipEl.style.opacity = 0;
      return;
    }

   tooltipEl.innerHTML = `
  <div class="tooltip-content">
    <img src="${IMAGE_BASE_URL}${client.image || ''}" class="tooltip-img" />
    <div class="tooltip-text">
      <strong>${client.name}</strong><br/>
      Total : ${dataset.data[index]}
    </div>
  </div>
`;


    const { offsetLeft, offsetTop } = context.chart.canvas;
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = offsetLeft + tooltip.caretX + 15 + "px";
    tooltipEl.style.top = offsetTop + tooltip.caretY + 15 + "px";
  };

  const loadData = async () => {
    try {
      const res = await dashboardApi.topProducts(limit, start, end, metric);

      const labels = res.data.map(item => item.nomProduit);
      const values = res.data.map(item => item.total);

         const clients = res.data.map(item => ({
        name: item.clientName ?? "Client inconnu",
        image: item.clientImage ?? "/default-avatar.png"
      }));

           setChartData({
        labels,
        datasets: [
          {
            label: metric === "ca" ? "CA (€)" : "Quantité",
            data: values,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            clients: clients,  
          },
        ],
      });
    } catch (err) {
      console.error("Erreur API TopProducts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [start, end, limit, metric]);

  if (loading) return <div className="loading">Chargement top produits...</div>;

  return (
    <div className="top-products-container">
      <h2>Top Produits</h2>

      {chartData && (
        <div className="chart-wrapper">
          <Bar
            data={chartData}
            options={{
              plugins: {
                tooltip: {
                  enabled: false,     // désactive tooltip natif
                  external: customTooltip,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
