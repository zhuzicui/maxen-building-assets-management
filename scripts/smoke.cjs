/* Click-through smoke test of the main user flows against a running build.
 *   npm run build && npx vite preview --port 4173 &
 *   BASE_URL=http://localhost:4173 node scripts/smoke.cjs
 * Needs Playwright with Chromium installed (not a project dependency). */
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:4173';
let failed = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); if (!ok) failed++; };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  const go = async (hash) => { await page.goto(`${BASE}/#${hash}`); await page.waitForSelector('main'); };

  // Every route renders.
  for (const r of ['/analytics', '/analytics/performance', '/assignees', '/my-work', '/building', '/building/analytics', '/building/performance', '/building/work-orders', '/building/assets', '/calendar', '/contacts', '/new-work-order', '/new-asset', '/profile', '/login']) {
    await go(r); check(`route ${r} renders`, (await page.locator('main').count()) === 1);
  }

  // Status change flows to the list and survives a reload.
  await go('/building/work-orders');
  const row = page.locator('tbody tr').first();
  const name = (await row.locator('td').first().innerText()).trim();
  await row.click();
  await page.getByRole('button', { name: /Change status/ }).click();
  await page.getByRole('menuitem').filter({ hasText: 'Overdue' }).click();
  await page.reload(); await page.waitForSelector('main');
  check('status survives reload', (await page.getByRole('button', { name: /Change status/ }).innerText()).includes('Overdue'));
  await go('/building/work-orders'); await page.getByLabel('Search').fill(name);
  check('status shows in the list', (await page.locator('tbody tr', { hasText: 'Overdue' }).count()) >= 1);

  // Create a work order, then find it in the list and on its detail page.
  await go('/new-work-order');
  await page.getByRole('button', { name: 'Create work order' }).click();
  check('empty form is rejected', (await page.locator('.err-msg').count()) >= 2);
  await page.getByLabel(/Work order name/).fill('Smoke test replace belts');
  await page.getByLabel(/Assignee/).selectOption({ index: 2 });
  await page.locator('#task-0').fill('Lock out the unit');
  await page.getByRole('button', { name: 'Create work order' }).click();
  await page.waitForURL(/work-orders\/wo-new/);
  check('new work order opens', await page.locator('h1', { hasText: 'Smoke test replace belts' }).waitFor({ timeout: 3000 }).then(() => true, () => false));
  await go('/building/work-orders'); await page.getByLabel('Search').fill('Smoke test');
  check('new work order is in the list', (await page.locator('tbody tr').count()) === 1);

  // Checklist: tick a task, progress changes.
  await page.locator('tbody tr').first().click();
  await page.locator('.task input').first().check();
  check('ticking a task starts the work order', (await page.getByRole('button', { name: /Change status/ }).innerText()).includes('In progress'));

  // Create an asset and open its page.
  await go('/new-asset');
  await page.getByLabel(/Asset name/).fill('Smoke test chiller');
  await page.getByLabel(/^Category/).selectOption('HVAC'); await page.getByLabel(/^Type/).selectOption('Chiller');
  await page.getByLabel(/^Wing/).selectOption({ index: 1 }); await page.getByLabel(/^Floor/).selectOption({ index: 1 }); await page.getByLabel(/^Room/).selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create asset' }).click();
  await page.waitForURL(/assets\/a-new/);
  check('new asset opens', await page.locator('h1', { hasText: 'Smoke test chiller' }).waitFor({ timeout: 3000 }).then(() => true, () => false));

  // Asset filters filter.
  await go('/building/assets');
  const before = await page.locator('.asset').count();
  await page.getByLabel('Asset type').selectOption({ index: 1 });
  const after = await page.locator('.asset').count();
  check('asset filter narrows the list', after > 0 && after < before, `${before} -> ${after}`);

  // Calendar: select a planned work order, click a day.
  await go('/calendar');
  const q = page.locator('.qi').nth(0);
  if (await q.count()) { await q.click(); await page.locator('.day:not(.out)').nth(14).click({ position: { x: 5, y: 5 } }); check('calendar scheduling shows a toast', (await page.locator('.toast').count()) === 1); }

  // Role switch and persistence of the chosen building.
  await go('/analytics');
  await page.locator('button.nav-item', { hasText: 'Buildings' }).click();
  await page.getByRole('menuitem', { name: /Tour Champlain/ }).click();
  await page.reload(); await page.waitForSelector('main');
  check('selected building survives reload', (await page.locator('h1').innerText()).includes('Tour Champlain'));

  // Phone width: no horizontal scroll, filters collapsed.
  await page.setViewportSize({ width: 390, height: 844 });
  await go('/my-work');
  check('no horizontal scroll at 390px', (await page.evaluate(() => document.documentElement.scrollWidth)) <= 390);
  check('filters start collapsed on phones', (await page.locator('.filters.closed').count()) === 1);

  check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
  console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
  process.exit(failed ? 1 : 0);
})();
