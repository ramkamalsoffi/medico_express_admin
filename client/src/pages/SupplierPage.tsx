import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ViewSupplierModal from '../components/ViewSupplierModal';
import EditSupplierModal from '../components/EditSupplierModal';
import { Download, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { useSuppliers, useDeleteSupplier } from '../hooks/useSuppliers';
import supplierApi from '../services/supplierApi';
import { Popover, Transition } from '@headlessui/react';

function SupplierPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    // Filter & Search States
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on new search term
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Modal states
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

    // Fetch suppliers with pagination
    const { data, isLoading, error, refetch } = useSuppliers(page, limit, debouncedSearch, sortBy);
    const deleteSupplierMutation = useDeleteSupplier();

    // View supplier - Open view modal
    const handleViewSupplier = (id: string) => {
        setSelectedSupplierId(id);
        setViewModalOpen(true);
    };

    // Edit supplier - Open edit modal
    const handleEditSupplier = (id: string) => {
        setSelectedSupplierId(id);
        setEditModalOpen(true);
    };

    // Delete supplier - Open delete confirmation
    const handleDeleteSupplier = (id: string) => {
        setSelectedSupplierId(id);
        setDeleteModalOpen(true);
    };

    // Confirm delete - Call DELETE API
    const confirmDeleteSupplier = async () => {
        if (selectedSupplierId) {
            try {
                await deleteSupplierMutation.mutateAsync(selectedSupplierId);
                setDeleteModalOpen(false);
                setSelectedSupplierId(null);
                alert('Supplier deleted successfully!');
            } catch (error) {
                alert('Failed to delete supplier');
            }
        }
    };

    const totalPages = data?.meta?.totalPages || 1;
    const suppliers = data?.data || [];

    const handleExport = async () => {
        try {
            await supplierApi.exportToExcel();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            <Header />
            <div className="flex overflow-x-hidden">
                <Sidebar />
                <main className="flex-1 p-6 overflow-x-hidden">
                    <div className="max-w-full overflow-x-hidden">
                        {/* Page Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Supplier Lists</h1>
                            <button
                                onClick={() => navigate('/supplier/add')}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Supplier
                            </button>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        {/* Filter Popover */}
                                        <Popover className="relative">
                                            <Popover.Button className="p-2 border border-blue-500 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200">
                                                <Filter className="w-5 h-5" />
                                            </Popover.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-200"
                                                enterFrom="opacity-0 translate-y-1"
                                                enterTo="opacity-100 translate-y-0"
                                                leave="transition ease-in duration-150"
                                                leaveFrom="opacity-100 translate-y-0"
                                                leaveTo="opacity-0 translate-y-1"
                                            >
                                                <Popover.Panel className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    <div className="p-4 space-y-4">
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</h4>
                                                            <div className="space-y-2">
                                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="sort"
                                                                        checked={sortBy === 'name_asc' || sortBy === 'name_desc' ? false : true}
                                                                        onChange={() => setSortBy('')}
                                                                        className="text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    Default (Newest First)
                                                                </label>
                                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="sort"
                                                                        checked={sortBy === 'name_asc'}
                                                                        onChange={() => setSortBy('name_asc')}
                                                                        className="text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    Name (A-Z)
                                                                </label>
                                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="sort"
                                                                        checked={sortBy === 'name_desc'}
                                                                        onChange={() => setSortBy('name_desc')}
                                                                        className="text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    Name (Z-A)
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Popover.Panel>
                                            </Transition>
                                        </Popover>

                                        {/* Search Bar */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search suppliers..."
                                                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleExport}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Export"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Loading State */}
                                {isLoading && (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        <p className="mt-2 text-sm text-gray-500">Loading suppliers...</p>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="text-center py-12">
                                        <p className="text-red-500">Failed to load suppliers</p>
                                        <p className="text-sm text-gray-500 mt-1">{error.message}</p>
                                    </div>
                                )}

                                {/* Table */}
                                {!isLoading && !error && (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">NAME</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">PHONE</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">EMAIL</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">GST NO</th>
                                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">PURCHASES</th>
                                                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {suppliers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                                                                No suppliers found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        suppliers.map((supplier) => (
                                                            <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                                <td className="px-3 py-3 text-xs text-gray-700 font-medium">{supplier.name}</td>
                                                                <td className="px-3 py-3 text-xs text-gray-700">{supplier.phone}</td>
                                                                <td className="px-3 py-3 text-xs text-gray-700">{supplier.email || '-'}</td>
                                                                <td className="px-3 py-3 text-xs text-gray-700">{supplier.gstNumber || '-'}</td>
                                                                <td className="px-3 py-3 text-xs text-gray-700">
                                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                        {supplier._count?.purchases || 0}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-3">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <button
                                                                            onClick={() => handleViewSupplier(supplier.id)}
                                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                            title="View Supplier"
                                                                        >
                                                                            <Eye className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleEditSupplier(supplier.id)}
                                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                            title="Edit Supplier"
                                                                        >
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteSupplier(supplier.id)}
                                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                            title="Delete Supplier"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                            <div className="text-sm text-gray-600">
                                                Showing {suppliers.length === 0 ? 0 : ((page - 1) * limit) + 1} to {Math.min(page * limit, data?.meta?.total || 0)} of {data?.meta?.total || 0} entries
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    disabled={page === 1}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>

                                                {/* Page Numbers */}
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setPage(pageNum)}
                                                            className={`px-3 py-1.5 text-sm rounded transition-colors ${page === pageNum
                                                                    ? 'bg-blue-500 text-white font-semibold'
                                                                    : 'text-gray-600 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={page === totalPages}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* View Supplier Modal */}
            {selectedSupplierId && (
                <ViewSupplierModal
                    supplierId={selectedSupplierId}
                    isOpen={viewModalOpen}
                    onClose={() => {
                        setViewModalOpen(false);
                        setSelectedSupplierId(null);
                    }}
                />
            )}

            {/* Edit Supplier Modal */}
            {selectedSupplierId && (
                <EditSupplierModal
                    supplierId={selectedSupplierId}
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setSelectedSupplierId(null);
                    }}
                    onSuccess={() => {
                        refetch(); // Refresh the table
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this supplier? This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setSelectedSupplierId(null);
                                }}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteSupplier}
                                disabled={deleteSupplierMutation.isPending}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {deleteSupplierMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SupplierPage;
