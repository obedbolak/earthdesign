// app/api/properties/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/properties
 * Returns all Lotissements, Parcelles, Batiments combined into a unified format
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // optional: 'lotissement' | 'parcelle' | 'batiment' | 'all'
    const publishedOnly = searchParams.get('published') !== 'false';

    // Fetch from all tables in parallel
    const [lotissements, parcelles, batiments] = await Promise.all([
      // Lotissements
      (!source || source === 'all' || source === 'lotissement')
        ? prisma.lotissement.findMany({
            where: publishedOnly ? { published: true } : undefined,
            include: {
              arrondissement: {
                include: {
                  departement: {
                    include: {
                      region: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        : [],

      // Parcelles
      (!source || source === 'all' || source === 'parcelle')
        ? prisma.parcelle.findMany({
            where: publishedOnly ? { published: true } : undefined,
            include: {
              lotissement: {
                include: {
                  arrondissement: {
                    include: {
                      departement: {
                        include: {
                          region: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        : [],

      // Batiments - TEMPORARY (until migration is applied)
(!source || source === 'all' || source === 'batiment')
  ? prisma.batiment.findMany({
      include: {
        parcelle: {
          include: {
            lotissement: {
              include: {
                arrondissement: {
                  include: {
                    departement: {
                      include: {
                        region: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  : [],
    ]);

    // Transform to unified format
    const unifiedProperties = [
      ...transformLotissements(lotissements),
      ...transformParcelles(parcelles),
      ...transformBatiments(batiments),
    ];

    // Sort by createdAt descending
    unifiedProperties.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      count: unifiedProperties.length,
      data: unifiedProperties,
      breakdown: {
        lotissements: lotissements.length,
        parcelles: parcelles.length,
        batiments: batiments.length,
      },
    });
  } catch (error) {
    console.error('Error fetching unified properties:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch properties',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============ Transform Functions ============

function transformLotissements(lotissements: any[]): UnifiedProperty[] {
  return lotissements.map((l) => ({
    id: `lotissement-${l.Id_Lotis}`,
    numericId: l.Id_Lotis,
    source: 'lotissement' as const,
    title: l.Nom_proprio
      ? `Lotissement ${l.Nom_proprio}`
      : `Lotissement #${l.Id_Lotis}`,
    shortDescription:
      l.shortDescription || `${l.Nbre_lots || 0} lots disponibles`,
    description:
      l.description ||
      `Lotissement de ${l.Surface?.toFixed(0) || 'N/A'} m² avec ${l.Nbre_lots || 0} lots. ${l.Lieudit ? `Situé à ${l.Lieudit}` : ''}`,
    price: l.price ? Number(l.price) : 0,
    pricePerSqM: l.pricePerSqM ? Number(l.pricePerSqM) : null,
    currency: l.currency || 'XAF',
    type: 'Land' as const,
    forSale: l.forSale ?? true,
    forRent: l.forRent ?? false,
    rentPrice: l.rentPrice ? Number(l.rentPrice) : null,
    isLandForDevelopment: true,
    approvedForApartments: null,
    bedrooms: null,
    bathrooms: null,
    kitchens: null,
    livingRooms: null,
    hasGenerator: false,
    hasParking: false,
    parkingSpaces: null,
    hasElevator: null,
    totalUnits: null,
    floorLevel: null,
    totalFloors: null,
    surface: l.Surface,
    nbreLots: l.Nbre_lots,
    location: {
      lieudit: l.Lieudit,
      arrondissement: l.arrondissement?.Nom_Arrond || null,
      departement: l.arrondissement?.departement?.Nom_Dept || null,
      region: l.arrondissement?.departement?.region?.Nom_Reg || null,
    },
    imageUrl1: l.Image_URL_1,
    imageUrl2: l.Image_URL_2,
    imageUrl3: l.Image_URL_3,
    imageUrl4: l.Image_URL_4,
    imageUrl5: l.Image_URL_5,
    imageUrl6: l.Image_URL_6,
    videoUrl: l.Video_URL,
    published: l.published ?? true,
    featured: l.featured ?? false,
    createdAt: l.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: l.updatedAt?.toISOString() || new Date().toISOString(),
    _meta: {
      Num_TF: l.Num_TF,
      Statut: l.Statut,
      Date_approb: l.Date_approb,
      Nom_visa_lotis: l.Nom_visa_lotis,
      Geo_exe: l.Geo_exe,
    },
  }));
}

function transformParcelles(parcelles: any[]): UnifiedProperty[] {
  return parcelles.map((p) => ({
    id: `parcelle-${p.Id_Parcel}`,
    numericId: p.Id_Parcel,
    source: 'parcelle' as const,
    title: p.Nom_Prop
      ? `Parcelle ${p.Nom_Prop}`
      : `Parcelle #${p.Id_Parcel}`,
    shortDescription:
      p.shortDescription || `Terrain de ${p.Sup?.toFixed(0) || 'N/A'} m²`,
    description:
      p.description ||
      `Parcelle de ${p.Sup?.toFixed(0) || 'N/A'} m² située à ${p.Lieu_dit || 'emplacement non spécifié'}. ${p.Cloture ? 'Clôturée.' : ''} ${p.Mise_Val ? 'Mise en valeur.' : ''}`,
    price: p.price ? Number(p.price) : 0,
    pricePerSqM: p.pricePerSqM ? Number(p.pricePerSqM) : null,
    currency: p.currency || 'XAF',
    type: 'Land' as const,
    forSale: p.forSale ?? true,
    forRent: p.forRent ?? false,
    rentPrice: p.rentPrice ? Number(p.rentPrice) : null,
    isLandForDevelopment: true,
    approvedForApartments: null,
    bedrooms: null,
    bathrooms: null,
    kitchens: null,
    livingRooms: null,
    hasGenerator: false,
    hasParking: false,
    parkingSpaces: null,
    hasElevator: null,
    totalUnits: null,
    floorLevel: null,
    totalFloors: null,
    surface: p.Sup,
    nbreLots: null,
    location: {
      lieudit: p.Lieu_dit,
      arrondissement: p.lotissement?.arrondissement?.Nom_Arrond || null,
      departement: p.lotissement?.arrondissement?.departement?.Nom_Dept || null,
      region: p.lotissement?.arrondissement?.departement?.region?.Nom_Reg || null,
    },
    imageUrl1: p.Image_URL_1,
    imageUrl2: p.Image_URL_2,
    imageUrl3: p.Image_URL_3,
    imageUrl4: p.Image_URL_4,
    imageUrl5: p.Image_URL_5,
    imageUrl6: p.Image_URL_6,
    videoUrl: p.Video_URL,
    published: p.published ?? true,
    featured: p.featured ?? false,
    createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
    _meta: {
      TF_Mere: p.TF_Mere,
      TF_Cree: p.TF_Cree,
      Num_lot: p.Num_lot,
      Num_bloc: p.Num_bloc,
      Mise_Val: p.Mise_Val,
      Cloture: p.Cloture,
      Largeur_Rte: p.Largeur_Rte,
    },
  }));
}

function transformBatiments(batiments: any[]): UnifiedProperty[] {
  return batiments.map((b) => ({
    id: `batiment-${b.Id_Bat}`,
    numericId: b.Id_Bat,
    source: 'batiment' as const,
    title: b.Nom || `${b.Cat_Bat || 'Bâtiment'} #${b.Id_Bat}`,
    shortDescription: b.shortDescription || `${b.Cat_Bat || 'Bâtiment'} - ${b.Type_Usage || 'Usage mixte'}`,
    description: b.description || buildBatimentDescription(b),
    price: b.price ? Number(b.price) : 0,  // NOW USING BATIMENT PRICE
    pricePerSqM: b.pricePerSqM ? Number(b.pricePerSqM) : null,  // NOW USING BATIMENT PRICE PER SQM
    currency: b.currency || 'XAF',
    type: mapBatimentType(b.Cat_Bat, b.Type_Usage),
    forSale: b.forSale ?? false,  // NOW USING BATIMENT forSale
    forRent: b.forRent ?? false,  // NOW USING BATIMENT forRent
    rentPrice: b.rentPrice ? Number(b.rentPrice) : null,  // NOW USING BATIMENT rentPrice
    isLandForDevelopment: false,
    approvedForApartments: null,
    bedrooms: b.bedrooms,
    bathrooms: b.bathrooms,
    kitchens: b.kitchens,
    livingRooms: b.livingRooms,
    hasGenerator: b.hasGenerator ?? false,
    hasParking: b.hasParking ?? false,
    parkingSpaces: b.parkingSpaces,  // NEW
    hasElevator: b.hasElevator ?? false,  // NEW
    totalUnits: b.totalUnits,  // NEW
    floorLevel: null,
    totalFloors: b.totalFloors,
    surface: b.parcelle?.Sup || null,
    nbreLots: null,
    location: {
      lieudit: b.parcelle?.Lieu_dit || null,
      arrondissement: b.parcelle?.lotissement?.arrondissement?.Nom_Arrond || null,
      departement: b.parcelle?.lotissement?.arrondissement?.departement?.Nom_Dept || null,
      region: b.parcelle?.lotissement?.arrondissement?.departement?.region?.Nom_Reg || null,
    },
    imageUrl1: b.Image_URL_1,
    imageUrl2: b.Image_URL_2,
    imageUrl3: b.Image_URL_3,
    imageUrl4: b.Image_URL_4,
    imageUrl5: b.Image_URL_5,
    imageUrl6: b.Image_URL_6,
    videoUrl: b.Video_URL,
    published: b.published ?? true,  // NOW USING BATIMENT published
    featured: b.featured ?? false,  // NOW USING BATIMENT featured
    createdAt: b.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: b.updatedAt?.toISOString() || new Date().toISOString(),
    _meta: {
      Standing: b.Standing,
      Etat_Bat: b.Etat_Bat,
      No_Permis: b.No_Permis,
      Mat_Bati: b.Mat_Bati,
      parkingSpaces: b.parkingSpaces,
      hasElevator: b.hasElevator,
      totalUnits: b.totalUnits,
      Type_Lodg: b.Type_Lodg,
    },
  }));
}

function buildBatimentDescription(b: any): string {
  const parts: string[] = [];

  if (b.Cat_Bat) parts.push(b.Cat_Bat);
  if (b.Type_Usage) parts.push(`à usage ${b.Type_Usage.toLowerCase()}`);
  if (b.bedrooms) parts.push(`${b.bedrooms} chambre(s)`);
  if (b.bathrooms) parts.push(`${b.bathrooms} salle(s) de bain`);
  if (b.Standing) parts.push(`Standing: ${b.Standing}`);
  if (b.Etat_Bat) parts.push(`État: ${b.Etat_Bat}`);
  if (b.totalFloors) parts.push(`${b.totalFloors} étage(s)`);
  if (b.totalUnits) parts.push(`${b.totalUnits} unité(s)`);
  if (b.hasParking) parts.push('Parking disponible');
  if (b.parkingSpaces) parts.push(`${b.parkingSpaces} place(s) de parking`);
  if (b.hasGenerator) parts.push('Groupe électrogène');
  if (b.hasElevator) parts.push('Ascenseur');

  return parts.join('. ') || 'Bâtiment disponible';
}

function mapBatimentType(
  catBat: string | null,
  typeUsage: string | null
): 'Apartment' | 'House' | 'Villa' | 'Office' | 'Commercial' | 'Land' | 'Building' | 'Studio' | 'Duplex' {
  const cat = (catBat || '').toLowerCase();
  const usage = (typeUsage || '').toLowerCase();

  if (cat.includes('villa')) return 'Villa';
  if (cat.includes('apartment') || cat.includes('appartement')) return 'Apartment';
  if (cat.includes('studio')) return 'Studio';
  if (cat.includes('duplex')) return 'Duplex';
  if (cat.includes('house') || cat.includes('maison')) return 'House';
  if (usage.includes('commercial') || cat.includes('shop') || cat.includes('boutique')) return 'Commercial';
  if (usage.includes('office') || cat.includes('bureau')) return 'Office';
  if (cat.includes('building') || cat.includes('immeuble')) return 'Building';

  return 'Building';
}

// Type definition for the unified property
interface UnifiedProperty {
  id: string;
  numericId: number;
  source: 'lotissement' | 'parcelle' | 'batiment';
  title: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  pricePerSqM: number | null;
  currency: string;
  type: 'Apartment' | 'House' | 'Villa' | 'Office' | 'Commercial' | 'Land' | 'Building' | 'Studio' | 'Duplex';
  forSale: boolean;
  forRent: boolean;
  rentPrice: number | null;
  isLandForDevelopment: boolean;
  approvedForApartments: boolean | null;
  bedrooms: number | null;
  bathrooms: number | null;
  kitchens: number | null;
  livingRooms: number | null;
  hasGenerator: boolean;
  hasParking: boolean;
  parkingSpaces: number | null;  // NEW
  hasElevator: boolean | null;   // NEW
  totalUnits: number | null;     // NEW
  floorLevel: number | null;
  totalFloors: number | null;
  surface: number | null;
  nbreLots: number | null;
  location: {
    lieudit: string | null;
    arrondissement: string | null;
    departement: string | null;
    region: string | null;
  };
  imageUrl1: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  imageUrl4: string | null;
  imageUrl5: string | null;
  imageUrl6: string | null;
  videoUrl: string | null;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  _meta: Record<string, any>;
}