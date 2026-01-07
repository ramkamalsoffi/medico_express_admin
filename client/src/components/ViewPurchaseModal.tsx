import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { purchaseApi } from '../services/purchaseApi';

interface ViewPurchaseModalProps {
    purchaseId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ViewPurchaseModal({ purchaseId, isOpen, onClose }: ViewPurchaseModalProps) {
    const { data: purchase, isLoading } = useQuery({
        queryKey: ['purchase', purchaseId],
        queryFn: () => purchaseApi.getById(purchaseId),
        enabled: !!purchaseId && isOpen,
    });

    if (!isOpen) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between border-b px-6 py-4">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Purchase Details
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                {isLoading ? (
                                    <div className="p-6 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        <p className="mt-2 text-gray-500">Loading details...</p>
                                    </div>
                                ) : purchase ? (
                                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                                        {/* Header Details */}
                                        <div className="grid grid-cols-4 gap-6 mb-8 bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Invoice No</p>
                                                <p className="text-sm font-medium text-gray-900 mt-1">{purchase.invoiceNo}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                                                <p className="text-sm font-medium text-gray-900 mt-1">
                                                    {new Date(purchase.invoiceDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Supplier</p>
                                                <p className="text-sm font-medium text-gray-900 mt-1">{purchase.supplier?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Branch</p>
                                                <p className="text-sm font-medium text-gray-900 mt-1">{purchase.branch?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Bill Type</p>
                                                <p className="text-sm font-medium text-gray-900 mt-1">{purchase.billType}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                                                <span className={`inline-flex px-2 py-1 mt-1 text-xs font-semibold rounded-full ${
                                                    purchase.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                                    purchase.paymentStatus === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {purchase.paymentStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Items Table */}
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Purchase Items</h4>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-4 py-2">S.No</th>
                                                        {/* Manufacturer not always available in type if backend not adjusted, but we adjusted backend */}
                                                        <th className="px-4 py-2">MFR</th> 
                                                        <th className="px-4 py-2">Product</th>
                                                        <th className="px-4 py-2">Batch</th>
                                                        <th className="px-4 py-2">Expiry</th>
                                                        <th className="px-4 py-2">Qty</th>
                                                        <th className="px-4 py-2">MRP</th>
                                                        <th className="px-4 py-2">Rate</th>
                                                        <th className="px-4 py-2">Disc %</th>
                                                        <th className="px-4 py-2 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {purchase.items?.map((item, index) => {
                                                        const subtotal = item.batch.purchaseRate * item.quantity;
                                                        const total = subtotal - (subtotal * item.discount / 100);
                                                        return (
                                                            <tr key={item.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-2">{index + 1}</td>
                                                                <td className="px-4 py-2 text-gray-600">
                                                                    {(item.batch as any).product?.manufacturer?.name || '-'}
                                                                </td>
                                                                <td className="px-4 py-2 font-medium text-gray-900">
                                                                    {item.batch.product.name}
                                                                </td>
                                                                <td className="px-4 py-2 text-gray-600">{item.batch.name}</td>
                                                                <td className="px-4 py-2 text-gray-600">
                                                                    {new Date(item.batch.expiryDate).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-2 text-gray-900">{item.quantity}</td>
                                                                <td className="px-4 py-2 text-gray-600">₹{item.batch.mrp}</td>
                                                                <td className="px-4 py-2 text-gray-600">₹{item.batch.purchaseRate}</td>
                                                                <td className="px-4 py-2 text-gray-600">{item.discount}%</td>
                                                                <td className="px-4 py-2 text-right font-medium text-gray-900">
                                                                    ₹{total.toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot className="bg-gray-50 font-semibold text-gray-900">
                                                    <tr>
                                                        <td colSpan={9} className="px-4 py-3 text-right">Total Amount:</td>
                                                        <td className="px-4 py-3 text-right">₹{purchase.totalAmount.toFixed(2)}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-red-500">
                                        Failed to load purchase details
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
