import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const nextConfig = readFileSync("next.config.ts", "utf8");

describe("Square Content Security Policy", () => {
  it("scopes the policy to registration routes", () => {
    expect(nextConfig).toContain('source: "/register/:path*"');
    expect(nextConfig).toContain('key: "Content-Security-Policy"');
  });

  it("supports the configured Sandbox and production Square origins", () => {
    expect(nextConfig).toContain("https://sandbox.web.squarecdn.com");
    expect(nextConfig).toContain("https://pci-connect.squareupsandbox.com");
    expect(nextConfig).toContain("https://web.squarecdn.com");
    expect(nextConfig).toContain("https://pci-connect.squareup.com");
    expect(nextConfig).toContain('process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase()');
  });

  it("keeps restrictive defaults around the vendor-specific allowances", () => {
    expect(nextConfig).toContain("default-src 'self'");
    expect(nextConfig).toContain("object-src 'none'");
    expect(nextConfig).toContain("form-action 'self'");
    expect(nextConfig).toContain("frame-ancestors 'self'");
    expect(nextConfig).toContain('process.env.NODE_ENV === "development"');
  });
});
