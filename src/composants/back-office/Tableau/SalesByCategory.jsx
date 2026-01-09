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

export default function SalesByCategory({ start, end }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

     
      const res = await dashboardApi.salesByCategory(start, end);

      const labels = res.data.map(item => item.nomCategorie);
      const values = res.data.map(item => item.total);

      setChartData({
        labels,
        datasets: [
          {
            label: "Chiffre d’affaires",
            data: values,
            backgroundColor: [
              '#8b5e3c',
              '#28a458',
              '#5E8BA8', 
              '#0e6bc2dc',
              '#9FB3C3',
              '#D2B48C',
            ],
            borderColor: '#FFFFFF',
            borderWidth: 2,
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
  }, [start, end]);
  return (
    <div className="sales-category-container">
      {chartData && (
        <div style={{width:"80%",height:"88%",padding:"20px"}}>
          <h2>Ventes par Catégorie</h2>
          <Pie data={chartData} />
        </div>
      )}
    </div>
  );
}
