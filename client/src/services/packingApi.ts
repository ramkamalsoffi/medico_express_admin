import apiClient from '../lib/axios';

export interface Packing {
    id: string;
    productCode: string;
    productName: string;
    qtyPack: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePackingDto {
    productCode: string;
    productName: string;
    qtyPack: string;
}

export interface UpdatePackingDto extends Partial<CreatePackingDto> {}

export interface PaginatedPackings {
    data: Packing[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const packingApi = {
    // Get all packings with pagination
    getAll: async (page: number = 1, limit: number = 10, search?: string, sortBy?: string): Promise<PaginatedPackings> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        if (sortBy) {
            params.append('sortBy', sortBy);
        }
        const response = await apiClient.get<PaginatedPackings>(`/packings?${params.toString()}`);
        return response.data;
    },

    // Get single packing by ID
    getById: async (id: string): Promise<Packing> => {
        const response = await apiClient.get<Packing>(`/packings/${id}`);
        return response.data;
    },

    // Create new packing
    create: async (data: CreatePackingDto): Promise<Packing> => {
        const response = await apiClient.post<Packing>('/packings', data);
        return response.data;
    },

    // Update packing
    update: async (id: string, data: UpdatePackingDto): Promise<Packing> => {
        const response = await apiClient.put<Packing>(`/packings/${id}`, data);
        return response.data;
    },

    // Delete packing
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/packings/${id}`);
    },
};

export default packingApi;
