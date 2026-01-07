import { X } from 'lucide-react';
import { useSupplier } from '../hooks/useSuppliers';

interface ViewSupplierModalProps {
    supplierId: string;
    isOpen: boolean;
    onClose: () => void;
}

function ViewSupplierModal({ supplierId, isOpen, onClose }: ViewSupplierModalProps) {
    const { data: supplier, isLoading } = useSupplier(supplierId, isOpen);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h2 className="text-xl font-bold text-gray-900">View Supplier Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-sm text-gray-500">Loading supplier details...</p>
                        </div>
                    ) : supplier ? (
                        <div className="grid grid-cols-2 gap-6">
                            {/* Supplier Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Code</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.code}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        supplier.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {supplier.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.category || '-'}
                                </div>
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.type || '-'}
                                </div>
                            </div>

                            {/* Supplier Name */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.name}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.address}
                                </div>
                            </div>

                            {/* Landline Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Landline Number</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.landlineNumber || '-'}
                                </div>
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.mobileNumber}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.email || '-'}
                                </div>
                            </div>

                            {/* GST Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.gstNumber || '-'}
                                </div>
                            </div>

                            {/* PAN Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.panNumber || '-'}
                                </div>
                            </div>

                            {/* DL Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">DL Number</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.dlNumber || '-'}
                                </div>
                            </div>

                            {/* Food License Number */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Food License Number</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.foodLicenseNumber || '-'}
                                </div>
                            </div>

                            {/* Contact Person Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person Name</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.contactPersonName}
                                </div>
                            </div>

                            {/* Payment Terms */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                                    {supplier.paymentTerms || '-'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            Supplier not found
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ViewSupplierModal;
