// app/api/properties/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse the ID format: "source-numericId"
    const [source, numericIdStr] = id.split('-');
    const numericId = parseInt(numericIdStr);

    if (!source || isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID format. Expected: source-id (e.g., lotissement-1)' },
        { status: 400 }
      );
    }

    let property = null;

    switch (source) {
      case 'lotissement':
        const lotissement = await prisma.lotissement.findUnique({
          where: { Id_Lotis: numericId },
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
            parcelles: {
              take: 10,
              include: {
                batiments: true,
              },
            },
          },
        });
        if (lotissement) {
          property = transformLotissement(lotissement);
        }
        break;

      case 'parcelle':
        const parcelle = await prisma.parcelle.findUnique({
          where: { Id_Parcel: numericId },
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
            batiments: true,
          },
        });
        if (parcelle) {
          property = transformParcelle(parcelle);
        }
        break;

      case 'batiment':
        const batiment = await prisma.batiment.findUnique({
          where: { Id_Bat: numericId },
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
        });
        if (batiment) {
          property = transformBatiment(batiment);
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown source: ${source}` },
          { status: 400 }
        );
    }

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// Transform functions (same as in main route)
function transformLotissement(l: any) {
  return {
    id: `lotissement-${l.Id_Lotis}`,
    numericId: l.Id_Lotis,
    source: 'lotissement',
    title: l.Nom_proprio ? `Lotissement ${l.Nom_proprio}` : `Lotissement #${l.Id_Lotis}`,
    shortDescription: l.shortDescription || `${l.Nbre_lots || 0} lots disponibles`,
    description: l.description || `Lotissement de ${l.Surface?.toFixed(0) || 'N/A'} m² avec ${l.Nbre_lots || 0} lots`,
    price: l.price ? Number(l.price) : 0,
    pricePerSqM: l.pricePerSqM ? Number(l.pricePerSqM) : null,
    currency: l.currency || 'XAF',
    type: 'Land',
    forSale: l.forSale ?? true,
    forRent: l.forRent ?? false,
    rentPrice: l.rentPrice ? Number(l.rentPrice) : null,
    isLandForDevelopment: true,
    bedrooms: null,
    bathrooms: null,
    kitchens: null,
    livingRooms: null,
    hasGenerator: false,
    hasParking: false,
    totalFloors: null,
    surface: l.Surface,
    nbreLots: l.Nbre_lots,
    location: {
      lieudit: l.Lieudit,
      arrondissement: l.arrondissement?.Nom_Arrond,
      departement: l.arrondissement?.departement?.Nom_Dept,
      region: l.arrondissement?.departement?.region?.Nom_Reg,
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
    createdAt: l.createdAt?.toISOString(),
    updatedAt: l.updatedAt?.toISOString(),
    // Related data
    parcelles: l.parcelles?.map((p: any) => ({
      id: p.Id_Parcel,
      name: p.Nom_Prop,
      surface: p.Sup,
      batiments: p.batiments?.length || 0,
    })),
    _meta: {
      Num_TF: l.Num_TF,
      Statut: l.Statut,
      Date_approb: l.Date_approb,
      Nom_visa_lotis: l.Nom_visa_lotis,
    },
  };
}

function transformParcelle(p: any) {
  return {
    id: `parcelle-${p.Id_Parcel}`,
    numericId: p.Id_Parcel,
    source: 'parcelle',
    title: p.Nom_Prop ? `Parcelle ${p.Nom_Prop}` : `Parcelle #${p.Id_Parcel}`,
    shortDescription: p.shortDescription || `Terrain de ${p.Sup?.toFixed(0) || 'N/A'} m²`,
    description: p.description || `Parcelle située à ${p.Lieu_dit || 'emplacement non spécifié'}`,
    price: p.price ? Number(p.price) : 0,
    pricePerSqM: p.pricePerSqM ? Number(p.pricePerSqM) : null,
    currency: p.currency || 'XAF',
    type: 'Land',
    forSale: p.forSale ?? true,
    forRent: p.forRent ?? false,
    rentPrice: p.rentPrice ? Number(p.rentPrice) : null,
    isLandForDevelopment: true,
    bedrooms: null,
    bathrooms: null,
    kitchens: null,
    livingRooms: null,
    hasGenerator: false,
    hasParking: false,
    totalFloors: null,
    surface: p.Sup,
    nbreLots: null,
    location: {
      lieudit: p.Lieu_dit,
      arrondissement: p.lotissement?.arrondissement?.Nom_Arrond,
      departement: p.lotissement?.arrondissement?.departement?.Nom_Dept,
      region: p.lotissement?.arrondissement?.departement?.region?.Nom_Reg,
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
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
    // Related data
    batiments: p.batiments?.map((b: any) => ({
      id: b.Id_Bat,
      name: b.Nom,
      type: b.Cat_Bat,
      bedrooms: b.bedrooms,
    })),
    lotissement: p.lotissement ? {
      id: p.lotissement.Id_Lotis,
      name: p.lotissement.Nom_proprio,
    } : null,
    _meta: {
      TF_Mere: p.TF_Mere,
      TF_Cree: p.TF_Cree,
      Num_lot: p.Num_lot,
      Mise_Val: p.Mise_Val,
      Cloture: p.Cloture,
    },
  };
}

function transformBatiment(b: any) {
  return {
    id: `batiment-${b.Id_Bat}`,
    numericId: b.Id_Bat,
    source: 'batiment',
    title: b.Nom || `${b.Cat_Bat || 'Bâtiment'} #${b.Id_Bat}`,
    shortDescription: `${b.Cat_Bat || 'Bâtiment'} - ${b.Type_Usage || 'Usage mixte'}`,
    description: `${b.Cat_Bat || 'Bâtiment'} avec ${b.bedrooms || 0} chambres. ${b.Standing ? `Standing: ${b.Standing}` : ''}`,
    price: 0,
    pricePerSqM: null,
    currency: 'XAF',
    type: mapBatimentType(b.Cat_Bat, b.Type_Usage),
    forSale: b.Status?.toLowerCase().includes('sale') || false,
    forRent: b.Status?.toLowerCase().includes('rent') || false,
    rentPrice: null,
    isLandForDevelopment: false,
    bedrooms: b.bedrooms,
    bathrooms: b.bathrooms,
    kitchens: b.kitchens,
    livingRooms: b.livingRooms,
    hasGenerator: b.hasGenerator ?? false,
    hasParking: b.hasParking ?? false,
    totalFloors: b.totalFloors,
    surface: b.parcelle?.Sup,
    nbreLots: null,
    location: {
      lieudit: b.parcelle?.Lieu_dit,
      arrondissement: b.parcelle?.lotissement?.arrondissement?.Nom_Arrond,
      departement: b.parcelle?.lotissement?.arrondissement?.departement?.Nom_Dept,
      region: b.parcelle?.lotissement?.arrondissement?.departement?.region?.Nom_Reg,
    },
    imageUrl1: b.Image_URL_1,
    imageUrl2: b.Image_URL_2,
    imageUrl3: b.Image_URL_3,
    imageUrl4: b.Image_URL_4,
    imageUrl5: b.Image_URL_5,
    imageUrl6: b.Image_URL_6,
    videoUrl: b.Video_URL,
    published: true,
    featured: false,
    createdAt: b.createdAt?.toISOString(),
    updatedAt: b.updatedAt?.toISOString(),
    parcelle: b.parcelle ? {
      id: b.parcelle.Id_Parcel,
      name: b.parcelle.Nom_Prop,
      surface: b.parcelle.Sup,
    } : null,
    _meta: {
      Standing: b.Standing,
      Etat_Bat: b.Etat_Bat,
      No_Permis: b.No_Permis,
      parkingSpaces: b.parkingSpaces,
      hasElevator: b.hasElevator,
      totalUnits: b.totalUnits,
    },
  };
}

function mapBatimentType(catBat: string | null, typeUsage: string | null): string {
  const cat = (catBat || '').toLowerCase();
  const usage = (typeUsage || '').toLowerCase();
  
  if (cat.includes('villa')) return 'Villa';
  if (cat.includes('apartment')) return 'Apartment';
  if (cat.includes('studio')) return 'Studio';
  if (cat.includes('duplex')) return 'Duplex';
  if (cat.includes('house') || cat.includes('maison')) return 'House';
  if (usage.includes('commercial') || cat.includes('shop')) return 'Commercial';
  if (usage.includes('office')) return 'Office';
  
  return 'Building';
}