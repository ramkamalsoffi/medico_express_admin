import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    total,
    limit,
    onPageChange,
    loading = false,
}) => {
    if (loading || total === 0) return null;

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            {/* Left Side - Info */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                    Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
                    <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
                    <span className="font-semibold text-gray-900">{total}</span> entries
                </span>
            </div>

            {/* Right Side - Controls */}
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    title="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                </button>

                {/* Page Info */}
                <div className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                    <span>Page</span>
                    <span className="font-semibold text-blue-600">{currentPage}</span>
                    <span>of</span>
                    <span className="font-semibold">{totalPages}</span>
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    title="Next page"
                >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
