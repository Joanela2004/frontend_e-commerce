// StockAlerts.js
import { useEffect, useState } from "react";
import dashboardApi from "../../../services/dashboardApi";
import "../../../styles/back-office/StockAlerts.css";
import { FaBox, FaExclamationTriangle, FaBell, FaChartLine, FaWeightHanging } from "react-icons/fa";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function StockAlerts({ threshold = 1.0 }) {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await dashboardApi.stockAlerts(threshold);
      setProduits(res.data);
    } catch (err) {
      console.error("Erreur API StockAlerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [threshold]);

  const getStockStatus = (poids) => {
    if (poids <= threshold * 0.3) return "critical";
    if (poids <= threshold * 0.6) return "warning";
    return "low";
  };

  const getProgressPercentage = (poids) => {
    const maxPoids = threshold * 2; // Pour l'échelle de progression
    return Math.min((poids / maxPoids) * 100, 100);
  };

 

  return (
    <div className="stock-alerts-container">
      <div className="stock-alerts-header">
        <div>
          <h2>
            <FaBell style={{ color: "#28a458" }} />
            Alertes de Stock
          </h2>
       
        </div>
        <div className="stock-badge">
          {produits.length} alerte{produits.length !== 1 ? 's' : ''}
        </div>
      </div>

      {produits.length === 0 ? (
        <div className="stock-empty-state">
          <FaBox className="icon" />
          <h3>Aucune alerte de stock</h3>
          <p>Tous les produits sont bien approvisionnés</p>
        </div>
      ) : (
        <div className="stock-grid">
          {produits.map((p) => {
            const status = getStockStatus(p.poids);
            const progress = getProgressPercentage(p.poids);
            
            return (
              <div key={p.numProduit} className={`stock-card ${status}`}>
                <div className="stock-info">
                  <div className="stock-image">
                    {p.image ? (
                      <img
                        src={`${IMAGE_BASE_URL}${p.image}`}
                        alt={p.nomProduit}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `
                            <div style='display:flex;align-items:center;justify-content:center;width:100%;height:100%;'>
                              <FaBox size={28} color="#94a3b8" />
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <FaBox size={28} color="#94a3b8" />
                    )}
                  </div>
                  <div className="stock-details">
                    <h3 className="product-name">{p.nomProduit}</h3>
                    
                    <div className="seuil-info">
                      <FaWeightHanging className="icon" />
                      <span>Poids actuel: {p.poids} kg</span>
                    </div>
                  </div>
                </div>

               
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}