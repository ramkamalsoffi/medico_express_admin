import apiClient from '../lib/axios';

export interface Doctor {
    id: string;
    name: string;
    registrationNo: string;
    specialty: string;
    hospitalName: string;
    location?: string;
    phone: string;
    email?: string;
}

export interface CreateDoctorDto {
    name: string;
    registrationNo: string;
    specialty: string;
    hospitalName: string;
    location?: string;
    phone: string;
    email?: string;
}

export interface UpdateDoctorDto extends Partial<CreateDoctorDto> { }

export interface PaginatedDoctor {
    data: Doctor[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const doctorApi = {
    getAll: async (page = 1, limit = 10, search = '', sortBy = ''): Promise<PaginatedDoctor> => {
        const params: any = { page, limit };

        // Only include search and sortBy if they have values
        if (search) params.search = search;
        if (sortBy) params.sortBy = sortBy;

        const response = await apiClient.get('/doctors', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Doctor> => {
        const response = await apiClient.get(`/doctors/${id}`);
        return response.data;
    },

    create: async (data: CreateDoctorDto): Promise<Doctor> => {
        const response = await apiClient.post('/doctors', data);
        return response.data;
    },

    update: async (id: string, data: UpdateDoctorDto): Promise<Doctor> => {
        const response = await apiClient.put(`/doctors/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/doctors/${id}`);
    },

    exportToExcel: async (): Promise<void> => {
        const response = await apiClient.get('/doctors/export', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'doctors.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
