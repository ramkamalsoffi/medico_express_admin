import { useState, useEffect, useCallback, Fragment } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Popover, Transition } from '@headlessui/react';
import { Download, Plus, Search, Pencil, Trash2, X, Filter } from 'lucide-react';
import { employeeApi, Employee, CreateEmployeeDto } from '../services/employeeApi';
import apiClient from '../lib/axios';
import Pagination from '../components/Pagination';

function EmployeePage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Dropdown Data
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const initialForm: CreateEmployeeDto = {
        name: '',
        designation: '',
        phone: '',
        email: '',
        dateOfJoin: '',
        branchId: '',
        departmentId: '',
    };
    const [formData, setFormData] = useState<CreateEmployeeDto>(initialForm);

    const fetchDropdowns = async () => {
        try {
            const [b, d] = await Promise.all([
                apiClient.get('/branches'),
                apiClient.get('/departments'),
            ]);
            setBranches(Array.isArray(b.data) ? b.data : b.data.data || []);
            setDepartments(Array.isArray(d.data) ? d.data : d.data.data || []);
        } catch (error) {
            console.error('Failed to fetch dropdowns', error);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const fetchEmployees = useCallback(async (page: number, search: string, sort: string) => {
        try {
            setLoading(true);
            const response = await employeeApi.getAll(page, limit, search, sort);
            setEmployees(response?.data || []);
            setTotalPages(response?.meta?.totalPages || 1);
            setTotal(response?.meta?.total || 0);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch employees', error);
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchEmployees(1, searchTerm, sortBy);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, sortBy, fetchEmployees]);

    useEffect(() => {
        fetchEmployees(currentPage, searchTerm, sortBy);
    }, [currentPage, fetchEmployees]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await employeeApi.update(editingId, formData);
            } else {
                await employeeApi.create(formData);
            }
            setShowModal(false);
            setFormData(initialForm);
            setEditingId(null);
            fetchEmployees(currentPage, searchTerm, sortBy);
        } catch (error) {
            console.error('Error saving employee:', error);
            alert('Failed to save employee');
        }
    };

    const handleEdit = (employee: Employee) => {
        setFormData({
            name: employee.name,
            designation: employee.designation,
            phone: employee.phone,
            email: employee.email || '',
            dateOfJoin: employee.dateOfJoin ? employee.dateOfJoin.split('T')[0] : '',
            branchId: employee.branchId,
            departmentId: employee.departmentId || '',
        });
        setEditingId(employee.id);
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await employeeApi.delete(deleteId);
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchEmployees(currentPage, searchTerm, sortBy);
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Failed to delete employee');
        }
    };

    const handleExport = async () => {
        try {
            await employeeApi.exportToExcel();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    };

    const columns = [
        { key: 'name', label: 'NAME' },
        { key: 'branch', label: 'BRANCH' },
        { key: 'designation', label: 'DESIGNATION' },
        { key: 'phone', label: 'PHONE' },
        { key: 'email', label: 'EMAIL' },
        { key: 'dateOfJoin', label: 'JOIN DATE' },
        { key: 'department', label: 'DEPARTMENT' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-[1920px] mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Employee Lists</h1>
                            <button
                                onClick={() => {
                                    setFormData(initialForm);
                                    setEditingId(null);
                                    setShowModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create Employee
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
                                                placeholder="Search employees..."
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
                                            ) : !employees || employees.length === 0 ? (
                                                <tr>
                                                    <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No employees found
                                                    </td>
                                                </tr>
                                            ) : (
                                                employees.map((employee) => (
                                                    <tr key={employee.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm text-gray-900">{employee.name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{employee.branch?.name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{employee.designation}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{employee.phone}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{employee.email}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(employee.dateOfJoin).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{employee.department?.name}</td>
                                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleEdit(employee)}
                                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setDeleteId(employee.id);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-900"
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
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Edit Employee' : 'Create New Employee'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Join</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dateOfJoin}
                                        onChange={(e) => setFormData({ ...formData, dateOfJoin: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                    <select
                                        required
                                        value={formData.branchId}
                                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                >
                                    {editingId ? 'Update Employee' : 'Create Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this employee? This action cannot be undone.</p>
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

export default EmployeePage;
