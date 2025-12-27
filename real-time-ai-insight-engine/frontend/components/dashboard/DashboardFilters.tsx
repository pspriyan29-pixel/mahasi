'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Filter, RefreshCw, X } from 'lucide-react';
import { DATE_RANGE_PRESETS, type DateRangePreset } from '@/lib/dateUtils';

export interface DashboardFiltersState {
    dateRange: DateRangePreset;
    regions: string[];
    eventTypes: string[];
    metricType: string;
    sensitivity: 'low' | 'medium' | 'high';
    refreshInterval: number;
}

interface DashboardFiltersProps {
    filters: DashboardFiltersState;
    onFiltersChange: (filters: Partial<DashboardFiltersState>) => void;
    onRefresh: () => void;
    onExport: (format: 'csv' | 'json') => void;
    availableRegions?: string[];
    availableEventTypes?: string[];
    isRefreshing?: boolean;
}

export function DashboardFilters({
    filters,
    onFiltersChange,
    onRefresh,
    onExport,
    availableRegions = [],
    availableEventTypes = [],
    isRefreshing = false,
}: DashboardFiltersProps) {
    const activeFiltersCount =
        (filters.regions.length > 0 ? 1 : 0) +
        (filters.eventTypes.length > 0 ? 1 : 0) +
        (filters.dateRange !== DATE_RANGE_PRESETS.LAST_HOUR ? 1 : 0);

    const clearFilters = () => {
        onFiltersChange({
            regions: [],
            eventTypes: [],
            dateRange: DATE_RANGE_PRESETS.LAST_HOUR,
            metricType: 'transaction_volume',
            sensitivity: 'medium',
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
            {/* Date Range */}
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select
                    value={filters.dateRange}
                    onValueChange={(value) =>
                        onFiltersChange({ dateRange: value as DateRangePreset })
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={DATE_RANGE_PRESETS.LAST_15_MIN}>
                            Last 15 minutes
                        </SelectItem>
                        <SelectItem value={DATE_RANGE_PRESETS.LAST_HOUR}>Last hour</SelectItem>
                        <SelectItem value={DATE_RANGE_PRESETS.LAST_6_HOURS}>
                            Last 6 hours
                        </SelectItem>
                        <SelectItem value={DATE_RANGE_PRESETS.LAST_24_HOURS}>
                            Last 24 hours
                        </SelectItem>
                        <SelectItem value={DATE_RANGE_PRESETS.LAST_7_DAYS}>
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Metric Type */}
            <Select
                value={filters.metricType}
                onValueChange={(value) => onFiltersChange({ metricType: value })}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="transaction_volume">Transaction Volume</SelectItem>
                    <SelectItem value="transaction_amount">Transaction Amount</SelectItem>
                    <SelectItem value="user_activity">User Activity</SelectItem>
                    <SelectItem value="regional_distribution">Regional Distribution</SelectItem>
                </SelectContent>
            </Select>

            {/* Sensitivity */}
            <Select
                value={filters.sensitivity}
                onValueChange={(value) =>
                    onFiltersChange({ sensitivity: value as 'low' | 'medium' | 'high' })
                }
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sensitivity" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="low">Low Sensitivity</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High Sensitivity</SelectItem>
                </SelectContent>
            </Select>

            {/* Divider */}
            <div className="h-8 w-px bg-border" />

            {/* Refresh */}
            <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="gap-2"
            >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
            </Button>

            {/* Export */}
            <Select onValueChange={(value) => onExport(value as 'csv' | 'json')}>
                <SelectTrigger className="w-[140px]">
                    <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="csv">Export as CSV</SelectItem>
                    <SelectItem value="json">Export as JSON</SelectItem>
                </SelectContent>
            </Select>

            {/* Active Filters Badge */}
            {activeFiltersCount > 0 && (
                <>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                            <Filter className="h-3 w-3" />
                            {activeFiltersCount} active
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}

            {/* Selected Filters */}
            {(filters.regions.length > 0 || filters.eventTypes.length > 0) && (
                <div className="flex w-full flex-wrap gap-2 border-t border-border pt-3">
                    {filters.regions.map((region) => (
                        <Badge key={region} variant="outline" className="gap-1">
                            {region}
                            <button
                                onClick={() =>
                                    onFiltersChange({
                                        regions: filters.regions.filter((r) => r !== region),
                                    })
                                }
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {filters.eventTypes.map((type) => (
                        <Badge key={type} variant="outline" className="gap-1">
                            {type}
                            <button
                                onClick={() =>
                                    onFiltersChange({
                                        eventTypes: filters.eventTypes.filter((t) => t !== type),
                                    })
                                }
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
