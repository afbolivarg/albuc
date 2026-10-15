import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const coversHostname = process.env.NEXT_PUBLIC_COVERS_URL
  ? new URL(process.env.NEXT_PUBLIC_COVERS_URL).hostname
  : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        port: "",
        pathname: "/**",
      },
      ...(coversHostname
        ? [
            {
              protocol: "https" as const,
              hostname: coversHostname,
              port: "",
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
  transpilePackages: ["@mdxeditor/editor"],
};

export default withSerwist(nextConfig);
