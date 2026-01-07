import apiClient from '../lib/axios';

export interface Supplier {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    gstNumber?: string;
    paymentTerms?: string;
    _count?: {
        purchases: number;
    };
}

export interface CreateSupplierDto {
    name: string;
    phone: string;
    email?: string;
    address: string;
    gstNumber?: string;
    paymentTerms?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> { }

export interface PaginatedSuppliers {
    data: Supplier[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const supplierApi = {
    // Get all suppliers with pagination
    getAll: async (page: number = 1, limit: number = 10, search?: string, sortBy?: string): Promise<PaginatedSuppliers> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);
        if (sortBy) params.append('sortBy', sortBy);

        const response = await apiClient.get<PaginatedSuppliers>(`/suppliers?${params.toString()}`);
        return response.data;
    },

    // Get single supplier by ID
    getById: async (id: string): Promise<Supplier> => {
        const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
        return response.data;
    },

    // Create new supplier
    create: async (data: CreateSupplierDto): Promise<Supplier> => {
        const response = await apiClient.post<Supplier>('/suppliers', data);
        return response.data;
    },

    // Update supplier
    update: async (id: string, data: UpdateSupplierDto): Promise<Supplier> => {
        const response = await apiClient.put<Supplier>(`/suppliers/${id}`, data);
        return response.data;
    },

    // Delete supplier
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/suppliers/${id}`);
    },

    exportToExcel: async (): Promise<void> => {
        const response = await apiClient.get('/suppliers/export', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'suppliers.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};

export default supplierApi;
