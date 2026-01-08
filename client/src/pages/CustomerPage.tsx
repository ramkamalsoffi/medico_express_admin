import { useState, useEffect, useCallback, Fragment } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Popover, Transition } from '@headlessui/react';
import { Download, Plus, Search, Pencil, Trash2, X, Filter, Eye, Upload } from 'lucide-react';
import { customerApi, Customer, CreateCustomerDto } from '../services/customerApi';
import Pagination from '../components/Pagination';

function CustomerPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0); // Added total
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const initialForm: CreateCustomerDto = {
        code: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        deliveryType: '',
        customerType: '',
        deliveryAddress: '',
        pincode: '',
        reference: '',
        remark: '',
        image: '',
    };
    const [formData, setFormData] = useState<CreateCustomerDto>(initialForm);

    const fetchCustomers = useCallback(async (page: number, search: string, sort: string) => {
        try {
            setLoading(true);
            const response = await customerApi.getAll(page, limit, search, sort);
            setCustomers(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1);
            setTotal(response?.meta?.total || 0);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch customers', error);
            setLoading(false);
        }
    }, [limit]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchCustomers(1, searchTerm, sortBy);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, sortBy, fetchCustomers]);

    // Pagination change
    useEffect(() => {
        fetchCustomers(currentPage, searchTerm, sortBy);
    }, [currentPage, fetchCustomers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let customerId = editingId;
            let response;

            if (editingId) {
                response = await customerApi.update(editingId, formData);
            } else {
                response = await customerApi.create(formData);
                customerId = response.id;
            }

            // Upload image if selected
            if (selectedFile && customerId) {
                await customerApi.uploadImage(customerId, selectedFile);
            }

            setShowModal(false);
            setFormData(initialForm);
            setEditingId(null);
            setSelectedFile(null);
            fetchCustomers(currentPage, searchTerm, sortBy);
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Failed to save customer');
        }
    };

    const handleEdit = (customer: Customer) => {
        setFormData({
            code: customer.code || '',
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            address: customer.address,
            deliveryType: customer.deliveryType || '',
            customerType: customer.customerType || '',
            deliveryAddress: customer.deliveryAddress || '',
            pincode: customer.pincode || '',
            reference: customer.reference || '',
            remark: customer.remark || '',
            image: customer.image || '',
        });
        setEditingId(customer.id);
        setSelectedFile(null); // Reset file on edit open
        setShowModal(true);
    };

    const handleView = (customer: Customer) => {
        setSelectedCustomer(customer);
        setViewModal(true);
    };

    const handleDelete = async () => {
        if (!selectedCustomer) return;
        try {
            await customerApi.delete(selectedCustomer.id);
            setShowDeleteModal(false);
            setSelectedCustomer(null);
            fetchCustomers(currentPage, searchTerm, sortBy);
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Failed to delete customer');
        }
    };

    const handleExport = async () => {
        try {
            await customerApi.exportToExcel();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const columns = [
        { key: 'image', label: 'IMAGE' },
        { key: 'code', label: 'CODE' },
        { key: 'name', label: 'NAME' },
        { key: 'phone', label: 'MOBILE NO' },
        { key: 'email', label: 'MAIL ID' },
        { key: 'deliveryType', label: 'DELIVERY' },
        { key: 'customerType', label: 'TYPE' },
        { key: 'address', label: 'ADDRESS' },
        { key: 'pincode', label: 'PINCODE' },
        { key: 'reference', label: 'REFERENCE' },
        { key: 'remark', label: 'REMARK' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-[1920px] mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Customer Lists</h1>
                            <button
                                onClick={() => {
                                    setFormData(initialForm);
                                    setEditingId(null);
                                    setSelectedFile(null);
                                    setShowModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Customer
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
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search customers..."
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
                                <div className="overflow-x-auto">
                                    <table className="w-full whitespace-nowrap">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                {columns.map(col => (
                                                    <th key={col.key} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        {col.label}
                                                    </th>
                                                ))}
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        Loading...
                                                    </td>
                                                </tr>
                                            ) : !customers || customers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No customers found
                                                    </td>
                                                </tr>
                                            ) : (
                                                customers.map((customer) => (
                                                    <tr key={customer.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm">
                                                            {customer.image ? (
                                                                <img
                                                                    src={customer.image}
                                                                    alt={customer.name}
                                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-semibold">
                                                                    NO IMG
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">{customer.code || '-'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{customer.name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{customer.phone}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{customer.email || '-'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{customer.deliveryType || '-'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{customer.customerType || '-'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs" title={customer.address}>
                                                            {customer.address}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{customer.pincode || '-'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{customer.reference || '-'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[150px]" title={customer.remark}>
                                                            {customer.remark || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleView(customer)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                                    title="View"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEdit(customer)}
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                                    title="Edit"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedCustomer(customer);
                                                                        setShowDeleteModal(true);
                                                                    }}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                                    title="Delete"
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
                    </div>
                </main>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Edit Customer' : 'Create New Customer'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No*</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mail ID</label>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                                    <input
                                        type="text"
                                        value={formData.deliveryType}
                                        onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                                    <input
                                        type="text"
                                        value={formData.customerType}
                                        onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                                    <input
                                        type="text"
                                        value={formData.reference}
                                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                                    <input
                                        type="text"
                                        value={formData.remark}
                                        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-3 border-t border-gray-100 pt-3 mt-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                                    <div className="flex items-center gap-4">
                                        {(selectedFile || formData.image) && (
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                                                <img
                                                    src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 text-center w-full justify-center lg:w-auto">
                                                <Upload className="w-4 h-4" />
                                                {selectedFile ? 'Change Image' : 'Upload Image'}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                            {selectedFile && (
                                                <span className="ml-3 text-sm text-gray-500">{selectedFile.name}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                                    <textarea
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                    <textarea
                                        value={formData.deliveryAddress}
                                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (editingId ? 'Update Customer' : 'Create Customer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <h3 className="text-lg font-bold text-gray-900">Customer Details</h3>
                            <button onClick={() => setViewModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4">
                                {selectedCustomer.image ? (
                                    <img
                                        src={selectedCustomer.image}
                                        alt={selectedCustomer.name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-bold border-2 border-white shadow-md">
                                        {selectedCustomer.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                                    <p className="text-sm text-gray-500">{selectedCustomer.code || 'No Code'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Mobile No</h4>
                                        <p className="text-base text-gray-900 mt-1">{selectedCustomer.phone}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                        <p className="text-base text-gray-900 mt-1">{selectedCustomer.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Delivery Type</h4>
                                        <p className="text-base text-gray-900 mt-1">{selectedCustomer.deliveryType || '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Customer Type</h4>
                                        <p className="text-base text-gray-900 mt-1">{selectedCustomer.customerType || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Address</h4>
                                    <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">{selectedCustomer.address}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Delivery Address</h4>
                                    <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">{selectedCustomer.deliveryAddress || '-'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Pincode</h4>
                                        <p className="text-base text-gray-900 mt-1">{selectedCustomer.pincode || '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Reference</h4>
                                        <p className="text-base text-gray-900 mt-1">{selectedCustomer.reference || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Remark</h4>
                                    <p className="text-base text-gray-900 mt-1">{selectedCustomer.remark || '-'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setViewModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{selectedCustomer.name}</strong>? This action cannot be undone.
                        </p>
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

export default CustomerPage;
