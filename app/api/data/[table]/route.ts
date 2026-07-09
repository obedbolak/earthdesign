// app/api/data/[table]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";

/* =========================================================
 * 1. Whitelist of allowed tables
 * ========================================================= */
const modelMap: Record<string, keyof typeof prisma> = {
  // Geographic
  region: "region",
  departement: "departement",
  arrondissement: "arrondissement",

  // Main listings
  lotissement: "lotissement",
  parcelle: "parcelle",
  batiment: "batiment",

  // Infrastructure
  route: "route",
  riviere: "riviere",
  taxe_immobiliere: "taxe_immobiliere",
  equipement: "equipement",
  reseau_energetique: "reseau_energetique",
  reseau_en_eau: "reseau_en_eau",
  infrastructure: "infrastructure",
  borne: "borne",

  // Media & Interactions
  media: "media",
  favorite: "favorite",
  share: "share",
  view: "view",

  // Users
  user: "user",
};

/* =========================================================
 * 2. Primary-key column names
 * ========================================================= */
const primaryKeyMap: Record<string, string> = {
  region: "Id_Reg",
  departement: "Id_Dept",
  arrondissement: "Id_Arrond",
  lotissement: "Id_Lotis",
  parcelle: "Id_Parcel",
  batiment: "Id_Bat",
  route: "Id_Rte",
  riviere: "Id_Riv",
  taxe_immobiliere: "Id_Taxe",
  equipement: "Id_Equip",
  reseau_energetique: "Id_Reseaux",
  reseau_en_eau: "Id_Reseaux",
  infrastructure: "Id_Infras",
  borne: "Id_Borne",
  media: "id",
  favorite: "id",
  share: "id",
  view: "id",
  user: "id",
};

/* =========================================================
 * 3. Tables that require authentication to modify
 * ========================================================= */
const PROTECTED_TABLES = ["lotissement", "parcelle", "batiment", "media"];
const LISTING_TABLES = ["lotissement", "parcelle", "batiment"];
const ADMIN_ONLY_TABLES = ["user"];

/* =========================================================
 * 4. Include configurations for related data
 * ========================================================= */
function getIncludeConfig(table: string, isDetail: boolean = false) {
  const configs: Record<string, object> = {
    // Geographic hierarchy
    region: {
      _count: { select: { departements: true } },
    },
    departement: {
      region: true,
      _count: { select: { arrondissements: true } },
    },
    arrondissement: {
      departement: {
        include: { region: true },
      },
      _count: { select: { lotissements: true } },
    },

    // Lotissement
    lotissement: {
      arrondissement: {
        include: {
          departement: {
            include: { region: true },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          whatsapp: true,
          agencyName: true,
          agencyLogo: true,
          isVerified: true,
        },
      },
      media: {
        orderBy: { order: "asc" },
        take: isDetail ? 20 : 5,
      },
      _count: {
        select: {
          parcelles: true,
          favorites: true,
          views: true,
          shares: true,
        },
      },
    },

    // Parcelle
    parcelle: {
      lotissement: {
        include: {
          arrondissement: {
            include: {
              departement: {
                include: { region: true },
              },
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          whatsapp: true,
          agencyName: true,
          agencyLogo: true,
          isVerified: true,
        },
      },
      media: {
        orderBy: { order: "asc" },
        take: isDetail ? 20 : 5,
      },
      _count: {
        select: {
          batiments: true,
          favorites: true,
          views: true,
          shares: true,
        },
      },
      ...(isDetail && {
        trouvrs: { include: { infrastructure: true } },
        desservirs: { include: { route: true } },
        contenirs: { include: { borne: true } },
      }),
    },

    // Batiment
    batiment: {
      parcelle: {
        include: {
          lotissement: {
            include: {
              arrondissement: {
                include: {
                  departement: {
                    include: { region: true },
                  },
                },
              },
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          whatsapp: true,
          agencyName: true,
          agencyLogo: true,
          isVerified: true,
        },
      },
      media: {
        orderBy: { order: "asc" },
        take: isDetail ? 20 : 10,
      },
      _count: {
        select: {
          favorites: true,
          views: true,
          shares: true,
        },
      },
      ...(isDetail && {
        alimenters: { include: { reseauEnergetique: true } },
        approvisionners: { include: { reseauEnEau: true } },
      }),
    },

    // Infrastructure
    infrastructure: {
      media: true,
      _count: { select: { trouvrs: true } },
    },

    // Media
    media: {
      lotissement: { select: { Id_Lotis: true, title: true } },
      parcelle: { select: { Id_Parcel: true, title: true } },
      batiment: { select: { Id_Bat: true, title: true } },
      infrastructure: { select: { Id_Infras: true, Nom_infras: true } },
    },

    // Favorite
    favorite: {
      user: { select: { id: true, name: true, email: true } },
      lotissement: { select: { Id_Lotis: true, title: true, slug: true } },
      parcelle: { select: { Id_Parcel: true, title: true, slug: true } },
      batiment: { select: { Id_Bat: true, title: true, slug: true } },
    },

    // User
    user: {
      _count: {
        select: {
          lotissements: true,
          parcelles: true,
          batiments: true,
          favorites: true,
        },
      },
    },
  };

  return configs[table];
}

/* =========================================================
 * 5. Build where clause for listings
 * ========================================================= */
function buildWhereClause(table: string, params: URLSearchParams): any {
  const where: any = {};

  // Common listing filters
  if (LISTING_TABLES.includes(table)) {
    const status = params.get("status");
    const listingType = params.get("listingType");
    const category = params.get("category");
    const featured = params.get("featured");
    const createdById = params.get("createdById");
    const minPrice = params.get("minPrice");
    const maxPrice = params.get("maxPrice");
    const search = params.get("search");

    if (status) {
      where.listingStatus = status.toUpperCase();
    }
    if (listingType) {
      where.listingType = listingType.toUpperCase();
    }
    if (category) {
      where.category = category.toUpperCase();
    }
    if (featured === "true") {
      where.featured = true;
    }
    if (createdById) {
      where.createdById = createdById;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = new Prisma.Decimal(minPrice);
      if (maxPrice) where.price.lte = new Prisma.Decimal(maxPrice);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
  }

  // Lotissement specific
  if (table === "lotissement") {
    const arrondissement = params.get("arrondissement");
    const departement = params.get("departement");
    const region = params.get("region");
    const minSurface = params.get("minSurface");
    const maxSurface = params.get("maxSurface");

    if (arrondissement) {
      where.Id_Arrond = parseInt(arrondissement);
    }
    if (departement) {
      where.arrondissement = { Id_Dept: parseInt(departement) };
    }
    if (region) {
      where.arrondissement = {
        departement: { Id_Reg: parseInt(region) },
      };
    }
    if (minSurface || maxSurface) {
      where.Surface = {};
      if (minSurface) where.Surface.gte = parseFloat(minSurface);
      if (maxSurface) where.Surface.lte = parseFloat(maxSurface);
    }

    // Extend search fields
    const search = params.get("search");
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { Lieudit: { contains: search, mode: "insensitive" } },
        { Nom_proprio: { contains: search, mode: "insensitive" } },
        { Num_TF: { contains: search, mode: "insensitive" } },
      ];
    }
  }

  // Parcelle specific
  if (table === "parcelle") {
    const lotissement = params.get("lotissement");
    const arrondissement = params.get("arrondissement");
    const departement = params.get("departement");
    const region = params.get("region");
    const isForDevelopment = params.get("isForDevelopment");
    const minSurface = params.get("minSurface");
    const maxSurface = params.get("maxSurface");

    if (lotissement) {
      where.Id_Lotis = parseInt(lotissement);
    }
    if (arrondissement) {
      where.lotissement = { Id_Arrond: parseInt(arrondissement) };
    }
    if (departement) {
      where.lotissement = {
        arrondissement: { Id_Dept: parseInt(departement) },
      };
    }
    if (region) {
      where.lotissement = {
        arrondissement: {
          departement: { Id_Reg: parseInt(region) },
        },
      };
    }
    if (isForDevelopment === "true") {
      where.isForDevelopment = true;
    }
    if (minSurface || maxSurface) {
      where.Sup = {};
      if (minSurface) where.Sup.gte = parseFloat(minSurface);
      if (maxSurface) where.Sup.lte = parseFloat(maxSurface);
    }

    // Extend search fields
    const search = params.get("search");
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { Lieu_dit: { contains: search, mode: "insensitive" } },
        { Nom_Prop: { contains: search, mode: "insensitive" } },
        { TF_Cree: { contains: search, mode: "insensitive" } },
        { Num_lot: { contains: search, mode: "insensitive" } },
      ];
    }
  }

  // Batiment specific
  if (table === "batiment") {
    const propertyType = params.get("propertyType");
    const parcelle = params.get("parcelle");
    const lotissement = params.get("lotissement");
    const arrondissement = params.get("arrondissement");
    const departement = params.get("departement");
    const region = params.get("region");
    const bedrooms = params.get("bedrooms");
    const bathrooms = params.get("bathrooms");
    const minSurface = params.get("minSurface");
    const maxSurface = params.get("maxSurface");
    const minRent = params.get("minRent");
    const maxRent = params.get("maxRent");
    const amenities = params.get("amenities");

    if (propertyType) {
      where.propertyType = propertyType.toUpperCase();
    }
    if (parcelle) {
      where.Id_Parcel = parseInt(parcelle);
    }
    if (lotissement) {
      where.parcelle = { Id_Lotis: parseInt(lotissement) };
    }
    if (arrondissement) {
      where.parcelle = {
        lotissement: { Id_Arrond: parseInt(arrondissement) },
      };
    }
    if (departement) {
      where.parcelle = {
        lotissement: {
          arrondissement: { Id_Dept: parseInt(departement) },
        },
      };
    }
    if (region) {
      where.parcelle = {
        lotissement: {
          arrondissement: {
            departement: { Id_Reg: parseInt(region) },
          },
        },
      };
    }
    if (bedrooms) {
      where.bedrooms = { gte: parseInt(bedrooms) };
    }
    if (bathrooms) {
      where.bathrooms = { gte: parseInt(bathrooms) };
    }
    if (minSurface || maxSurface) {
      where.surfaceArea = {};
      if (minSurface) where.surfaceArea.gte = parseFloat(minSurface);
      if (maxSurface) where.surfaceArea.lte = parseFloat(maxSurface);
    }
    if (minRent || maxRent) {
      where.rentPrice = {};
      if (minRent) where.rentPrice.gte = new Prisma.Decimal(minRent);
      if (maxRent) where.rentPrice.lte = new Prisma.Decimal(maxRent);
    }

    // Amenities filter
    if (amenities) {
      const amenityList = amenities.split(",");
      const amenityFilters: any[] = [];

      amenityList.forEach((amenity) => {
        const key = amenity.trim().toLowerCase();
        const amenityMap: Record<string, string> = {
          parking: "hasParking",
          pool: "hasPool",
          garden: "hasGarden",
          security: "hasSecurity",
          generator: "hasGenerator",
          elevator: "hasElevator",
          ac: "hasAirConditioning",
          airconditioning: "hasAirConditioning",
          furnished: "hasFurnished",
          balcony: "hasBalcony",
          terrace: "hasTerrace",
        };

        if (amenityMap[key]) {
          amenityFilters.push({ [amenityMap[key]]: true });
        }
      });

      if (amenityFilters.length > 0) {
        where.AND = [...(where.AND || []), ...amenityFilters];
      }
    }

    // Extend search fields
    const search = params.get("search");
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { Nom: { contains: search, mode: "insensitive" } },
      ];
    }
  }

  return where;
}

/* =========================================================
 * 6. Build orderBy clause
 * ========================================================= */
function buildOrderBy(table: string, params: URLSearchParams): any[] {
  const sortBy = params.get("sortBy") || "createdAt";
  const sortOrder = params.get("sortOrder") || "desc";
  const primaryKey = primaryKeyMap[table];

  const orderBy: any[] = [];

  // Featured first for listings
  if (LISTING_TABLES.includes(table)) {
    orderBy.push({ featured: "desc" });
  }

  // Valid sort fields per table
  const validSortFields: Record<string, string[]> = {
    lotissement: [
      "createdAt",
      "updatedAt",
      "price",
      "Surface",
      "viewCount",
      "favoriteCount",
    ],
    parcelle: [
      "createdAt",
      "updatedAt",
      "price",
      "Sup",
      "viewCount",
      "favoriteCount",
    ],
    batiment: [
      "createdAt",
      "updatedAt",
      "price",
      "rentPrice",
      "surfaceArea",
      "bedrooms",
      "viewCount",
      "favoriteCount",
    ],
    default: ["createdAt", "updatedAt"],
  };

  const allowedFields = validSortFields[table] || validSortFields.default;

  if (allowedFields.includes(sortBy)) {
    orderBy.push({ [sortBy]: sortOrder === "asc" ? "asc" : "desc" });
  } else {
    orderBy.push({ [primaryKey]: "asc" });
  }

  return orderBy;
}

/* =========================================================
 * 7. Helper functions
 * ========================================================= */
function coerceId(idStr: string, table: string): string | number {
  const pk = primaryKeyMap[table];
  if (pk === "id" && idStr.includes("-")) {
    return idStr; // UUID
  }
  return parseInt(idStr);
}

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 100) +
    "-" +
    Date.now().toString(36)
  );
}

async function checkAuth(
  table: string,
  action: "create" | "update" | "delete",
  recordCreatorId?: string | null,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { authorized: false, error: "Authentication required", status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user) {
    return { authorized: false, error: "User not found", status: 401 };
  }

  // Admin-only tables
  if (ADMIN_ONLY_TABLES.includes(table) && user.role !== "ADMIN") {
    return { authorized: false, error: "Admin access required", status: 403 };
  }

  // Protected tables (listings)
  if (PROTECTED_TABLES.includes(table)) {
    // Create: Agent or Admin only
    if (action === "create" && !["AGENT", "ADMIN"].includes(user.role)) {
      return {
        authorized: false,
        error: "Only agents and admins can create listings",
        status: 403,
      };
    }

    // Update/Delete: Owner or Admin only
    if ((action === "update" || action === "delete") && recordCreatorId) {
      const isOwner = recordCreatorId === user.id;
      const isAdmin = user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        return {
          authorized: false,
          error: "You can only modify your own listings",
          status: 403,
        };
      }
    }
  }

  return { authorized: true, user };
}

/* =========================================================
 * 8. GET - Fetch records
 * ========================================================= */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ table: string }> },
) {
  try {
    const { table } = await params;
    const url = new URL(request.url);

    if (!table) {
      return NextResponse.json(
        { error: "No table specified" },
        { status: 400 },
      );
    }

    const tableLower = table.toLowerCase();
    const modelName = modelMap[tableLower];
    const primaryKey = primaryKeyMap[tableLower];

    if (!modelName || !primaryKey) {
      return NextResponse.json(
        { error: `Invalid table: ${table}` },
        { status: 400 },
      );
    }

    const model = (prisma as any)[modelName];

    // Parse common params
    const id = url.searchParams.get("id");
    const slug = url.searchParams.get("slug");
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset");

    // Single record by ID
    if (id) {
      const record = await model.findUnique({
        where: { [primaryKey]: coerceId(id, tableLower) },
        include: getIncludeConfig(tableLower, true),
      });

      if (!record) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 },
        );
      }

      // Increment view count for listings
      if (LISTING_TABLES.includes(tableLower)) {
        await model.update({
          where: { [primaryKey]: coerceId(id, tableLower) },
          data: { viewCount: { increment: 1 } },
        });
      }

      return NextResponse.json({ data: record });
    }

    // Single record by slug (listings only)
    if (slug && LISTING_TABLES.includes(tableLower)) {
      const record = await model.findUnique({
        where: { slug },
        include: getIncludeConfig(tableLower, true),
      });

      if (!record) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 },
        );
      }

      // Increment view count
      await model.update({
        where: { slug },
        data: { viewCount: { increment: 1 } },
      });

      return NextResponse.json({ data: record });
    }

    // Build query
    const where = buildWhereClause(tableLower, url.searchParams);
    const orderBy = buildOrderBy(tableLower, url.searchParams);
    const take = limit ? parseInt(limit) : 20;
    const skip = offset ? parseInt(offset) : 0;

    // Fetch records and count
    const [records, total] = await Promise.all([
      model.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: getIncludeConfig(tableLower, false),
        orderBy,
        take,
        skip,
      }),
      model.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    return NextResponse.json({
      data: records,
      count: records.length,
      total,
      pagination: {
        limit: take,
        offset: skip,
        hasMore: skip + records.length < total,
      },
    });
  } catch (error) {
    console.error("[API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: (error as Error).message },
      { status: 500 },
    );
  }
}

/* =========================================================
 * 9. POST - Create record
 * ========================================================= */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> },
) {
  try {
    const { table } = await params;

    if (!table) {
      return NextResponse.json(
        { error: "No table specified" },
        { status: 400 },
      );
    }

    const tableLower = table.toLowerCase();
    const modelName = modelMap[tableLower];

    if (!modelName) {
      return NextResponse.json(
        { error: `Invalid table: ${table}` },
        { status: 400 },
      );
    }

    // Check authorization
    if (
      PROTECTED_TABLES.includes(tableLower) ||
      ADMIN_ONLY_TABLES.includes(tableLower)
    ) {
      const auth = await checkAuth(tableLower, "create");
      if (!auth.authorized) {
        return NextResponse.json(
          { error: auth.error },
          { status: auth.status },
        );
      }

      const body = await request.json();
      const model = (prisma as any)[modelName];

      // Add creator ID for listings
      if (LISTING_TABLES.includes(tableLower) && auth.user) {
        body.createdById = auth.user.id;
      }

      // Generate slug if not provided
      if (LISTING_TABLES.includes(tableLower) && !body.slug && body.title) {
        body.slug = generateSlug(body.title);
      }

      // Set default status
      if (LISTING_TABLES.includes(tableLower) && !body.listingStatus) {
        body.listingStatus = "DRAFT";
      }

      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(body).filter(([_, v]) => v !== undefined),
      );

      const record = await model.create({
        data: cleanData,
        include: getIncludeConfig(tableLower, false),
      });

      return NextResponse.json({ data: record }, { status: 201 });
    }

    // Non-protected tables
    const body = await request.json();
    const model = (prisma as any)[modelName];

    const cleanData = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== undefined),
    );

    const record = await model.create({
      data: cleanData,
      include: getIncludeConfig(tableLower, false),
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("[API] POST error:", error);

    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "A record with this unique value already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create record", details: (error as Error).message },
      { status: 500 },
    );
  }
}

/* =========================================================
 * 10. PATCH - Update record
 * ========================================================= */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ table: string }> },
) {
  try {
    const { table } = await params;
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!table || !id) {
      return NextResponse.json(
        { error: "Table and ID are required" },
        { status: 400 },
      );
    }

    const tableLower = table.toLowerCase();
    const modelName = modelMap[tableLower];
    const primaryKey = primaryKeyMap[tableLower];

    if (!modelName || !primaryKey) {
      return NextResponse.json(
        { error: `Invalid table: ${table}` },
        { status: 400 },
      );
    }

    const model = (prisma as any)[modelName];

    // Check if record exists and get creator
    const existing = await model.findUnique({
      where: { [primaryKey]: coerceId(id, tableLower) },
      select: LISTING_TABLES.includes(tableLower)
        ? { createdById: true }
        : { [primaryKey]: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Check authorization
    if (
      PROTECTED_TABLES.includes(tableLower) ||
      ADMIN_ONLY_TABLES.includes(tableLower)
    ) {
      const auth = await checkAuth(tableLower, "update", existing.createdById);
      if (!auth.authorized) {
        return NextResponse.json(
          { error: auth.error },
          { status: auth.status },
        );
      }
    }

    const body = await request.json();

    // Remove fields that shouldn't be updated
    delete body[primaryKey];
    delete body.createdById;
    delete body.createdAt;
    if (LISTING_TABLES.includes(tableLower)) {
      delete body.viewCount;
      delete body.favoriteCount;
      delete body.shareCount;
    }

    const cleanData = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== undefined),
    );

    const record = await model.update({
      where: { [primaryKey]: coerceId(id, tableLower) },
      data: cleanData,
      include: getIncludeConfig(tableLower, false),
    });

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("[API] PATCH error:", error);

    if ((error as any).code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update record", details: (error as Error).message },
      { status: 500 },
    );
  }
}

/* =========================================================
 * 11. DELETE - Delete record
 * ========================================================= */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string }> },
) {
  try {
    const { table } = await params;
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!table || !id) {
      return NextResponse.json(
        { error: "Table and ID are required" },
        { status: 400 },
      );
    }

    const tableLower = table.toLowerCase();
    const modelName = modelMap[tableLower];
    const primaryKey = primaryKeyMap[tableLower];

    if (!modelName || !primaryKey) {
      return NextResponse.json(
        { error: `Invalid table: ${table}` },
        { status: 400 },
      );
    }

    const model = (prisma as any)[modelName];

    // Check if record exists and get creator
    const existing = await model.findUnique({
      where: { [primaryKey]: coerceId(id, tableLower) },
      select: LISTING_TABLES.includes(tableLower)
        ? { createdById: true }
        : { [primaryKey]: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Check authorization
    if (
      PROTECTED_TABLES.includes(tableLower) ||
      ADMIN_ONLY_TABLES.includes(tableLower)
    ) {
      const auth = await checkAuth(tableLower, "delete", existing.createdById);
      if (!auth.authorized) {
        return NextResponse.json(
          { error: auth.error },
          { status: auth.status },
        );
      }
    }

    await model.delete({
      where: { [primaryKey]: coerceId(id, tableLower) },
    });

    return NextResponse.json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("[API] DELETE error:", error);

    if ((error as any).code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if ((error as any).code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete: record is referenced by other data" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete record", details: (error as Error).message },
      { status: 500 },
    );
  }
}
