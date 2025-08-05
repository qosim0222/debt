/*
  Warnings:

  - You are about to drop the column `adress` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Debt` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `CustomerPhone` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CustomerImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CustomerPhone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadline_months` to the `Debt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthly_amount` to the `Debt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Debt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Debt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DebtImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Sample` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('FULL', 'PARTIAL', 'BY_MONTH');

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_sampleId_fkey";

-- AlterTable
ALTER TABLE "public"."Customer" DROP COLUMN "adress",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."CustomerImage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."CustomerPhone" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Debt" DROP COLUMN "date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deadline_months" INTEGER NOT NULL,
ADD COLUMN     "monthly_amount" INTEGER NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT false;

-- AlterTable
ALTER TABLE "public"."DebtImage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "sampleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "method" "public"."PaymentMethod" NOT NULL,
ADD COLUMN     "monthNumber" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Sample" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPhone_phone_key" ON "public"."CustomerPhone"("phone");

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "public"."Sample"("id") ON DELETE SET NULL ON UPDATE CASCADE;
