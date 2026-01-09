// import { useEffect, useState } from "react";
// import dashboardApi from "../../../services/dashboardApi";
// import "../../../styles/back-office/KPIs.css";

// export default function GetKpis({ range = "30d", start = null, end = null }) {
//   const [kpis, setKpis] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchKpis = async () => {
//     try {
//       const res = await dashboardApi.getKpis(start, end, range);
//       setKpis(res.data);
//     } catch (err) {
//       console.error("Erreur API getKpis:", err);
//       setKpis(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchKpis();
//   }, [start, end, range]);

//   if (loading) return <div className="loading"></div>;
//   if (!kpis) return <div className="loading"></div>;

//   return (
//     <div className="getkpi-container">

//       {/* Repeat Purchase Rate */}
//       <div className="getkpi-card">
//         <h3>Fréquence d’achat</h3>
//         <p>{kpis.repeatPurchaseRate}%</p>
//       </div>

//       {/* Revenu */}
//       <div className="getkpi-card">
//         <h3>Revenu total</h3>
//         <p>{kpis.revenuTotal.toLocaleString()} Ar</p>
//       </div>


      
//       {/* Taux retour/annulation */}
//       <div className="getkpi-card">
//         <h3>Taux d'annulation</h3>
//         <p>{kpis.tauxRetour}%</p>
//       </div>
//     </div>
    
//   );
// }