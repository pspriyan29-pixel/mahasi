/**
 * OpenTelemetry Integration
 * Enterprise-grade distributed tracing and metrics
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import {
    MeterProvider,
    PeriodicExportingMetricReader
} from '@opentelemetry/sdk-metrics';
import {
    BatchSpanProcessor,
    ConsoleSpanExporter
} from '@opentelemetry/sdk-trace-base';
import { trace, context, SpanStatusCode, Span } from '@opentelemetry/api';
import { logger } from '../utils/logger';

// Service information
const SERVICE_NAME = process.env.SERVICE_NAME || 'ai-insight-engine-backend';
const SERVICE_VERSION = process.env.SERVICE_VERSION || '2.0.0';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

/**
 * Initialize OpenTelemetry SDK
 */
export function initializeTelemetry(): NodeSDK {
    // Create resource with service information
    const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
        [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: ENVIRONMENT,
    });

    // Configure Jaeger exporter for traces
    const jaegerExporter = new JaegerExporter({
        endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    });

    // Configure Prometheus exporter for metrics
    const prometheusExporter = new PrometheusExporter({
        port: parseInt(process.env.PROMETHEUS_PORT || '9464'),
    });

    // Create meter provider
    const meterProvider = new MeterProvider({
        resource,
        readers: [
            new PeriodicExportingMetricReader({
                exporter: prometheusExporter,
                exportIntervalMillis: 10000, // Export every 10 seconds
            }),
        ],
    });

    // Initialize SDK
    const sdk = new NodeSDK({
        resource,
        traceExporter: ENVIRONMENT === 'production' ? jaegerExporter : new ConsoleSpanExporter(),
        instrumentations: [
            getNodeAutoInstrumentations({
                '@opentelemetry/instrumentation-fs': {
                    enabled: false, // Disable filesystem instrumentation (too noisy)
                },
                '@opentelemetry/instrumentation-http': {
                    enabled: true,
                    ignoreIncomingPaths: ['/health', '/metrics'],
                },
                '@opentelemetry/instrumentation-express': {
                    enabled: true,
                },
                '@opentelemetry/instrumentation-pg': {
                    enabled: true,
                },
                '@opentelemetry/instrumentation-redis': {
                    enabled: true,
                },
            }),
        ],
        spanProcessor: new BatchSpanProcessor(
            ENVIRONMENT === 'production' ? jaegerExporter : new ConsoleSpanExporter()
        ),
    });

    // Start SDK
    sdk.start();
    logger.info('OpenTelemetry initialized successfully');

    // Graceful shutdown
    process.on('SIGTERM', () => {
        sdk
            .shutdown()
            .then(() => logger.info('OpenTelemetry shut down successfully'))
            .catch((error) => logger.error('Error shutting down OpenTelemetry', error))
            .finally(() => process.exit(0));
    });

    return sdk;
}

/**
 * Tracer instance
 */
const tracer = trace.getTracer(SERVICE_NAME, SERVICE_VERSION);

/**
 * Create a new span
 */
export function createSpan(name: string, attributes?: Record<string, any>): Span {
    return tracer.startSpan(name, {
        attributes,
    });
}

/**
 * Wrap async function with tracing
 */
export async function traceAsync<T>(
    spanName: string,
    fn: (span: Span) => Promise<T>,
    attributes?: Record<string, any>
): Promise<T> {
    const span = createSpan(spanName, attributes);

    try {
        const result = await context.with(trace.setSpan(context.active(), span), () => fn(span));
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
    } catch (error) {
        span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        span.recordException(error as Error);
        throw error;
    } finally {
        span.end();
    }
}

/**
 * Wrap sync function with tracing
 */
export function traceSync<T>(
    spanName: string,
    fn: (span: Span) => T,
    attributes?: Record<string, any>
): T {
    const span = createSpan(spanName, attributes);

    try {
        const result = context.with(trace.setSpan(context.active(), span), () => fn(span));
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
    } catch (error) {
        span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        span.recordException(error as Error);
        throw error;
    } finally {
        span.end();
    }
}

/**
 * Add event to current span
 */
export function addSpanEvent(name: string, attributes?: Record<string, any>): void {
    const span = trace.getActiveSpan();
    if (span) {
        span.addEvent(name, attributes);
    }
}

/**
 * Set attribute on current span
 */
export function setSpanAttribute(key: string, value: any): void {
    const span = trace.getActiveSpan();
    if (span) {
        span.setAttribute(key, value);
    }
}

/**
 * Record exception on current span
 */
export function recordSpanException(error: Error): void {
    const span = trace.getActiveSpan();
    if (span) {
        span.recordException(error);
        span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
        });
    }
}

/**
 * Decorator for tracing class methods
 */
export function Trace(spanName?: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        const name = spanName || `${target.constructor.name}.${propertyKey}`;

        descriptor.value = async function (...args: any[]) {
            return traceAsync(
                name,
                async (span) => {
                    span.setAttribute('method', propertyKey);
                    span.setAttribute('class', target.constructor.name);
                    return originalMethod.apply(this, args);
                }
            );
        };

        return descriptor;
    };
}

/**
 * Express middleware for tracing HTTP requests
 */
export function tracingMiddleware() {
    return (req: any, res: any, next: any) => {
        const span = createSpan(`HTTP ${req.method} ${req.path}`, {
            'http.method': req.method,
            'http.url': req.url,
            'http.target': req.path,
            'http.host': req.hostname,
            'http.scheme': req.protocol,
            'http.user_agent': req.get('user-agent'),
        });

        // Add trace context to request
        req.span = span;

        // Track response
        const originalSend = res.send;
        res.send = function (body: any) {
            span.setAttribute('http.status_code', res.statusCode);

            if (res.statusCode >= 400) {
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: `HTTP ${res.statusCode}`,
                });
            } else {
                span.setStatus({ code: SpanStatusCode.OK });
            }

            span.end();
            return originalSend.call(this, body);
        };

        // Handle errors
        res.on('error', (error: Error) => {
            span.recordException(error);
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message,
            });
            span.end();
        });

        next();
    };
}

/**
 * Metrics collection
 */
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter(SERVICE_NAME, SERVICE_VERSION);

// Create metrics
export const Metrics = {
    // Counters
    httpRequests: meter.createCounter('http_requests_total', {
        description: 'Total number of HTTP requests',
    }),

    httpErrors: meter.createCounter('http_errors_total', {
        description: 'Total number of HTTP errors',
    }),

    eventsProcessed: meter.createCounter('events_processed_total', {
        description: 'Total number of events processed',
    }),

    aiAnalyses: meter.createCounter('ai_analyses_total', {
        description: 'Total number of AI analyses performed',
    }),

    cacheHits: meter.createCounter('cache_hits_total', {
        description: 'Total number of cache hits',
    }),

    cacheMisses: meter.createCounter('cache_misses_total', {
        description: 'Total number of cache misses',
    }),

    // Histograms
    httpDuration: meter.createHistogram('http_request_duration_ms', {
        description: 'HTTP request duration in milliseconds',
    }),

    aiAnalysisDuration: meter.createHistogram('ai_analysis_duration_ms', {
        description: 'AI analysis duration in milliseconds',
    }),

    dbQueryDuration: meter.createHistogram('db_query_duration_ms', {
        description: 'Database query duration in milliseconds',
    }),

    // Gauges
    activeConnections: meter.createObservableGauge('active_connections', {
        description: 'Number of active connections',
    }),

    queueSize: meter.createObservableGauge('queue_size', {
        description: 'Number of jobs in queue',
    }),
};

/**
 * Record HTTP request metrics
 */
export function recordHttpMetrics(
    method: string,
    path: string,
    statusCode: number,
    duration: number
): void {
    const labels = { method, path, status: statusCode.toString() };

    Metrics.httpRequests.add(1, labels);
    Metrics.httpDuration.record(duration, labels);

    if (statusCode >= 400) {
        Metrics.httpErrors.add(1, labels);
    }
}

/**
 * Record cache metrics
 */
export function recordCacheMetrics(hit: boolean, key: string): void {
    const labels = { key };

    if (hit) {
        Metrics.cacheHits.add(1, labels);
    } else {
        Metrics.cacheMisses.add(1, labels);
    }
}

/**
 * Record AI analysis metrics
 */
export function recordAIMetrics(duration: number, success: boolean): void {
    const labels = { success: success.toString() };

    Metrics.aiAnalyses.add(1, labels);
    Metrics.aiAnalysisDuration.record(duration, labels);
}

/**
 * Record event processing metrics
 */
export function recordEventMetrics(count: number, type: string): void {
    Metrics.eventsProcessed.add(count, { type });
}

export { tracer };
