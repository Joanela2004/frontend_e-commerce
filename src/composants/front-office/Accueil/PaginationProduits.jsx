import React from 'react'; // Retirer useState et useEffect car l'état est géré par le parent
import '../../../styles/front-office/Accueil/Pagination.css';

const PaginationProduits = ({ totalProduits, produitsParPage, currentPage, onPageChange }) => {
  
  const totalPages = Math.ceil(totalProduits / produitsParPage);

  const handlePageChange = (nouvellePage) => {
      onPageChange(nouvellePage);
  };

    if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        // Utilisation de currentPage directement
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        &lt;
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          // Utilisation de currentPage pour l'état actif
          className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
          onClick={() => handlePageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}

      <button
        className="pagination-btn"
        // Utilisation de currentPage directement
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationProduits;