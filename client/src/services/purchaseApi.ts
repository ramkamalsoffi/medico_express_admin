import apiClient from '../lib/axios';

export interface PurchaseItem {
    id: string;
    quantity: number;
    discount: number;
    batch: {
        id: string;
        name: string;
        expiryDate: string;
        mrp: number;
        purchaseRate: number;
        product: {
            name: string;
            code: string;
        };
    };
}

export interface Purchase {
    id: string;
    invoiceNo: string;
    invoiceDate: string;
    billType: string;
    totalAmount: number;
    paymentStatus: string;
    supplier: {
        id: string;
        name: string;
    };
    branch: {
        id: string;
        name: string;
    };
    items?: PurchaseItem[];
}

export interface PaginatedPurchases {
    data: Purchase[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const purchaseApi = {
    getAll: async (page: number = 1, limit: number = 10, search?: string, startDate?: string, endDate?: string, supplierId?: string, sortBy?: string, branchId?: string, paymentStatus?: string, productId?: string): Promise<PaginatedPurchases> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (supplierId) params.append('supplierId', supplierId);
        if (sortBy) params.append('sortBy', sortBy);
        if (branchId) params.append('branchId', branchId);
        if (paymentStatus) params.append('paymentStatus', paymentStatus);
        if (productId) params.append('productId', productId);

        const response = await apiClient.get<PaginatedPurchases>(`/purchases?${params.toString()}`);
        return response.data;
    },

    getById: async (id: string): Promise<Purchase> => {
        const response = await apiClient.get<Purchase>(`/purchases/${id}`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/purchases/${id}`);
    },

    exportToExcel: async (): Promise<void> => {
        const response = await apiClient.get('/purchases/export', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'purchases.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
};
