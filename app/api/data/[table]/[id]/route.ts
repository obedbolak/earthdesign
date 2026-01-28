// app/api/data/[table]/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/* =========================================================
 * 1. Model and Primary Key Maps
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
 * 2. Constants
 * ========================================================= */
const PROTECTED_TABLES = ["lotissement", "parcelle", "batiment", "media"];
const LISTING_TABLES = ["lotissement", "parcelle", "batiment"];
const ADMIN_ONLY_TABLES = ["user"];

// Fields that should never be updated directly
const PROTECTED_FIELDS = [
  "createdAt",
  "createdById",
  "viewCount",
  "favoriteCount",
  "shareCount",
];

/* =========================================================
 * 3. Include Configurations
 * ========================================================= */
function getIncludeConfig(table: string) {
  const configs: Record<string, object> = {
    region: {
      _count: { select: { departements: true } },
    },
    departement: {
      region: true,
      _count: { select: { arrondissements: true } },
    },
    arrondissement: {
      departement: { include: { region: true } },
      _count: { select: { lotissements: true } },
    },
    lotissement: {
      arrondissement: {
        include: {
          departement: { include: { region: true } },
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
      media: { orderBy: { order: "asc" } },
      _count: {
        select: {
          parcelles: true,
          favorites: true,
          views: true,
          shares: true,
        },
      },
    },
    parcelle: {
      lotissement: {
        include: {
          arrondissement: {
            include: {
              departement: { include: { region: true } },
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
      media: { orderBy: { order: "asc" } },
      trouvrs: { include: { infrastructure: true } },
      desservirs: { include: { route: true } },
      _count: {
        select: {
          batiments: true,
          favorites: true,
          views: true,
          shares: true,
        },
      },
    },
    batiment: {
      parcelle: {
        include: {
          lotissement: {
            include: {
              arrondissement: {
                include: {
                  departement: { include: { region: true } },
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
      media: { orderBy: { order: "asc" } },
      alimenters: { include: { reseauEnergetique: true } },
      approvisionners: { include: { reseauEnEau: true } },
      _count: {
        select: {
          favorites: true,
          views: true,
          shares: true,
        },
      },
    },
    infrastructure: {
      media: true,
      _count: { select: { trouvrs: true } },
    },
    media: {
      lotissement: { select: { Id_Lotis: true, title: true } },
      parcelle: { select: { Id_Parcel: true, title: true } },
      batiment: { select: { Id_Bat: true, title: true } },
      infrastructure: { select: { Id_Infras: true, Nom_infras: true } },
    },
    favorite: {
      user: { select: { id: true, name: true, email: true } },
      lotissement: { select: { Id_Lotis: true, title: true, slug: true } },
      parcelle: { select: { Id_Parcel: true, title: true, slug: true } },
      batiment: { select: { Id_Bat: true, title: true, slug: true } },
    },
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
 * 4. Helper Functions
 * ========================================================= */
function coerceId(idStr: string, table: string): string | number {
  const pk = primaryKeyMap[table];
  // UUID for user table
  if (pk === "id" && idStr.includes("-")) {
    return idStr;
  }
  return parseInt(idStr);
}

async function checkAuth(
  table: string,
  action: "read" | "update" | "delete",
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
  if (ADMIN_ONLY_TABLES.includes(table)) {
    if (user.role !== "ADMIN") {
      return { authorized: false, error: "Admin access required", status: 403 };
    }
    return { authorized: true, user };
  }

  // Protected tables (listings, media)
  if (PROTECTED_TABLES.includes(table)) {
    // Update/Delete: Owner or Admin only
    if ((action === "update" || action === "delete") && recordCreatorId) {
      const isOwner = recordCreatorId === user.id;
      const isAdmin = user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        return {
          authorized: false,
          error: "You can only modify your own content",
          status: 403,
        };
      }
    }
  }

  return { authorized: true, user };
}

/* =========================================================
 * 5. GET - Fetch single record by ID
 * ========================================================= */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ table: string; id: string }> },
) {
  try {
    const { table, id } = await params;

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
        { status: 404 },
      );
    }

    const model = (prisma as any)[modelName];

    const record = await model.findUnique({
      where: { [primaryKey]: coerceId(id, tableLower) },
      include: getIncludeConfig(tableLower),
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Increment view count for listings
    if (LISTING_TABLES.includes(tableLower)) {
      await model.update({
        where: { [primaryKey]: coerceId(id, tableLower) },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("[API] GET by ID error:", error);
    return NextResponse.json(
      { error: "Failed to fetch record", details: (error as Error).message },
      { status: 500 },
    );
  }
}

/* =========================================================
 * 6. PATCH - Update record
 * ========================================================= */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ table: string; id: string }> },
) {
  try {
    const { table, id } = await params;

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
        { status: 404 },
      );
    }

    const model = (prisma as any)[modelName];

    // Check if record exists
    const existing = await model.findUnique({
      where: { [primaryKey]: coerceId(id, tableLower) },
      select: LISTING_TABLES.includes(tableLower)
        ? { [primaryKey]: true, createdById: true }
        : { [primaryKey]: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Check authorization for protected tables
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

    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Remove protected fields and primary key
    const cleanData: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (
        key !== primaryKey &&
        !PROTECTED_FIELDS.includes(key) &&
        value !== undefined
      ) {
        cleanData[key] = value;
      }
    }

    // Update record
    const updated = await model.update({
      where: { [primaryKey]: coerceId(id, tableLower) },
      data: cleanData,
      include: getIncludeConfig(tableLower),
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[API] PATCH error:", error);

    if ((error as any).code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Unique constraint violation" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Update failed", details: (error as Error).message },
      { status: 500 },
    );
  }
}

/* =========================================================
 * 7. DELETE - Delete record
 * ========================================================= */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string; id: string }> },
) {
  try {
    const { table, id } = await params;

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
        { status: 404 },
      );
    }

    const model = (prisma as any)[modelName];

    // Check if record exists
    const existing = await model.findUnique({
      where: { [primaryKey]: coerceId(id, tableLower) },
      select: LISTING_TABLES.includes(tableLower)
        ? { [primaryKey]: true, createdById: true, title: true }
        : { [primaryKey]: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Check authorization for protected tables
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

    // Delete record
    await model.delete({
      where: { [primaryKey]: coerceId(id, tableLower) },
    });

    return NextResponse.json({
      success: true,
      message: `${tableLower} deleted successfully`,
      deleted: {
        id: coerceId(id, tableLower),
        ...(existing.title && { title: existing.title }),
      },
    });
  } catch (error) {
    console.error("[API] DELETE error:", error);

    if ((error as any).code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if ((error as any).code === "P2003") {
      return NextResponse.json(
        {
          error: "Cannot delete: record is referenced by other data",
          details: "Delete related records first or use cascade delete",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Delete failed", details: (error as Error).message },
      { status: 500 },
    );
  }
}

/* =========================================================
 * 8. PUT - Full replacement (optional, same as PATCH for now)
 * ========================================================= */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ table: string; id: string }> },
) {
  // Delegate to PATCH for now
  return PATCH(request, { params });
}
