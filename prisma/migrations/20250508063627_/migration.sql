/*
  Warnings:

  - You are about to drop the column `videoId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tiktokPostId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_videoId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "videoId",
ADD COLUMN     "tiktokPostId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Video";

-- CreateTable
CREATE TABLE "AuthorMeta" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "nickName" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "signature" TEXT NOT NULL,
    "bioLink" TEXT,
    "originalAvatarUrl" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "privateAccount" BOOLEAN NOT NULL,
    "ttSeller" BOOLEAN NOT NULL,
    "following" INTEGER NOT NULL,
    "friends" INTEGER NOT NULL,
    "fans" INTEGER NOT NULL,
    "heart" INTEGER NOT NULL,
    "video" INTEGER NOT NULL,
    "digg" INTEGER NOT NULL,

    CONSTRAINT "AuthorMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TiktokPost" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createTime" BIGINT NOT NULL,
    "createTimeISO" TEXT NOT NULL,
    "webVideoUrl" TEXT NOT NULL,
    "diggCount" INTEGER NOT NULL,
    "shareCount" INTEGER NOT NULL,
    "playCount" INTEGER NOT NULL,
    "collectCount" INTEGER NOT NULL,
    "commentCount" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TiktokPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TiktokPostHashtag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cover" TEXT NOT NULL,

    CONSTRAINT "TiktokPostHashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostHashtag" (
    "postId" TEXT NOT NULL,
    "hashtagId" TEXT NOT NULL,

    CONSTRAINT "PostHashtag_pkey" PRIMARY KEY ("postId","hashtagId")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_tiktokPostId_fkey" FOREIGN KEY ("tiktokPostId") REFERENCES "TiktokPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TiktokPost" ADD CONSTRAINT "TiktokPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AuthorMeta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashtag" ADD CONSTRAINT "PostHashtag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "TiktokPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashtag" ADD CONSTRAINT "PostHashtag_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "TiktokPostHashtag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
