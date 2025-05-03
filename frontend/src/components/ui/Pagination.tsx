import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of page numbers to show
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the beginning
      if (currentPage <= 2) {
        end = 4;
      }
      
      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
          currentPage === 1
            ? 'text-neutral-light cursor-not-allowed'
            : 'text-neutral hover:bg-neutral-light/50 hover:text-black'
        }`}
        aria-label="Previous page"
      >
        <FaChevronLeft />
      </button>
      
      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 text-neutral">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                currentPage === page
                  ? 'bg-primary text-black font-medium'
                  : 'hover:bg-neutral-light/50 text-neutral hover:text-black'
              }`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
          currentPage === totalPages
            ? 'text-neutral-light cursor-not-allowed'
            : 'text-neutral hover:bg-neutral-light/50 hover:text-black'
        }`}
        aria-label="Next page"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};
