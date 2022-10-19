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
