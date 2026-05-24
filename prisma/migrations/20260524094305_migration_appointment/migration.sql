/*
  Warnings:

  - The primary key for the `appointments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `appointmentCode` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentDate` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationReason` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `roomName` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `serviceName` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `staffName` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `appointments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[appointment_code]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointment_code` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appointment_date` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_name` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_phone` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "appointments_appointmentCode_key";

-- AlterTable
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_pkey",
DROP COLUMN "appointmentCode",
DROP COLUMN "appointmentDate",
DROP COLUMN "cancellationReason",
DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "customerName",
DROP COLUMN "customerPhone",
DROP COLUMN "endTime",
DROP COLUMN "roomName",
DROP COLUMN "serviceName",
DROP COLUMN "staffName",
DROP COLUMN "startTime",
DROP COLUMN "updatedAt",
ADD COLUMN     "appointment_code" TEXT NOT NULL,
ADD COLUMN     "appointment_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "customer_name" TEXT NOT NULL,
ADD COLUMN     "customer_phone" TEXT NOT NULL,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "end_time" TEXT NOT NULL,
ADD COLUMN     "room" TEXT NOT NULL,
ADD COLUMN     "service_id" TEXT,
ADD COLUMN     "staff_id" TEXT,
ADD COLUMN     "staff_schedule_id" TEXT,
ADD COLUMN     "start_time" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "appointments_id_seq";

-- AlterTable
ALTER TABLE "staff_schedules" ADD COLUMN     "service_id" TEXT;

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "category_id" TEXT,
    "image_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_appointment_code_key" ON "appointments"("appointment_code");

-- CreateIndex
CREATE INDEX "appointments_staff_id_idx" ON "appointments"("staff_id");

-- CreateIndex
CREATE INDEX "appointments_staff_schedule_id_idx" ON "appointments"("staff_schedule_id");

-- CreateIndex
CREATE INDEX "appointments_appointment_date_idx" ON "appointments"("appointment_date");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- AddForeignKey
ALTER TABLE "staff_schedules" ADD CONSTRAINT "staff_schedules_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_schedule_id_fkey" FOREIGN KEY ("staff_schedule_id") REFERENCES "staff_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
