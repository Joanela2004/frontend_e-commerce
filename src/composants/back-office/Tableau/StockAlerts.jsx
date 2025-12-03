import { useEffect, useState } from "react";
import dashboardApi from "../../../services/dashboardApi";
import "../../../styles/back-office/StockAlerts.css";

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

  if (loading) return <div className="loading">Chargement alertes stock...</div>;

  return (
    <div className="stock-alerts-container">
      <h2>Alertes Stock</h2>
      {produits.length === 0 ? (
        <p>Aucun produit en rupture ou proche du seuil.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Poids / Quantité</th>
            </tr>
          </thead>
          <tbody>
            {produits.map(p => (
              <tr key={p.numProduit}>
                <td>{p.nomProduit}</td>
                <td>{p.poids}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
