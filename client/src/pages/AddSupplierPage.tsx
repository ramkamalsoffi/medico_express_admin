import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useCreateSupplier } from '../hooks/useSuppliers';

function AddSupplierPage() {
    const navigate = useNavigate();
    const createSupplierMutation = useCreateSupplier();
    
    // Form state matching all Figma fields
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        category: '',
        type: '',
        address: '',
        landlineNumber: '',
        mobileNumber: '',
        email: '',
        gstNumber: '',
        panNumber: '',
        dlNumber: '', // Combined DL number
        foodLicenseNumber: '',
        contactPersonName: '',
        paymentTerms: '',
        isActive: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await createSupplierMutation.mutateAsync(formData);
            alert('Supplier created successfully!');
            navigate('/supplier');
        } catch (error: any) {
            alert(`Failed to create supplier: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleCancel = () => {
        navigate('/supplier');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Add Supplier</h1>
                        </div>

                        {/* Form Container */}
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">1. Supplier Details</h2>
                                <label className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">In-Active</span>
                                    <div className="relative inline-block w-12 h-6">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors"></div>
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                                    </div>
                                </label>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Supplier Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Supplier Code<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="Enter Supplier Code"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category<span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Pharmaceutical">Pharmaceutical</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Surgical">Surgical</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type<span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Wholesaler">Wholesaler</option>
                                        <option value="Distributor">Distributor</option>
                                        <option value="Retailer">Retailer</option>
                                        <option value="Manufacturer">Manufacturer</option>
                                    </select>
                                </div>

                                {/* Supplier Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Supplier Name<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter Supplier Name"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Supplier Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Supplier Address<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter Address"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Landline Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Landline Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="landlineNumber"
                                        value={formData.landlineNumber}
                                        onChange={handleChange}
                                        placeholder="Enter Landline Number"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mobile Number<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        placeholder="Enter Mobile Number"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Mail ID */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mail ID<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter Mail ID"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* GST Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        GST Number<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        placeholder="Enter GST Number"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* PAN Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        PAN Number<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="panNumber"
                                        value={formData.panNumber}
                                        onChange={handleChange}
                                        placeholder="Enter PAN Number"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* DI Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        DI Number<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="dlNumber"
                                        value={formData.dlNumber}
                                        onChange={handleChange}
                                        placeholder="Enter DI Number"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Food License Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Food License Number<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="foodLicenseNumber"
                                        value={formData.foodLicenseNumber}
                                        onChange={handleChange}
                                        placeholder="Enter Food License Number"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Contact Person Name */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Person Name<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="contactPersonName"
                                        value={formData.contactPersonName}
                                        onChange={handleChange}
                                        placeholder="Enter Name"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AddSupplierPage;
