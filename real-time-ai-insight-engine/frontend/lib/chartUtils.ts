import { format, parseISO } from 'date-fns';

/**
 * Format a number with commas for thousands
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Generate color palette for charts
 */
export function generateColorPalette(count: number): string[] {
    const baseColors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // violet
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#f97316', // orange
        '#84cc16', // lime
        '#6366f1', // indigo
    ];

    if (count <= baseColors.length) {
        return baseColors.slice(0, count);
    }

    // Generate additional colors if needed
    const colors = [...baseColors];
    while (colors.length < count) {
        const hue = (colors.length * 137.5) % 360;
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }

    return colors;
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: 'LOW' | 'MEDIUM' | 'HIGH'): string {
    const colors = {
        LOW: '#f59e0b',
        MEDIUM: '#f97316',
        HIGH: '#ef4444',
    };
    return colors[severity];
}

/**
 * Format tooltip value
 */
export function formatTooltipValue(value: number, type: 'number' | 'currency' | 'percentage' = 'number'): string {
    switch (type) {
        case 'currency':
            return formatCurrency(value);
        case 'percentage':
            return formatPercentage(value);
        default:
            return formatNumber(value);
    }
}

/**
 * Aggregate data by time window
 */
export function aggregateByTimeWindow(
    data: Array<{ timestamp: string; value: number }>,
    windowMinutes: number = 5
): Array<{ timestamp: string; value: number; count: number }> {
    const aggregated = new Map<string, { sum: number; count: number }>();

    data.forEach((item) => {
        const date = parseISO(item.timestamp);
        const windowStart = new Date(
            Math.floor(date.getTime() / (windowMinutes * 60 * 1000)) * (windowMinutes * 60 * 1000)
        );
        const key = windowStart.toISOString();

        const existing = aggregated.get(key) || { sum: 0, count: 0 };
        existing.sum += item.value;
        existing.count += 1;
        aggregated.set(key, existing);
    });

    return Array.from(aggregated.entries())
        .map(([timestamp, { sum, count }]) => ({
            timestamp,
            value: sum / count,
            count,
        }))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(
    data: number[],
    windowSize: number = 5
): number[] {
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const window = data.slice(start, i + 1);
        const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
        result.push(avg);
    }

    return result;
}

/**
 * Export data to CSV
 */
export function exportToCSV(
    data: Array<Record<string, any>>,
    filename: string = 'export.csv'
): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map((row) =>
            headers.map((header) => {
                const value = row[header];
                // Escape values containing commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export data to JSON
 */
export function exportToJSON(
    data: any,
    filename: string = 'export.json'
): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Calculate trend direction and percentage
 */
export function calculateTrend(
    current: number,
    previous: number
): { direction: 'up' | 'down' | 'neutral'; percentage: number } {
    if (previous === 0) {
        return { direction: 'neutral', percentage: 0 };
    }

    const percentage = ((current - previous) / previous) * 100;

    return {
        direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
        percentage: Math.abs(percentage),
    };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}
