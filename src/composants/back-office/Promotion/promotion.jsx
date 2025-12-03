import React, { useState, useEffect } from 'react';
import AjouterPromotionModal from './AjouterPromotionModal';
import { fetchPromotions, createPromotion, updatePromotion, deletePromotion } from '../../../services/promotionService';
import { FaGift, FaSearch, FaEdit, FaSync, FaFilter,FaTrash } from "react-icons/fa";
import "../../../styles/back-office/global.css";
import "../../../styles/back-office/tableau.css";
import "../../../styles/back-office/modal.css";
import "../../../styles/back-office/toast.css";

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [promotionAEditer, setPromotionAEditer] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    // États pour les filtres
    const [filtreStatut, setFiltreStatut] = useState("tous");
    const [filtreType, setFiltreType] = useState("tous");
    const [filtreDateMin, setFiltreDateMin] = useState("");
    const [filtreDateMax, setFiltreDateMax] = useState("");

    const loadPromotions = async () => {
        try {
            setLoading(true);
            const data = await fetchPromotions();
            setPromotions(data);
        } catch (error) {
            console.error("Erreur chargement promotions:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadPromotions();
    }, []);

    const handleSavePromotion = async (promotionData) => {
        try {
            let promotionEnregistree;
            if (promotionAEditer) {
                promotionEnregistree = await updatePromotion(promotionAEditer.numPromotion, promotionData);
                setPromotions(promotions.map(p => p.numPromotion === promotionAEditer.numPromotion ? promotionEnregistree : p));
            } else {
                promotionEnregistree = await createPromotion(promotionData);
                setPromotions([...promotions, promotionEnregistree]);
            }
            setPromotionAEditer(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erreur sauvegarde promotion:", error);
            alert(error.response?.data?.message || "Une erreur est survenue lors de la sauvegarde.");
        }
    };

    const handleEdit = (promo) => {
        setPromotionAEditer(promo);
        setIsModalOpen(true);
    };

    const handleDelete = async (promo) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la promotion "${promo.nomPromotion}" ?`)) {
            try {
                await deletePromotion(promo.numPromotion);
                setPromotions(promotions.filter(p => p.numPromotion !== promo.numPromotion));
            } catch (error) {
                console.error("Erreur suppression promotion:", error);
                alert("Erreur lors de la suppression de la promotion.");
            }
        }
    };

    // Filtrer les promotions
    const filteredPromotions = promotions.filter(promo => {
        const searchMatch =
            (promo.codePromo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (promo.nomPromotion?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (promo.typePromotion?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        
        const statutMatch = filtreStatut === "tous" || 
            (filtreStatut === "active" && promo.statutPromotion === 'Active') ||
            (filtreStatut === "inactive" && promo.statutPromotion === 'Inactive') ||
            (filtreStatut === "expiree" && promo.statutPromotion === 'Expirée');
        
        const typeMatch = filtreType === "tous" || 
            promo.typePromotion?.toLowerCase() === filtreType;
        
        const dateDebut = promo.dateDebut ? new Date(promo.dateDebut) : null;
        const dateFin = promo.dateFin ? new Date(promo.dateFin) : null;
        
        const dateMinMatch = !filtreDateMin || 
            (dateDebut && dateDebut >= new Date(filtreDateMin)) ||
            (dateFin && dateFin >= new Date(filtreDateMin));
        
        const dateMaxMatch = !filtreDateMax || 
            (dateDebut && dateDebut <= new Date(filtreDateMax)) ||
            (dateFin && dateFin <= new Date(filtreDateMax));
        
        return searchMatch && statutMatch && typeMatch && dateMinMatch && dateMaxMatch;
    });

    const reinitialiserFiltres = () => {
        setFiltreStatut("tous");
        setFiltreType("tous");
        setFiltreDateMin("");
        setFiltreDateMax("");
        setSearchTerm("");
    };

    const hasActiveFilters = 
        searchTerm || 
        filtreStatut !== "tous" || 
        filtreType !== "tous" || 
        filtreDateMin || 
        filtreDateMax;

    // Statistiques
    const promotionsActive = promotions.filter(p => p.statutPromotion === 'Active').length;
    const promotionsInactive = promotions.filter(p => p.statutPromotion === 'Inactive').length;
    const promotionsExpiree = promotions.filter(p => p.statutPromotion === 'Expirée').length;

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Chargement des promotions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1><FaGift style={{marginRight: '10px'}} /> Gestion des Promotions</h1>
                    <div className="stats-container" style={{ marginTop: '10px' }}>
                        <span className="stat-item">
                            {filteredPromotions.length} promotion{filteredPromotions.length !== 1 ? 's' : ''} trouvée{filteredPromotions.length !== 1 ? 's' : ''}
                        </span>
                        <span className="stat-item" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                            {promotionsActive} active{promotionsActive !== 1 ? 's' : ''}
                        </span>
                        <span className="stat-item" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                            {promotionsInactive} inactive{promotionsInactive !== 1 ? 's' : ''}
                        </span>
                        <span className="stat-item" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                            {promotionsExpiree} expirée{promotionsExpiree !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => {setPromotionAEditer(null); setIsModalOpen(true);}}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaGift />
                    Ajouter une promotion
                </button>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="search-container">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher par code, nom ou type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        className={`filter-toggle ${showAdvancedFilters ? 'active' : ''}`}
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        style={{ border:"none", display:"flex", alignItems:"center", background:"white", color:"#28a458", paddingRight:"10px"}}
                    >
                        <FaFilter />
                    </button>
                    <FaSync
                        onClick={reinitialiserFiltres}
                        style={{ marginRight: '8px', border:"none", color:"#28a458", cursor: "pointer" }}
                        title="Réinitialiser tous les filtres"
                    />
                </div>
            </div>

            {/* Filtres avancés */}
            {showAdvancedFilters && (
                <div className="filters-container">
                    <div className="filters-row">
                        <div className="filter-group">
                            <label>Statut</label>
                            <select
                                className="form-control"
                                value={filtreStatut}
                                onChange={(e) => setFiltreStatut(e.target.value)}
                            >
                                <option value="tous">Tous les statuts</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="expiree">Expirée</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Type</label>
                            <select
                                className="form-control"
                                value={filtreType}
                                onChange={(e) => setFiltreType(e.target.value)}
                            >
                                <option value="tous">Tous les types</option>
                                <option value="pourcentage">Pourcentage</option>
                                <option value="montant fixe">Montant fixe</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Date début min</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filtreDateMin}
                                onChange={(e) => setFiltreDateMin(e.target.value)}
                            />
                        </div>
                        
                        <div className="filter-group">
                            <label>Date fin max</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filtreDateMax}
                                onChange={(e) => setFiltreDateMax(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Affichage des filtres actifs */}
                    <div className="active-filters">
                        {filtreStatut !== "tous" && (
                            <span className="active-filter-tag">
                                Statut: {filtreStatut}
                                <button onClick={() => setFiltreStatut("tous")}>×</button>
                            </span>
                        )}
                        {filtreType !== "tous" && (
                            <span className="active-filter-tag">
                                Type: {filtreType}
                                <button onClick={() => setFiltreType("tous")}>×</button>
                            </span>
                        )}
                        {filtreDateMin && (
                            <span className="active-filter-tag">
                                Date début min: {filtreDateMin}
                                <button onClick={() => setFiltreDateMin("")}>×</button>
                            </span>
                        )}
                        {filtreDateMax && (
                            <span className="active-filter-tag">
                                Date fin max: {filtreDateMax}
                                <button onClick={() => setFiltreDateMax("")}>×</button>
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Tableau des promotions */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Code Promo</th>
                            <th>Nom</th>
                            <th>Type</th>
                            <th>Valeur</th>
                            <th>Montant Minimum</th>
                            <th>Date Début</th>
                            <th>Date Fin</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPromotions.length > 0 ? (
                            filteredPromotions.map((promo) => (
                                <tr key={promo.numPromotion} className={promo.statutPromotion === 'Active' ? 'active-row' : ''}>
                                    <td>
                                        <span style={{ 
                                            fontWeight: 'bold', 
                                            color: '#8b5e3c',
                                            fontFamily: 'monospace'
                                        }}>
                                            {promo.codePromo}
                                        </span>
                                    </td>
                                    <td>{promo.nomPromotion}</td>
                                    <td>
                                        <span className={`badge-type ${promo.typePromotion === 'Pourcentage' ? 'badge-percent' : 'badge-amount'}`}>
                                            {promo.typePromotion || 'Pourcentage'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 'bold' }}>
                                            {promo.typePromotion === 'Pourcentage' 
                                                ? `${promo.valeur}%` 
                                                : `${promo.valeur.toLocaleString()} Ar`}
                                        </span>
                                    </td>
                                    <td>
                                        {promo.montantMinimum 
                                            ? `${promo.montantMinimum.toLocaleString()} Ar` 
                                            : <span style={{ color: '#6c757d' }}>Aucun</span>}
                                    </td>
                                    <td>
                                        {promo.dateDebut 
                                            ? new Date(promo.dateDebut).toLocaleDateString('fr-FR')
                                            : '-'}
                                    </td>
                                    <td>
                                        {promo.dateFin 
                                            ? new Date(promo.dateFin).toLocaleDateString('fr-FR')
                                            : '-'}
                                    </td>
                                    <td>
                                        <span className={`status ${promo.statutPromotion?.toLowerCase().replace('é', 'e') || 'inactive'}`}>
                                            {promo.statutPromotion || 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                       <div className="table-actions">
                                                             <button 
                                                               className="edit"
                                                               onClick={() => handleEdit(promo)}
                                                             >
                                                               <FaEdit style={{color:"#28a458", marginRight:"8px"}} /> Modifier
                                                             </button>
                                                             
                                                             <button 
                                                               className="delete" 
                                                               onClick={() => handleDelete(promo)}
                                                             >
                                                               <FaTrash style={{marginRight:"8px"}} /> Supprimer
                                                             </button>
                                                           </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="empty-table">
                                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                        <h3>
                                            {hasActiveFilters
                                                ? "Aucune promotion ne correspond à vos critères"
                                                : "Aucune promotion trouvée"}
                                        </h3>
                                        <p>
                                            {hasActiveFilters
                                                ? "Essayez avec d'autres termes de recherche ou modifiez les filtres."
                                                : "Ajoutez votre première promotion en cliquant sur le bouton ci-dessus."}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <AjouterPromotionModal
                    isOpen={isModalOpen}
                    onClose={() => {setIsModalOpen(false); setPromotionAEditer(null);}}
                    onSave={handleSavePromotion}
                    promotionAEditer={promotionAEditer}
                />
            )}
        </div>
    );
};

export default Promotions;