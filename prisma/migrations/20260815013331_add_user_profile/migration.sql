/*
  Warnings:

  - You are about to drop the column `avatarId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_avatarId_fkey";

-- DropIndex
DROP INDEX "User_avatarId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarId",
DROP COLUMN "name";

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "bio" TEXT,
    "headline" TEXT,
    "phoneNumber" TEXT,
    "location" TEXT,
    "interests" TEXT[],
    "skills" TEXT[],
    "avatarId" TEXT,
    "bannerId" TEXT,
    "websiteUrl" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "twitterUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_avatarId_key" ON "UserProfile"("avatarId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_bannerId_key" ON "UserProfile"("bannerId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
