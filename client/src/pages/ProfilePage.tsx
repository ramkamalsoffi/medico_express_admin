import { useState, useEffect, useCallback, Fragment } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Download, Plus, Search, Pencil, Trash2, Eye, X, ChevronLeft, ChevronRight, Phone, Mail, Filter } from 'lucide-react';
import { companyApi, Company, CreateCompanyDto } from '../services/companyApi';
import { Popover, Transition } from '@headlessui/react';

function ProfilePage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Pagination
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const initialForm: CreateCompanyDto = {
        name: '',
        gstNumber: '',
        drugLicenseNo: '',
        dlExpiryDate: '',
        address: '',
        phone: '',
        email: '',
        licenseExpiryReminder: 30,
    };
    const [formData, setFormData] = useState<CreateCompanyDto>(initialForm);

    const fetchCompanies = useCallback(async (page: number, search: string, sort: string) => {
        try {
            setLoading(true);
            const response = await companyApi.getAll(page, limit, search, sort);
            setCompanies(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1);
            setTotalItems(response?.meta?.total || 0);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch companies', error);
            setLoading(false);
        }
    }, [limit]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch Effect
    useEffect(() => {
        fetchCompanies(currentPage, debouncedSearch, sortBy);
    }, [currentPage, debouncedSearch, sortBy, fetchCompanies]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await companyApi.update(editingId, formData);
            } else {
                await companyApi.create(formData);
            }
            setShowCreateModal(false);
            setFormData(initialForm);
            setEditingId(null);
            fetchCompanies(currentPage, debouncedSearch, sortBy);
        } catch (error) {
            console.error('Error saving company:', error);
            alert('Failed to save company');
        }
    };

    const handleEdit = (company: Company) => {
        setFormData({
            name: company.name,
            gstNumber: company.gstNumber || '',
            drugLicenseNo: company.drugLicenseNo,
            dlExpiryDate: company.dlExpiryDate ? company.dlExpiryDate.split('T')[0] : '',
            address: company.address,
            phone: company.phone,
            email: company.email || '',
            licenseExpiryReminder: company.licenseExpiryReminder || 30,
        });
        setEditingId(company.id);
        setShowCreateModal(true);
    };

    const handleView = (company: Company) => {
        setSelectedCompany(company);
        setShowViewModal(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await companyApi.delete(deleteId);
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchCompanies(currentPage, debouncedSearch, sortBy);
        } catch (error) {
            console.error('Error deleting company:', error);
            alert('Failed to delete company');
        }
    };

    const handleExport = async () => {
        try {
            await companyApi.exportToExcel();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    };

    const columns = [
        { key: 'name', label: 'NAME' },
        { key: 'address', label: 'ADDRESS' },
        { key: 'contact', label: 'CONTACT INFO' },
        { key: 'license', label: 'LICENSE & GST' },
        { key: 'validity', label: 'VALIDITY' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-[1920px] mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Company Lists</h1>
                            <button
                                onClick={() => {
                                    setFormData(initialForm);
                                    setEditingId(null);
                                    setShowCreateModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Company
                            </button>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4 flex-1">

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

                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search companies..."
                                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                {columns.map(col => (
                                                    <th key={col.key} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                                        {col.label}
                                                    </th>
                                                ))}
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        Loading...
                                                    </td>
                                                </tr>
                                            ) : !companies || companies.length === 0 ? (
                                                <tr>
                                                    <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No companies found
                                                    </td>
                                                </tr>
                                            ) : (
                                                companies.map((company) => (
                                                    <tr key={company.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{company.name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={company.address}>{company.address}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Phone className="w-3 h-3" /> {company.phone}
                                                                </div>
                                                                {company.email && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Mail className="w-3 h-3" /> {company.email}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            <div className="flex flex-col gap-1">
                                                                <span>DL: {company.drugLicenseNo}</span>
                                                                <span className="text-xs">GST: {company.gstNumber || '-'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(company.dlExpiryDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleView(company)}
                                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                                title="View"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(company)}
                                                                className="text-green-600 hover:text-green-900 mr-3"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setDeleteId(company.id);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                                    <div className="text-sm text-gray-700">
                                        Showing {totalItems === 0 ? 0 : (currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-1 text-sm rounded-lg border transition-colors ${currentPage === pageNum
                                                            ? 'bg-blue-500 text-white border-blue-500'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Edit Company' : 'Create New Company'}
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                                    <input
                                        type="text"
                                        value={formData.gstNumber}
                                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Drug License No</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.drugLicenseNo}
                                        onChange={(e) => setFormData({ ...formData, drugLicenseNo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">DL Expiry Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dlExpiryDate}
                                        onChange={(e) => setFormData({ ...formData, dlExpiryDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Reminder (Days)</label>
                                    <input
                                        type="number"
                                        value={formData.licenseExpiryReminder}
                                        onChange={(e) => setFormData({ ...formData, licenseExpiryReminder: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                >
                                    {editingId ? 'Update Company' : 'Create Company'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal with Tabs */}
            {showViewModal && selectedCompany && (
                <ViewCompanyModal
                    company={selectedCompany}
                    onClose={() => setShowViewModal(false)}
                />
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this company? This will also remove associated branches.</p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
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

function ViewCompanyModal({ company, onClose }: { company: Company, onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<'details' | 'branches'>('details');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Company Details
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'branches' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('branches')}
                    >
                        Branches
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'details' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Company Name</h3>
                                <p className="text-sm text-gray-900 font-medium">{company.name}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">GST Number</h3>
                                <p className="text-sm text-gray-900">{company.gstNumber || '-'}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Drug License</h3>
                                <p className="text-sm text-gray-900">{company.drugLicenseNo}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">License Expiry</h3>
                                <p className="text-sm text-gray-900">{new Date(company.dlExpiryDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone</h3>
                                <p className="text-sm text-gray-900">{company.phone}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</h3>
                                <p className="text-sm text-gray-900">{company.email || '-'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Address</h3>
                                <p className="text-sm text-gray-900">{company.address}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Renewal Reminder</h3>
                                <p className="text-sm text-gray-900">{company.licenseExpiryReminder || 30} days before</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {company.branches && company.branches.length > 0 ? (
                                <table className="w-full border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Branch Name</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Address</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {company.branches.map((branch: any) => (
                                            <tr key={branch.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{branch.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{branch.address}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No branches found for this company.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
