[![NPM Version](https://img.shields.io/npm/v/express-superjson?style=for-the-badge&logo=npm&color=blue&cacheSeconds=3600)](https://npmjs.com/package/express-superjson)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/bur4kbey/express-superjson/test.yml?style=for-the-badge&label=tests&cacheSeconds=3600)](https://github.com/BUR4KBEY/express-superjson/actions/workflows/test.yml)
[![Codecov](https://img.shields.io/codecov/c/github/bur4kbey/express-superjson?style=for-the-badge&cacheSeconds=3600)](https://app.codecov.io/gh/BUR4KBEY/express-superjson)
[![GitHub License](https://img.shields.io/github/license/bur4kbey/express-superjson?style=for-the-badge)](https://github.com/BUR4KBEY/express-superjson/blob/main/LICENSE)
[![GitHub Repo stars](https://img.shields.io/github/stars/bur4kbey/express-superjson?style=for-the-badge&label=%E2%AD%90%20STARS&color=yellow&cacheSeconds=3600)](https://github.com/BUR4KBEY/express-superjson)

# 🔄 [express-superjson](https://npmjs.com/package/express-superjson)

Express middleware that seamlessly integrates [Superjson](https://github.com/blitz-js/superjson) into your Express.js applications, enabling automatic handling of JavaScript built-in types in HTTP responses.

## 🚀 Installation

Install the package using your preferred package manager. Here's an example using `pnpm`:

```bash
pnpm add superjson express-superjson
```

## 📝 Example Usage

```ts
import express from 'express';
import superjsonMiddleware from 'express-superjson';

const app = express();

app.use(express.json());

// This middleware must be registered after `express.json()` middleware.
app.use(superjsonMiddleware());

app.get('/', (req, res) => {
  res.json({ date: new Date() });
});

app.listen(3000, () => console.log('Application is running on port 3000.'));
```

Send a **GET** request to `http://localhost:3000` and you'll receive a **Superjson** response like below:

```
{
  "json": {
    "date": "2023-01-01T00:00:00.000Z"
  },
  "meta": {
    "values": {
      "date": ["Date"]
    }
  }
}
```

## 🧪 Code Coverage and Tests

Tests are crucial for ensuring that the library functions as expected. You can review the code coverage reports by visiting [**Codecov**](https://app.codecov.io/gh/BUR4KBEY/express-superjson). The primary objective is to achieve complete coverage of the entire codebase through rigorous testing.

## ☕ Support

If you find this project useful and would like to support [me](https://github.com/BUR4KBEY), you can do so by visiting [my website](https://burakbey.dev).

<a href="https://burakbey.dev" target="_blank"><img src="https://burakbey.dev/github_support_snippet.png" style="height: 56px !important;width: 200px !important;" alt="Buy me a coffee"></img></a>
