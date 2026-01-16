/*
  Warnings:

  - Added the required column `mimetype` to the `ListingImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ListingImage" ADD COLUMN     "mimetype" TEXT NOT NULL;
