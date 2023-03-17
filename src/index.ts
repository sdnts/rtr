// type Routes = Record<
//   string,
//   (
//     params: Record<string, string>,
//     request: Request
//   ) => Response | Promise<Response>
// >;

/**
 * Splits a route definition into a method and a path.
 *
 * @example RouteSplit<"GET /users"> gets turned into `{ method: "GET", path: "users" }`
 * @example RouteSplit<"GET /users/:userId/posts"> gets turned into `{ method: "GET", path: "users/:userId/posts" }`
 */
type RouteSplit<Route extends string> =
  Route extends `${infer Method} /${infer Path}`
    ? {
        method: Method;
        path: Path;
      }
    : never;

/**
 * Filters out the variable segments from a path.
 *
 * @example PathToVars<"users/:userId/posts/:postId/overview"> gets turned into `["userId", "postId"]`
 * @example PathToVars<"users"> gets turned into `[]`
 */
type PathToVars<Path extends string> =
  Path extends `${infer Seg1}/${infer Seg2}`
    ? Seg1 extends `:${infer Var}`
      ? [Var, ...PathToVars<Seg2>]
      : PathToVars<Seg2>
    : Path extends `:${infer Var}` // This is possibly the last segment, which can still be a variable
    ? [Var]
    : [];

/**
 * Returns the type of the items of an array
 *
 * @example ArrayItem<string[]> returns string
 * @example ArrayItem<number[]> returns number
 */
type ArrayItem<S extends any[]> = S[number];

/**
 * Takes in a route and uses {@link RouteSplit}, {@link PathToVars} & {@link ArrayItem} to convert it into an object whose keys are the variable segments of the route's path.
 *
 * @example RouteToArgs<"GET /users/:userId/posts/:postId/overview"> gets turned into `{ userId: string, postId: string }`
 * @example RouteToArgs<"POST /users"> gets turned into `{}`
 */
export type RouteToArgs<Route extends string> = {
  [Arg in ArrayItem<PathToVars<RouteSplit<Route>["path"]>>]: string;
};

type X = RouteSplit<"GET /users">;
type Y = RouteSplit<"GET">;
type PS1 = PathToVars<":user/abc/:xyz/foo">;
type PS2 = PathToVars<"a/b/c">;

type Args = RouteToArgs<"GET /users/:userId/posts/:postId/summary">;

type Routes = {
  [K in string]: (
    // params: ArrayToObject<PathSplit<RouteSplit<K>["path"]>>,
    params: RouteSplit<K>["path"],
    request: Request
  ) => Response | Promise<Response>;
};

const r: Routes = {
  "GET /users/:user": (args, request) => new Response(),
} as const;

export function route<Routes>(
  request: Request,
  routes: Routes
): Promise<Response> {
  const url = new URL(request.url);

  let callback, params;
  for (const route of Object.keys(routes)) {
    let [method, pathname] = route.split(" ", 2);
    if (pathname === undefined) {
      pathname = method;
      method = undefined!;
    }

    const pattern = new URLPattern({ pathname });
    const matches = pattern.test(url);

    if (
      (matches && method === undefined) ||
      (matches && method === request.method)
    ) {
      callback = routes[route];
      params = pattern.exec(url);
      break;
    }
  }

  if (callback) {
    const val = callback(params?.pathname.groups ?? {}, request);
    if (val instanceof Promise) return val;
    return Promise.resolve(val);
  }

  const fallback = routes["*"];
  if (fallback) {
    const val = fallback({}, request);
    if (val instanceof Promise) return val;
    return Promise.resolve(val);
  }

  throw new Error("No fallback route configured");
}
