/*
  Warnings:

  - Added the required column `status` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MsgStatus" AS ENUM ('SENT', 'FAILED');

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "status" "public"."MsgStatus" NOT NULL,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Sample" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
