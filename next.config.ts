import type { NextConfig } from "next";

function configuredSupabaseImagePatterns(): Array<{
  protocol: "https";
  hostname: string;
  pathname: "/storage/v1/object/public/**";
}> {
  const configuredUrls = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
  ];
  const patterns = new Map<string, {
    protocol: "https";
    hostname: string;
    pathname: "/storage/v1/object/public/**";
  }>();

  for (const configuredUrl of configuredUrls) {
    if (!configuredUrl?.trim()) continue;
    try {
      const url = new URL(configuredUrl.trim());
      if (url.protocol !== "https:") continue;
      patterns.set(
        url.hostname,
        {
          protocol: "https",
          hostname: url.hostname,
          pathname: "/storage/v1/object/public/**",
        },
      );
    } catch {
      // Supabase configuration validation reports malformed URLs elsewhere.
    }
  }

  return [...patterns.values()];
}

const squareEnvironment = process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase() === "production"
  ? "production"
  : "sandbox";
const squareCdnHost = squareEnvironment === "production"
  ? "https://web.squarecdn.com"
  : "https://sandbox.web.squarecdn.com";
const squareConnectHost = squareEnvironment === "production"
  ? "https://pci-connect.squareup.com"
  : "https://pci-connect.squareupsandbox.com";

const squareContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} ${squareCdnHost}`,
  `frame-src 'self' ${squareCdnHost}`,
  `connect-src 'self' ${squareCdnHost} ${squareConnectHost} https://o160250.ingest.sentry.io`,
  `style-src 'self' 'unsafe-inline' ${squareCdnHost}`,
  "font-src 'self' data: https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
  `img-src 'self' data: blob: ${squareCdnHost}`,
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: configuredSupabaseImagePatterns(),
  },
  async headers() {
    return [
      {
        source: "/register/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: squareContentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
