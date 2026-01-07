import { useState, useEffect, useCallback, Fragment } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Popover, Transition } from '@headlessui/react';
import { Download, Plus, Search, Pencil, Trash2, X, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { salesReportsApi, SalesReport, CreateSalesReportDto } from '../services/salesReportsApi';

function ReportsPage() {
    const [reports, setReports] = useState<SalesReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('date_desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewingReport, setViewingReport] = useState<SalesReport | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const initialForm: CreateSalesReportDto = {
        invoiceNo: '', invoiceDate: '', billType: 'Cash', saleType: 'Local',
        customerName: '', customerCode: '', communicationAddress: '',
        pincode: '', phoneNo: '', email: '', deliveryAddress: '',
        sno: '', productName: '', hsnCode: '', noOfItems: 0,
        mfr: '', packing: '', batch: '', expiry: '',
        qty: 0, mrp: 0, pdDiscount: '0%', tax: '0%', discount: '0%',
        goodsValue: 0, taxAmount: 0, amount: 0, consolidate: '0%',
        goodsValue2: 0, tax2: '0%', frightCharges: 0, tax3: '0%',
        insurance: 'No', discount2: '0%', roundedOff: '0%', total: 0,
        deliveryAddress2: '', name: '', phoneNo3: '', email3: '',
        deliveryMode: 'Road', transportor: 'No'
    };
    const [formData, setFormData] = useState<CreateSalesReportDto>(initialForm);

    const fetchReports = useCallback(async (page: number, search: string, start: string, end: string, sort: string) => {
        try {
            setLoading(true);
            const response = await salesReportsApi.getAll(page, limit, search, start, end, sort);
            setReports(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1);
            setTotalItems(response?.meta?.total || 0);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchReports(currentPage, debouncedSearch, startDate, endDate, sortBy);
    }, [currentPage, debouncedSearch, startDate, endDate, sortBy, fetchReports]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await salesReportsApi.update(editingId, formData);
            } else {
                await salesReportsApi.create(formData);
            }
            setShowModal(false);
            setFormData(initialForm);
            setEditingId(null);
            fetchReports(currentPage, debouncedSearch, startDate, endDate, sortBy);
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Failed to save report');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await salesReportsApi.delete(deleteId);
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchReports(currentPage, debouncedSearch, startDate, endDate, sortBy);
        } catch (error) {
            console.error('Error deleting report:', error);
            alert('Failed to delete report');
        }
    };

    const handleView = async (id: string) => {
        try {
            const report = await salesReportsApi.getById(id);
            setViewingReport(report);
            setShowViewModal(true);
        } catch (error) {
            console.error('Error fetching report:', error);
        }
    };

    const handleExport = async () => {
        try {
            await salesReportsApi.exportToExcel();
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
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
                            <button
                                onClick={() => { setFormData(initialForm); setEditingId(null); setShowModal(true); }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Report
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Popover className="relative">
                                            <Popover.Button className="p-2 border border-gray-500 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">
                                                <Filter className="w-5 h-5" />
                                            </Popover.Button>
                                            <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                                                <Popover.Panel className="absolute left-0 z-10 mt-2 w-72 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-4">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</h4>
                                                            <div className="space-y-2">
                                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                    <input type="radio" name="sort" checked={sortBy === ''} onChange={() => setSortBy('')} className="text-gray-600 focus:ring-gray-500" />
                                                                    Default (Newest)
                                                                </label>
                                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                    <input type="radio" name="sort" checked={sortBy === 'date_desc'} onChange={() => setSortBy('date_desc')} className="text-gray-600 focus:ring-gray-500" />
                                                                    Date (Newest)
                                                                </label>
                                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                    <input type="radio" name="sort" checked={sortBy === 'date_asc'} onChange={() => setSortBy('date_asc')} className="text-gray-600 focus:ring-gray-500" />
                                                                    Date (Oldest)
                                                                </label>
                                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                    <input type="radio" name="sort" checked={sortBy === 'amount_desc'} onChange={() => setSortBy('amount_desc')} className="text-gray-600 focus:ring-gray-500" />
                                                                    Amount (High-Low)
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <hr />
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date Range</h4>
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <label className="text-xs text-gray-400">From</label>
                                                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-500" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs text-gray-400">To</label>
                                                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-500" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {(startDate || endDate) && (
                                                            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="w-full px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors">
                                                                Clear Filters
                                                            </button>
                                                        )}
                                                    </div>
                                                </Popover.Panel>
                                            </Transition>
                                        </Popover>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search reports..." className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-gray-500" />
                                        </div>
                                    </div>
                                    <button onClick={handleExport} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" title="Export">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">INVOICE NO</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">INVOICE DATE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">BILL TYPE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">SALE TYPE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">CUSTOMER NAME</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">CUSTOMER CODE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">COMMUNICATION ADDRESS</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">PINCODE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">PHONE NO</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">EMAIL</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">DELIVERY ADDRESS</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">PHONE NO 2</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">EMAIL 2</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">DOCTOR NAME</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">HOSPITAL NAME</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">PRESCRIPTION NO</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">PRESCRIPTION DATE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">S NO</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">PRODUCT NAME</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">HSN CODE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">NO OF ITEMS</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">MFR</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">PACKING</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">BATCH</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">EXPIRY</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">QTY</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">MRP</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">PD DISCOUNT</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">TAX</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">DISCOUNT</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">GOODS VALUE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">TAX AMOUNT</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">AMOUNT</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">CONSOLIDATE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">GOODS VALUE 2</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">TAX 2</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">FREIGHT CHARGES</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">TAX 3</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">INSURANCE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">DISCOUNT 2</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">ROUNDED OFF</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">TOTAL</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">DELIVERY ADDRESS 2</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">NAME</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">PHONE NO 3</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">EMAIL 3</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">DELIVERY MODE</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">TRANSPORTOR</th>
                                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={49} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
                                            ) : !reports || reports.length === 0 ? (
                                                <tr><td colSpan={49} className="px-6 py-4 text-center text-sm text-gray-500">No reports found</td></tr>
                                            ) : (
                                                reports.map((report) => (
                                                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.invoiceNo}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{new Date(report.invoiceDate).toLocaleDateString()}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.billType}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.saleType}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.customerName}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.customerCode}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.communicationAddress}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.pincode}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.phoneNo}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.email}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.deliveryAddress}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.phoneNo2}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.email2}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.doctorName}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.hospitalName}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.prescriptionNo}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.prescriptionDate ? new Date(report.prescriptionDate).toLocaleDateString() : ''}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.sno}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.productName}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.hsnCode}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.noOfItems}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.mfr}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.packing}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.batch}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{new Date(report.expiry).toLocaleDateString()}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.qty}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.mrp}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.pdDiscount}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.tax}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.discount}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.goodsValue}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.taxAmount}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.amount}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.consolidate}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.goodsValue2}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.tax2}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.frightCharges}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.tax3}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.insurance}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.discount2}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.roundedOff}</td>
                                                        <td className="px-3 py-3 text-xs font-semibold text-gray-900">₹{report.total.toFixed(2)}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.deliveryAddress2}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.name}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.phoneNo3}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.email3}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.deliveryMode}</td>
                                                        <td className="px-3 py-3 text-xs text-gray-700">{report.transportor}</td>
                                                        <td className="px-3 py-3 text-center">
                                                            <button onClick={() => handleView(report.id)} className="text-gray-600 hover:text-gray-900">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                                    <div className="text-sm text-gray-700">Showing {totalItems === 0 ? 0 : (currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems}</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this report?</p>
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportsPage;
