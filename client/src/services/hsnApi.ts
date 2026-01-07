import apiClient from '../lib/axios';

export interface HSNMaster {
    id: string;
    hsnCode: string;
    description: string | null;
    gstRate: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHSNDto {
    hsnCode: string;
    description?: string;
    gstRate?: number;
}

export interface UpdateHSNDto extends Partial<CreateHSNDto> {}

export interface PaginatedHSN {
    data: HSNMaster[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const hsnApi = {
    getAll: async (page: number = 1, limit: number = 10, search?: string, sortBy?: string): Promise<PaginatedHSN> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);
        if (sortBy) params.append('sortBy', sortBy);
        const response = await apiClient.get<PaginatedHSN>(`/hsn-master?${params.toString()}`);
        return response.data;
    },

    getById: async (id: string): Promise<HSNMaster> => {
        const response = await apiClient.get<HSNMaster>(`/hsn-master/${id}`);
        return response.data;
    },

    create: async (data: CreateHSNDto): Promise<HSNMaster> => {
        const response = await apiClient.post<HSNMaster>('/hsn-master', data);
        return response.data;
    },

    update: async (id: string, data: UpdateHSNDto): Promise<HSNMaster> => {
        const response = await apiClient.put<HSNMaster>(`/hsn-master/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/hsn-master/${id}`);
    },

    uploadExcel: async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiClient.post('/hsn-master/import-excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export default hsnApi;
