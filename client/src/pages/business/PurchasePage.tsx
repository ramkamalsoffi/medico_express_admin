import { useState, useEffect, useCallback, Fragment } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Download, Plus, Search, Eye, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { purchaseApi, Purchase } from '../../services/purchaseApi';
import { companyApi, Company } from '../../services/companyApi';
import { productApi, Product } from '../../services/productApi';
import ViewPurchaseModal from '../../components/ViewPurchaseModal';
import { Popover, Transition } from '@headlessui/react';

type TabType = 'purchase' | 'order' | 'return' | 'dc';

function PurchasePage() {
    const [activeTab, setActiveTab] = useState<TabType>('purchase');
    
    // List States
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingBranches, setLoadingBranches] = useState(false);
    
    // Filter States
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState('date_desc');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Data for Filters
    const [branches, setBranches] = useState<{ id: string, name: string }[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // View Modal State
    const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    // Fetch Branches and Products
    useEffect(() => {
        const loadFilters = async () => {
            setLoadingBranches(true);
            try {
                // Fetch companies to get branches
                const response = await companyApi.getAll(1, 100);
                const allBranches = response.data.flatMap(c => c.branches || []);
                setBranches(allBranches);

                // Fetch Products for filter
                const productResponse = await productApi.getAll(1, 100);
                setProducts(productResponse.data);
            } catch (error) {
                console.error("Failed to load filters", error);
            } finally {
                setLoadingBranches(false);
            }
        };
        loadFilters();
    }, []);

    // Fetch Logic
    const fetchPurchases = useCallback(async (
        page: number, 
        searchTerm: string, 
        start: string, 
        end: string, 
        sort: string,
        branch: string,
        status: string,
        product: string
    ) => {
        setLoading(true);
        try {
            const response = await purchaseApi.getAll(
                page, 
                limit, 
                searchTerm, 
                start, 
                end, 
                undefined, 
                sort,
                branch,
                status,
                product
            );
            setPurchases(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1 || 1);
            setTotalItems(response?.meta?.total || 0 || 0);
        } catch (error) {
            console.error('Failed to fetch purchases', error);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Effect to fetch
    useEffect(() => {
        if (activeTab === 'purchase') {
            fetchPurchases(currentPage, debouncedSearch, startDate, endDate, sortBy, selectedBranch, paymentStatus, selectedProduct);
        }
    }, [currentPage, debouncedSearch, startDate, endDate, sortBy, selectedBranch, paymentStatus, selectedProduct, fetchPurchases, activeTab]);

    // Handle Page Change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Actions
    const handleView = (id: string) => {
        setSelectedPurchaseId(id);
        setViewModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this purchase? Include items and ledger entries?')) {
            try {
                await purchaseApi.delete(id);
                await purchaseApi.delete(id);
                fetchPurchases(currentPage, debouncedSearch, startDate, endDate, sortBy, selectedBranch, paymentStatus, selectedProduct);
                alert('Purchase deleted successfully');
            } catch (error) {
                console.error('Delete failed', error);
                alert('Failed to delete purchase');
            }
        }
    };

    const handleExport = async () => {
        try {
            await purchaseApi.exportToExcel();
        } catch (error) {
            console.error('Export failed', error);
            alert('Failed to export data');
        }
    };

    const tabs = [
        { id: 'purchase' as TabType, label: 'Purchase' },
        { id: 'order' as TabType, label: 'Purchase Order' },
        { id: 'return' as TabType, label: 'Purchase Return' },
        { id: 'dc' as TabType, label: 'DC Purchase' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            <Header />
            <div className="flex overflow-x-hidden">
                <Sidebar />
                <main className="flex-1 p-6 overflow-x-hidden">
                    <div className="max-w-full overflow-x-hidden">
                        
                        {/* Page Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab === 'purchase' ? 'Purchases' : 
                                 activeTab === 'order' ? 'Purchase Orders' : 
                                 activeTab === 'return' ? 'Purchase Returns' : 'DC Purchases'}
                            </h1>
                            {activeTab === 'purchase' && (
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Create Purchase
                                </button>
                            )}
                        </div>

                        {/* Tabs Header */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                            <div className="flex items-center gap-6 px-6 py-3">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.id
                                            ? 'text-gray-700 border-b-2 border-gray-700'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data Table & Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {activeTab === 'purchase' ? (
                                <div className="p-6">
                                    {/* Filters Section */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
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
                                                    <Popover.Panel className="absolute left-0 z-10 mt-2 w-72 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-4 max-h-[80vh] overflow-y-auto">
                                                        <div className="space-y-4">
                                                            
                                                            {/* Sort */}
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</h4>
                                                                <div className="space-y-2">
                                                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                        <input 
                                                                            type="radio" 
                                                                            name="sort" 
                                                                            checked={sortBy === 'date_asc' || sortBy === 'date_desc' || sortBy === 'amount_asc' || sortBy === 'amount_desc' ? false : true} 
                                                                            onChange={() => setSortBy('')}
                                                                            className="text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                        Default (Newest First)
                                                                    </label>
                                                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                        <input 
                                                                            type="radio" 
                                                                            name="sort" 
                                                                            checked={sortBy === 'date_desc'} 
                                                                            onChange={() => setSortBy('date_desc')}
                                                                            className="text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                        Newest First
                                                                    </label>
                                                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                        <input 
                                                                            type="radio" 
                                                                            name="sort" 
                                                                            checked={sortBy === 'date_asc'} 
                                                                            onChange={() => setSortBy('date_asc')}
                                                                            className="text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                        Oldest First
                                                                    </label>
                                                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                        <input 
                                                                            type="radio" 
                                                                            name="sort" 
                                                                            checked={sortBy === 'amount_desc'} 
                                                                            onChange={() => setSortBy('amount_desc')}
                                                                            className="text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                        Amount (High to Low)
                                                                    </label>
                                                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                        <input 
                                                                            type="radio" 
                                                                            name="sort" 
                                                                            checked={sortBy === 'amount_asc'} 
                                                                            onChange={() => setSortBy('amount_asc')}
                                                                            className="text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                        Amount (Low to High)
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <hr />

                                                            {/* Branch */}
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Branch</h4>
                                                                <select 
                                                                    value={selectedBranch}
                                                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                                >
                                                                    <option value="">All Branches</option>
                                                                    {branches.map(b => (
                                                                        <option key={b.id} value={b.id}>{b.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <hr />

                                                            {/* Payment Status */}
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Status</h4>
                                                                <select 
                                                                    value={paymentStatus}
                                                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                                >
                                                                    <option value="">All Statuses</option>
                                                                    <option value="PAID">Paid</option>
                                                                    <option value="PARTIALLY_PAID">Partially Paid</option>
                                                                    <option value="PENDING">Pending</option>
                                                                </select>
                                                            </div>
                                                            <hr />

                                                            {/* Product Filter */}
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Product</h4>
                                                                <select 
                                                                    value={selectedProduct}
                                                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                                >
                                                                    <option value="">All Products</option>
                                                                    {products.map(p => (
                                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <hr />

                                                            {/* Date Range */}
                                                            <div>
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date Range</h4>
                                                                <div className="space-y-2">
                                                                    <div>
                                                                        <label className="text-xs text-gray-400">From</label>
                                                                        <input 
                                                                            type="date"
                                                                            value={startDate}
                                                                            onChange={(e) => setStartDate(e.target.value)}
                                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-xs text-gray-400">To</label>
                                                                        <input 
                                                                            type="date"
                                                                            value={endDate}
                                                                            onChange={(e) => setEndDate(e.target.value)}
                                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Clear Filters */}
                                                            {(selectedBranch || paymentStatus || startDate || endDate || selectedProduct) && (
                                                                <button 
                                                                    onClick={() => {
                                                                        setSelectedBranch('');
                                                                        setPaymentStatus('');
                                                                        setStartDate('');
                                                                        setEndDate('');
                                                                        setSelectedProduct('');
                                                                    }}
                                                                    className="w-full mt-2 px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                                                                >
                                                                    Clear Filters
                                                                </button>
                                                            )}
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
                                                    placeholder="Search Invoice No..." 
                                                    className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleExport}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Export Excel"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice No</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                                                            Loading Data...
                                                        </td>
                                                    </tr>
                                                ) : !purchases || purchases.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                                            No purchases found matching criteria.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    purchases.map((purchase) => (
                                                        <tr key={purchase.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.invoiceNo}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(purchase.invoiceDate).toLocaleDateString()}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.supplier?.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.branch?.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{purchase.totalAmount.toFixed(2)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                    purchase.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                                                    purchase.paymentStatus === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {purchase.paymentStatus.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button 
                                                                        onClick={() => handleView(purchase.id)}
                                                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                                        title="View Details"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDelete(purchase.id)}
                                                                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                        title="Delete Invoice"
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
                                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                                        <div className="text-sm text-gray-700">
                                            Showing {totalItems === 0 ? 0 : (currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                                                            currentPage === pageNum
                                                                ? 'bg-blue-500 text-white border-blue-500'
                                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500">
                                    Module under construction
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {selectedPurchaseId && (
                <ViewPurchaseModal
                    purchaseId={selectedPurchaseId as string}
                    isOpen={viewModalOpen}
                    onClose={() => {
                        setViewModalOpen(false);
                        setSelectedPurchaseId(null);
                    }}
                />
            )}
        </div>
    );
}

export default PurchasePage;
