import type { Request, Response } from "express";
import { Router } from "express";
import Controller from "./Controller";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import { getApifyClient, initApify } from "services/apifyClient";
import { tiktokCommentScraperActor, tiktokScraperActor } from "services/actors";
import { TiktokComment, TiktokPost } from "types";

const prisma = new PrismaClient();

class CommentController extends Controller {
    private router: Router;
    constructor() {
        super();
        this.router = Router();
        this.routes();
        this.index = this.index.bind(this)
    }

    public getRouter(): Router {
        return this.router;
    }
    private validateCreate = [
        body("commentsPerPost")
        .isInt({ min: 1 })
        .withMessage("commentsPerPost must be an integer >= 1"),

    body("excludePinnedPosts")
        .isBoolean()
        .withMessage("excludePinnedPosts must be a boolean"),

    body("maxRepliesPerComment")
        .isInt({ min: 0 })
        .withMessage("maxRepliesPerComment must be an integer >= 0"),

    body("postURLs")
        .isArray({ min: 1 })
        .withMessage("postURLs must be a non-empty array"),

    body("postURLs.*")
        .isURL()
        .withMessage("Each postURL must be a valid URL"),

    body("resultsPerPage")
        .isInt({ min: 1 })
        .withMessage("resultsPerPage must be an integer >= 1")
    ];
    private routes(): void {
        this.router.get("/", this.index);
        this.router.post("/", this.validateCreate, this.store);
        this.router.get("/:id", this.show)
    }

    private async index(req: Request, res: Response) {

        try {
            const { actor, client } = initApify(tiktokCommentScraperActor)

            const lists = await actor.runs().list()
            let results = [];
            const promises = lists.items.map(async (dataset) => {
                return {
                    id: dataset.id,
                    defaultDatasetId: dataset.defaultDatasetId,
                    ...(await client.run(dataset.id).dataset().listItems())
                };
            }
            );

            results = await Promise.all(promises);
            return super.success(res, 'Success', results);
        } catch (error: any) {
            console.error(error.message);
            return super.error(res, error.message);
        }
    }
    private async store(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return super.badRequest(res, "invalid request", errors.array());
            }
            const { actor, client } = initApify(tiktokCommentScraperActor)
            const run = await actor.call(req.body)
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            for (const item of items as TiktokComment[]) {
                const tiktokPost = await prisma.tiktokPost.findFirst({
                    where: {
                        webVideoUrl: item.videoWebUrl
                    }
                })
                if (!tiktokPost) continue
                const comment = await prisma.comment.upsert({
                    where: {
                        commentId: item.cid
                    },
                    update: {},
                    create: {
                        commentId: item.cid,
                        tiktokPostId: tiktokPost.id,
                        text: item.text,
                        likeCount: item.diggCount,
                        userId: item.uid,
                        username: item.uniqueId,
                        userAvatar: item.avatarThumbnail,
                        createdTime: item.createTimeISO
                    }
                })
            }
            return super.success(res, 'Success', items);
        } catch (error: any) {
            console.error(error.message);
            return super.error(res, error.message);
        }
    }
    private async show(req: Request<{ id: string }>, res: Response) {
        try {
            const id = req.params.id
            const { actor, client } = initApify(tiktokCommentScraperActor)
            const dataset = await client.dataset(id).listItems()
            return super.success(res, 'Success', dataset)
        } catch (error: any) {
            console.error(error.message);
            return super.error(res, error.message);
        }
    }
}

export default new CommentController().getRouter();
