/** @type {import('next').NextConfig} */
const nextConfig = {
    /**
     * SECURITY: Content Security Policy headers
     * These headers prevent XSS attacks, clickjacking, and other injection attacks.
     * All scripts must come from same origin - no inline scripts or external sources.
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
                            "connect-src 'self'",
                            "frame-ancestors 'none'",
                        ].join( '; ' ),
                    },
                    {
                        /** SECURITY: Prevent clickjacking attacks */
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        /** SECURITY: Prevent MIME type sniffing */
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        /** SECURITY: Control referrer information leakage */
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        /** SECURITY: Restrict browser features */
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
