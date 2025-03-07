import type { RequestHandler } from 'express';

import superjson from 'superjson';

/**
 * Express middleware that automatically serializes response data using `superjson`.
 * This enables proper handling of JavaScript built-in types that are not supported by standard JSON:
 * - Date
 * - Map
 * - Set
 * - URL
 * - BigInt
 * - Regular Expressions
 * - Error objects
 * - Circular references
 *
 * Important: This middleware must be registered after `express.json()` middleware.
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import superjsonMiddleware from 'express-superjson';
 *
 * const app = express();
 *
 * app.use(express.json());
 * app.use(superjsonMiddleware());
 *
 * app.get('/example', (req, res) => {
 *   res.json({
 *     date: new Date(),
 *     map: new Map([['key', 'value']]),
 *     set: new Set(['value']),
 *     url: new URL('https://example.com')
 *   });
 * });
 * ```
 *
 * @returns {RequestHandler} Express middleware that enhances `res.json()` with `superjson` serialization
 */
export default function superjsonMiddleware(): RequestHandler {
  return (req, res, next) => {
    const json = res.json.bind(res);
    res.json = body => json(superjson.serialize(body));

    next();
  };
}
