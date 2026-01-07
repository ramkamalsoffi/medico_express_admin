import apiClient from '../lib/axios';

export interface SubCategoryMaster {
    id: string;
    subCategoryName: string;
    categoryId?: string;
    category?: { id: string; categoryName: string };
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubCategoryMasterDto {
    subCategoryName: string;
    categoryId?: string;
}

export interface UpdateSubCategoryMasterDto extends Partial<CreateSubCategoryMasterDto> {}

export interface PaginatedSubCategories {
    data: SubCategoryMaster[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const subCategoryMasterApi = {
    getAll: async (page: number = 1, limit: number = 10, search?: string, sortBy?: string): Promise<PaginatedSubCategories> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);
        if (sortBy) params.append('sortBy', sortBy);
        const response = await apiClient.get<PaginatedSubCategories>(`/sub-category-master?${params.toString()}`);
        return response.data;
    },

    getById: async (id: string): Promise<SubCategoryMaster> => {
        const response = await apiClient.get<SubCategoryMaster>(`/sub-category-master/${id}`);
        return response.data;
    },

    create: async (data: CreateSubCategoryMasterDto): Promise<SubCategoryMaster> => {
        const response = await apiClient.post<SubCategoryMaster>('/sub-category-master', data);
        return response.data;
    },

    update: async (id: string, data: UpdateSubCategoryMasterDto): Promise<SubCategoryMaster> => {
        const response = await apiClient.put<SubCategoryMaster>(`/sub-category-master/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/sub-category-master/${id}`);
    },
};

export default subCategoryMasterApi;
