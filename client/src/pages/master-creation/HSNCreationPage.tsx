import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Plus, Edit, Trash2, X, Upload, FileSpreadsheet, Filter, Search, Download } from 'lucide-react';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import hsnApi, { HSNMaster, CreateHSNDto } from '../../services/hsnApi';
import { exportMasterData } from '../../utils/export';
import Pagination from '../../components/Pagination';

function HSNCreationPage() {
    const [data, setData] = useState<HSNMaster[]>([]);
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
    const [uploadModal, setUploadModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CreateHSNDto>({
        hsnCode: '',
        description: '',
        gstRate: 0,
    });

    // File upload state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);

    // Fetch data
    const fetchData = React.useCallback(async (page: number = currentPage, searchTerm: string = debouncedSearch, sort: string = sortBy) => {
        try {
            setLoading(true);
            // Assuming api can handle sort, if not we will add it later. For now just passing it.
            // But hsnApi.getAll might not accept sort yet. I will check/update it.
            const response = await hsnApi.getAll(page, limit, searchTerm || undefined, sort);
            setData(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1);
            setTotal(response?.meta?.total || 0);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching HSN codes:', error);
            alert('Failed to fetch HSN codes');
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
        setFormData({ hsnCode: '', description: '', gstRate: 0 });
        setEditingId(null);
        setShowModal(true);
    };

    const handleEdit = (item: HSNMaster) => {
        setFormData({
            hsnCode: item.hsnCode,
            description: item.description || '',
            gstRate: item.gstRate || 0,
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
        if (!formData.hsnCode) {
            alert('Please enter HSN Code');
            return;
        }

        try {
            setSubmitting(true);
            // Convert gstRate to number if it's a string
            const dataToSend = {
                ...formData,
                gstRate: Number(formData.gstRate),
            };

            if (editingId) {
                await hsnApi.update(editingId, dataToSend);
                alert('HSN Code updated successfully');
            } else {
                await hsnApi.create(dataToSend);
                alert('HSN Code created successfully');
            }
            setShowModal(false);
            fetchData(currentPage);
        } catch (error: any) {
            console.error('Error saving HSN Code:', error);
            alert(error.response?.data?.message || 'Failed to save HSN Code');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedId) return;
        try {
            await hsnApi.delete(selectedId);
            alert('HSN Code deleted successfully');
            setDeleteModal(false);
            setSelectedId(null);
            if (data.length === 1 && currentPage > 1) {
                fetchData(currentPage - 1, debouncedSearch, sortBy);
            } else {
                fetchData(currentPage, debouncedSearch, sortBy);
            }
        } catch (error) {
            console.error('Error deleting HSN Code:', error);
            alert('Failed to delete HSN Code');
        }
    };

    // File Upload Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setUploadResult(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            const result = await hsnApi.uploadExcel(selectedFile);
            setUploadResult(result);
            if (result.success > 0) {
                fetchData(currentPage, debouncedSearch, sortBy); // Refresh data
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">HSN Master Creation</h1>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setUploadResult(null);
                                        setSelectedFile(null);
                                        setUploadModal(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    Import Excel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add HSN
                                </button>
                            </div>
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
                                                                        checked={sortBy === 'code_asc'}
                                                                        onChange={() => setSortBy('code_asc')}
                                                                        className="text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    Code (A-Z)
                                                                </label>
                                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="sort"
                                                                        checked={sortBy === 'code_desc'}
                                                                        onChange={() => setSortBy('code_desc')}
                                                                        className="text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    Code (Z-A)
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
                                                placeholder="Search HSN codes..."
                                                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <button
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Export to CSV"
                                            onClick={() => exportMasterData(data, 'hsn', [
                                                { key: 'hsnCode', header: 'HSN Code' },
                                                { key: 'description', header: 'Description' },
                                                { key: 'gstRate', header: 'GST Rate (%)' },
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
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">HSN CODE</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">DESCRIPTION</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">GST RATE (%)</th>
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
                                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No HSN codes found</td>
                                                </tr>
                                            ) : (
                                                data.map((item, index) => (
                                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-700">{(currentPage - 1) * limit + index + 1}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.hsnCode}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{item.description || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">{item.gstRate ? `${item.gstRate}%` : '-'}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEdit(item)}
                                                                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                                                                    title="Delete"
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
                                {editingId ? 'Edit HSN Code' : 'Add HSN Code'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code*</label>
                                <input
                                    type="text"
                                    value={formData.hsnCode}
                                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                    placeholder="Enter HSN Code"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.gstRate}
                                    onChange={(e) => setFormData({ ...formData, gstRate: parseFloat(e.target.value) })}
                                    placeholder="Enter GST Rate"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter description (optional)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
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

            {/* Excel Upload Modal */}
            {uploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Import HSN from Excel</h3>
                            <button onClick={() => setUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {!uploadResult ? (
                            <div className="space-y-4">
                                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Upload Excel file with columns: <br />
                                        <span className="font-mono text-xs">HSN Code, Description, GST Rate</span>
                                    </p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".xlsx, .xls"
                                        onChange={handleFileChange}
                                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>

                                {selectedFile && (
                                    <div className="text-sm text-gray-500">
                                        Selected: {selectedFile.name}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => setUploadModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!selectedFile || uploading}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {uploading ? 'Importing...' : 'Import Data'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-lg ${uploadResult.success > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <h4 className="font-semibold text-gray-900 mb-2">Import Results</h4>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-green-700">Successful:</span>
                                        <span className="font-bold">{uploadResult.success}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-red-700">Failed:</span>
                                        <span className="font-bold">{uploadResult.failed}</span>
                                    </div>
                                </div>

                                {uploadResult.errors.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-sm font-medium text-red-600 mb-2">Errors:</h5>
                                        <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-xs border border-gray-200">
                                            {uploadResult.errors.map((err: any, idx: number) => (
                                                <div key={idx} className="mb-1 pb-1 border-b border-gray-100 last:border-0 text-gray-700">
                                                    row: {JSON.stringify(err.row).substring(0, 50)}... <br />
                                                    <span className="text-red-500">{err.error}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => {
                                            setUploadModal(false);
                                            setUploadResult(null);
                                            setSelectedFile(null);
                                        }}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this HSN Code? This action cannot be undone.</p>
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

export default HSNCreationPage;
