/*
  Warnings:

  - The `latitude` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `longitude` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "latitude",
ADD COLUMN     "latitude" DECIMAL(10,7),
DROP COLUMN "longitude",
ADD COLUMN     "longitude" DECIMAL(10,7);
