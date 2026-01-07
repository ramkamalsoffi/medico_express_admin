import apiClient from '../lib/axios';

export interface Company {
    id: string;
    name: string;
    gstNumber?: string;
    drugLicenseNo: string;
    dlExpiryDate: string;
    address: string;
    phone: string;
    email?: string;
    logo?: string;
    licenseExpiryReminder?: number;
    branches?: any[]; // Defined in Branch module usually, or generic
}

export interface CreateCompanyDto {
    name: string;
    gstNumber?: string;
    drugLicenseNo: string;
    dlExpiryDate: string;
    address: string;
    phone: string;
    email?: string;
    licenseExpiryReminder?: number;
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> { }

export interface PaginatedCompany {
    data: Company[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const companyApi = {
    getAll: async (page = 1, limit = 10, search = '', sortBy?: string): Promise<PaginatedCompany> => {
        const response = await apiClient.get('/company', {
            params: { page, limit, search, sortBy }
        });
        return response.data;
    },

    getById: async (id: string): Promise<Company> => {
        const response = await apiClient.get(`/company/${id}`);
        return response.data;
    },

    create: async (data: CreateCompanyDto): Promise<Company> => {
        const response = await apiClient.post('/company', data);
        return response.data;
    },

    update: async (id: string, data: UpdateCompanyDto): Promise<Company> => {
        const response = await apiClient.put(`/company/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/company/${id}`);
    },

    exportToExcel: async (): Promise<void> => {
        const response = await apiClient.get('/company/export', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'companies.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    uploadLogo: async (id: string, file: File): Promise<Company> => {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await apiClient.post(`/company/${id}/logo-upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }
};
