# (WIP) rtr

A tiny router for Cloudflare Workers & Deno Deploy.
Don't use pls, it isn't type-safe yet.

# Usage

Copy over src/index.ts to your project directly

Define your routes and handlers in your worker's `fetch` handler:

```typescript
import { route } from "rtr";

export default {
  async fetch(r: Request) {
    return route<Response>(r, {
      // Match a method and a route
      "GET /": () => {
        return new Response("Hello World!");
      },

      // Match a method and a route in an aynsc handler
      "POST /": async (params, request) => {
        const body = await request.text();
        return new Response(
          `method=${request.method}, pathname=/ body=${body}`
        );
      },

      // Match all methods on a route
      "/user": (params, request) => {
        return new Response(`method=${request.method}, pathname=/user`);
      },

      // Route parameters
      "GET /user/:userId": ({ userId }, request) => {
        return new Response(`method=${request.method}, userId=${userId}`);
      },

      // Fallback route, matches when nothing else does
      "*": () => {
        return new Response(`404`, { status: 404 });
      },
    });
  },
};
```

This package is just a really light wrapper around the `URLPattern` API, so for more information about the kinds of things you can do, refer to [this MDN page](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern/URLPattern)
