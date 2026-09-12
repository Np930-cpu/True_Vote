// Vote page specific screenshots
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

async function screenshot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`Saved: ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // Set auth
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => {
      localStorage.setItem('voter', JSON.stringify({ voter_id: 'V100', name: 'Rahul Sharma' }));
      localStorage.setItem('access', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake');
    });

    // Navigate to /vote with election state via React Router state
    // We use page.evaluate to push state
    await page.goto(`${BASE_URL}/elections`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    // Inject election data into window and navigate
    await page.evaluate(() => {
      // Store election in sessionStorage for the vote page to pick up
      window.__testElection = {
        id: 1,
        name: 'General Election 2025',
        start_date: '2025-01-01',
        end_date: '2099-12-31',
        description: 'National parliamentary election'
      };
    });

    // Use React Router navigate with state by clicking if button exists
    // Otherwise directly navigate with history state
    await page.evaluate(() => {
      const election = {
        id: 1,
        name: 'General Election 2025',
        start_date: '2025-01-01',
        end_date: '2099-12-31',
        description: 'National parliamentary election'
      };
      window.history.pushState({ election }, '', '/vote');
    });

    await page.goto(`${BASE_URL}/vote`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    // The vote page checks location.state.election — inject via navigation
    // Use a different approach: intercept and mock
    await page.addInitScript(() => {
      const origPushState = history.pushState.bind(history);
      // Override React Router's useLocation to return our state
    });

    // Best approach: use page.route to mock the API and navigate properly
    // Mock candidates API
    await page.route('**/api/elections/candidate/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Rahul Sharma', party: 'Indian National Party', manifesto: 'Focus on education and infrastructure growth for all citizens.', election: 1 },
          { id: 2, name: 'Priya Patel', party: 'Progressive Alliance', manifesto: 'Healthcare reform and digital India initiative for modern governance.', election: 1 },
          { id: 3, name: 'Amit Kumar', party: 'Development Front', manifesto: 'Economic growth through industrial development and job creation.', election: 1 },
        ])
      });
    });

    // Mock has-voted API
    await page.route('**/api/votes/has-voted/**', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ has_voted: false }) });
    });

    // Mock elections API
    await page.route('**/api/elections/election/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'General Election 2025', description: 'National parliamentary election', start_date: '2025-01-01', end_date: '2099-12-31' }
        ])
      });
    });

    // Navigate to elections first to get the election card
    await page.goto(`${BASE_URL}/elections`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '06b_elections_with_active');

    // Click Vote Now
    const voteBtn = page.locator('button:has-text("Vote Now")').first();
    const visible = await voteBtn.isVisible().catch(() => false);
    if (visible) {
      await voteBtn.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '10a_vote_step1_face_verify');

      // Simulate face verified - click Open Camera button
      const camBtn = page.locator('button:has-text("Open Camera")').first();
      const camVisible = await camBtn.isVisible().catch(() => false);
      if (camVisible) {
        await screenshot(page, '10b_vote_face_camera_ready');
      }
    } else {
      console.log('Vote Now button not found even with mocked API');
      await screenshot(page, '10_vote_page_debug');
    }

    // Mock vote cast response for success screen
    await page.route('**/api/votes/vote/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Vote Cast Successfully',
          receipt: {
            voter_id: 'V100',
            candidate: 'Priya Patel',
            party: 'Progressive Alliance',
            election: 'General Election 2025',
            timestamp: new Date().toISOString(),
            block_index: 42,
            block_hash: 'a3f8c291d4e7b2f1e9c0d5a8b3f6e2c1d4a7b0e3f6c9d2a5b8e1f4c7d0a3b6e9f2c5d8a1b4e7f0c3d6a9b2e5f8c1d4a7b0e3f6c9d2a5b8e1f4c7d0a3b6e9f2'
          }
        })
      });
    });

  } catch (err) {
    console.error('ERROR:', err.message);
    try { await screenshot(page, 'vote_error'); } catch(e) {}
  }

  await browser.close();
  console.log(`Done! Screenshots in: ${OUT_DIR}`);
})();
