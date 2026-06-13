/** @type {import('next').NextConfig} */
const nextConfig = {
    /**
     * EFFICIENCY: Enable React strict mode for better development practices.
     */
    reactStrictMode: true,

    /**
     * EFFICIENCY: Enable SWC minification for smaller, faster bundles.
     * SWC is 20x faster than Terser for minification.
     */
    swcMinify: true,

    /**
     * EFFICIENCY: Configure image optimization.
     * Modern formats (AVIF, WebP) reduce payload by 30-50%.
     */
    images: {
        formats: [ 'image/avif', 'image/webp' ],
    },

    /**
     * EFFICIENCY: Tree-shake recharts - only bundle used components.
     * Reduces recharts bundle from ~200KB to ~60KB.
     */
    modularizeImports: {
        recharts: {
            transform: 'recharts/es6/{{member}}',
        },
    },

    /**
     * SECURITY & EFFICIENCY: HTTP headers for security and caching.
     */
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
                            "style-src 'self' 'unsafe-inline'",
                            "img-src 'self' data: blob:",
                            "font-src 'self'",
                            "connect-src 'self' https://generativelanguage.googleapis.com",
                            "frame-ancestors 'none'",
                        ].join( '; ' ),
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
            {
                /** EFFICIENCY: Immutable cache for static assets (1 year) */
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
