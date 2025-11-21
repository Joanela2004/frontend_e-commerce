import React, { useState, useEffect } from "react";
import "../../../styles/back-office/commandes.css";
import { Link } from "react-router-dom";
import { usePagination } from "../../../pages/hooks/hooks";
import { fetchCommandes, updateCommandeAdmin } from "../../../services/commandeService";

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);

  const { currentRows, currentPage, totalPages, goToPage } = usePagination(
    commandes,
    5
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCommandes();
        setCommandes(data);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes", error);
      }
    };

    fetchData();
  }, []);

  // 🔥 Changer le statut
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateCommandeAdmin(id, { statut: newStatus });

      setCommandes((prev) =>
        prev.map((cmd) =>
          cmd.numCommande === id ? { ...cmd, statut: newStatus } : cmd
        )
      );
    } catch (error) {
      console.error("Erreur update statut :", error);
    }
  };

  // 🔥 Changer payerLivraison
  const handleLivraisonPaid = async (id, value) => {
    try {
      await updateCommandeAdmin(id, { payerLivraison: value });

      setCommandes((prev) =>
        prev.map((cmd) =>
          cmd.numCommande === id ? { ...cmd, payerLivraison: value } : cmd
        )
      );
    } catch (error) {
      console.error("Erreur update livraison :", error);
    }
  };

  return (
    <div className="commandes-container">
      <h2>Liste des Commandes</h2>

      <table className="table-commandes">
        <thead>
          <tr>
            <th>N° Commande</th>
            <th>Client</th>
            <th>Date</th>

            {/* Statut modifiable */}
            <th>Statut</th>

            <th>Sous-total</th>
            <th>Frais livraison</th>
            <th>Total</th>
            <th>Code promo</th>
            <th>Promotion</th>

            {/* Livraison payée modifiable */}
            <th>Livraison payée ?</th>

            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {currentRows.map((cmd) => (
            <tr key={cmd.numCommande}>
              <td>{cmd.numCommande}</td>
              <td>{cmd.utilisateur?.nomUtilisateur || "Inconnu"}</td>
              <td>{cmd.dateCommande}</td>

              {/* 🔥 Liste déroulante statut */}
              <td>
                <select
                  value={cmd.statut}
                  onChange={(e) =>
                    handleStatusChange(cmd.numCommande, e.target.value)
                  }
                  className="status-select"
                >
                  <option value="en attente">En attente</option>
                  <option value="validée">Validée</option>
                  <option value="en cours">En cours</option>
                  <option value="livrée">Livrée</option>
                  <option value="annulée">Annulée</option>
                </select>
              </td>

              <td>{cmd.sousTotal} Ar</td>
              <td>{cmd.fraisLivraison} Ar</td>
              <td>{cmd.montantTotal} Ar</td>

              <td>{cmd.codePromo ?? "—"}</td>
              <td>{cmd.numPromotion ?? "—"}</td>

              {/* 🔥 Checkbox frais de livraison */}
              <td>
                <input
                  type="checkbox"
                  checked={cmd.payerLivraison}
                  onChange={(e) =>
                    handleLivraisonPaid(cmd.numCommande, e.target.checked)
                  }
                />
              </td>

              <td>
                <Link
                  to={`/admin/commandes/${cmd.numCommande}`}
                  className="btn-voir"
                >
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          &lt;
        </button>

        <button className="pagination-btn active">{currentPage}</button>

        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Commandes;
