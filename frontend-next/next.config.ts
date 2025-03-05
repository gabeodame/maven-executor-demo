/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // Apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "script-src 'self' https://pagead2.googlesyndication.com https://www.googletagservices.com 'unsafe-inline' 'unsafe-eval';",
          },
          {
            key: "Permissions-Policy",
            value: "interest-cohort=()", // Disable FLoC tracking (optional)
          },
        ],
      },
    ];
  },
};

export default nextConfig;
