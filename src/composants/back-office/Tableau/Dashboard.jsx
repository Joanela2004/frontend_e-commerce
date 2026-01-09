import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaSync } from "react-icons/fa";
import Kpis from "./Kpis";
import SalesByCategory from "./SalesByCategory";
import SalesOverTime from "./SalesOverTime";
import TopProducts from "./TopProducts";
import TopClients from "./TopClients";
import StockAlerts from "./StockAlerts";
// import GetKpis from "./GetKpis";
import DateRange from "./DateRange";
import "../../../styles/back-office/Dashboard.css";

import dashboardApi from "../../../services/dashboardApi";

export default function Dashboard() {
  const [dates, setDates] = useState({ start: null, end: null });
  const [stockAlerts, setStockAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadStockAlerts = async () => {
      try {
        setLoading(true);
        const res = await dashboardApi.stockAlerts(1);
        setStockAlerts(res.data);
      } catch (err) {
        console.error("Erreur StockAlerts", err);
      } finally {
        setLoading(false);
      }
    };
    loadStockAlerts();
  }, []);

  const filteredStockAlerts = stockAlerts.filter(alert => 
    alert.nomProduit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
     
         
      {/* Section Stock Alerts */}
      {filteredStockAlerts.length > 0 && (
        <div className="stock-section">
          
          <StockAlerts produits={filteredStockAlerts} />
        </div>
      )}

      {/* Section KPIs */}
      <div className="kpis-grid">
        <div className="kpis-primary">
      <Kpis start={dates.start} end={dates.end} />
          {/* <GetKpis start={dates.start} end={dates.end} /> */}
          
        </div>
           

       
       
      </div>

      {/* Section Graphiques */}
      <div className="charts-main-section">
        <div style={{display:"flex",marginBottom:"20px"}}className="date-range-wrapper">
          <DateRange onChange={setDates} />
        </div>
        <div style={{display:"flex",marginBottom:"20px"}}className="main-chart">
          <SalesOverTime start={dates.start} end={dates.end} interval="day" />
        </div>
        
       
      </div>
 {/* Petits graphiques à droite */}
        <div className="charts-main-section">
          <div className="chart-card">
            <SalesByCategory start={dates.start} end={dates.end} />
          </div>
          <div className="chart-card">
            <TopProducts
              start={dates.start}
              end={dates.end}
              limit={10}
              metric="ca"
            />
          </div>
        </div>
      {/* Section Top Clients */}
      <div className="top-clients-section">
        <TopClients start={dates.start} end={dates.end} limit={10} />
      </div>
    </div>
  );
}