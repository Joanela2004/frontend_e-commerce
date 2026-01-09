import api from "./api";


const getConfig = (params = {}, isFormData = false) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("Utilisateur non authentifié");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (isFormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  return {
    headers,
    params,
    withCredentials: true,
  };
};
export default {
  
   Kpis(start = null, end = null, range = "30d") {
    return api.get("/dashboard/kpis", getConfig({ start, end, range }));
  },
  salesOverTime(start = null, end = null, interval = "day") {
    return api.get("/dashboard/sales-over-time", getConfig({ start, end, interval }));
  },

  // Ventes par catégorie
  salesByCategory(start = null, end = null) {
    return api.get("/dashboard/sales-by-category", getConfig({ start, end }));
  },

 topProducts(limit = 10, start = null, end = null, metric = "ca") {
  return api.get(
    "/dashboard/top-products",
    getConfig({ limit, start, end, metric })
  );
},

  topClients(start = null, end = null, limit = 10) {
    return api.get("/dashboard/top-clients", getConfig({ start, end, limit }));
  },

  // Stock alerts
  stockAlerts(threshold = 1.0) {
    return api.get("/dashboard/stock-alerts", getConfig({ threshold }));
  },
};
