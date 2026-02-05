-- DropForeignKey
ALTER TABLE "history" DROP CONSTRAINT "history_dormitoryId_fkey";

-- DropForeignKey
ALTER TABLE "history" DROP CONSTRAINT "history_studentId_fkey";

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_dormitoryId_fkey" FOREIGN KEY ("dormitoryId") REFERENCES "dormitory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
