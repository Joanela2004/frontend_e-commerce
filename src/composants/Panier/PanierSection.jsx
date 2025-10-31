import React, { useState } from "react";
// Import des icônes nécessaires, j'ajoute FaLock et FaTruck
import { FaTrash, FaMobileAlt, FaCreditCard, FaUniversity, FaLock, FaTruck } from "react-icons/fa"; 
import Pagination from "../Accueil/PaginationProduits"; 
import panierImage from "../../assets/images/panierList.png"; 
import "../../styles/front-office/global.css";
import "../../styles/front-office/Panier/panierSection.css";
import legumeImage from "../../assets/images/legume3.jpg"; 

import MVolaModal from './MvolaModal';
import CarteBancaireModal from './CarteBancaireModal';
import VirementBancaireModal from './VirementBancaireModal';

const cuttingOptions = [
    { value: "entier", label: "Entier " },
    { value: "tranches", label: "En tranches " },
    { value: "des", label: "En dés " },
    { value: "mixte", label: "Découpe spécifique (à préciser)" },
];
const initialCartItems = [
    {
        id: 1,
        nom: "Tomate",
        description: "Calendrier de l'Avent panier - pour 1 ou 2 personnes",
        prixPerKg: 69.90,
        quantityKg: 1,
        image: legumeImage,
        cuttingOption: "entier",
    },
    {
        id: 2,
        nom: "Courgette Bio",
        description: "Courgettes fraîches et biologiques de saison",
        prixPerKg: 35.50,
        quantityKg: 2,
        image: legumeImage, 
        cuttingOption: "entier",
    },
    {
        id: 3,
        nom: "Pomme de Terre",
        description: "Sachet de 5kg de pommes de terre Bintje",
        prixPerKg: 15.00,
        quantityKg: 3,
        image: legumeImage,
        cuttingOption: "entier",
    },
    {
        id: 4,
        nom: "Carottes",
        description: "Lot de carottes de plein champ",
        prixPerKg: 20.25,
        quantityKg: 1.5,
        image: legumeImage,
        cuttingOption: "entier",
    },
    {
        id: 5,
        nom: "Oignons Rouges",
        description: "Filet d'oignons rouges d'Espagne",
        prixPerKg: 10.99,
        quantityKg: 1,
        image: legumeImage,
        cuttingOption: "entier",
    },
];

const PanierSection = () => {
  
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [promoCode, setPromoCode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; 
  const sousTotal = cartItems.reduce((acc, item) => acc + (item.prixPerKg * item.quantityKg), 0);
  const fraisDeService = 1.00;
  const livraisonOfferte = 0.00; 
  const montantAPayer = sousTotal + fraisDeService + livraisonOfferte; 
  
  const [activeModal, setActiveModal] = useState(null);
  const openModal = (mode) => {
    setActiveModal(mode);
  };

  const closeModal = () => {
    setActiveModal(null);
  };
  currentPage
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cartItems.length / itemsPerPage) ;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleQuantityChange = (itemId, increment) => {
    setCartItems(prevItems => prevItems.map(item => 
        item.id === itemId 
        ? {...item, quantityKg: Math.max(1, item.quantityKg + increment)} 
        : item
    ));
  };
    const handleCuttingOptionChange = (itemId, newOption) => {
      setCartItems(prevItems => prevItems.map(item => 
          item.id === itemId
          ? { ...item, cuttingOption: newOption }
          : item
      ));
  };
  
  const handleDelete = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    
    if (currentItems.length === 1 && totalPages > 1 ) {
        setCurrentPage(Math.max(1, currentPage - 1));
    }
  };
  const handleCommanderClick = () => {
    alert("Passer la commande !");
     };


  return (
    <section className="panier-section">
     
      <div className="panier-produits">
        <div className="panier-header">
         
          <div className="panier-icon-container">
            <img src={panierImage} className="panier-image" alt="Panier icône"/>
            <h3>Panier ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})</h3>
          </div>
        </div>
        
       <div className="panier-item-container">
               
            {currentItems.map((produit) => (
                <div className="item-card" key={produit.id}>
                   
                    <div className="item-card-image-info">
                        <img
                            src={produit.image}
                            alt={produit.nom}
                            className="panier-img"
                        />
                        <div className="produit-info-text">
                            <p className="precommande">[Précommande]</p>
                            <p className="produit-nom">{produit.nom}</p>
                            <p className="produit-description">{produit.description}</p>
                        </div>
                    </div>
                    
                   
                    <div className="produit-controls-row">
                        <div className="cutting-option-group">
                             <label htmlFor={`cutting-${produit.id}`}>Découpe :</label>
                             <div className="select-wrapper">
                                <select
                                    id={`cutting-${produit.id}`}
                                    
                                    value={produit.cuttingOption || "entier"} 
                                    onChange={(e) => handleCuttingOptionChange(produit.id, e.target.value)}
                                    className="cutting-select"
                                >
                                    {cuttingOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                             </div>
                        </div>

                        <div className="quantite-control-group">
                             <div className="quantite-control">
                                <button onClick={() => handleQuantityChange(produit.id, -1)}>-</button>
                                <span>{produit.quantityKg}</span>
                                <button onClick={() => handleQuantityChange(produit.id, 1)}>+</button>
                            </div>
                            <p className="quantite-unit">{produit.quantityKg} kg</p>
                            <p className="prix-per-kg">{produit.prixPerKg.toFixed(2).replace('.', ',')} € / kg</p>
                        </div>
                    </div>

                   
                    <div className="produit-final-row">
                         <p className="total-item-prix">
                          {(produit.prixPerKg * produit.quantityKg).toFixed(2).replace('.', ',')} Ar
                        </p>
                        <button className="delete-btn" onClick={() => handleDelete(produit.id)} title="Supprimer">
                            <FaTrash />
                        </button>
                    </div>
                </div>
            ))}
                 </div>
        
        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
        />
    
      </div>
     <div className="right-panel-wrapper">
       
        <div className="panier-total-card commande-globale-card">
        
          <div className="total-card">
           <div className="total-card-top">
            <div className="text">
              <h2>Sous-Total Panier</h2>
              <p>{sousTotal.toFixed(2).replace('.', ',')} €</p>
            </div>

            <div className="text">
              <h2><FaTruck className="delivery-icon" /> Livraison</h2>
              <p>{livraisonOfferte.toFixed(2).replace('.', ',')} €</p>
            </div>
            
            <div className="text">
              <h2>Frais de service
                <span className="info-icon" title="Information sur les frais">
                  &#9432;
                </span>
              </h2>
              <p>{fraisDeService.toFixed(2).replace('.', ',')} €</p>
            </div>
</div>
           
            <hr className="total-card-middle" />

            <div className="text total-line">
              <h2>Montant à payer</h2>
              <p className="total-prix-to-pay">
                {montantAPayer.toFixed(2).replace('.', ',')} €
              </p>
            </div>
          </div>

          <div className="promo-code-section">
            <p>Choisir le jour de ma livraison</p>
            <div className="livraison-input-group">
              <input
                type="date"
                placeholder="12-12-2025"
               
              />
                         </div>
                         <p>Adresse de livraison</p>
                          <div className="livraison-input-group">
              <input
                type="text"
                placeholder="Ville / Région"
               
              />
                         </div>
                          <p>Vous avez un code promo?</p>
            <div className="promo-input-group">
              <input
                type="text"
                placeholder="Saisissez votre code..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button className="promo-ok-btn">OK</button>
            </div>
          </div>

                <button className="passer-commande-btn" onClick={handleCommanderClick}>
            <FaLock className="lock-icon" /> Passer la commande
          </button>
        </div>

        <div className="paiement-section">
          <h3>Choisir un mode de paiement</h3>
          <div className="paiement-option" onClick={() => openModal('mvola')}>
            <FaMobileAlt className="icon mvola" />
            <div>
              <h4>Mvola</h4>
              <p>Paiement mobile instantané</p>
            </div>
            <span className="arrow">›</span>
          </div>
          <div className="paiement-option" onClick={() => openModal('carte')}>
            <FaCreditCard className="icon carte" />
            <div>
              <h4>Carte Bancaire</h4>
              <p>Visa, Mastercard</p>
            </div>
            <span className="arrow">›</span>
          </div>
          <div className="paiement-option" onClick={() => openModal('virement')}>
            <FaUniversity className="icon virement" />
            <div>
              <h4>Virement Bancaire</h4>
              <p>Transfert depuis votre banque</p>
            </div>
            <span className="arrow">›</span>
          </div>
        </div>
        
      </div>
      {activeModal === 'mvola' && (
        <MVolaModal montant={montantAPayer.toFixed(2).replace('.', ',')} onClose={closeModal} />
      )}
      {activeModal === 'carte' && (
        <CarteBancaireModal montant={montantAPayer.toFixed(2).replace('.', ',')} onClose={closeModal} />
      )}
      {activeModal === 'virement' && (
        <VirementBancaireModal montant={montantAPayer.toFixed(2).replace('.', ',')} onClose={closeModal} />
      )}
    </section>
  );
};

export default PanierSection;