import React, { useState, useEffect } from 'react';
import { createProduit, updateProduit } from '../../../services/produitService';

const AjouterProduitModal = ({ isOpen, onClose, onSave, produitAEditer, categories, promotions }) => {
    const [nom, setNom] = useState('');
    const [prix, setPrix] = useState('');
    const [poids, setPoids] = useState('');
    const [quantiteStock, setQuantiteStock] = useState('');
    const [image, setImage] = useState(null);
    const [imageFileName, setImageFileName] = useState('');
    const [numCategorie, setNumCategorie] = useState('');
    const [numPromotion, setNumPromotion] = useState('');

    useEffect(() => {
        if (!isOpen) {
            resetForm();
            return;
        }

        if (produitAEditer) {
            setNom(produitAEditer.nomProduit || '');
            setPrix(produitAEditer.prix?.toString() || '');
            setPoids(produitAEditer.poids?.toString() || '');
            setQuantiteStock(produitAEditer.quantiteStock?.toString() || '');
            setNumCategorie(produitAEditer.numCategorie || '');
            setNumPromotion(produitAEditer.numPromotion || '');
            setImage(null);
            setImageFileName(produitAEditer.image ? produitAEditer.image.split('/').pop() : '');
        } else {
            resetForm();
        }
    }, [isOpen, produitAEditer]);

    const resetForm = () => {
        setNom('');
        setPrix('');
        setPoids('');
        setQuantiteStock('');
        setImage(null);
        setImageFileName('');
        setNumCategorie(categories[0]?.numCategorie || '');
        setNumPromotion('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImageFileName(file.name);
        } else {
            setImage(null);
            setImageFileName(produitAEditer?.image ? produitAEditer.image.split('/').pop() : '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const produitId = produitAEditer?.id ?? produitAEditer?.numProduit;

        const formData = new FormData();
        formData.append('nomProduit', nom);
        formData.append('prix', prix);
        formData.append('poids', poids);
        formData.append('quantiteStock', quantiteStock);
        formData.append('numCategorie', numCategorie);
        if (numPromotion) formData.append('numPromotion', numPromotion);

        if (image instanceof File) {
            formData.append('image', image);
        }

        try {
            let result;
            if (produitAEditer) {
                result = await updateProduit(produitId, formData);
            } else {
                result = await createProduit(formData);
            }
            onSave(result);
            onClose();
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
            alert("Erreur lors de la sauvegarde !");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            

                <form onSubmit={handleSubmit} className="frais-form" encType="multipart/form-data">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Image</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                            {imageFileName && <small>Fichier: {imageFileName}</small>}
                        </div>

                        <div className="form-group">
                            <label>Nom du produit *</label>
                            <input
                                type="text"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                required
                                placeholder="Nom du produit"
                            />
                        </div>

                        <div className="form-group">
                            <label>Prix (Ar) *</label>
                            <input
                                type="number"
                                value={prix}
                                onChange={(e) => setPrix(e.target.value)}
                                required
                                placeholder="Prix"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Poids (kg) *</label>
                            <input
                                type="number"
                                value={poids}
                                onChange={(e) => setPoids(e.target.value)}
                                required
                                placeholder="Poids"
                                step="0.01"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Quantité en stock *</label>
                            <input
                                type="number"
                                value={quantiteStock}
                                onChange={(e) => setQuantiteStock(e.target.value)}
                                required
                                placeholder="Quantité"
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Catégorie *</label>
                            <select
                                value={numCategorie}
                                onChange={(e) => setNumCategorie(e.target.value)}
                                required
                            >
                                <option value="">Sélectionnez une catégorie</option>
                                {categories.map(cat => (
                                    <option key={cat.numCategorie} value={cat.numCategorie}>
                                        {cat.nomCategorie}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Promotion</label>
                            <select
                                value={numPromotion}
                                onChange={(e) => setNumPromotion(e.target.value)}
                            >
                                <option value="">Aucune promotion</option>
                                {promotions.map(promo => (
                                    <option key={promo.numPromotion} value={promo.numPromotion}>
                                        {promo.nomPromotion} ({promo.valeur}%)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn-save" type="submit">
                            {produitAEditer ? "Mettre à jour" : "Ajouter"}
                        </button>
                        
                        <button 
                            type="button" 
                            className="btn-cancel"
                            onClick={onClose}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
           
        </div>
    );
};

export default AjouterProduitModal;