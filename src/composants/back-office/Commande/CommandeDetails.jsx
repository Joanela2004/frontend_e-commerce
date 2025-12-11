import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/back-office/commandes.css";
import { fetchDetailCommande } from "../../../services/commandeService";
import { FaDownload, FaArrowLeft, FaPrint, FaFilePdf } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CommandeDetails = () => {
  const { id } = useParams();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const contentRef = useRef(null);
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  useEffect(() => {
    const loadCommande = async () => {
      try {
        const data = await fetchDetailCommande(id);
        setCommande(data);
      } catch (error) {
        console.error("Erreur lors du chargement de la commande", error);
      } finally {
        setLoading(false);
      }
    };
    loadCommande();
  }, [id]);

  // Fonction de formatage fiable : date + heure au format malgache (serveur)
  const formatDateHeureServer = (dateString) => {
    if (!dateString) return "Non définie";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "Date invalide";

    const jour = String(date.getDate()).padStart(2, "0");
    const mois = String(date.getMonth() + 1).padStart(2, "0");
    const annee = date.getFullYear();
    const heures = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `Le ${jour}/${mois}/${annee} à ${heures}:${minutes}`;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "0 Ar";
    return Number(price).toLocaleString("fr-FR") + " Ar";
  };

  const getLivraisonStatus = (payerLivraison) => {
    return payerLivraison ? (
      <span className="badge-paid">OUI (Payé)</span>
    ) : (
      <span className="badge-unpaid">NON (Non Payé)</span>
    );
  };

  const getStatusClass = (statut) => {
    switch (statut) {
      case 'validée':
      case 'livrée':
        return 'statut-reussi';
      case 'expédiée':
        return 'statut-expediee';
      case 'en attente':
        return 'statut-attente';
      case 'annulée':
        return 'statut-annule';
      default:
        return 'statut-default';
    }
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setGeneratingPDF(true);
    try {
      const images = contentRef.current.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) {
          return Promise.resolve();
        } else {
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        }
      });
      await Promise.all(imagePromises);

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`commande-${commande.referenceCommande}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF", error);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Chargement des détails de la commande...</p>
    </div>
  );

  if (!commande) return (
    <div className="error-message">
      <p>Commande introuvable.</p>
      <button
        className="btn-consulter mt-4"
        onClick={() => window.history.back()}
      >
        <FaArrowLeft /> Retour
      </button>
    </div>
  );

  const totalPoids = commande.detail_commandes?.reduce(
    (total, item) => total + Number(item.poids || 0),
    0
  ) || 0;

  const nombreProduits = commande.detail_commandes?.length || 0;
  const lieuLivraison = commande.livraisons?.[0]?.lieuLivraison || 'Non spécifié';
  const livraisonPayee = commande.payerLivraison;
  const codePromo = commande.codePromo;

  return (
    <div className="commande-details-container">
      <div className="details-header">
        <h2>Détails de la commande n° {commande.referenceCommande}</h2>
        <div className="table-actions">
          <button
            className="btn-details"
            onClick={() => window.history.back()}
          >
            <FaArrowLeft /> Retour
          </button>
          <button
            className="btn-validate"
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
          >
            {generatingPDF ? (
              <span className="pdf-loading">
                <div className="loading-spinner"></div>
                En cours
              </span>
            ) : (
              <>
                <FaFilePdf /> Télécharger PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="details-content" ref={contentRef}>
        <div className="commande-info">
          <p><strong>Client :</strong> {commande.utilisateur?.nomUtilisateur || 'Inconnu'}</p>
          <p>
            <strong>Date :</strong>{' '}
            {formatDateHeureServer(commande.dateCommande)} {/* ← Date + Heure serveur */}
          </p>
          <p>
            <strong>Statut :</strong>{' '}
            <span className={`statut-badge ${getStatusClass(commande.statut)}`}>
              {commande.statut}
            </span>
          </p>
          <p><strong>Nombre de produits commandés :</strong> {nombreProduits}</p>
          <p><strong>Lieu de livraison :</strong> {lieuLivraison}</p>
        </div>

        <table className="table-produits">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom du produit</th>
              <th>Poids</th>
              <th>Découpe</th>
              <th>Prix unitaire</th>
              <th>Promotion</th>
              <th>Sous Total</th>
            </tr>
          </thead>
          <tbody>
            {commande.detail_commandes?.map((item) => (
              <tr key={item.numDetailCommande}>
                <td>
                  <img
                    src={
                      item.produit?.image
                        ? `${IMAGE_BASE_URL}/${item.produit.image}`
                        : "/placeholder.png"
                    }
                    alt={item.produit?.nomProduit || "Produit"}
                    className="img-produit"
                  />
                </td>
                <td>{item.produit?.nomProduit}</td>
                <td>{item.poids} kg</td>
                <td>{item.decoupe || "Pas de découpe"}</td>
                <td>{formatPrice(item.prixUnitaire)}</td>
                <td>
                  {item.produit?.promotion?.valeur
                    ? `${item.produit.promotion.valeur}${item.produit.promotion.typePromotion === "Pourcentage" ? "%" : " Ar"}`
                    : "Aucune"}
                </td>
                <td>{formatPrice(item.sousTotal || (item.poids * item.prixUnitaire))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="recap-financier">
          <h3>Récapitulatif financier et logistique</h3>
          <p>
            <strong>Poids Total des produits :</strong> <span>{totalPoids} kg</span>
          </p>
          <p>
            <strong>Sous-Total des produits :</strong> <span>{formatPrice(commande.sousTotal)}</span>
          </p>
          <p>
            <strong>Frais de Livraison :</strong> <span>{formatPrice(commande.fraisLivraison)}</span>
          </p>
          <p>
            <strong>Code Promo Appliqué :</strong>{" "}
            <span style={{ color: codePromo ? 'var(--color-primary)' : 'var(--color-danger-dark)' }}>
              {codePromo || "Aucun"}
            </span>
          </p>
          <p>
            <strong>Livraison Payée :</strong>{" "}
            <span style={{ color: livraisonPayee ? 'var(--color-primary)' : 'var(--color-danger-dark)' }}>
              {getLivraisonStatus(livraisonPayee)}
            </span>
          </p>
          <hr />
          <p className="montant-total">
            <strong>Montant Total (Net) :</strong> <span>{formatPrice(commande.montantTotal)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommandeDetails;