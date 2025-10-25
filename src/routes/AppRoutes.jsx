import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//front-office
import Accueil from "../pages/front-office/Accueil";
import Actualite from "../pages/front-office/Actualite";
import ContenuArticle from "../pages/front-office/ContenuArticle";
import Panier from "../pages/front-office/Panier";
import Produit from "../pages/front-office/Produit";
import Profil from "../pages/front-office/Profil";
import SuiviCommande from "../pages/front-office/SuiviCommande"; 
import SuiviLivraison from "../pages/front-office/SuiviLivraison"; 

// back-office
import TableauDeBord from "../pages/back-office/TableauDeBord";
import TousLesProduits from "../pages/back-office/Produit/TousLesProduits";
import AjouterProduit from "../pages/back-office/Produit/AjoutProduit";
import ModifierProduit from "../pages/back-office/Produit/ModifierProduit";
import ListeCommande from "../pages/back-office/Commande/ListeCommande";
import DetailsCommande from "../pages/back-office/Commande/DetailsCommande";
import TousLesClient from "../pages/back-office/TousLesClient";
import ProduitEnPromotion from "../pages/back-office/Promotion/ProduitEnPromotion";
import ProfilAdmin from "../pages/back-office/Profil";
import PaiementStat from "../pages/back-office/Paiement";
import AjoutActualite from "../pages/back-office/Actualite/AjoutActualite";
import ModifierActualite from "../pages/back-office/Actualite/ModifierActualite";
import TousLesActualite from "../pages/back-office/Actualite/TousLesActualite";
export default function AppRoutes(){
    return (
<Router>
    <Routes>
        {/* front-office */}
        <Route path="/" element={<Accueil/>}></Route>
        <Route path="/actualite" element ={<Actualite/>}></Route>
        <Route path="/actualite/:id" element ={<ContenuArticle/>}></Route>
        <Route path="/produit" element ={<Produit/>}></Route>
        <Route path="/profil" element ={<Profil/>}></Route>
        <Route path="/Panier" element ={<Panier/>}></Route>
        <Route path="/suivi-commande" element ={<SuiviCommande/>}></Route>
        <Route path="/suivi-livraison" element ={<SuiviLivraison/>}></Route>


        {/* back-office */}
        <Route path="/admin" element={<TableauDeBord/>}></Route>
        
        {/* Gestion des produits */}
        <Route path="/admin/produits" element={<TousLesProduits/>}></Route>
        <Route path="/admin/produits/ajouter" element={<AjouterProduit/>}></Route>
        <Route path="/admin/produits/modifier/:id" element={<ModifierProduit/>}></Route>
        <Route path="/admin/promotion" element={<ProduitEnPromotion/>}></Route>

        {/* Gestion des commandes */}
        <Route path="/admin/commandes" element={<ListeCommande/>}></Route>
        <Route path="/admin/commandes/:id" element={<DetailsCommande/>}></Route>
        
        {/* Gestion des actualités */}
        <Route path="/admin/actualites" element={<TousLesActualite/>}></Route>
        <Route path="/admin/actualites/ajouter" element={<AjoutActualite/>}></Route>
        <Route path="/admin/actualites/modifier/:id" element={<ModifierActualite/>}></Route>

        {/* Autres pages admin */}
        <Route path="/admin/clients" element={<TousLesClient/>}></Route>
        <Route path="/admin/profil" element={<ProfilAdmin/>}></Route>
        <Route path="/admin/paiements" element={<PaiementStat/>}></Route>
    </Routes>
</Router>
    );
}