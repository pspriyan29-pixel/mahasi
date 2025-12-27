import { format, subMinutes, subHours, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';

export interface DateRange {
    start: Date;
    end: Date;
    label: string;
}

/**
 * Predefined date range presets
 */
export const DATE_RANGE_PRESETS = {
    LAST_15_MIN: 'last_15_min',
    LAST_HOUR: 'last_hour',
    LAST_6_HOURS: 'last_6_hours',
    LAST_24_HOURS: 'last_24_hours',
    LAST_7_DAYS: 'last_7_days',
    CUSTOM: 'custom',
} as const;

export type DateRangePreset = typeof DATE_RANGE_PRESETS[keyof typeof DATE_RANGE_PRESETS];

/**
 * Get date range based on preset
 */
export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
    const now = new Date();

    switch (preset) {
        case DATE_RANGE_PRESETS.LAST_15_MIN:
            return {
                start: subMinutes(now, 15),
                end: now,
                label: 'Last 15 minutes',
            };
        case DATE_RANGE_PRESETS.LAST_HOUR:
            return {
                start: subHours(now, 1),
                end: now,
                label: 'Last hour',
            };
        case DATE_RANGE_PRESETS.LAST_6_HOURS:
            return {
                start: subHours(now, 6),
                end: now,
                label: 'Last 6 hours',
            };
        case DATE_RANGE_PRESETS.LAST_24_HOURS:
            return {
                start: subHours(now, 24),
                end: now,
                label: 'Last 24 hours',
            };
        case DATE_RANGE_PRESETS.LAST_7_DAYS:
            return {
                start: subDays(now, 7),
                end: now,
                label: 'Last 7 days',
            };
        default:
            return {
                start: subHours(now, 1),
                end: now,
                label: 'Custom',
            };
    }
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date | string, formatStr: string = 'PPpp'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
}

/**
 * Format date for chart axis
 */
export function formatDateForAxis(date: Date | string, rangeInHours: number): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (rangeInHours <= 1) {
        // Show minutes for short ranges
        return format(dateObj, 'HH:mm');
    } else if (rangeInHours <= 24) {
        // Show hours for day ranges
        return format(dateObj, 'HH:mm');
    } else {
        // Show date for longer ranges
        return format(dateObj, 'MMM dd');
    }
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
        return `${diffSec}s ago`;
    } else if (diffMin < 60) {
        return `${diffMin}m ago`;
    } else if (diffHour < 24) {
        return `${diffHour}h ago`;
    } else {
        return `${diffDay}d ago`;
    }
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    return (
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear()
    );
}

/**
 * Get time range in hours
 */
export function getTimeRangeInHours(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/**
 * Format ISO string for API
 */
export function formatForAPI(date: Date): string {
    return date.toISOString();
}

/**
 * Parse date safely
 */
export function parseDateSafely(dateStr: string): Date | null {
    try {
        const date = parseISO(dateStr);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}
