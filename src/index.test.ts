import { beforeEach, describe, expect, it } from 'vitest';
import express, { Express } from 'express';
import SuperJSON from 'superjson';
import request from 'supertest';

import superjsonMiddleware from './index';

describe('superjsonMiddleware', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(superjsonMiddleware());
  });

  it('should serialize Date objects correctly', async () => {
    const data = { date: new Date('2023-01-01') };

    app.get('/test-date', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-date').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);
    expect(deserializedData.date).toBeInstanceOf(Date);
    expect(deserializedData.date.toISOString()).toBe(data.date.toISOString());
  });

  it('should serialize Map objects correctly', async () => {
    const data = { map: new Map([['key', 'value']]) };

    app.get('/test-map', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-map').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);
    expect(deserializedData.map).toBeInstanceOf(Map);
    expect(deserializedData.map.get('key')).toBe('value');
  });

  it('should serialize Set objects correctly', async () => {
    const data = { set: new Set(['value1', 'value2']) };

    app.get('/test-set', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-set').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);
    expect(deserializedData.set).toBeInstanceOf(Set);
    expect(deserializedData.set.has('value1')).toBe(true);
    expect(deserializedData.set.has('value2')).toBe(true);
  });

  it('should handle nested objects with special types', async () => {
    const data = {
      nested: {
        deeper: {
          date: new Date('2023-12-31')
        },
        set: new Set(['value1'])
      },
      map: new Map([['key', 'value']]),
      date: new Date('2023-01-01')
    };

    app.get('/test-nested', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-nested').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);
    expect(deserializedData.date).toBeInstanceOf(Date);
    expect(deserializedData.map).toBeInstanceOf(Map);
    expect(deserializedData.nested.set).toBeInstanceOf(Set);
    expect(deserializedData.nested.deeper.date).toBeInstanceOf(Date);
  });

  it('should handle regular JSON data without modification', async () => {
    const data = {
      object: { key: 'value' },
      array: [1, 2, 3],
      string: 'hello',
      boolean: true,
      number: 42
    };

    app.get('/test-regular', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-regular').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);
    expect(deserializedData).toEqual(data);
  });

  it('should handle null and undefined values', async () => {
    const data = {
      nested: {
        // eslint-disable-next-line unicorn/no-null
        nullValue: null
      },
      undefinedValue: undefined,
      // eslint-disable-next-line unicorn/no-null
      nullValue: null
    };

    app.get('/test-null-undefined', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-null-undefined').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);
    expect(deserializedData.nullValue).toBeNull();
    expect(deserializedData.undefinedValue).toBeUndefined();
    expect(deserializedData.nested.nullValue).toBeNull();
  });

  it('should handle BigInt values', async () => {
    const data = {
      arrayWithBigInt: [BigInt(1), BigInt(2)],
      bigInt: BigInt(9_007_199_254_740_991)
    };

    app.get('/test-bigint', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-bigint').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);
    expect(typeof deserializedData.bigInt).toBe('bigint');
    expect(deserializedData.bigInt).toBe(BigInt(9_007_199_254_740_991));
    expect(deserializedData.arrayWithBigInt[0]).toBe(BigInt(1));
  });

  it('should handle Error objects', async () => {
    const data = {
      customError: new TypeError('custom error'),
      error: new Error('test error')
    };

    app.get('/test-error', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-error').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);
    expect(deserializedData.error).toBeInstanceOf(Error);
    expect(deserializedData.error.message).toBe('test error');
    expect(deserializedData.customError).toBeInstanceOf(Error); // SuperJSON does not support custom error classes
    expect(deserializedData.customError.message).toBe('custom error');
  });

  it('should handle RegExp objects', async () => {
    const data = {
      regexWithSpecialChars: /^\d+$/,
      regex: /test/gi
    };

    app.get('/test-regexp', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-regexp').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);
    expect(deserializedData.regex).toBeInstanceOf(RegExp);
    expect(deserializedData.regex.toString()).toBe('/test/gi');
    expect(deserializedData.regexWithSpecialChars.toString()).toBe(
      String.raw`/^\d+$/`
    );
  });

  it('should handle complex nested arrays', async () => {
    type ComplexArray = [
      Date,
      Map<string, string>,
      Set<string>,
      [bigint, Error],
      { nested: RegExp }
    ];

    const data = {
      array: [
        new Date('2023-01-01'),
        new Map([['key', 'value']]),
        new Set(['value']),
        [BigInt(1), new Error('nested error')],
        { nested: new RegExp('test', 'i') }
      ] as ComplexArray
    };

    app.get('/test-complex-array', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-complex-array').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);
    expect(deserializedData.array[0]).toBeInstanceOf(Date);
    expect(deserializedData.array[1]).toBeInstanceOf(Map);
    expect(deserializedData.array[2]).toBeInstanceOf(Set);
    expect(typeof deserializedData.array[3][0]).toBe('bigint');
    expect(deserializedData.array[3][1]).toBeInstanceOf(Error);
    expect(deserializedData.array[4].nested).toBeInstanceOf(RegExp);
  });

  it('should handle circular references gracefully', async () => {
    interface CircularData {
      self?: CircularData;
      prop: string;
    }

    const data: CircularData = { prop: 'value' };
    data.self = data;

    app.get('/test-circular', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-circular').expect(200);
    const deserializedData = SuperJSON.deserialize<CircularData>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);

    // Structure checks
    expect(deserializedData).toHaveProperty('prop');
    expect(deserializedData.prop).toBe('value');
    expect(deserializedData).toHaveProperty('self');

    // Circular reference checks
    expect(deserializedData.self).toBe(deserializedData);
    expect(deserializedData.self?.self).toBe(deserializedData);
    expect(deserializedData.self?.prop).toBe('value');

    // Reference equality depth check
    expect(deserializedData.self?.self?.self).toBe(deserializedData);
    expect(deserializedData.self?.self?.self?.prop).toBe('value');
  });

  it('should handle very large nested structures', async () => {
    const createDeepObject = (depth: number) => {
      if (depth === 0) {
        return {
          map: new Map([['key', 'value']]),
          set: new Set(['value']),
          date: new Date()
        };
      }
      return {
        nested: createDeepObject(depth - 1)
      };
    };

    const data = createDeepObject(50); // Deep nested structure

    app.get('/test-deep-nesting', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-deep-nesting').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);

    let current = deserializedData;
    for (let i = 0; i < 49; i++) {
      current = current.nested;
      expect(current).toBeDefined();
    }
    expect(current.nested.date).toBeInstanceOf(Date);
    expect(current.nested.map).toBeInstanceOf(Map);
    expect(current.nested.set).toBeInstanceOf(Set);
  });

  it('should handle URL objects correctly', async () => {
    const data = {
      nested: {
        array: [
          new URL('https://array.example.com'),
          new URL('https://another.example.com')
        ],
        url: new URL('https://nested.example.com')
      },
      complex: new URL(
        'https://user:pass@example.com:8080/path?key=value#section'
      ),
      withQuery: new URL('https://example.com?key=value'),
      withHash: new URL('https://example.com#section'),
      withPath: new URL('https://example.com/path'),
      simple: new URL('https://example.com')
    };

    app.get('/test-url', (req, res) => {
      res.json(data);
    });

    const response = await request(app).get('/test-url').expect(200);
    const deserializedData = SuperJSON.deserialize<typeof data>(response.body);

    expect(SuperJSON.stringify(data)).toBe(response.text);

    // Simple URL checks
    expect(deserializedData.simple).toBeInstanceOf(URL);
    expect(deserializedData.simple.href).toBe('https://example.com/');

    // URL with path
    expect(deserializedData.withPath).toBeInstanceOf(URL);
    expect(deserializedData.withPath.pathname).toBe('/path');

    // URL with query parameters
    expect(deserializedData.withQuery).toBeInstanceOf(URL);
    expect(deserializedData.withQuery.searchParams.get('key')).toBe('value');

    // URL with hash
    expect(deserializedData.withHash).toBeInstanceOf(URL);
    expect(deserializedData.withHash.hash).toBe('#section');

    // Complex URL with all components
    expect(deserializedData.complex).toBeInstanceOf(URL);
    expect(deserializedData.complex.username).toBe('user');
    expect(deserializedData.complex.password).toBe('pass');
    expect(deserializedData.complex.hostname).toBe('example.com');
    expect(deserializedData.complex.port).toBe('8080');
    expect(deserializedData.complex.pathname).toBe('/path');
    expect(deserializedData.complex.searchParams.get('key')).toBe('value');
    expect(deserializedData.complex.hash).toBe('#section');

    // Nested URL checks
    expect(deserializedData.nested.url).toBeInstanceOf(URL);
    expect(deserializedData.nested.url.href).toBe(
      'https://nested.example.com/'
    );

    // Array of URLs
    expect(deserializedData.nested.array[0]).toBeInstanceOf(URL);
    expect(deserializedData.nested.array[0].href).toBe(
      'https://array.example.com/'
    );
    expect(deserializedData.nested.array[1]).toBeInstanceOf(URL);
    expect(deserializedData.nested.array[1].href).toBe(
      'https://another.example.com/'
    );
  });
});
