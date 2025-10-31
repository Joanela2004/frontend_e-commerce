import React from 'react';

const FiltresCommandes = ({ filtreStatut, setFiltreStatut, filtreDate, setFiltreDate, statutsDisponibles }) => {
  return (
    <div className="filtres-commandes-conteneur">
      <div className="filtre-item">
        <p>Rechercher par date</p>
        <input
          type="date"
          placeholder="mm/dd/yyyy"
          value={filtreDate}
          onChange={(e) => setFiltreDate(e.target.value)}
          className="input-date"
        />
      </div>

      <div className="filtre-item">
        <p>Filtrer par statut</p>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="select-statut"
        >
          {statutsDisponibles.map((statut) => (
            <option key={statut} value={statut}>
              {statut === "Tous" ? "Tous les statuts" : statut}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FiltresCommandes;