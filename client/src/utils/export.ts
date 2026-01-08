/**
 * Converts an array of objects to CSV format and triggers download
 * @param data Array of objects to export
 * @param filename Name of the CSV file
 * @param columns Optional: specify which columns to export and their headers
 */
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string,
    columns?: { key: keyof T; header: string }[]
) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // If columns not specified, use all keys from first object
    const cols = columns || Object.keys(data[0]).map((key) => ({ key, header: key }));

    // Create CSV header
    const headers = cols.map((col) => col.header).join(',');

    // Create CSV rows
    const rows = data.map((row) => {
        return cols
            .map((col) => {
                let value = row[col.key];

                // Handle different types
                if (value === null || value === undefined) {
                    return '';
                }
                if (typeof value === 'object') {
                    value = JSON.stringify(value) as any;
                }

                // Escape quotes and wrap in quotes if contains comma, newline, or quote
                value = String(value) as any;
                if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                    value = `"${value.replace(/"/g, '""')}"` as any;
                }

                return value;
            })
            .join(',');
    });

    // Combine header and rows
    const csv = [headers, ...rows].join('\n');

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export master data with common formatting
 */
export function exportMasterData<T extends Record<string, any>>(
    data: T[],
    type: 'molecules' | 'hsn' | 'categories' | 'subcategories' | 'packings',
    columns?: { key: keyof T; header: string }[]
) {
    const filenames = {
        molecules: 'molecules_master',
        hsn: 'hsn_master',
        categories: 'categories_master',
        subcategories: 'subcategories_master',
        packings: 'packings_master',
    };

    exportToCSV(data, filenames[type], columns);
}
