type Routes<T> = Record<
  string,
  (params: any, request: Request) => T | Promise<T>
>;
export function route<T>(request: Request, routes: Routes<T>): Promise<T> {
  const url = new URL(request.url);

  let callback, params;
  for (const r of Object.keys(routes)) {
    const [method, pathname] = r.split(" ");
    const pattern = new URLPattern({ pathname });
    if (method === request.method && pattern.test(url)) {
      callback = routes[r];
      params = pattern.exec(url);
      break;
    }
  }

  if (callback) {
    const val = callback(params ?? {}, request);
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
