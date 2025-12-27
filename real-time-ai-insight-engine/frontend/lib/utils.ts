import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
    const d = new Date(date)
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d)
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount)
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num)
}

export function formatCompactNumber(num: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
    }).format(num)
}

export function generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'sk_'
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function truncate(str: string, length: number = 50): string {
    if (str.length <= length) return str
    return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
}

export function getRelativeTime(date: string | Date): string {
    const now = new Date()
    const then = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return formatDate(date)
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

export function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text)
    }
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
        document.execCommand('copy')
        return Promise.resolve()
    } catch (error) {
        return Promise.reject(error)
    } finally {
        document.body.removeChild(textArea)
    }
}

export function downloadJSON(data: any, filename: string): void {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export function downloadCSV(data: any[], filename: string): void {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csv = [
        headers.join(','),
        ...data.map((row) =>
            headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')
        ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export function getSeverityColor(severity: string): string {
    switch (severity.toUpperCase()) {
        case 'CRITICAL':
            return 'text-red-500 bg-red-500/10 border-red-500/20'
        case 'HIGH':
            return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
        case 'MEDIUM':
            return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
        case 'LOW':
            return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
        default:
            return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
}

export function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'open':
            return 'text-red-500 bg-red-500/10 border-red-500/20'
        case 'acknowledged':
            return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
        case 'resolved':
            return 'text-green-500 bg-green-500/10 border-green-500/20'
        case 'ignored':
            return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
        case 'anomaly':
            return 'text-red-500 bg-red-500/10 border-red-500/20'
        case 'normal':
            return 'text-green-500 bg-green-500/10 border-green-500/20'
        default:
            return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
}
