import { Application, oakCors, Router, send } from "./deps.ts";

const router = new Router();

async function getCollectionContent(collection: string) {
  const entries: string[] = [];

  for await (const dirEntry of await Deno.readDir(`collections/${collection}`)) {
    if (dirEntry.isFile && !dirEntry.name.startsWith(".")) {
      entries.push(dirEntry.name);
    }
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

async function hashString(str: string) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const iv = await crypto.subtle.digest("SHA-256", encoder.encode(str + (Deno.env.get("SALT") ?? "salt")));
  return decoder.decode(iv);
}

const COLLECTION_RE = /^[a-z0-9-_.~]{1,32}$/;
const IMAGE_RE = /^[A-Za-z0-9-_.]+$/;

router
  .get("/", (context) => {
    context.response.body = { ok: true };
  })
  .get("/collection/:collection", async (context) => {
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
  .post("/collection/:collection", async (context) => {
    const collection = context?.params?.collection;

    const body = await context.request.body({ type: "form-data" });
    const data = await body.value.read();
    const files = data.files;

    if (!files || files.length === 0) {
      context.response.status = 400;
      return;
    }

    for (const { filename, originalName } of data.files) {
      if (COLLECTION_RE.test(collection) && IMAGE_RE.test(originalName)) {
        const newPath = `collections/${collection}/${originalName}`;
        try {
          await Deno.copyFile(filename, newPath);
        } catch (e) {
          console.error(e);
          context.response.status = 500;
          return;
        }
      } else {
        context.response.status = 400;
      }
    }

    context.response.status = 201;
  })
  .get("/collection/:collection/image/:image", async (context) => {
    const collection = context?.params?.collection;
    const image = encodeURIComponent(context?.params?.image);

    if (COLLECTION_RE.test(collection) && IMAGE_RE.test(image)) {
      await send(context, `${collection}/${image}`, { root: "collections" });
    } else {
      context.response.status = 400;
    }
  })
  .delete("/collection/:collection/image/:image", async (context) => {
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
  port: Deno.env.get("PORT") ?? 8000,
});
