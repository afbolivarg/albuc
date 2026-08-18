import { baseUrl } from "@/app/sitemap";

const excludedRoutes = ["/library", "/~offline", "/serwist"];

export default function robots() {
  const fullDisallowList = excludedRoutes.flatMap((route) => [
    route,
    `${route}/*`,
  ]);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: fullDisallowList,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
