import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supplierApi, { CreateSupplierDto, UpdateSupplierDto } from '../services/supplierApi';

// Query key factory
export const supplierKeys = {
    all: ['suppliers'] as const,
    lists: () => [...supplierKeys.all, 'list'] as const,
    list: (page: number, limit: number, search?: string, sortBy?: string) => 
        [...supplierKeys.all, { page, limit, search, sortBy }] as const,
    details: () => [...supplierKeys.all, 'detail'] as const,
    detail: (id: string) => [...supplierKeys.details(), id] as const,
};

// Get all suppliers with pagination
export const useSuppliers = (page: number = 1, limit: number = 10, search?: string, sortBy?: string) => {
    return useQuery({
        queryKey: supplierKeys.list(page, limit, search, sortBy),
        queryFn: () => supplierApi.getAll(page, limit, search, sortBy),
    });
};

// Get single supplier
export const useSupplier = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: supplierKeys.detail(id),
        queryFn: () => supplierApi.getById(id),
        enabled: enabled && !!id,
    });
};

// Create supplier
export const useCreateSupplier = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreateSupplierDto) => supplierApi.create(data),
        onSuccess: () => {
            // Invalidate and refetch suppliers list
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
        },
    });
};

// Update supplier
export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSupplierDto }) => 
            supplierApi.update(id, data),
        onSuccess: (_, variables) => {
            // Invalidate specific supplier and list
            queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
        },
    });
};

// Delete supplier
export const useDeleteSupplier = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => supplierApi.delete(id),
        onSuccess: () => {
            // Invalidate suppliers list
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
        },
    });
};
