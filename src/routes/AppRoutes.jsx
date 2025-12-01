// AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

// Pages Front
import Accueil from "../pages/front-office/Accueil";
import Produit from "../pages/front-office/Produit";
import Panier from "../pages/front-office/Panier";
import Actualite from "../pages/front-office/Actualite";
import ActualiteDetails from "../pages/front-office/ActualiteDetails";
import Profil from "../pages/front-office/Profil";
import Success from "../pages/front-office/Success";
import Cancel from "../pages/front-office/Cancel";

// Pages Back
import TableauLayout from "../pages/back-office/TableauLayout";
import TableauDeBord from "../composants/back-office/Tableau/TableauDeBord";
import Produits from "../composants/back-office/Produits/Produits";
import Paiements from "../composants/back-office/Paiements/Paiements";        // ← Bon composant
import ModesPaiement from "../composants/back-office/Paiements/ModesPaiement"; // ← Bon composant
import Commandes from "../composants/back-office/Commande/Commandes";
import CommandeDetails from "../composants/back-office/Commande/CommandeDetails";
import Promotion from "../composants/back-office/Promotion/promotion";
import Articles from "../composants/back-office/Article/articles";
import Clients from "../composants/back-office/Client/Clients";
import Livraisons from "../composants/back-office/Livraison/Livraisons";
import FraisLivraison from "../composants/back-office/Livraison/FraisLivraison";
import LieuxLivraison from "../composants/back-office/Livraison/LieuxLivraison";
import Categorie from "../composants/back-office/Produits/Categorie";
import Decoupes from "../composants/back-office/Produits/Decoupes";
import CommandesClient from "../composants/back-office/Client/CommandesClient";
import ChangePasswordAdmin from "../composants/front-office/Profil/ChangePasswordAdmin";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Accueil />} />
        <Route path="/produit" element={<Produit />} />
        <Route path="/panier" element={<Panier />} />
        <Route path="/actualite" element={<Actualite />} />
        <Route path="/actualite/:id" element={<ActualiteDetails />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />

        {/* Routes Admin */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute role="admin">
              <TableauLayout />
            </PrivateRoute>
          }
        >
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
    </Router>
  );
}