import apiClient from '../lib/axios';

export interface Customer {
    id: string;
    code?: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    deliveryType?: string;
    customerType?: string;
    deliveryAddress?: string;
    pincode?: string;
    reference?: string;
    remark?: string;
    image?: string;
}

export interface CreateCustomerDto {
    code?: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    deliveryType?: string;
    customerType?: string;
    deliveryAddress?: string;
    pincode?: string;
    reference?: string;
    remark?: string;
    image?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> { }

export interface PaginatedCustomer {
    data: Customer[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const customerApi = {
    getAll: async (page = 1, limit = 10, search = '', sortBy = ''): Promise<PaginatedCustomer> => {
        const response = await apiClient.get('/customers', {
            params: { page, limit, search, sortBy }
        });
        return response.data;
    },

    getById: async (id: string): Promise<Customer> => {
        const response = await apiClient.get(`/customers/${id}`);
        return response.data;
    },

    create: async (data: CreateCustomerDto): Promise<Customer> => {
        const response = await apiClient.post('/customers', data);
        return response.data;
    },

    update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
        const response = await apiClient.put(`/customers/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/customers/${id}`);
    },

    exportToExcel: async (): Promise<void> => {
        const response = await apiClient.get('/customers/export', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'customers.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
