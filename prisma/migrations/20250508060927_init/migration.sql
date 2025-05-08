-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "authorMetaAvatar" TEXT NOT NULL,
    "authorMetaName" TEXT NOT NULL,
    "authorUrl" TEXT NOT NULL,
    "shareCount" INTEGER NOT NULL,
    "likeCount" INTEGER NOT NULL,
    "playCount" INTEGER NOT NULL,
    "commentCount" INTEGER NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "commentId" TEXT NOT NULL,
    "videoId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "likeCount" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userAvatar" TEXT,
    "createdTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Comment_commentId_key" ON "Comment"("commentId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
