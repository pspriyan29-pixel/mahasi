import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://3bc0bd834fdf4e2bc229e6971079b796@o4510596255121408.ingest.de.sentry.io/4510596271571024",

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Enable logging
    enableLogs: true,

    // Capture console logs
    integrations: [
        Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: process.env.NODE_ENV === 'development',
});
