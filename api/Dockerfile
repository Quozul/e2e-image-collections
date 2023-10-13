FROM alpine:edge

RUN apk --update add deno

WORKDIR /app

RUN mkdir collections

COPY api/deps.ts .
RUN deno cache deps.ts

COPY api .
RUN deno cache main.ts

ENV PORT 8000
ENV SALT salt
EXPOSE $PORT

CMD deno run --allow-env --allow-net --allow-read --allow-write main.ts
