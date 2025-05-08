export type ActorResult = {
    items: TiktokPost[],
    total: number,
    offset: number,
    count: number,
    limit: number,
    desc: boolean
}
export type TiktokPost = {
    id: string,
    text: string,
    createTime: number,
    createTimeISO: string,
    authorMeta: AuthorMeta,
    webVideoUrl: string,
    diggCount: number,
    shareCount: number,
    playCount: number,
    collectCount: number,
    commentCount: number,
    hashtags: TiktokPostHashtag[]
}
export type TiktokPostHashtag = {
    id: string,
    name: string,
    title: string,
    cover: string
}
export type AuthorMeta = {
    id: string,
    name: string,
    profileUrl: string,
    nickName: string,
    verified: boolean,
    signature: string,
    bioLink?: string,
    originalAvatarUrl: string,
    avatar: string,
    privateAccount: boolean,
    ttSeller: boolean,
    following: number,
    friends: number,
    fans: number,
    heart: number,
    video: number,
    digg: number
}

export type TiktokComment = {
    videoWebUrl: string,
    submittedVideoUrl: string,
    input: string,
    cid: string,
    createTimeISO: string,
    text: string,
    diggCount: number,
    likedByAuthor: boolean,
    pinnedByAuthor: boolean,
    replyCommentTotal: number,
    uid: string,
    uniqueId: string,
    avatarThumbnail: string
}