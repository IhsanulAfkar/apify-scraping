import { cleanEnv, port, str } from "envalid";

export const config = cleanEnv(process.env, {
    APIFY_TOKEN: str(),
    APP_PORT: port({ default: 3000 })
})