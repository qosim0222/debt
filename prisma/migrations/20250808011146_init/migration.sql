/*
  Warnings:

  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "method";

-- DropEnum
DROP TYPE "public"."PaymentMethod";
