/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `faculty` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passport` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomNumber` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "dormitory" DROP CONSTRAINT "dormitory_userId_fkey";

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "faculty" TEXT NOT NULL,
ADD COLUMN     "job" TEXT,
ADD COLUMN     "passport" TEXT NOT NULL,
ADD COLUMN     "roomNumber" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'moderator',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "dormitoryId" INTEGER NOT NULL,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_login_key" ON "user"("login");

-- CreateIndex
CREATE UNIQUE INDEX "history_userId_key" ON "history"("userId");

-- AddForeignKey
ALTER TABLE "dormitory" ADD CONSTRAINT "dormitory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_dormitoryId_fkey" FOREIGN KEY ("dormitoryId") REFERENCES "dormitory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
