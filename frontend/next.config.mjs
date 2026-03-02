/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                path: false,
                os: false,
                stream: false,
                http: false,
                https: false,
                zlib: false,
            };
        }
        
        // Fix for WalletConnect/MultiversX pino-pretty warnings
        config.externals.push('pino-pretty', 'lokijs', 'encoding');

        return config;
    },
};

export default nextConfig;
