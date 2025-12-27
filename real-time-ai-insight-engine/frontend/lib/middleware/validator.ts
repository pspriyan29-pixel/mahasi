import { z, ZodSchema } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';

// Common validation schemas
export const schemas = {
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    uuid: z.string().uuid('Invalid UUID'),
    url: z.string().url('Invalid URL'),
    dateRange: z.object({
        start: z.string().datetime(),
        end: z.string().datetime(),
    }),
    pagination: z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
    }),
};

// Sanitize input to prevent XSS
export function sanitizeInput(input: any): any {
    if (typeof input === 'string') {
        return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    }

    if (typeof input === 'object' && input !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }

    return input;
}

// Validate request body against schema
export async function validateRequest<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
    try {
        const body = await request.json();
        const sanitized = sanitizeInput(body);
        const validated = schema.parse(sanitized);

        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: NextResponse.json(
                    {
                        error: 'Validation Error',
                        message: 'Invalid request data',
                        details: error.errors.map((err) => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    },
                    { status: 400 }
                ),
            };
        }

        return {
            success: false,
            error: NextResponse.json(
                {
                    error: 'Bad Request',
                    message: 'Invalid request body',
                },
                { status: 400 }
            ),
        };
    }
}

// Validate query parameters
export function validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
    try {
        const { searchParams } = new URL(request.url);
        const params: any = {};

        searchParams.forEach((value, key) => {
            // Try to parse as JSON if it looks like an object/array
            if (value.startsWith('{') || value.startsWith('[')) {
                try {
                    params[key] = JSON.parse(value);
                } catch {
                    params[key] = value;
                }
            } else if (!isNaN(Number(value))) {
                params[key] = Number(value);
            } else if (value === 'true' || value === 'false') {
                params[key] = value === 'true';
            } else {
                params[key] = value;
            }
        });

        const sanitized = sanitizeInput(params);
        const validated = schema.parse(sanitized);

        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: NextResponse.json(
                    {
                        error: 'Validation Error',
                        message: 'Invalid query parameters',
                        details: error.errors.map((err) => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    },
                    { status: 400 }
                ),
            };
        }

        return {
            success: false,
            error: NextResponse.json(
                {
                    error: 'Bad Request',
                    message: 'Invalid query parameters',
                },
                { status: 400 }
            ),
        };
    }
}

// SQL injection prevention patterns
const SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|;|\/\*|\*\/)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
];

export function detectSQLInjection(input: string): boolean {
    return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

// Validate and sanitize file uploads
export function validateFileUpload(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
}): { valid: boolean; error?: string } {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options;

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
        };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        };
    }

    return { valid: true };
}
