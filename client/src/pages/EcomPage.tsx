import { useState, useEffect, useCallback, Fragment } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Download, Plus, Search, Trash2, Eye, X, ChevronLeft, ChevronRight, Package, Truck, Filter } from 'lucide-react';
import { ecomOrderApi, EcomOrder, CreateEcomOrderDto } from '../services/ecomOrderApi';
import { Popover, Transition } from '@headlessui/react';

function EcomPage() {
    const [orders, setOrders] = useState<EcomOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [productIdSearch, setProductIdSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Pagination
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState<EcomOrder | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const initialForm: CreateEcomOrderDto = {
        customerName: '',
        customerPhone: '',
        productId: '',
        productName: '',
        quantity: 1,
        totalAmount: 0,
        orderStatus: 'PENDING',
        deliveryStatus: 'PENDING',
        deliveryAddress: '',
        notes: '',
    };
    const [formData, setFormData] = useState<CreateEcomOrderDto>(initialForm);
    const [orderStatus, setOrderStatus] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState('');

    const fetchOrders = useCallback(async (page: number, search: string, status: string) => {
        try {
            setLoading(true);
            const response = await ecomOrderApi.getAll(page, limit, search, status);
            setOrders(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1);
            setTotalItems(response?.meta?.total || 0);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch orders', error);
            setOrders([]);
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
        fetchOrders(currentPage, debouncedSearch, statusFilter);
    }, [currentPage, debouncedSearch, statusFilter, fetchOrders]);

    const handleProductIdSearch = async () => {
        if (!productIdSearch.trim()) return;

        try {
            const ordersData = await ecomOrderApi.getByProductId(productIdSearch);
            if (ordersData && ordersData.length > 0) {
                setSelectedOrder(ordersData[0]);
                setShowViewModal(true);
            } else {
                // Open create modal with product ID pre-filled
                setFormData({ ...initialForm, productId: productIdSearch });
                setShowCreateModal(true);
            }
        } catch (error) {
            console.error('Error searching by product ID:', error);
            // If not found, open create modal
            setFormData({ ...initialForm, productId: productIdSearch });
            setShowCreateModal(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ecomOrderApi.create(formData);
            setShowCreateModal(false);
            setFormData(initialForm);
            fetchOrders(currentPage, debouncedSearch, statusFilter);
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order');
        }
    };

    const handleUpdateOrderStatus = async () => {
        if (!selectedOrder) return;
        try {
            await ecomOrderApi.updateOrderStatus(selectedOrder.id, { orderStatus });
            setShowStatusModal(false);
            fetchOrders(currentPage, debouncedSearch, statusFilter);
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        }
    };

    const handleUpdateDeliveryStatus = async () => {
        if (!selectedOrder) return;
        try {
            await ecomOrderApi.updateDeliveryStatus(selectedOrder.id, {
                deliveryStatus,
                deliveryDate: deliveryStatus === 'DELIVERED' ? new Date().toISOString() : undefined
            });
            setShowDeliveryModal(false);
            fetchOrders(currentPage, debouncedSearch, statusFilter);
        } catch (error) {
            console.error('Error updating delivery status:', error);
            alert('Failed to update delivery status');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await ecomOrderApi.delete(deleteId);
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchOrders(currentPage, debouncedSearch, statusFilter);
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order');
        }
    };

    const handleExport = async () => {
        try {
            await ecomOrderApi.exportToExcel();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            PROCESSING: 'bg-purple-100 text-purple-800',
            SHIPPED: 'bg-indigo-100 text-indigo-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
            PACKED: 'bg-orange-100 text-orange-800',
            DISPATCHED: 'bg-cyan-100 text-cyan-800',
            OUT_FOR_DELIVERY: 'bg-teal-100 text-teal-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const columns = [
        { key: 'orderId', label: 'ORDER ID' },
        { key: 'customer', label: 'CUSTOMER' },
        { key: 'product', label: 'PRODUCT' },
        { key: 'amount', label: 'AMOUNT' },
        { key: 'orderStatus', label: 'ORDER STATUS' },
        { key: 'deliveryStatus', label: 'DELIVERY STATUS' },
        { key: 'date', label: 'ORDER DATE' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-[1920px] mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">E-commerce Orders</h1>
                            <button
                                onClick={() => {
                                    setFormData(initialForm);
                                    setShowCreateModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Order
                            </button>
                        </div>

                        {/* Product ID Search */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search by Product ID or Order ID
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={productIdSearch}
                                            onChange={(e) => setProductIdSearch(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleProductIdSearch()}
                                            placeholder="Enter Product ID or Order ID..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={handleProductIdSearch}
                                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
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
                                                <Popover.Panel className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    <div className="p-4 space-y-4">
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Status</h4>
                                                            <select
                                                                value={statusFilter}
                                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            >
                                                                <option value="">All Orders</option>
                                                                <option value="PENDING">Pending</option>
                                                                <option value="CONFIRMED">Confirmed</option>
                                                                <option value="PROCESSING">Processing</option>
                                                                <option value="SHIPPED">Shipped</option>
                                                                <option value="DELIVERED">Delivered</option>
                                                                <option value="CANCELLED">Cancelled</option>
                                                            </select>
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
                                                placeholder="Search orders..."
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
                                            ) : !orders || orders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No orders found
                                                    </td>
                                                </tr>
                                            ) : (
                                                orders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{order.orderId}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            <div>{order.customerName}</div>
                                                            <div className="text-xs text-gray-400">{order.customerPhone}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            <div>{order.productName || '-'}</div>
                                                            {order.productId && <div className="text-xs text-gray-400">ID: {order.productId}</div>}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">₹{order.totalAmount.toFixed(2)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.deliveryStatus)}`}>
                                                                {order.deliveryStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(order.orderDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setShowViewModal(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                                title="View"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setOrderStatus(order.orderStatus);
                                                                    setShowStatusModal(true);
                                                                }}
                                                                className="text-green-600 hover:text-green-900 mr-3"
                                                                title="Update Order Status"
                                                            >
                                                                <Package className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setDeliveryStatus(order.deliveryStatus);
                                                                    setShowDeliveryModal(true);
                                                                }}
                                                                className="text-purple-600 hover:text-purple-900 mr-3"
                                                                title="Update Delivery Status"
                                                            >
                                                                <Truck className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setDeleteId(order.id);
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

            {/* Create Order Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Create New Order</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                                    <input
                                        type="text"
                                        value={formData.productId}
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        value={formData.productName}
                                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.totalAmount}
                                        onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                    <textarea
                                        value={formData.deliveryAddress}
                                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
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
                                    Create Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Order Status Modal */}
            {showStatusModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Update Order Status</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Order: {selectedOrder.orderId}</label>
                            <select
                                value={orderStatus}
                                onChange={(e) => setOrderStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateOrderStatus}
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Delivery Status Modal */}
            {showDeliveryModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Update Delivery Status</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Order: {selectedOrder.orderId}</label>
                            <select
                                value={deliveryStatus}
                                onChange={(e) => setDeliveryStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="PACKED">Packed</option>
                                <option value="DISPATCHED">Dispatched</option>
                                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                <option value="DELIVERED">Delivered</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowDeliveryModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateDeliveryStatus}
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                            <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Order ID</h3>
                                    <p className="text-sm text-gray-900 font-medium">{selectedOrder.orderId}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Order Date</h3>
                                    <p className="text-sm text-gray-900">{new Date(selectedOrder.orderDate).toLocaleString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Customer Name</h3>
                                    <p className="text-sm text-gray-900">{selectedOrder.customerName}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Customer Phone</h3>
                                    <p className="text-sm text-gray-900">{selectedOrder.customerPhone}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Product Name</h3>
                                    <p className="text-sm text-gray-900">{selectedOrder.productName || '-'}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Product ID</h3>
                                    <p className="text-sm text-gray-900">{selectedOrder.productId || '-'}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Quantity</h3>
                                    <p className="text-sm text-gray-900">{selectedOrder.quantity}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Amount</h3>
                                    <p className="text-sm text-gray-900 font-medium">₹{selectedOrder.totalAmount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Order Status</h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.orderStatus)}`}>
                                        {selectedOrder.orderStatus}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Delivery Status</h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.deliveryStatus)}`}>
                                        {selectedOrder.deliveryStatus}
                                    </span>
                                </div>
                                {selectedOrder.deliveryAddress && (
                                    <div className="col-span-2">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Delivery Address</h3>
                                        <p className="text-sm text-gray-900">{selectedOrder.deliveryAddress}</p>
                                    </div>
                                )}
                                {selectedOrder.notes && (
                                    <div className="col-span-2">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</h3>
                                        <p className="text-sm text-gray-900">{selectedOrder.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
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

export default EcomPage;
