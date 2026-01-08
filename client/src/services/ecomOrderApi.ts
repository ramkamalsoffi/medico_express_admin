import apiClient from '../lib/axios';

export interface EcomOrder {
    id: string;
    orderId: string;
    customerName: string;
    customerPhone: string;
    productId?: string;
    productName?: string;
    quantity: number;
    totalAmount: number;
    orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    deliveryStatus: 'PENDING' | 'PACKED' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
    deliveryAddress?: string;
    orderDate: string;
    deliveryDate?: string;
    notes?: string;
}

export interface CreateEcomOrderDto {
    customerName: string;
    customerPhone: string;
    productId?: string;
    productName?: string;
    quantity: number;
    totalAmount: number;
    orderStatus?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    deliveryStatus?: 'PENDING' | 'PACKED' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
    deliveryAddress?: string;
    notes?: string;
}

export interface UpdateOrderStatusDto {
    orderStatus: string;
}

export interface UpdateDeliveryStatusDto {
    deliveryStatus: string;
    deliveryDate?: string;
}

export interface PaginatedEcomOrders {
    data: EcomOrder[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const ecomOrderApi = {
    getAll: async (page = 1, limit = 10, search = '', status?: string): Promise<PaginatedEcomOrders> => {
        const response = await apiClient.get('/ecom-orders', {
            params: { page, limit, search, status }
        });
        return response.data;
    },

    getById: async (id: string): Promise<EcomOrder> => {
        const response = await apiClient.get(`/ecom-orders/${id}`);
        return response.data;
    },

    getByProductId: async (productId: string): Promise<EcomOrder[]> => {
        const response = await apiClient.get(`/ecom-orders/product/${productId}`);
        return response.data;
    },

    create: async (data: CreateEcomOrderDto): Promise<EcomOrder> => {
        const response = await apiClient.post('/ecom-orders', data);
        return response.data;
    },

    updateOrderStatus: async (id: string, data: UpdateOrderStatusDto): Promise<EcomOrder> => {
        const response = await apiClient.patch(`/ecom-orders/${id}/order-status`, data);
        return response.data;
    },

    updateDeliveryStatus: async (id: string, data: UpdateDeliveryStatusDto): Promise<EcomOrder> => {
        const response = await apiClient.patch(`/ecom-orders/${id}/delivery-status`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/ecom-orders/${id}`);
    },

    exportToExcel: async (): Promise<void> => {
        const response = await apiClient.get('/ecom-orders/export/data', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ecom-orders.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
