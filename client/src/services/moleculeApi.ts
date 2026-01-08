import apiClient from '../lib/axios';

export interface Molecule {
    id: string;
    moleculeName: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMoleculeDto {
    moleculeName: string;
}

export interface UpdateMoleculeDto extends Partial<CreateMoleculeDto> { }

export interface PaginatedMolecules {
    data: Molecule[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const moleculeApi = {
    // Get all molecules with pagination
    getAll: async (page: number = 1, limit: number = 10, search?: string, sortBy?: string): Promise<PaginatedMolecules> => {
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
        const response = await apiClient.get<PaginatedMolecules>(`/molecules?${params.toString()}`);
        return response.data;
    },

    // Get single molecule by ID
    getById: async (id: string): Promise<Molecule> => {
        const response = await apiClient.get<Molecule>(`/molecules/${id}`);
        return response.data;
    },

    // Create new molecule
    create: async (data: CreateMoleculeDto): Promise<Molecule> => {
        const response = await apiClient.post<Molecule>('/molecules', data);
        return response.data;
    },

    // Update molecule
    update: async (id: string, data: UpdateMoleculeDto): Promise<Molecule> => {
        const response = await apiClient.patch<Molecule>(`/molecules/${id}`, data);
        return response.data;
    },

    // Delete molecule
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/molecules/${id}`);
    },
};

export default moleculeApi;
