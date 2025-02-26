/*
  Warnings:

  - Added the required column `address` to the `master_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `master_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "master_profiles" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workSchedule" JSONB;
