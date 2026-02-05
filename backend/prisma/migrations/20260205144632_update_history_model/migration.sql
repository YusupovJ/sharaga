/*
  Warnings:

  - A unique constraint covering the columns `[studentId,date]` on the table `history` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isPresent` to the `history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `history` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "history_userId_key";

-- AlterTable
ALTER TABLE "history" ADD COLUMN     "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isPresent" BOOLEAN NOT NULL,
ADD COLUMN     "studentId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "history_studentId_date_key" ON "history"("studentId", "date");

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
