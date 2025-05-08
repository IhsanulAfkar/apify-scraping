import type { Request, Response } from "express";
import { response, Router } from "express";
import Controller from "./Controller";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import { getApifyClient, initApify } from "services/apifyClient";
import { tiktokScraperActor } from "services/actors";
import { TiktokComment, TiktokPost } from "types";

const prisma = new PrismaClient();

class HashTagController extends Controller {
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
       
        body('hashtags')
            .isArray({ min: 1 }).withMessage('hashtags must be a non-empty array')
            .custom((arr) => arr.every((tag: any) => typeof tag === 'string'))
            .withMessage('all hashtags must be strings'),

        body("resultsPerPage")
            .notEmpty()
            .withMessage("resultsPerPage is required")
            .isInt({ min: 1, max: 100 })
            .withMessage("resultsPerPage must be a positive integer"),
    ];
    private routes(): void {
        this.router.get("/", this.index);
        this.router.post("/", this.validateCreate, this.store);
        this.router.get("/:id", this.show)
    }

    private async index(req: Request, res: Response) {

        try {
            const { actor, client } = initApify(tiktokScraperActor)

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
            const {actor,client } = initApify(tiktokScraperActor)
            const run = await actor.call(req.body)
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            for (const item of items as TiktokPost[]) {
                const { id } = item;
                const post = await prisma.tiktokPost.upsert({
                    where: { id },
                    update: {},
                    create: {
                        id,
                        text: item.text,
                        createTime: item.createTime,
                        createTimeISO: item.createTimeISO,
                        webVideoUrl: item.webVideoUrl,
                        diggCount: item.diggCount,
                        shareCount: item.shareCount,
                        playCount: item.playCount,
                        collectCount: item.collectCount,
                        commentCount: item.commentCount,
                        author: {
                            connectOrCreate: {
                                where: { id: item.authorMeta.id },
                                create: {
                                    ...item.authorMeta
                                }
                            }
                        },
                    }
                })
                for (const hashtag of item.hashtags) {
                    await prisma.tiktokPostHashtag.upsert({
                        where: { id: hashtag.id },
                        update: {},
                        create: {
                            id: hashtag.id,
                            name: hashtag.name,
                            title: hashtag.title || "",
                            cover: hashtag.cover || "",
                        },
                    });

                    await prisma.postHashtag.upsert({
                        where: {
                            postId_hashtagId: {
                                postId: post.id,
                                hashtagId: hashtag.id,
                            },
                        },
                        update: {},
                        create: {
                            postId: post.id,
                            hashtagId: hashtag.id,
                        },
                    });
                }
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
            const { actor, client } = initApify(tiktokScraperActor)
            const dataset = await client.dataset(id).listItems()
            return super.success(res, 'Success', dataset)
        } catch (error: any) {
            console.error(error.message);
            return super.error(res, error.message);
        }
    }
}

export default new HashTagController().getRouter();
