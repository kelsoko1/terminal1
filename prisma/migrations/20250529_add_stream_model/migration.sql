-- CreateEnum
CREATE TYPE "StreamMediaType" AS ENUM ('VIDEO', 'AUDIO');

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "viewers" INTEGER NOT NULL DEFAULT 0,
    "isLive" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "mediaType" "StreamMediaType" NOT NULL,
    "mediaUrl" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
