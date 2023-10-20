type T = ProgressEvent<XMLHttpRequestEventTarget>;

export default async function* fetchProgress(
  url: string,
  {
    method = "GET",
    body = null,
  }: {
    method: string;
    body: ArrayBuffer | null;
  },
) {
  const req = new XMLHttpRequest();
  req.open(method, url);
  const target = req.upload;

  let resolver: undefined | ((event: T) => void);

  const listener = (event: T) => {
    if (resolver) {
      resolver(event);
      resolver = undefined;
    }
  };

  target.addEventListener("progress", listener);

  const loadPromise = new Promise<T>((resolve, reject) => {
    target.addEventListener("load", function (event) {
      resolve(event);
    });

    target.addEventListener("error", function (event) {
      reject(event);
    });
  });

  req.send(body);

  try {
    while (true) {
      const progressPromise = new Promise<T>((resolve) => {
        resolver = resolve;
      });

      const settled = await Promise.race([loadPromise, progressPromise]);
      yield settled;

      if (settled.type !== "progress") {
        break;
      }
    }
  } finally {
    target.removeEventListener("progress", listener);
  }
}
