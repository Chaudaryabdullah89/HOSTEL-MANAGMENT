/*
  Warnings:

  - You are about to drop the column `addressId` on the `UserAddress` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_addressId_fkey";

-- DropIndex
DROP INDEX "public"."UserAddress_addressId_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "addressId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserAddress" DROP COLUMN "addressId";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "UserAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;
