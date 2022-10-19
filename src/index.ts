type Routes<T> = Record<
  string,
  (params: Record<string, string>, request: Request) => T | Promise<T>
>;
export function route<T>(request: Request, routes: Routes<T>): Promise<T> {
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
