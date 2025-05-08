import { ApifyClient } from "apify-client";
import { config } from "config";

let client: ApifyClient | null = null;

export function getApifyClient(): ApifyClient {
  if (!client) {
    client = new ApifyClient({
      token: config.APIFY_TOKEN,
    });
    console.log('Apify client initialized');
  } else {
  }

  return client;
}
export function initApify(actorId: string) {
  const client = getApifyClient()
  const actor = client.actor(actorId)
  return { client, actor }
}