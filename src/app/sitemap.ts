import { env } from "@/lib/env";

export const baseUrl = env.NEXT_PUBLIC_SITE_URL;

const sitemapRoutes = ["/", "/why", "/privacy", "/terms", "/llms.txt"];

export default async function sitemap() {
  const routes = sitemapRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return routes;
}
