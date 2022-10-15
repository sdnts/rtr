# rtr

The tiniest, fastest router for Cloudflare Workers

# Tests?

This package is just a really light wrapper around the `URLPattern` API, which is tested by the Cloudflare team (I hope)

# Fast?

First off, routing performance almost never matters, so don't pick a router based on performance.

Still, it is fun to microbenchmark:
