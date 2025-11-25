import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

// Pages Front-Office
import Accueil from "../pages/front-office/Accueil";
import Actualite from "../pages/front-office/Actualite";
import ActualiteDetails from "../pages/front-office/ActualiteDetails";
import Panier from "../pages/front-office/Panier";
import Produit from "../pages/front-office/Produit";
import SuiviCommande from "../pages/front-office/SuiviCommande";
import SuiviLivraison from "../pages/front-office/SuiviLivraison";
import Profil from "../pages/front-office/Profil";
import ChangePasswordAdmin from "../composants/front-office/Profil/ChangePasswordAdmin";

// Pages Back-Office
import LieuxLivraison from "../composants/back-office/Livraison/LieuxLivraison";
import TableauLayout from "../pages/back-office/TableauLayout";
import TableauDeBord from "../composants/back-office/Tableau/TableauDeBord";
import Produits from "../composants/back-office/Produits/Produits";
import Paiements from "../composants/back-office/Paiements/paiements";
import ModesPaiement from "../composants/back-office/Paiements/ModesPaiement";
import Promotion from "../composants/back-office/Promotion/promotion";
import Articles from "../composants/back-office/Article/articles";
import Commandes from "../composants/back-office/Commande/Commandes";
import CommandeDetails from "../composants/back-office/Commande/CommandeDetails";
import Clients from "../composants/back-office/Client/Clients";
import Livraisons from "../composants/back-office/Livraison/Livraisons";
import FraisLivraison from "../composants/back-office/Livraison/FraisLivraison";
import Categorie from "../composants/back-office/Produits/Categorie";
import Decoupes from "../composants/back-office/Produits/Decoupes";
import CommandesClient from "../composants/back-office/Client/CommandeClient";
export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Accueil />} />
        <Route path="/produit" element={<Produit />} />
        <Route path="/panier" element={<Panier />} />
        <Route path="/actualite" element={<Actualite />} />
        <Route path="/actualite/:id" element={<ActualiteDetails />} />
        <Route path="/profil" element={<Profil />} />

        {/* Pages client sécurisées */}
        <Route
          path="/client/mesCommandes"
          element={
            <PrivateRoute role="client">
              <SuiviCommande />
            </PrivateRoute>
          }
        />
        <Route
          path="/client/livraisons/:id"
          element={
            <PrivateRoute role="client">
              <SuiviLivraison />
            </PrivateRoute>
          }
        />

        {/* Pages admin sécurisées */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute role="admin">
              <AdminRoutes />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// Routes admin
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<TableauLayout />}>
        <Route index element={<TableauDeBord />} />
        <Route path="produits" element={<Produits />} />
        <Route path="articles" element={<Articles />} />
        <Route path="commandes" element={<Commandes />} />
        <Route path="commandes/:id" element={<CommandeDetails />} />
        <Route path="paiements" element={<Paiements />} />
        <Route path="paiements/modes" element={<ModesPaiement />} />
        <Route path="categories" element={<Categorie />} />
        <Route path="decoupes" element={<Decoupes />} />
        <Route path="promotion" element={<Promotion />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id/commandes" element={<CommandesClient />} />
        <Route path="livraisons" element={<Livraisons />} />
        <Route path="livraisons/frais" element={<FraisLivraison />} />
        <Route path="livraisons/lieux" element={<LieuxLivraison />} />
        <Route path="change-password" element={<ChangePasswordAdmin />} />
      </Route>
    </Routes>
  );
};