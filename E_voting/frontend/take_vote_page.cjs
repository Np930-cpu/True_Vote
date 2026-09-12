// Vote page screenshot - inject state via React Router
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

  // Mock all API calls
  await page.route('**/api/elections/candidate/**', route => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Rahul Sharma', party: 'Indian National Party', manifesto: 'Focus on education and infrastructure growth for all citizens of India.', election: 1 },
        { id: 2, name: 'Priya Patel', party: 'Progressive Alliance', manifesto: 'Healthcare reform and digital India initiative for modern governance.', election: 1 },
        { id: 3, name: 'Amit Kumar', party: 'Development Front', manifesto: 'Economic growth through industrial development and job creation programs.', election: 1 },
      ])
    });
  });

  await page.route('**/api/votes/has-voted/**', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ has_voted: false }) });
  });

  await page.route('**/api/elections/election/**', route => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'General Election 2025', description: 'National parliamentary election for all seats across the country.', start_date: '2025-01-01', end_date: '2099-12-31' }
      ])
    });
  });

  await page.route('**/api/votes/vote/**', route => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        message: 'Vote Cast Successfully',
        receipt: {
          voter_id: 'V100',
          candidate: 'Priya Patel',
          party: 'Progressive Alliance',
          election: 'General Election 2025',
          timestamp: '2025-04-28T10:30:00Z',
          block_index: 42,
          block_hash: 'a3f8c291d4e7b2f1e9c0d5a8b3f6e2c1d4a7b0e3f6c9d2a5b8e1f4c7d0a3b6e9f2c5d8a1b4e7f0c3d6a9b2e5f8c1d4a7b0e3f6c9d2a5b8e1f4c7d0a3b6e9f2'
        }
      })
    });
  });

  await page.route('**/api/users/profile/**', route => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        voter_id: 'V100', name: 'Rahul Sharma', age: 28,
        email_id: 'rahul@example.com', otp_verified: true,
        face_registered: true, voted_elections: [1]
      })
    });
  });

  await page.route('**/api/votes/dashboard/**', route => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        total_voters: 150, total_votes: 89,
        candidate_votes: [
          { candidate__name: 'Priya Patel', total: 42 },
          { candidate__name: 'Rahul Sharma', total: 31 },
          { candidate__name: 'Amit Kumar', total: 16 },
        ],
        winner: { candidate__name: 'Priya Patel', total: 42 }
      })
    });
  });

  await page.route('**/api/votes/results/**', route => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        results: [
          { candidate__name: 'Priya Patel', total_vote: 42 },
          { candidate__name: 'Rahul Sharma', total_vote: 31 },
          { candidate__name: 'Amit Kumar', total_vote: 16 },
        ],
        winner: { candidate__name: 'Priya Patel', total_vote: 42 }
      })
    });
  });

  await page.route('**/blockchain/**', route => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        chain: [
          { index: 1, voter_id: 'V100', candidate_id: 2, timestamp: '2025-04-28T09:00:00Z', previous_hash: '0000000000', hash: 'a3f8c291d4e7b2f1e9c0' },
          { index: 2, voter_id: 'V101', candidate_id: 1, timestamp: '2025-04-28T09:15:00Z', previous_hash: 'a3f8c291d4e7b2f1e9c0', hash: 'b7d2e104f9a3c6d8e1b4' },
          { index: 3, voter_id: 'V102', candidate_id: 2, timestamp: '2025-04-28T09:30:00Z', previous_hash: 'b7d2e104f9a3c6d8e1b4', hash: 'c1e5f8a2d4b7e0c3f6a9' },
        ],
        valid: true
      })
    });
  });

  try {
    // Set auth
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => {
      localStorage.setItem('voter', JSON.stringify({ voter_id: 'V100', name: 'Rahul Sharma' }));
      localStorage.setItem('access', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.fake');
    });

    // Elections page with mocked data
    console.log('Elections page with data...');
    await page.goto(`${BASE_URL}/elections`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '06_elections_with_data');

    // Click Vote Now
    const voteBtn = page.locator('button:has-text("Vote Now")').first();
    const visible = await voteBtn.isVisible().catch(() => false);
    console.log('Vote Now button visible:', visible);

    if (visible) {
      await voteBtn.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '10a_vote_face_verify');
    }

    // Results with data
    console.log('Results page with data...');
    await page.goto(`${BASE_URL}/results`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);
    await screenshot(page, '07_results_with_data');

    // Profile with data
    console.log('Profile page with data...');
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '08_profile_with_data');

    // Blockchain with data
    console.log('Blockchain page with data...');
    await page.goto(`${BASE_URL}/blockchain`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '09_blockchain_with_data');

    // Admin dashboard with data
    console.log('Admin dashboard with data...');
    await page.evaluate(() => {
      localStorage.setItem('isAdmin', 'true');
    });
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);
    await screenshot(page, '12_admin_dashboard_with_data');

  } catch (err) {
    console.error('ERROR:', err.message);
    try { await screenshot(page, 'debug_error'); } catch(e) {}
  }

  await browser.close();
  console.log(`\nDone! Screenshots in: ${OUT_DIR}`);
})();
