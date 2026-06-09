-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT,
    "gender" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "departureTimeStart" TEXT NOT NULL,
    "departureTimeEnd" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "routeId" TEXT,
    "routeName" TEXT,
    "sameGenderOnly" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE INDEX "Ride_driverId_idx" ON "Ride"("driverId");

-- CreateIndex
CREATE INDEX "Ride_date_idx" ON "Ride"("date");

-- CreateIndex
CREATE INDEX "Ride_status_idx" ON "Ride"("status");

-- CreateIndex
CREATE INDEX "Ride_origin_destination_date_idx" ON "Ride"("origin", "destination", "date");
