// lib/metadata.ts
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { EntityType } from "@/lib/hooks/useProperties";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.earthdesignengineeringltd.com";
const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "Earth Design Engineering Ltd";

// ── Route mapping ──────────────────────────────────────────
const ENTITY_CONFIG: Record<
  EntityType,
  {
    routePrefix: string;
    defaultTitle: string;
    defaultDescription: string;
    notFoundTitle: string;
  }
> = {
  BATIMENT: {
    routePrefix: "properties",
    defaultTitle: "Property",
    defaultDescription: "Discover this property available in Cameroon",
    notFoundTitle: "Property Not Found",
  },
  PARCELLE: {
    routePrefix: "lands",
    defaultTitle: "Land",
    defaultDescription: "Discover this land available in Cameroon",
    notFoundTitle: "Land Not Found",
  },
  LOTISSEMENT: {
    routePrefix: "estates",
    defaultTitle: "Estate",
    defaultDescription: "Discover this estate available in Cameroon",
    notFoundTitle: "Estate Not Found",
  },
};

// ── Helpers ─────────────────────────────────────────────────
function getImages(
  media?: { url: string; type: string; isPrimary: boolean; order: number }[],
): string[] {
  if (!media?.length) return [];
  return media
    .filter((m) => m.type === "image")
    .sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.order - b.order;
    })
    .map((m) => m.url);
}

function formatPriceShort(price: any, currency = "XAF"): string | null {
  if (price == null || price === "") return null;
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num) || num <= 0) return null;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B ${currency}`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(0)}M ${currency}`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K ${currency}`;
  return `${num.toLocaleString("fr-CM")} ${currency}`;
}

// ── Core metadata builder ──────────────────────────────────
function buildMetadata({
  entityType,
  title,
  description,
  url,
  images,
}: {
  entityType: EntityType;
  title: string;
  description: string;
  url: string;
  images: string[];
}): Metadata {
  const ogImages =
    images.length > 0
      ? images.slice(0, 4).map((img) => ({
          url: img,
          width: 1200,
          height: 630,
          alt: title,
        }))
      : [
          {
            url: `${SITE_URL}/og-default.jpg`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ];

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "fr_CM",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images[0] ? [images[0]] : [],
    },
  };
}

// ── Batiment (Properties) ──────────────────────────────────
export async function generateBatimentMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = ENTITY_CONFIG.BATIMENT;

  try {
    const isNumeric = /^\d+$/.test(slug);

    const batiment = await prisma.batiment.findFirst({
      where: isNumeric ? { Id_Bat: parseInt(slug) } : { slug },
      select: {
        Id_Bat: true,
        title: true,
        slug: true,
        shortDescription: true,
        description: true,
        propertyType: true,
        listingType: true,
        price: true,
        currency: true,
        surfaceArea: true,
        bedrooms: true,
        bathrooms: true,
        address: true,
        media: {
          where: { type: "image" },
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
          take: 4,
          select: { url: true, type: true, isPrimary: true, order: true },
        },
      },
    });

    if (!batiment) return { title: config.notFoundTitle };

    const title = batiment.title || config.defaultTitle;
    const images = getImages(batiment.media);
    const url = `${SITE_URL}/${config.routePrefix}/${batiment.slug || batiment.Id_Bat}`;

    // Build rich description
    let description = batiment.shortDescription || "";
    if (!description) {
      const parts: string[] = [];
      if (batiment.propertyType)
        parts.push(batiment.propertyType.replace(/_/g, " "));
      if (batiment.listingType === "SALE") parts.push("for sale");
      if (batiment.listingType === "RENT") parts.push("for rent");
      const price = formatPriceShort(batiment.price, batiment.currency);
      if (price) parts.push(`at ${price}`);
      const features: string[] = [];
      if (batiment.bedrooms) features.push(`${batiment.bedrooms} bed`);
      if (batiment.bathrooms) features.push(`${batiment.bathrooms} bath`);
      if (batiment.surfaceArea) features.push(`${batiment.surfaceArea} m²`);
      if (features.length) parts.push(`— ${features.join(", ")}`);
      if (batiment.address) parts.push(`in ${batiment.address}`);
      description =
        parts.length > 0
          ? parts.join(" ").replace(/^\w/, (c) => c.toUpperCase())
          : config.defaultDescription;
    }

    return buildMetadata({
      entityType: "BATIMENT",
      title,
      description,
      url,
      images,
    });
  } catch (error) {
    console.error("Error generating batiment metadata:", error);
    return { title: config.defaultTitle };
  }
}

// ── Parcelle (Lands) ───────────────────────────────────────
export async function generateParcelleMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = ENTITY_CONFIG.PARCELLE;

  try {
    const isNumeric = /^\d+$/.test(slug);

    const parcelle = await prisma.parcelle.findFirst({
      where: isNumeric ? { Id_Parcel: parseInt(slug) } : { slug },
      select: {
        Id_Parcel: true,
        title: true,
        slug: true,
        shortDescription: true,
        Sup: true,
        Lieu_dit: true,
        listingType: true,
        price: true,
        currency: true,
        media: {
          where: { type: "image" },
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
          take: 4,
          select: { url: true, type: true, isPrimary: true, order: true },
        },
      },
    });

    if (!parcelle) return { title: config.notFoundTitle };

    const title = parcelle.title || config.defaultTitle;
    const images = getImages(parcelle.media);
    const url = `${SITE_URL}/${config.routePrefix}/${parcelle.slug || parcelle.Id_Parcel}`;

    let description = parcelle.shortDescription || "";
    if (!description) {
      const parts: string[] = [];
      if (parcelle.Sup) parts.push(`${parcelle.Sup} m² land`);
      else parts.push("Land");
      if (parcelle.listingType === "SALE") parts.push("for sale");
      if (parcelle.listingType === "RENT") parts.push("for rent");
      const price = formatPriceShort(parcelle.price, parcelle.currency);
      if (price) parts.push(`at ${price}`);
      if (parcelle.Lieu_dit) parts.push(`in ${parcelle.Lieu_dit}`);
      description =
        parts.length > 1
          ? parts.join(" ").replace(/^\w/, (c) => c.toUpperCase())
          : config.defaultDescription;
    }

    return buildMetadata({
      entityType: "PARCELLE",
      title,
      description,
      url,
      images,
    });
  } catch (error) {
    console.error("Error generating parcelle metadata:", error);
    return { title: config.defaultTitle };
  }
}

// ── Lotissement (Estates) ──────────────────────────────────
export async function generateLotissementMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = ENTITY_CONFIG.LOTISSEMENT;

  try {
    const isNumeric = /^\d+$/.test(slug);

    const lotissement = await prisma.lotissement.findFirst({
      where: isNumeric ? { Id_Lotis: parseInt(slug) } : { slug },
      select: {
        Id_Lotis: true,
        title: true,
        slug: true,
        shortDescription: true,
        Surface: true,
        Nbre_lots: true,
        Lieudit: true,
        listingType: true,
        price: true,
        currency: true,
        media: {
          where: { type: "image" },
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
          take: 4,
          select: { url: true, type: true, isPrimary: true, order: true },
        },
      },
    });

    if (!lotissement) return { title: config.notFoundTitle };

    const title = lotissement.title || config.defaultTitle;
    const images = getImages(lotissement.media);
    const url = `${SITE_URL}/${config.routePrefix}/${lotissement.slug || lotissement.Id_Lotis}`;

    let description = lotissement.shortDescription || "";
    if (!description) {
      const parts: string[] = [];
      if (lotissement.Surface) parts.push(`${lotissement.Surface} m² estate`);
      else parts.push("Estate");
      if (lotissement.Nbre_lots)
        parts.push(`with ${lotissement.Nbre_lots} lots`);
      const price = formatPriceShort(lotissement.price, lotissement.currency);
      if (price) parts.push(`at ${price}`);
      if (lotissement.Lieudit) parts.push(`in ${lotissement.Lieudit}`);
      description =
        parts.length > 1
          ? parts.join(" ").replace(/^\w/, (c) => c.toUpperCase())
          : config.defaultDescription;
    }

    return buildMetadata({
      entityType: "LOTISSEMENT",
      title,
      description,
      url,
      images,
    });
  } catch (error) {
    console.error("Error generating lotissement metadata:", error);
    return { title: config.defaultTitle };
  }
}

// ── Static pages helper ────────────────────────────────────
export function generateStaticMetadata({
  title,
  description,
  path = "",
  image,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "fr_CM",
      images: [
        {
          url: image || `${SITE_URL}/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image || `${SITE_URL}/og-default.jpg`],
    },
  };
}
