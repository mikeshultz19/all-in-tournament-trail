import type { NextConfig } from "next";

const squareSandboxContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://sandbox.web.squarecdn.com`,
  "frame-src 'self' https://sandbox.web.squarecdn.com",
  "connect-src 'self' https://sandbox.web.squarecdn.com https://pci-connect.squareupsandbox.com https://o160250.ingest.sentry.io",
  "style-src 'self' 'unsafe-inline' https://sandbox.web.squarecdn.com",
  "font-src 'self' data: https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
  "img-src 'self' data: blob: https://sandbox.web.squarecdn.com",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/register/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: squareSandboxContentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
