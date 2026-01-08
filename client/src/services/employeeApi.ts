import apiClient from '../lib/axios';

export interface Employee {
    id: string;
    name: string;
    designation: string;
    phone: string;
    email?: string;
    dateOfJoin: string;
    branchId: string;
    departmentId?: string;

    // Relations
    branch?: { name: string };
    department?: { name: string };

    createdAt?: string;
}

export interface CreateEmployeeDto {
    name: string;
    designation: string;
    phone: string;
    email?: string;
    dateOfJoin: string;
    branchId: string;
    departmentId?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> { }

export interface PaginatedEmployee {
    data: Employee[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const employeeApi = {
    getAll: async (page = 1, limit = 10, search = '', sortBy = ''): Promise<PaginatedEmployee> => {
        const params: any = { page, limit };

        // Only include search and sortBy if they have values
        if (search) params.search = search;
        if (sortBy) params.sortBy = sortBy;

        const response = await apiClient.get('/employees', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Employee> => {
        const response = await apiClient.get(`/employees/${id}`);
        return response.data;
    },

    create: async (data: CreateEmployeeDto): Promise<Employee> => {
        const response = await apiClient.post('/employees', data);
        return response.data;
    },

    update: async (id: string, data: UpdateEmployeeDto): Promise<Employee> => {
        const response = await apiClient.put(`/employees/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/employees/${id}`);
    },

    exportToExcel: async (): Promise<void> => {
        const response = await apiClient.get('/employees/export', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'employees.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
