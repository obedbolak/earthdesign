-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT', 'BOTH');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SOLD', 'RENTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PropertyCategory" AS ENUM ('LAND', 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'DUPLEX', 'TRIPLEX', 'PENTHOUSE', 'CHAMBRE_MODERNE', 'CHAMBRE', 'OFFICE', 'SHOP', 'RESTAURANT', 'HOTEL', 'WAREHOUSE', 'COMMERCIAL_SPACE', 'INDUSTRIAL', 'FACTORY', 'BUILDING', 'MIXED_USE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "OTPType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_VERIFICATION');

-- CreateEnum
CREATE TYPE "MediaEntityType" AS ENUM ('LOTISSEMENT', 'PARCELLE', 'BATIMENT', 'INFRASTRUCTURE');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('LOTISSEMENT', 'PARCELLE', 'BATIMENT');

-- CreateTable
CREATE TABLE "OTPToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "OTPType" NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTPToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "agencyName" TEXT,
    "agencyLogo" TEXT,
    "bio" TEXT,
    "whatsapp" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Region" (
    "Id_Reg" SERIAL NOT NULL,
    "Nom_Reg" TEXT,
    "Sup_Reg" DOUBLE PRECISION,
    "Chef_lieu_Reg" TEXT,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("Id_Reg")
);

-- CreateTable
CREATE TABLE "Departement" (
    "Id_Dept" SERIAL NOT NULL,
    "Nom_Dept" TEXT,
    "Sup_Dept" DOUBLE PRECISION,
    "Chef_lieu_Dept" TEXT,
    "Id_Reg" INTEGER,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departement_pkey" PRIMARY KEY ("Id_Dept")
);

-- CreateTable
CREATE TABLE "Arrondissement" (
    "Id_Arrond" SERIAL NOT NULL,
    "Nom_Arrond" TEXT,
    "Sup_Arrond" DOUBLE PRECISION,
    "Chef_lieu_Arrond" TEXT,
    "Commune" TEXT,
    "Id_Dept" INTEGER,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arrondissement_pkey" PRIMARY KEY ("Id_Arrond")
);

-- CreateTable
CREATE TABLE "Lotissement" (
    "Id_Lotis" SERIAL NOT NULL,
    "Nom_proprio" TEXT,
    "Num_TF" TEXT,
    "Statut" TEXT,
    "Nom_cons" TEXT,
    "Surface" DOUBLE PRECISION,
    "Nom_visa_lotis" TEXT,
    "Date_approb" DATE,
    "Geo_exe" TEXT,
    "Nbre_lots" INTEGER,
    "Lieudit" TEXT,
    "Echelle" INTEGER,
    "Ccp" TEXT,
    "Id_Arrond" INTEGER,
    "WKT_Geometry" TEXT,
    "slug" TEXT,
    "title" TEXT,
    "shortDescription" VARCHAR(500),
    "description" TEXT,
    "category" "PropertyCategory" NOT NULL DEFAULT 'LAND',
    "listingType" "ListingType",
    "listingStatus" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "price" DECIMAL(15,2),
    "pricePerSqM" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "totalParcels" INTEGER,
    "availableParcels" INTEGER,
    "hasRoadAccess" BOOLEAN DEFAULT false,
    "hasElectricity" BOOLEAN DEFAULT false,
    "hasWater" BOOLEAN DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lotissement_pkey" PRIMARY KEY ("Id_Lotis")
);

-- CreateTable
CREATE TABLE "Parcelle" (
    "Id_Parcel" SERIAL NOT NULL,
    "Nom_Prop" TEXT,
    "TF_Mere" TEXT,
    "Mode_Obtent" TEXT,
    "TF_Cree" TEXT,
    "Nom_Cons" TEXT,
    "Sup" DOUBLE PRECISION,
    "Nom_Visa_Cad" TEXT,
    "Date_visa" DATE,
    "Geometre" TEXT,
    "Date_impl" DATE,
    "Num_lot" TEXT,
    "Num_bloc" TEXT,
    "Lieu_dit" TEXT,
    "Largeur_Rte" TEXT,
    "Echelle" INTEGER,
    "Ccp_N" TEXT,
    "Mise_Val" BOOLEAN,
    "Cloture" BOOLEAN,
    "Id_Lotis" INTEGER,
    "WKT_Geometry" TEXT,
    "slug" TEXT,
    "title" TEXT,
    "shortDescription" VARCHAR(500),
    "description" TEXT,
    "category" "PropertyCategory" NOT NULL DEFAULT 'LAND',
    "listingType" "ListingType",
    "listingStatus" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "price" DECIMAL(15,2),
    "pricePerSqM" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "isForDevelopment" BOOLEAN DEFAULT false,
    "approvedForBuilding" BOOLEAN,
    "zoningType" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parcelle_pkey" PRIMARY KEY ("Id_Parcel")
);

-- CreateTable
CREATE TABLE "Batiment" (
    "Id_Bat" SERIAL NOT NULL,
    "Cat_Bat" TEXT,
    "Status" TEXT,
    "Standing" TEXT,
    "Cloture" BOOLEAN,
    "No_Permis" TEXT,
    "Type_Lodg" TEXT,
    "Etat_Bat" TEXT,
    "Nom" TEXT,
    "Mat_Bati" TEXT,
    "Id_Parcel" INTEGER,
    "WKT_Geometry" TEXT,
    "propertyType" "PropertyType",
    "slug" TEXT,
    "title" TEXT,
    "shortDescription" VARCHAR(500),
    "description" TEXT,
    "category" "PropertyCategory" NOT NULL DEFAULT 'RESIDENTIAL',
    "listingType" "ListingType",
    "listingStatus" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "price" DECIMAL(15,2),
    "rentPrice" DECIMAL(15,2),
    "pricePerSqM" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "totalFloors" INTEGER,
    "totalUnits" INTEGER,
    "hasElevator" BOOLEAN DEFAULT false,
    "surfaceArea" DOUBLE PRECISION,
    "doorNumber" TEXT,
    "address" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "kitchens" INTEGER,
    "livingRooms" INTEGER,
    "floorLevel" INTEGER,
    "hasGenerator" BOOLEAN DEFAULT false,
    "hasParking" BOOLEAN DEFAULT false,
    "parkingSpaces" INTEGER,
    "hasPool" BOOLEAN DEFAULT false,
    "hasGarden" BOOLEAN DEFAULT false,
    "hasSecurity" BOOLEAN DEFAULT false,
    "hasAirConditioning" BOOLEAN DEFAULT false,
    "hasFurnished" BOOLEAN DEFAULT false,
    "hasBalcony" BOOLEAN DEFAULT false,
    "hasTerrace" BOOLEAN DEFAULT false,
    "amenities" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batiment_pkey" PRIMARY KEY ("Id_Bat")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "lotissementId" INTEGER,
    "parcelleId" INTEGER,
    "batimentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Share" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "entityType" "EntityType" NOT NULL,
    "platform" TEXT,
    "lotissementId" INTEGER,
    "parcelleId" INTEGER,
    "batimentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "View" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "entityType" "EntityType" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lotissementId" INTEGER,
    "parcelleId" INTEGER,
    "batimentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "View_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "entityType" "MediaEntityType" NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lotissementId" INTEGER,
    "parcelleId" INTEGER,
    "batimentId" INTEGER,
    "infrastructureId" INTEGER,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "Id_Rte" SERIAL NOT NULL,
    "Cat_Rte" TEXT,
    "Type_Rte" TEXT,
    "Largeur_Rte" TEXT,
    "Etat_Rte" TEXT,
    "Mat_Rte" TEXT,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("Id_Rte")
);

-- CreateTable
CREATE TABLE "Riviere" (
    "Id_Riv" SERIAL NOT NULL,
    "Nom_Riv" TEXT,
    "Type_Riv" TEXT,
    "Etat_amenag" TEXT,
    "Debit_Riv" TEXT,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Riviere_pkey" PRIMARY KEY ("Id_Riv")
);

-- CreateTable
CREATE TABLE "Taxe_immobiliere" (
    "Id_Taxe" SERIAL NOT NULL,
    "Num_TF" TEXT,
    "Nom_Proprio" TEXT,
    "NIU" TEXT,
    "Val_imm" DOUBLE PRECISION,
    "Taxe_Payee" BOOLEAN,
    "Date_declaree" DATE,
    "Type_taxe" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Taxe_immobiliere_pkey" PRIMARY KEY ("Id_Taxe")
);

-- CreateTable
CREATE TABLE "Equipement" (
    "Id_Equip" SERIAL NOT NULL,
    "Type_Equip" TEXT,
    "Design_Equip" TEXT,
    "Etat_Equip" TEXT,
    "Mat_Equip" TEXT,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipement_pkey" PRIMARY KEY ("Id_Equip")
);

-- CreateTable
CREATE TABLE "Reseau_energetique" (
    "Id_Reseaux" SERIAL NOT NULL,
    "Source_Res" DOUBLE PRECISION,
    "Type_Reseau" TEXT,
    "Etat_Res" TEXT,
    "Materiau" TEXT,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reseau_energetique_pkey" PRIMARY KEY ("Id_Reseaux")
);

-- CreateTable
CREATE TABLE "Reseau_en_eau" (
    "Id_Reseaux" SERIAL NOT NULL,
    "Source_Res" DOUBLE PRECISION,
    "Type_Res" TEXT,
    "Etat_Res" TEXT,
    "Mat_Res" TEXT,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reseau_en_eau_pkey" PRIMARY KEY ("Id_Reseaux")
);

-- CreateTable
CREATE TABLE "Infrastructure" (
    "Id_Infras" SERIAL NOT NULL,
    "Nom_infras" TEXT,
    "Type_Infraas" TEXT,
    "Categorie_infras" TEXT,
    "Cycle" TEXT,
    "Statut_infras" TEXT,
    "Standing" TEXT,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Infrastructure_pkey" PRIMARY KEY ("Id_Infras")
);

-- CreateTable
CREATE TABLE "Borne" (
    "Id_Borne" SERIAL NOT NULL,
    "coord_x" DOUBLE PRECISION,
    "coord_y" DOUBLE PRECISION,
    "coord_z" DOUBLE PRECISION,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Borne_pkey" PRIMARY KEY ("Id_Borne")
);

-- CreateTable
CREATE TABLE "Payer" (
    "Id_Parcel" INTEGER NOT NULL,
    "Id_Bat" INTEGER NOT NULL,
    "Id_Taxe" INTEGER NOT NULL,
    "date_paye" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payer_pkey" PRIMARY KEY ("Id_Parcel","Id_Bat","Id_Taxe")
);

-- CreateTable
CREATE TABLE "Limitrophe" (
    "Id_Lotis" INTEGER NOT NULL,
    "Id_Riv" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Limitrophe_pkey" PRIMARY KEY ("Id_Lotis","Id_Riv")
);

-- CreateTable
CREATE TABLE "Alimenter" (
    "Id_Bat" INTEGER NOT NULL,
    "Id_Reseaux" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alimenter_pkey" PRIMARY KEY ("Id_Bat","Id_Reseaux")
);

-- CreateTable
CREATE TABLE "Contenir" (
    "Id_Parcel" INTEGER NOT NULL,
    "Id_Borne" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contenir_pkey" PRIMARY KEY ("Id_Parcel","Id_Borne")
);

-- CreateTable
CREATE TABLE "Trouver" (
    "Id_Parcel" INTEGER NOT NULL,
    "Id_Infras" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trouver_pkey" PRIMARY KEY ("Id_Parcel","Id_Infras")
);

-- CreateTable
CREATE TABLE "Eclairer" (
    "Id_Parcel" INTEGER NOT NULL,
    "Id_Equip" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Eclairer_pkey" PRIMARY KEY ("Id_Parcel","Id_Equip")
);

-- CreateTable
CREATE TABLE "Desservir" (
    "Id_Parcel" INTEGER NOT NULL,
    "Id_Rte" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Desservir_pkey" PRIMARY KEY ("Id_Parcel","Id_Rte")
);

-- CreateTable
CREATE TABLE "Approvisionner" (
    "Id_Bat" INTEGER NOT NULL,
    "Id_Reseaux" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approvisionner_pkey" PRIMARY KEY ("Id_Bat","Id_Reseaux")
);

-- CreateIndex
CREATE INDEX "OTPToken_email_expires_idx" ON "OTPToken"("email", "expires");

-- CreateIndex
CREATE UNIQUE INDEX "OTPToken_email_token_key" ON "OTPToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isVerified_idx" ON "User"("isVerified");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Region_Nom_Reg_idx" ON "Region"("Nom_Reg");

-- CreateIndex
CREATE INDEX "Departement_Id_Reg_idx" ON "Departement"("Id_Reg");

-- CreateIndex
CREATE INDEX "Departement_Nom_Dept_idx" ON "Departement"("Nom_Dept");

-- CreateIndex
CREATE INDEX "Arrondissement_Id_Dept_idx" ON "Arrondissement"("Id_Dept");

-- CreateIndex
CREATE INDEX "Arrondissement_Nom_Arrond_idx" ON "Arrondissement"("Nom_Arrond");

-- CreateIndex
CREATE UNIQUE INDEX "Lotissement_slug_key" ON "Lotissement"("slug");

-- CreateIndex
CREATE INDEX "Lotissement_Id_Arrond_idx" ON "Lotissement"("Id_Arrond");

-- CreateIndex
CREATE INDEX "Lotissement_Num_TF_idx" ON "Lotissement"("Num_TF");

-- CreateIndex
CREATE INDEX "Lotissement_Statut_idx" ON "Lotissement"("Statut");

-- CreateIndex
CREATE INDEX "Lotissement_listingStatus_idx" ON "Lotissement"("listingStatus");

-- CreateIndex
CREATE INDEX "Lotissement_listingType_idx" ON "Lotissement"("listingType");

-- CreateIndex
CREATE INDEX "Lotissement_price_idx" ON "Lotissement"("price");

-- CreateIndex
CREATE INDEX "Lotissement_featured_idx" ON "Lotissement"("featured");

-- CreateIndex
CREATE INDEX "Lotissement_createdById_idx" ON "Lotissement"("createdById");

-- CreateIndex
CREATE INDEX "Lotissement_createdAt_idx" ON "Lotissement"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Parcelle_slug_key" ON "Parcelle"("slug");

-- CreateIndex
CREATE INDEX "Parcelle_Id_Lotis_idx" ON "Parcelle"("Id_Lotis");

-- CreateIndex
CREATE INDEX "Parcelle_TF_Cree_idx" ON "Parcelle"("TF_Cree");

-- CreateIndex
CREATE INDEX "Parcelle_Num_lot_idx" ON "Parcelle"("Num_lot");

-- CreateIndex
CREATE INDEX "Parcelle_listingStatus_idx" ON "Parcelle"("listingStatus");

-- CreateIndex
CREATE INDEX "Parcelle_listingType_idx" ON "Parcelle"("listingType");

-- CreateIndex
CREATE INDEX "Parcelle_price_idx" ON "Parcelle"("price");

-- CreateIndex
CREATE INDEX "Parcelle_featured_idx" ON "Parcelle"("featured");

-- CreateIndex
CREATE INDEX "Parcelle_category_idx" ON "Parcelle"("category");

-- CreateIndex
CREATE INDEX "Parcelle_createdById_idx" ON "Parcelle"("createdById");

-- CreateIndex
CREATE INDEX "Parcelle_createdAt_idx" ON "Parcelle"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Batiment_slug_key" ON "Batiment"("slug");

-- CreateIndex
CREATE INDEX "Batiment_Id_Parcel_idx" ON "Batiment"("Id_Parcel");

-- CreateIndex
CREATE INDEX "Batiment_propertyType_idx" ON "Batiment"("propertyType");

-- CreateIndex
CREATE INDEX "Batiment_Standing_idx" ON "Batiment"("Standing");

-- CreateIndex
CREATE INDEX "Batiment_listingStatus_idx" ON "Batiment"("listingStatus");

-- CreateIndex
CREATE INDEX "Batiment_listingType_idx" ON "Batiment"("listingType");

-- CreateIndex
CREATE INDEX "Batiment_price_idx" ON "Batiment"("price");

-- CreateIndex
CREATE INDEX "Batiment_rentPrice_idx" ON "Batiment"("rentPrice");

-- CreateIndex
CREATE INDEX "Batiment_featured_idx" ON "Batiment"("featured");

-- CreateIndex
CREATE INDEX "Batiment_bedrooms_idx" ON "Batiment"("bedrooms");

-- CreateIndex
CREATE INDEX "Batiment_category_idx" ON "Batiment"("category");

-- CreateIndex
CREATE INDEX "Batiment_createdById_idx" ON "Batiment"("createdById");

-- CreateIndex
CREATE INDEX "Batiment_createdAt_idx" ON "Batiment"("createdAt");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_entityType_idx" ON "Favorite"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_entityType_lotissementId_key" ON "Favorite"("userId", "entityType", "lotissementId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_entityType_parcelleId_key" ON "Favorite"("userId", "entityType", "parcelleId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_entityType_batimentId_key" ON "Favorite"("userId", "entityType", "batimentId");

-- CreateIndex
CREATE INDEX "Share_userId_idx" ON "Share"("userId");

-- CreateIndex
CREATE INDEX "Share_entityType_idx" ON "Share"("entityType");

-- CreateIndex
CREATE INDEX "Share_platform_idx" ON "Share"("platform");

-- CreateIndex
CREATE INDEX "Share_createdAt_idx" ON "Share"("createdAt");

-- CreateIndex
CREATE INDEX "View_userId_idx" ON "View"("userId");

-- CreateIndex
CREATE INDEX "View_entityType_idx" ON "View"("entityType");

-- CreateIndex
CREATE INDEX "View_createdAt_idx" ON "View"("createdAt");

-- CreateIndex
CREATE INDEX "Media_entityType_idx" ON "Media"("entityType");

-- CreateIndex
CREATE INDEX "Media_lotissementId_idx" ON "Media"("lotissementId");

-- CreateIndex
CREATE INDEX "Media_parcelleId_idx" ON "Media"("parcelleId");

-- CreateIndex
CREATE INDEX "Media_batimentId_idx" ON "Media"("batimentId");

-- CreateIndex
CREATE INDEX "Media_order_idx" ON "Media"("order");

-- CreateIndex
CREATE INDEX "Media_isPrimary_idx" ON "Media"("isPrimary");

-- CreateIndex
CREATE INDEX "Route_Type_Rte_idx" ON "Route"("Type_Rte");

-- CreateIndex
CREATE INDEX "Taxe_immobiliere_Num_TF_idx" ON "Taxe_immobiliere"("Num_TF");

-- CreateIndex
CREATE INDEX "Taxe_immobiliere_NIU_idx" ON "Taxe_immobiliere"("NIU");

-- CreateIndex
CREATE INDEX "Infrastructure_Type_Infraas_idx" ON "Infrastructure"("Type_Infraas");

-- CreateIndex
CREATE INDEX "Infrastructure_Nom_infras_idx" ON "Infrastructure"("Nom_infras");

-- CreateIndex
CREATE INDEX "Payer_Id_Taxe_idx" ON "Payer"("Id_Taxe");

-- CreateIndex
CREATE INDEX "Limitrophe_Id_Riv_idx" ON "Limitrophe"("Id_Riv");

-- CreateIndex
CREATE INDEX "Alimenter_Id_Reseaux_idx" ON "Alimenter"("Id_Reseaux");

-- CreateIndex
CREATE INDEX "Contenir_Id_Borne_idx" ON "Contenir"("Id_Borne");

-- CreateIndex
CREATE INDEX "Trouver_Id_Infras_idx" ON "Trouver"("Id_Infras");

-- CreateIndex
CREATE INDEX "Eclairer_Id_Equip_idx" ON "Eclairer"("Id_Equip");

-- CreateIndex
CREATE INDEX "Desservir_Id_Rte_idx" ON "Desservir"("Id_Rte");

-- CreateIndex
CREATE INDEX "Approvisionner_Id_Reseaux_idx" ON "Approvisionner"("Id_Reseaux");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departement" ADD CONSTRAINT "Departement_Id_Reg_fkey" FOREIGN KEY ("Id_Reg") REFERENCES "Region"("Id_Reg") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrondissement" ADD CONSTRAINT "Arrondissement_Id_Dept_fkey" FOREIGN KEY ("Id_Dept") REFERENCES "Departement"("Id_Dept") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lotissement" ADD CONSTRAINT "Lotissement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lotissement" ADD CONSTRAINT "Lotissement_Id_Arrond_fkey" FOREIGN KEY ("Id_Arrond") REFERENCES "Arrondissement"("Id_Arrond") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcelle" ADD CONSTRAINT "Parcelle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcelle" ADD CONSTRAINT "Parcelle_Id_Lotis_fkey" FOREIGN KEY ("Id_Lotis") REFERENCES "Lotissement"("Id_Lotis") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batiment" ADD CONSTRAINT "Batiment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batiment" ADD CONSTRAINT "Batiment_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_lotissementId_fkey" FOREIGN KEY ("lotissementId") REFERENCES "Lotissement"("Id_Lotis") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_parcelleId_fkey" FOREIGN KEY ("parcelleId") REFERENCES "Parcelle"("Id_Parcel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_batimentId_fkey" FOREIGN KEY ("batimentId") REFERENCES "Batiment"("Id_Bat") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_lotissementId_fkey" FOREIGN KEY ("lotissementId") REFERENCES "Lotissement"("Id_Lotis") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_parcelleId_fkey" FOREIGN KEY ("parcelleId") REFERENCES "Parcelle"("Id_Parcel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_batimentId_fkey" FOREIGN KEY ("batimentId") REFERENCES "Batiment"("Id_Bat") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_lotissementId_fkey" FOREIGN KEY ("lotissementId") REFERENCES "Lotissement"("Id_Lotis") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_parcelleId_fkey" FOREIGN KEY ("parcelleId") REFERENCES "Parcelle"("Id_Parcel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_batimentId_fkey" FOREIGN KEY ("batimentId") REFERENCES "Batiment"("Id_Bat") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_lotissementId_fkey" FOREIGN KEY ("lotissementId") REFERENCES "Lotissement"("Id_Lotis") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_parcelleId_fkey" FOREIGN KEY ("parcelleId") REFERENCES "Parcelle"("Id_Parcel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_batimentId_fkey" FOREIGN KEY ("batimentId") REFERENCES "Batiment"("Id_Bat") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_infrastructureId_fkey" FOREIGN KEY ("infrastructureId") REFERENCES "Infrastructure"("Id_Infras") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payer" ADD CONSTRAINT "Payer_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payer" ADD CONSTRAINT "Payer_Id_Bat_fkey" FOREIGN KEY ("Id_Bat") REFERENCES "Batiment"("Id_Bat") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payer" ADD CONSTRAINT "Payer_Id_Taxe_fkey" FOREIGN KEY ("Id_Taxe") REFERENCES "Taxe_immobiliere"("Id_Taxe") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Limitrophe" ADD CONSTRAINT "Limitrophe_Id_Lotis_fkey" FOREIGN KEY ("Id_Lotis") REFERENCES "Lotissement"("Id_Lotis") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Limitrophe" ADD CONSTRAINT "Limitrophe_Id_Riv_fkey" FOREIGN KEY ("Id_Riv") REFERENCES "Riviere"("Id_Riv") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alimenter" ADD CONSTRAINT "Alimenter_Id_Bat_fkey" FOREIGN KEY ("Id_Bat") REFERENCES "Batiment"("Id_Bat") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alimenter" ADD CONSTRAINT "Alimenter_Id_Reseaux_fkey" FOREIGN KEY ("Id_Reseaux") REFERENCES "Reseau_energetique"("Id_Reseaux") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contenir" ADD CONSTRAINT "Contenir_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contenir" ADD CONSTRAINT "Contenir_Id_Borne_fkey" FOREIGN KEY ("Id_Borne") REFERENCES "Borne"("Id_Borne") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trouver" ADD CONSTRAINT "Trouver_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trouver" ADD CONSTRAINT "Trouver_Id_Infras_fkey" FOREIGN KEY ("Id_Infras") REFERENCES "Infrastructure"("Id_Infras") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eclairer" ADD CONSTRAINT "Eclairer_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eclairer" ADD CONSTRAINT "Eclairer_Id_Equip_fkey" FOREIGN KEY ("Id_Equip") REFERENCES "Equipement"("Id_Equip") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Desservir" ADD CONSTRAINT "Desservir_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Desservir" ADD CONSTRAINT "Desservir_Id_Rte_fkey" FOREIGN KEY ("Id_Rte") REFERENCES "Route"("Id_Rte") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approvisionner" ADD CONSTRAINT "Approvisionner_Id_Bat_fkey" FOREIGN KEY ("Id_Bat") REFERENCES "Batiment"("Id_Bat") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approvisionner" ADD CONSTRAINT "Approvisionner_Id_Reseaux_fkey" FOREIGN KEY ("Id_Reseaux") REFERENCES "Reseau_en_eau"("Id_Reseaux") ON DELETE CASCADE ON UPDATE CASCADE;
