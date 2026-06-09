-- CreateTable
CREATE TABLE "RideRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rideId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RideRequest_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RideRequest_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RideRequest_rideId_idx" ON "RideRequest"("rideId");

-- CreateIndex
CREATE INDEX "RideRequest_passengerId_idx" ON "RideRequest"("passengerId");

-- CreateIndex
CREATE INDEX "RideRequest_status_idx" ON "RideRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RideRequest_rideId_passengerId_key" ON "RideRequest"("rideId", "passengerId");
