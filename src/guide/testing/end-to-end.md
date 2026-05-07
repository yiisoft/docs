# End-to-end tests

End-to-end tests run the application through a real HTTP server. Use them for user-visible flows such as sign in, form
submission, redirects, cookies, JavaScript behavior, and file uploads.

Keep them few. Detailed business rules belong in unit and functional tests.

## Smoke test with curl

Start the application in the test environment:

```shell
APP_ENV=test ./yii serve --port=8080
```

In another terminal, check the home page:

```shell
curl -fsS http://127.0.0.1:8080/ > /tmp/home.html
grep -q "Welcome" /tmp/home.html
```

This is enough for a simple deployment or reverse-proxy smoke test.

## Browser tests with Playwright

Install Playwright:

```shell
npm install --save-dev @playwright/test
npx playwright install
```

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/EndToEnd',
  webServer: {
    command: 'APP_ENV=test ./yii serve --port=8080',
    url: 'http://127.0.0.1:8080/',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://127.0.0.1:8080',
  },
});
```

Create `tests/EndToEnd/home-page.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('home page opens', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Yii/i);
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

Run it:

```shell
npx playwright test
```

Run it with a visible browser while debugging:

```shell
npx playwright test --headed --debug
```

## Reset state

End-to-end tests use real infrastructure, so reset state before each scenario:

- Load only the records required by the scenario.
- Clear session and cookie storage.
- Clear generated files and outgoing messages.
- Stop background workers or make their effects deterministic.

If the scenario changes a database, reset it in a Playwright `beforeEach` hook by calling a project-specific script:

```ts
import { test } from '@playwright/test';
import { execFileSync } from 'node:child_process';

test.beforeEach(() => {
  execFileSync('php', ['tests/reset-test-state.php']);
});
```
