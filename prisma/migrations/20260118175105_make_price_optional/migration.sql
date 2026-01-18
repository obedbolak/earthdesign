-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('Apartment', 'House', 'Villa', 'Office', 'Commercial', 'Land', 'Building', 'Studio', 'Duplex');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "OTPType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_VERIFICATION');

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
    "role" "UserRole" NOT NULL DEFAULT 'USER',
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
    "price" DECIMAL(15,2),
    "pricePerSqM" DECIMAL(15,2),
    "currency" TEXT DEFAULT 'XAF',
    "forSale" BOOLEAN DEFAULT false,
    "forRent" BOOLEAN DEFAULT false,
    "rentPrice" DECIMAL(15,2),
    "shortDescription" VARCHAR(255),
    "description" TEXT,
    "published" BOOLEAN DEFAULT false,
    "featured" BOOLEAN DEFAULT false,
    "Video_URL" TEXT,
    "Image_URL_1" TEXT,
    "Image_URL_2" TEXT,
    "Image_URL_3" TEXT,
    "Image_URL_4" TEXT,
    "Image_URL_5" TEXT,
    "Image_URL_6" TEXT,
    "Id_Arrond" INTEGER,
    "WKT_Geometry" TEXT,
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
    "price" DECIMAL(15,2),
    "pricePerSqM" DECIMAL(15,2),
    "currency" TEXT DEFAULT 'XAF',
    "forSale" BOOLEAN DEFAULT false,
    "forRent" BOOLEAN DEFAULT false,
    "rentPrice" DECIMAL(15,2),
    "shortDescription" VARCHAR(255),
    "description" TEXT,
    "published" BOOLEAN DEFAULT false,
    "featured" BOOLEAN DEFAULT false,
    "Video_URL" TEXT,
    "Image_URL_1" TEXT,
    "Image_URL_2" TEXT,
    "Image_URL_3" TEXT,
    "Image_URL_4" TEXT,
    "Image_URL_5" TEXT,
    "Image_URL_6" TEXT,
    "Id_Lotis" INTEGER,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parcelle_pkey" PRIMARY KEY ("Id_Parcel")
);

-- CreateTable
CREATE TABLE "Batiment" (
    "Id_Bat" SERIAL NOT NULL,
    "Type_Usage" TEXT,
    "Cat_Bat" TEXT,
    "Status" TEXT,
    "Standing" TEXT,
    "Cloture" BOOLEAN,
    "No_Permis" TEXT,
    "Type_Lodg" TEXT,
    "Etat_Bat" TEXT,
    "Nom" TEXT,
    "Mat_Bati" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "kitchens" INTEGER,
    "livingRooms" INTEGER,
    "totalFloors" INTEGER,
    "totalUnits" INTEGER,
    "hasElevator" BOOLEAN DEFAULT false,
    "hasGenerator" BOOLEAN DEFAULT false,
    "hasParking" BOOLEAN DEFAULT false,
    "parkingSpaces" INTEGER,
    "price" DECIMAL(15,2),
    "pricePerSqM" DECIMAL(15,2),
    "currency" TEXT DEFAULT 'XAF',
    "forSale" BOOLEAN DEFAULT false,
    "forRent" BOOLEAN DEFAULT false,
    "rentPrice" DECIMAL(15,2),
    "shortDescription" VARCHAR(255),
    "description" TEXT,
    "published" BOOLEAN DEFAULT false,
    "featured" BOOLEAN DEFAULT false,
    "Video_URL" TEXT,
    "Image_URL_1" TEXT,
    "Image_URL_2" TEXT,
    "Image_URL_3" TEXT,
    "Image_URL_4" TEXT,
    "Image_URL_5" TEXT,
    "Image_URL_6" TEXT,
    "Id_Parcel" INTEGER,
    "WKT_Geometry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batiment_pkey" PRIMARY KEY ("Id_Bat")
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
    "Video_URL" TEXT,
    "Image_URL_1" TEXT,
    "Image_URL_2" TEXT,
    "Image_URL_3" TEXT,
    "Image_URL_4" TEXT,
    "Image_URL_5" TEXT,
    "Image_URL_6" TEXT,
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

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" VARCHAR(255),
    "description" TEXT,
    "price" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "type" "PropertyType" NOT NULL,
    "forSale" BOOLEAN NOT NULL DEFAULT true,
    "forRent" BOOLEAN NOT NULL DEFAULT false,
    "rentPrice" DECIMAL(15,2),
    "isLandForDevelopment" BOOLEAN NOT NULL DEFAULT false,
    "approvedForApartments" BOOLEAN,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "kitchens" INTEGER DEFAULT 1,
    "livingRooms" INTEGER DEFAULT 1,
    "hasGenerator" BOOLEAN DEFAULT false,
    "hasParking" BOOLEAN DEFAULT false,
    "floorLevel" INTEGER,
    "totalFloors" INTEGER,
    "parcelleId" INTEGER NOT NULL,
    "batimentId" INTEGER,
    "imageUrl1" TEXT,
    "imageUrl2" TEXT,
    "imageUrl3" TEXT,
    "imageUrl4" TEXT,
    "imageUrl5" TEXT,
    "imageUrl6" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OTPToken_email_idx" ON "OTPToken"("email");

-- CreateIndex
CREATE INDEX "OTPToken_expires_idx" ON "OTPToken"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "OTPToken_email_token_key" ON "OTPToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Lotissement_price_idx" ON "Lotissement"("price");

-- CreateIndex
CREATE INDEX "Lotissement_forSale_idx" ON "Lotissement"("forSale");

-- CreateIndex
CREATE INDEX "Lotissement_forRent_idx" ON "Lotissement"("forRent");

-- CreateIndex
CREATE INDEX "Lotissement_published_idx" ON "Lotissement"("published");

-- CreateIndex
CREATE INDEX "Parcelle_price_idx" ON "Parcelle"("price");

-- CreateIndex
CREATE INDEX "Parcelle_forSale_idx" ON "Parcelle"("forSale");

-- CreateIndex
CREATE INDEX "Parcelle_forRent_idx" ON "Parcelle"("forRent");

-- CreateIndex
CREATE INDEX "Parcelle_published_idx" ON "Parcelle"("published");

-- CreateIndex
CREATE INDEX "Batiment_price_idx" ON "Batiment"("price");

-- CreateIndex
CREATE INDEX "Batiment_forSale_idx" ON "Batiment"("forSale");

-- CreateIndex
CREATE INDEX "Batiment_forRent_idx" ON "Batiment"("forRent");

-- CreateIndex
CREATE INDEX "Batiment_published_idx" ON "Batiment"("published");

-- CreateIndex
CREATE INDEX "Property_parcelleId_idx" ON "Property"("parcelleId");

-- CreateIndex
CREATE INDEX "Property_batimentId_idx" ON "Property"("batimentId");

-- CreateIndex
CREATE INDEX "Property_type_idx" ON "Property"("type");

-- CreateIndex
CREATE INDEX "Property_price_idx" ON "Property"("price");

-- CreateIndex
CREATE INDEX "Property_published_idx" ON "Property"("published");

-- CreateIndex
CREATE INDEX "Property_createdAt_idx" ON "Property"("createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departement" ADD CONSTRAINT "Departement_Id_Reg_fkey" FOREIGN KEY ("Id_Reg") REFERENCES "Region"("Id_Reg") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrondissement" ADD CONSTRAINT "Arrondissement_Id_Dept_fkey" FOREIGN KEY ("Id_Dept") REFERENCES "Departement"("Id_Dept") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lotissement" ADD CONSTRAINT "Lotissement_Id_Arrond_fkey" FOREIGN KEY ("Id_Arrond") REFERENCES "Arrondissement"("Id_Arrond") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcelle" ADD CONSTRAINT "Parcelle_Id_Lotis_fkey" FOREIGN KEY ("Id_Lotis") REFERENCES "Lotissement"("Id_Lotis") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batiment" ADD CONSTRAINT "Batiment_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payer" ADD CONSTRAINT "Payer_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payer" ADD CONSTRAINT "Payer_Id_Bat_fkey" FOREIGN KEY ("Id_Bat") REFERENCES "Batiment"("Id_Bat") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payer" ADD CONSTRAINT "Payer_Id_Taxe_fkey" FOREIGN KEY ("Id_Taxe") REFERENCES "Taxe_immobiliere"("Id_Taxe") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Limitrophe" ADD CONSTRAINT "Limitrophe_Id_Lotis_fkey" FOREIGN KEY ("Id_Lotis") REFERENCES "Lotissement"("Id_Lotis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Limitrophe" ADD CONSTRAINT "Limitrophe_Id_Riv_fkey" FOREIGN KEY ("Id_Riv") REFERENCES "Riviere"("Id_Riv") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alimenter" ADD CONSTRAINT "Alimenter_Id_Bat_fkey" FOREIGN KEY ("Id_Bat") REFERENCES "Batiment"("Id_Bat") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alimenter" ADD CONSTRAINT "Alimenter_Id_Reseaux_fkey" FOREIGN KEY ("Id_Reseaux") REFERENCES "Reseau_energetique"("Id_Reseaux") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contenir" ADD CONSTRAINT "Contenir_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contenir" ADD CONSTRAINT "Contenir_Id_Borne_fkey" FOREIGN KEY ("Id_Borne") REFERENCES "Borne"("Id_Borne") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trouver" ADD CONSTRAINT "Trouver_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trouver" ADD CONSTRAINT "Trouver_Id_Infras_fkey" FOREIGN KEY ("Id_Infras") REFERENCES "Infrastructure"("Id_Infras") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eclairer" ADD CONSTRAINT "Eclairer_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eclairer" ADD CONSTRAINT "Eclairer_Id_Equip_fkey" FOREIGN KEY ("Id_Equip") REFERENCES "Equipement"("Id_Equip") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Desservir" ADD CONSTRAINT "Desservir_Id_Parcel_fkey" FOREIGN KEY ("Id_Parcel") REFERENCES "Parcelle"("Id_Parcel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Desservir" ADD CONSTRAINT "Desservir_Id_Rte_fkey" FOREIGN KEY ("Id_Rte") REFERENCES "Route"("Id_Rte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approvisionner" ADD CONSTRAINT "Approvisionner_Id_Bat_fkey" FOREIGN KEY ("Id_Bat") REFERENCES "Batiment"("Id_Bat") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approvisionner" ADD CONSTRAINT "Approvisionner_Id_Reseaux_fkey" FOREIGN KEY ("Id_Reseaux") REFERENCES "Reseau_en_eau"("Id_Reseaux") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_parcelleId_fkey" FOREIGN KEY ("parcelleId") REFERENCES "Parcelle"("Id_Parcel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_batimentId_fkey" FOREIGN KEY ("batimentId") REFERENCES "Batiment"("Id_Bat") ON DELETE SET NULL ON UPDATE CASCADE;
