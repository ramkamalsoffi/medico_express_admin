import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, X, Search, Filter, Download } from 'lucide-react';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import packingApi, { Packing, CreatePackingDto } from '../../services/packingApi';
import { exportMasterData } from '../../utils/export';
import Pagination from '../../components/Pagination';

function PackingCreationPage() {
    const [data, setData] = useState<Packing[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('');
    const limit = 10;

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CreatePackingDto>({
        productCode: '',
        productName: '',
        qtyPack: '',
    });

    // Fetch data
    const fetchData = React.useCallback(async (page: number = currentPage, searchTerm: string = debouncedSearch, sort: string = sortBy) => {
        try {
            setLoading(true);
            const response = await packingApi.getAll(page, limit, searchTerm || undefined, sort);
            setData(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1);
            setTotal(response?.meta?.total || 0);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching packings:', error);
            alert('Failed to fetch packings');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, sortBy, limit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchData(1, debouncedSearch, sortBy);
    }, [debouncedSearch, sortBy]);

    useEffect(() => {
        fetchData(currentPage, debouncedSearch, sortBy);
    }, [currentPage]);



    const handleAdd = () => {
        setFormData({ productCode: '', productName: '', qtyPack: '' });
        setEditingId(null);
        setShowModal(true);
    };

    const handleEdit = (item: Packing) => {
        setFormData({
            productCode: item.productCode,
            productName: item.productName,
            qtyPack: item.qtyPack,
        });
        setEditingId(item.id);
        setShowModal(true);
    };

    const handleDelete = (id: string) => {
        setSelectedId(id);
        setDeleteModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productCode || !formData.productName || !formData.qtyPack) {
            alert('Please fill all fields');
            return;
        }

        try {
            setSubmitting(true);
            if (editingId) {
                await packingApi.update(editingId, formData);
                alert('Packing updated successfully');
            } else {
                await packingApi.create(formData);
                alert('Packing created successfully');
            }
            setShowModal(false);
            fetchData(currentPage, debouncedSearch, sortBy);
        } catch (error: any) {
            console.error('Error saving packing:', error);
            alert(error.response?.data?.message || 'Failed to save packing');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedId) return;
        try {
            await packingApi.delete(selectedId);
            alert('Packing deleted successfully');
            setDeleteModal(false);
            setSelectedId(null);
            if (data.length === 1 && currentPage > 1) {
                fetchData(currentPage - 1, debouncedSearch, sortBy);
            } else {
                fetchData(currentPage, debouncedSearch, sortBy);
            }
        } catch (error) {
            console.error('Error deleting packing:', error);
            alert('Failed to delete packing');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Packing Master Creation</h1>
                            <button
                                onClick={handleAdd}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Packing
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
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

                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search packings..."
                                                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <button
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Export to CSV"
                                            onClick={() => exportMasterData(data, 'packings', [
                                                { key: 'productCode', header: 'Product Code' },
                                                { key: 'productName', header: 'Product Name' },
                                                { key: 'qtyPack', header: 'Qty/Pack' },
                                                { key: 'createdAt', header: 'Created At' },
                                            ])}
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">S.NO</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">PRODUCT CODE</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">PRODUCT NAME</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">QTY/PACK</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                                                </tr>
                                            ) : !data || data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No packings found</td>
                                                </tr>
                                            ) : (
                                                data.map((item, index) => (
                                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-700">{(currentPage - 1) * limit + index + 1}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{item.productCode}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{item.productName}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{item.qtyPack}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEdit(item)}
                                                                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                total={total}
                                limit={limit}
                                onPageChange={setCurrentPage}
                                loading={loading}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingId ? 'Edit Packing' : 'Add Packing'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Code*</label>
                                <input
                                    type="text"
                                    value={formData.productCode}
                                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                                    placeholder="Enter product code"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name*</label>
                                <input
                                    type="text"
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    placeholder="Enter product name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Qty/Pack*</label>
                                <input
                                    type="text"
                                    value={formData.qtyPack}
                                    onChange={(e) => setFormData({ ...formData, qtyPack: e.target.value })}
                                    placeholder="e.g., 1 x 10"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this packing? This action cannot be undone.</p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => { setDeleteModal(false); setSelectedId(null); }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PackingCreationPage;
