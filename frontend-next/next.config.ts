import { getBackEndUrl } from "@/app/util/getbackEndUrl";

/** @type {import('next').NextConfig} */
const backendUrl = getBackEndUrl()?.replace(/^https?:\/\//, ""); // Strip http/https prefix
const backendWs = backendUrl?.replace(/\/$/, ""); // Remove trailing slash if any

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // Apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval'
                https://pagead2.googlesyndication.com
                https://www.googletagservices.com
                https://www.googletagmanager.com
                https://securepubads.g.doubleclick.net
                https://tpc.googlesyndication.com
                https://ep1.adtrafficquality.google
                https://ep2.adtrafficquality.google
                https://adservice.google.com;
              img-src 'self'
                https://pagead2.googlesyndication.com
                https://tpc.googlesyndication.com
                https://ep1.adtrafficquality.google
                https://ep2.adtrafficquality.google
                https://adservice.google.com;
              style-src 'self' 'unsafe-inline';
              frame-src 'self'
                https://googleads.g.doubleclick.net
                https://ep1.adtrafficquality.google
                https://ep2.adtrafficquality.google
                https://www.google.com
                https://www.youtube.com
                https://adservice.google.com
                https://www.googletagservices.com;
              fenced-frame-src 'self'
                https://googleads.g.doubleclick.net
                https://ep1.adtrafficquality.google
                https://ep2.adtrafficquality.google
                https://www.google.com
                https://www.youtube.com
                https://adservice.google.com
                https://www.googletagservices.com
                https://tpc.googlesyndication.com
                https://securepubads.g.doubleclick.net;
              connect-src 'self' http://${backendUrl} https://${backendUrl}
                ws://${backendWs} wss://${backendWs}
                https://pagead2.googlesyndication.com
                https://www.googletagmanager.com
                https://securepubads.g.doubleclick.net
                https://ep1.adtrafficquality.google
                https://ep2.adtrafficquality.google
                https://adservice.google.com
                https://googleads.g.doubleclick.net
                https://tpc.googlesyndication.com;
            `.replace(/\s{2,}/g, " "), // Clean whitespace
          },
        ],
      },
    ];
  },
};

export default nextConfig;
