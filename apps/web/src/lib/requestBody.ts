// Story 15.30 (Gate Phase 6 §9.2/§9.1, API-04 residual: "pas de limite de
// taille de payload"). Every mutation route parsed `await req.json()`
// directly — the Fetch API buffers and JSON-parses the entire body with no
// size check of its own, and `Content-Length` can't be trusted (a client can
// omit it or lie about it; Next.js doesn't reject on a mismatch). A request
// with an arbitrarily large body therefore got fully read and parsed before
// any Zod validation ran, on every one of the ~16 routes that accept one.
//
// One shared, documented cap here — used as a drop-in replacement for
// `req.json()` — closes that gap everywhere at once instead of adding a
// manual size check to each route individually.
export const MAX_JSON_BODY_BYTES = 100 * 1024; // 100 KB — the largest legitimate
// payload in this app (e.g. a scenario's `inputs`/`results` blob, story
// 15.23) is a few KB; this leaves generous headroom without allowing a
// multi-MB body to be buffered and parsed.

export class PayloadTooLargeError extends Error {
  constructor(maxBytes: number) {
    super(`Request body exceeds the ${maxBytes}-byte limit`);
    this.name = 'PayloadTooLargeError';
  }
}

/**
 * Drop-in replacement for `req.json()` that rejects an oversized body before
 * parsing it. Mirrors `req.json()`'s own behavior otherwise (it's
 * `JSON.parse(await req.text())` under the hood per the Fetch spec), so a
 * malformed or empty body still throws the same `SyntaxError` a caller's
 * existing catch-all already handles.
 */
export async function readJsonBody<T = unknown>(
  req: Request,
  maxBytes: number = MAX_JSON_BODY_BYTES
): Promise<T> {
  const text = await req.text();
  if (Buffer.byteLength(text, 'utf8') > maxBytes) {
    throw new PayloadTooLargeError(maxBytes);
  }
  return JSON.parse(text) as T;
}
