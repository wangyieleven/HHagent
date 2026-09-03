import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const baseURL = 'http://127.0.0.1:8734';
const server = spawn('python3', [
  '-m', 'http.server', '8734',
  '--bind', '127.0.0.1',
  '--directory', 'mirror/site'
], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe']
});

let serverOutput = '';
server.stdout.on('data', chunk => { serverOutput += String(chunk); });
server.stderr.on('data', chunk => { serverOutput += String(chunk); });

async function waitForServer() {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseURL, { redirect: 'manual' });
      if (response.ok) return;
    } catch {
      // Server may still be starting.
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error(`Static server did not start.\n${serverOutput}`);
}

async function send(page, text) {
  const input = page.locator('#chatInput');
  await input.fill(text);
  await page.locator('#chatSend').click();
}

async function waitForText(page, text) {
  await page.waitForFunction(
    expected => (document.querySelector('#chatStream')?.textContent || '').includes(expected),
    text,
    { timeout: 10_000 }
  );
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const pageErrors = [];
  const consoleErrors = [];
  const failedLocalRequests = [];
  const unexpectedDialogs = [];
  let acceptNextDialog = false;

  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', request => {
    if (request.url().startsWith(baseURL)) {
      failedLocalRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText || 'failed'}`);
    }
  });
  page.on('dialog', async dialog => {
    if (acceptNextDialog) {
      acceptNextDialog = false;
      await dialog.accept();
    } else {
      unexpectedDialogs.push(`${dialog.type()}: ${dialog.message()}`);
      await dialog.dismiss();
    }
  });

  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.locator('#heheFab').waitFor({ state: 'visible', timeout: 15_000 });
  await page.locator('#heheFab').click();
  await page.locator('#aiChatPanel.open').waitFor({ state: 'visible', timeout: 10_000 });
  await page.locator('.hh-demo-banner').waitFor({ state: 'visible', timeout: 10_000 });

  assert.equal(await page.evaluate(() => window.__HH_RUNTIME_CONFIG__?.mode), 'demo');
  assert.equal(await page.evaluate(() => window.BASE_HOST), '');
  assert.equal(await page.evaluate(() => window.commonHdSyn?.enabled), false);
  assert.equal(await page.evaluate(() => window.HHVisitLog?.enabled), false);
  assert.equal(await page.evaluate(() => localStorage.getItem('tokenId')), null);
  assert.equal(await page.evaluate(() => sessionStorage.getItem('userId')), null);

  await send(page, '申请算力资源需要准备什么？');
  await waitForText(page, '算力申请的材料要点');
  assert.equal(await page.locator('#chatStream .hh-flow').count(), 0, 'Policy question must not open an application form.');

  await page.locator('#chatReset').click();
  await page.waitForFunction(() => !(document.querySelector('#chatStream')?.textContent || '').trim());
  await send(page, '申请算力资源需要准备什么？');
  await waitForText(page, '算力申请的材料要点');

  await page.locator('#chatReset').click();
  await send(page, '帮我找不到 <img src=x onerror="window.__HH_XSS__=true">');
  await waitForText(page, '找不到');
  assert.equal(await page.evaluate(() => window.__HH_XSS__ === true), false, 'Injected handler executed.');
  assert.equal(await page.locator('#chatStream img[src="x"]').count(), 0, 'Injected image element was created.');

  await page.locator('#chatReset').click();
  await send(page, '我想预约参观，下周三下午，5个人');
  await waitForText(page, '单位名称和联系人');
  await send(page, '单位北京测试公司，联系人张三，手机号13800138000');
  await waitForText(page, '来访主要想了解什么');

  const storedDrafts = await page.evaluate(() => Object.keys(sessionStorage)
    .filter(key => key.startsWith('hehe-ui-v2:'))
    .map(key => sessionStorage.getItem(key) || '')
    .join('\n'));
  assert(!storedDrafts.includes('13800138000'), 'Phone number leaked into assistant storage.');
  assert(!storedDrafts.includes('"contact"'), 'Contact field leaked into assistant storage.');

  await send(page, '有没有停车位？');
  await waitForText(page, '看起来是一个新问题');

  await page.locator('button[aria-label="更多能力与记录"]').click();
  await page.getByRole('button', { name: '清除本次演示数据' }).waitFor({ state: 'visible' });
  acceptNextDialog = true;
  await page.getByRole('button', { name: '清除本次演示数据' }).click();
  await page.locator('#hhRuntimeNotice.show').waitFor({ state: 'visible' });
  assert.equal(
    await page.evaluate(() => Object.keys(sessionStorage).some(key => key.startsWith('hehe-ui-v2:'))),
    false,
    'Assistant demo data was not cleared.'
  );

  await page.waitForTimeout(500);
  assert.deepEqual(unexpectedDialogs, [], `Unexpected browser dialogs: ${unexpectedDialogs.join('\n')}`);
  assert.deepEqual(pageErrors, [], `Page errors:\n${pageErrors.join('\n')}`);
  assert.deepEqual(failedLocalRequests, [], `Failed local requests:\n${failedLocalRequests.join('\n')}`);
  assert.deepEqual(consoleErrors, [], `Console errors:\n${consoleErrors.join('\n')}`);

  console.log('HHagent browser smoke passed: demo isolation, repeated prompts, XSS handling, draft privacy and clear-data flow.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
