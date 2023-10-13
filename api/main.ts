import {
  Application,
  Router,
  send,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const router = new Router();

async function getCollectionContent(collection: string) {
  const entries: string[] = [];
  for await (const dirEntry of await Deno.readDir(
    `collections/${collection}`,
  )) {
    entries.push(dirEntry.name);
  }
  return entries;
}

async function getOrCreateCollection(collection: string) {
  try {
    return await getCollectionContent(collection);
  } catch (e) {
    await Deno.mkdir(`collections/${collection}`);
    return await getCollectionContent(collection);
  }
}

export async function hashString(str: string) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // TODO: Append salt to `str`
  const iv = await crypto.subtle.digest("SHA-256", encoder.encode(str));
  return decoder.decode(iv);
}

const COLLECTION_RE = /^[a-z0-9-_.~]{1,32}$/;
const IMAGE_RE = /^[A-Za-z0-9-_.~]+$/;

router
  .get("/", (context) => {
    context.response.body = { ok: true };
  })
  .post("/api/collection/:collection", async (context) => {
    const collection = context?.params?.collection;

    if (COLLECTION_RE.test(collection)) {
      try {
        const files = await getOrCreateCollection(collection);
        const iv = await hashString(collection);

        context.response.body = { files, iv, name: collection };
      } catch (e) {
        console.error(e);
        context.response.status = 500;
      }
    } else {
      context.response.status = 400;
    }
  })
  .get("/api/collection/:collection/image/:image", async (context) => {
    const collection = context?.params?.collection;
    const image = encodeURIComponent(context?.params?.image);

    if (COLLECTION_RE.test(collection) && IMAGE_RE.test(image)) {
      await send(context, `${collection}/${image}`, { root: "collections" });
    } else {
      context.response.status = 400;
    }
  })
  .post("/api/collection/:collection/image/:image", async (context) => {
    const collection = context?.params?.collection;
    const image = encodeURIComponent(context?.params?.image);

    if (COLLECTION_RE.test(collection) && IMAGE_RE.test(image)) {
      try {
        const body = await context.request.body({
          type: "bytes",
        }).value;

        await Deno.writeFile(`collections/${collection}/${image}`, body);
        context.response.status = 201;
      } catch (e) {
        console.error(e);
        context.response.status = 500;
        context.response.body = [];
      }
    } else {
      context.response.status = 400;
    }
  })
  .delete("/api/collection/:collection/image/:image", async (context) => {
    const collection = context?.params?.collection;
    const image = encodeURIComponent(context?.params?.image);

    if (COLLECTION_RE.test(collection) && IMAGE_RE.test(image)) {
      try {
        await Deno.remove(`collections/${collection}/${image}`);
        context.response.status = 204;
      } catch (e) {
        console.error(e);
        context.response.status = 500;
      }
    } else {
      context.response.status = 400;
    }
  });

const app = new Application();
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({
  port: 8000,
  secure: true,
  certFile: "cert.pem",
  keyFile: "key.pem",
});
