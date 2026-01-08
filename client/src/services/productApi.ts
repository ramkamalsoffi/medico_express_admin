import apiClient from '../lib/axios';

export interface Product {
    id: string;
    name: string;
    hsnCode: string;
    gstPercent: number;
    packSize: string;
    minStockLevel: number;
    maxStockLevel?: number;
    manufacturerId: string;
    categoryId: string;
    brandId?: string;
    unitId?: string;
    description?: string;
    molecules?: string;

    // Relations
    manufacturer?: { name: string };
    category?: { name: string };
    brand?: { name: string };
    unit?: { name: string };

    createdAt?: string;
}

export interface CreateProductDto {
    name: string;
    hsnCode: string;
    gstPercent: number;
    packSize: string;
    minStockLevel: number;
    maxStockLevel?: number;
    manufacturerId: string;
    categoryId: string;
    brandId?: string;
    unitId?: string;
    description?: string;
    molecules?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

export interface PaginatedProduct {
    data: Product[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const productApi = {
    getAll: async (page = 1, limit = 10, search = '', sortBy = ''): Promise<PaginatedProduct> => {
        const response = await apiClient.get('/products', {
            params: { page, limit, search, sortBy }
        });
        return response.data;
    },

    getById: async (id: string): Promise<Product> => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    create: async (data: CreateProductDto): Promise<Product> => {
        const response = await apiClient.post('/products', data);
        return response.data;
    },

    update: async (id: string, data: UpdateProductDto): Promise<Product> => {
        const response = await apiClient.put(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/products/${id}`);
    },

    exportToExcel: async (): Promise<void> => {
        const response = await apiClient.get('/products/export/data', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'products.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
