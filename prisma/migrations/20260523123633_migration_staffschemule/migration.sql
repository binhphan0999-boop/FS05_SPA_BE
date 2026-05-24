-- CreateTable
CREATE TABLE "staff_schedules" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "staff_id" TEXT NOT NULL,
    "work_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "shift_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,

    CONSTRAINT "staff_schedules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "staff_schedules" ADD CONSTRAINT "staff_schedules_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
