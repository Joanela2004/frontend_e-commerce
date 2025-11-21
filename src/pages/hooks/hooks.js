import { useState } from 'react'

export const usePagination = (data, rowPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);

  const safeData = Array.isArray(data) ? data : [];
  const safeRowPerPage = rowPerPage > 0 ? rowPerPage : 1;

  const indexOfLastRow = currentPage * safeRowPerPage;
  const indexOfFirstRow = indexOfLastRow - safeRowPerPage;
  const currentRows = safeData.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(safeData.length / safeRowPerPage);

  const goToPage = (pageNumber) => {
    const page = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(page);
  };

  return { currentRows, currentPage, totalPages, goToPage };
}