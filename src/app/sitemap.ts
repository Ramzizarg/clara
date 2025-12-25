import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clara.shop";

  const productEntries: MetadataRoute.Sitemap = [];

  try {
    const products = await prisma.product.findMany({
      select: { id: true, updatedAt: true },
    });

    for (const product of products) {
      productEntries.push({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: product.updatedAt ?? new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // In case DB is not reachable during build/runtime, just skip product URLs
  }

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  return [...staticEntries, ...productEntries];
}
