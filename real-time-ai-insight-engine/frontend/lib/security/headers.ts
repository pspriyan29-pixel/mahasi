import { NextResponse } from 'next/server';

/**
 * Security headers configuration
 */
export const securityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; '),

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy
    'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'interest-cohort=()',
    ].join(', '),

    // HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

/**
 * CORS configuration
 */
export interface CORSOptions {
    allowedOrigins?: string[];
    allowedMethods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
}

const defaultCORSOptions: CORSOptions = {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    credentials: true,
    maxAge: 86400, // 24 hours
};

/**
 * Apply CORS headers to response
 */
export function applyCORSHeaders(
    response: NextResponse,
    origin: string | null,
    options: CORSOptions = defaultCORSOptions
): NextResponse {
    const {
        allowedOrigins,
        allowedMethods,
        allowedHeaders,
        exposedHeaders,
        credentials,
        maxAge,
    } = { ...defaultCORSOptions, ...options };

    // Check if origin is allowed
    if (origin && allowedOrigins?.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins?.includes('*')) {
        response.headers.set('Access-Control-Allow-Origin', '*');
    }

    if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    if (allowedMethods) {
        response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
    }

    if (allowedHeaders) {
        response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    }

    if (exposedHeaders) {
        response.headers.set('Access-Control-Expose-Headers', exposedHeaders.join(', '));
    }

    if (maxAge) {
        response.headers.set('Access-Control-Max-Age', maxAge.toString());
    }

    return response;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken) {
        return false;
    }

    const crypto = require('crypto');
    return crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(expectedToken)
    );
}

/**
 * Password strength validation
 */
export interface PasswordStrength {
    score: number; // 0-4
    feedback: string[];
    isStrong: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    else feedback.push('Use at least 12 characters for better security');

    // Character variety
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('Add special characters');

    // Common patterns check
    const commonPatterns = ['password', '123456', 'qwerty', 'abc123'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
        score = Math.max(0, score - 2);
        feedback.push('Avoid common passwords');
    }

    // Normalize score to 0-4
    score = Math.min(4, Math.floor(score / 1.5));

    return {
        score,
        feedback,
        isStrong: score >= 3,
    };
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 255);
}

/**
 * Check if IP is in whitelist
 */
export function isIPWhitelisted(ip: string, whitelist: string[]): boolean {
    return whitelist.includes(ip) || whitelist.includes('*');
}

/**
 * Get client IP from request
 */
export function getClientIP(headers: Headers): string {
    return (
        headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        headers.get('x-real-ip') ||
        'unknown'
    );
}
