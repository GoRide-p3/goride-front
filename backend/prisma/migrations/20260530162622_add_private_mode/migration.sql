-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT,
    "gender" TEXT NOT NULL,
    "birthDate" TEXT,
    "passwordHash" TEXT NOT NULL,
    "bio" TEXT,
    "pix" TEXT,
    "avatar" TEXT,
    "privateMode" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "bio", "birthDate", "cpf", "createdAt", "email", "emailVerified", "gender", "id", "name", "passwordHash", "phone", "pix", "rating", "totalRatings", "updatedAt") SELECT "avatar", "bio", "birthDate", "cpf", "createdAt", "email", "emailVerified", "gender", "id", "name", "passwordHash", "phone", "pix", "rating", "totalRatings", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
