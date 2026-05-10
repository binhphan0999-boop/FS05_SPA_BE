-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "appointmentCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "staffName" TEXT,
    "serviceName" TEXT,
    "roomName" TEXT,
    "appointmentDate" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "cancellationReason" TEXT,
    "createdBy" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_appointmentCode_key" ON "appointments"("appointmentCode");
