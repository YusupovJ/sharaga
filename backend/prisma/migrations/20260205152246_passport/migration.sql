/*
  Warnings:

  - A unique constraint covering the columns `[passport]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "students_passport_key" ON "students"("passport");
