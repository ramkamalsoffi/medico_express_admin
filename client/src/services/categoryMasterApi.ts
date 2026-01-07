import apiClient from '../lib/axios';

export interface CategoryMaster {
    id: string;
    categoryName: string;
    createdAt: string;
    updatedAt: string;
    _count?: { subCategories: number };
}

export interface CreateCategoryMasterDto {
    categoryName: string;
}

export interface UpdateCategoryMasterDto extends Partial<CreateCategoryMasterDto> {}

export interface PaginatedCategories {
    data: CategoryMaster[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const categoryMasterApi = {
    getAll: async (page: number = 1, limit: number = 10, search?: string, sortBy?: string): Promise<PaginatedCategories> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);
        if (sortBy) params.append('sortBy', sortBy);
        const response = await apiClient.get<PaginatedCategories>(`/category-master?${params.toString()}`);
        return response.data;
    },

    getById: async (id: string): Promise<CategoryMaster> => {
        const response = await apiClient.get<CategoryMaster>(`/category-master/${id}`);
        return response.data;
    },

    create: async (data: CreateCategoryMasterDto): Promise<CategoryMaster> => {
        const response = await apiClient.post<CategoryMaster>('/category-master', data);
        return response.data;
    },

    update: async (id: string, data: UpdateCategoryMasterDto): Promise<CategoryMaster> => {
        const response = await apiClient.put<CategoryMaster>(`/category-master/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/category-master/${id}`);
    },
};

export default categoryMasterApi;
