import apiClient from '../lib/axios';

export interface SalesReport {
    id: string;
    invoiceNo: string;
    invoiceDate: string;
    billType: string;
    saleType: string;
    customerName: string;
    customerCode: string;
    communicationAddress: string;
    pincode: string;
    phoneNo: string;
    email: string;
    deliveryAddress: string;
    phoneNo2?: string;
    email2?: string;
    doctorName?: string;
    hospitalName?: string;
    prescriptionNo?: string;
    prescriptionDate?: string;
    sno: string;
    productName: string;
    hsnCode: string;
    noOfItems: number;
    mfr: string;
    packing: string;
    batch: string;
    expiry: string;
    qty: number;
    mrp: number;
    pdDiscount: string;
    tax: string;
    discount: string;
    goodsValue: number;
    taxAmount: number;
    amount: number;
    consolidate: string;
    goodsValue2: number;
    tax2: string;
    frightCharges: number;
    tax3: string;
    insurance: string;
    discount2: string;
    roundedOff: string;
    total: number;
    deliveryAddress2: string;
    name: string;
    phoneNo3: string;
    email3: string;
    deliveryMode: string;
    transportor: string;
    orderStatus?: string;
    deliveryStatus?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateSalesReportDto {
    invoiceNo: string;
    invoiceDate: string;
    billType: string;
    saleType: string;
    customerName: string;
    customerCode: string;
    communicationAddress: string;
    pincode: string;
    phoneNo: string;
    email: string;
    deliveryAddress: string;
    phoneNo2?: string;
    email2?: string;
    doctorName?: string;
    hospitalName?: string;
    prescriptionNo?: string;
    prescriptionDate?: string;
    sno: string;
    productName: string;
    hsnCode: string;
    noOfItems: number;
    mfr: string;
    packing: string;
    batch: string;
    expiry: string;
    qty: number;
    mrp: number;
    pdDiscount: string;
    tax: string;
    discount: string;
    goodsValue: number;
    taxAmount: number;
    amount: number;
    consolidate: string;
    goodsValue2: number;
    tax2: string;
    frightCharges: number;
    tax3: string;
    insurance: string;
    discount2: string;
    roundedOff: string;
    total: number;
    deliveryAddress2: string;
    name: string;
    phoneNo3: string;
    email3: string;
    deliveryMode: string;
    transportor: string;
    orderStatus?: string;
    deliveryStatus?: string;
}

export interface UpdateSalesReportDto extends Partial<CreateSalesReportDto> { }

export interface PaginatedSalesReports {
    data: SalesReport[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const salesReportsApi = {
    getAll: async (
        page = 1,
        limit = 10,
        search = '',
        startDate?: string,
        endDate?: string,
        sortBy?: string
    ): Promise<PaginatedSalesReports> => {
        const params: any = { page, limit };
        if (search) params.search = search;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (sortBy) params.sortBy = sortBy;

        const response = await apiClient.get('/sales-reports', { params });
        return response.data;
    },

    getById: async (id: string): Promise<SalesReport> => {
        const response = await apiClient.get(`/sales-reports/${id}`);
        return response.data;
    },

    create: async (data: CreateSalesReportDto): Promise<SalesReport> => {
        const response = await apiClient.post('/sales-reports', data);
        return response.data;
    },

    update: async (id: string, data: UpdateSalesReportDto): Promise<SalesReport> => {
        const response = await apiClient.put(`/sales-reports/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/sales-reports/${id}`);
    },

    exportToExcel: async (): Promise<void> => {
        const response = await apiClient.get('/sales-reports/export', {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sales-reports.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};
