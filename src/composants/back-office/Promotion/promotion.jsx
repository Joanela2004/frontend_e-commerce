import React, { useState, useEffect } from 'react';
import AjouterPromotionModal from './AjouterPromotionModal';
import { fetchPromotions, createPromotion, updatePromotion, deletePromotion } from '../../../services/promotionService';
import { FaGift, FaSearch, FaEdit } from "react-icons/fa";
import "../../../styles/back-office/Promotions.css";

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [promotionAEditer, setPromotionAEditer] = useState(null);
    const [search, setSearch] = useState("");

    const loadPromotions = async () => {
        try {
            const data = await fetchPromotions();
            setPromotions(data);
        } catch (error) {
            console.error("Erreur chargement promotions:", error);
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

    const filteredPromotions = promotions.filter(promo =>
        [
            promo.codePromo,
            promo.nomPromotion,
            promo.typePromotion,
            promo.statutPromotion
        ]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const getStatusClass = (statut) => {
        // Vérification que statut est une string avant d'appeler toLowerCase
        const statutStr = statut ? statut.toString().toLowerCase() : '';
        
        switch (statutStr) {
            case 'active':
                return 'badge-statut-active';
            case 'inactive':
                return 'badge-statut-inactive';
            case 'expirée':
            case 'expiree':
            case 'expired':
                return 'badge-statut-expired';
            default:
                return 'badge-statut-inactive';
        }
    };

    const getTypeClass = (type) => {
        // Vérification que type est une string avant d'appeler toLowerCase
        const typeStr = type ? type.toString().toLowerCase() : '';
        
        switch (typeStr) {
            case 'pourcentage':
                return 'badge-type-pourcentage';
            case 'montant fixe':
            case 'montantfixe':
                return 'badge-type-montantfixe';
            default:
                return 'badge-type-pourcentage';
        }
    };

    return (
        <div className="livraison-container">
            <div className="livraison-header">
                <h2><FaGift /> Gestion des Promotions</h2>
                <button 
                    className="btn-primary"
                    onClick={() => {setPromotionAEditer(null); setIsModalOpen(true);}}
                >
                    <FaGift style={{marginRight: '8px'}} />
                    Ajouter une promotion
                </button>
            </div>

               <div className="frais-search-bar">
                                  <FaSearch />
                                  <input
                                    type="text"
                                    placeholder="Rechercher "
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                  />
            </div>

            <div className="table-container-bo">
                <table className="livraison-table">
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
                        {filteredPromotions.map((promo) => (
                            <tr key={promo.numPromotion} className={promo.statutPromotion === 'Active' ? 'promotion-active' : ''}>
                                <td className="code-promo-td">{promo.codePromo}</td>
                                <td>{promo.nomPromotion}</td>
                                <td>
                                    <span className={`badge-type-bo ${getTypeClass(promo.typePromotion)}`}>
                                        {promo.typePromotion || 'Pourcentage'}
                                    </span>
                                </td>
                                <td>
                                    {promo.typePromotion === 'Pourcentage' ? `${promo.valeur}%` : `${promo.valeur} Ar`}
                                </td>
                                <td>{promo.montantMinimum ? `${promo.montantMinimum} Ar` : 'Aucun'}</td>
                                <td>{promo.dateDebut ? new Date(promo.dateDebut).toLocaleDateString() : '-'}</td>
                                <td>{promo.dateFin ? new Date(promo.dateFin).toLocaleDateString() : '-'}</td>
                                <td>
                                    <span className={`badge-statut-bo ${getStatusClass(promo.statutPromotion)}`}>
                                        {promo.statutPromotion || 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(promo)}
                                        title="Modifier cette promotion"
                                    >
                                        <FaEdit />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredPromotions.length === 0 && (
                <div className="promotions-empty">
                    {search ? 'Aucune promotion ne correspond à votre recherche.' : 'Aucune promotion disponible.'}
                </div>
            )}

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