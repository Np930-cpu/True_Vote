// Screenshot script using Playwright with system Chromium
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function screenshot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`Saved: ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // 1. Home Page
    console.log('1. Home page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    await screenshot(page, '01_home');

    // 2. Register Page - Step 1 (empty)
    console.log('2. Register page...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(800);
    await screenshot(page, '02_register_step1');

    // 3. Register - Step 1 filled
    await page.fill('input[placeholder="V1001"]', 'V9999');
    await page.fill('input[placeholder="18"]', '25');
    await page.fill('input[placeholder="Your full name"]', 'Rahul Sharma');
    await page.fill('input[placeholder="you@email.com"]', 'rahul@example.com');
    await screenshot(page, '03_register_step1_filled');

    // 4. Login Page
    console.log('3. Login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(800);
    await screenshot(page, '04_login_step1');

    // 5. Login - voter ID filled
    await page.fill('input[placeholder="e.g. V1001"]', 'V100');
    await screenshot(page, '05_login_voter_id_filled');

    // Inject auth tokens to access protected pages
    await page.evaluate(() => {
      localStorage.setItem('voter', JSON.stringify({ voter_id: 'V100', name: 'Rahul Sharma' }));
      localStorage.setItem('access', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake');
    });

    // 6. Elections / Dashboard
    console.log('4. Elections page...');
    await page.goto(`${BASE_URL}/elections`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);
    await screenshot(page, '06_elections_dashboard');

    // 7. Results Page
    console.log('5. Results page...');
    await page.goto(`${BASE_URL}/results`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);
    await screenshot(page, '07_results');

    // 8. Profile Page
    console.log('6. Profile page...');
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '08_profile');

    // 9. Blockchain Page
    console.log('7. Blockchain page...');
    await page.goto(`${BASE_URL}/blockchain`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '09_blockchain');

    // 10. Vote Page - try clicking Vote Now
    console.log('8. Vote page...');
    await page.goto(`${BASE_URL}/elections`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const voteBtn = page.locator('button:has-text("Vote Now")').first();
    const voteBtnVisible = await voteBtn.isVisible().catch(() => false);
    if (voteBtnVisible) {
      await voteBtn.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '10_vote_face_verify_step');
    } else {
      console.log('   No active election found, skipping vote page');
      await screenshot(page, '10_elections_no_active');
    }

    // 11. Admin Login
    console.log('9. Admin Login page...');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(800);
    await screenshot(page, '11_admin_login');

    // 12. Admin Dashboard
    console.log('10. Admin Dashboard...');
    await page.evaluate(() => {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('access', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake');
    });
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);
    await screenshot(page, '12_admin_dashboard');

    // 13. Manage Elections
    console.log('11. Admin Manage Elections...');
    await page.goto(`${BASE_URL}/admin/elections`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '13_admin_manage_elections');

    // 14. Manage Candidates
    console.log('12. Admin Manage Candidates...');
    await page.goto(`${BASE_URL}/admin/candidates`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '14_admin_manage_candidates');

  } catch (err) {
    console.error('ERROR:', err.message);
    try { await screenshot(page, 'error_state'); } catch(e) {}
  }

  await browser.close();
  console.log(`\nDone! Screenshots saved to: ${OUT_DIR}`);
})();
