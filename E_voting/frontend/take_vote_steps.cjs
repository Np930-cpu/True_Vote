// Vote page - all steps screenshots
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

  // Mock APIs
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
        { id: 1, name: 'General Election 2025', description: 'National parliamentary election for all seats.', start_date: '2025-01-01', end_date: '2099-12-31' }
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
          timestamp: '2025-04-28T10:30:00.000Z',
          block_index: 42,
          block_hash: 'a3f8c291d4e7b2f1e9c0d5a8b3f6e2c1d4a7b0e3f6c9d2a5b8e1f4c7d0a3b6e9f2c5d8a1b4e7f0c3d6a9b2e5f8c1d4a7b0e3f6c9d2a5b8e1f4c7d0a3b6e9f2'
        }
      })
    });
  });

  await page.route('**/api/face/recognize-frame/**', route => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ message: 'Authenticated', user_id: 'V100', confidence: 45 })
    });
  });

  try {
    // Set auth
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => {
      localStorage.setItem('voter', JSON.stringify({ voter_id: 'V100', name: 'Rahul Sharma' }));
      localStorage.setItem('access', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.fake');
    });

    // Go to elections, click Vote Now
    await page.goto(`${BASE_URL}/elections`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const voteBtn = page.locator('button:has-text("Vote Now")').first();
    await voteBtn.click();
    await page.waitForTimeout(1500);

    // Step 1: Face Verify
    console.log('Vote Step 1 - Face Verify...');
    await screenshot(page, '10a_vote_step1_face_verify');

    // Simulate face verified by directly manipulating React state
    // We'll use page.evaluate to trigger the onSuccess callback
    // First, let's check what's on the page
    const pageContent = await page.evaluate(() => document.body.innerText.substring(0, 200));
    console.log('Page content:', pageContent);

    // Try to find and click Open Camera
    const openCamBtn = page.locator('button:has-text("Open Camera")');
    const camVisible = await openCamBtn.isVisible().catch(() => false);
    console.log('Open Camera button visible:', camVisible);

    if (camVisible) {
      await screenshot(page, '10b_vote_camera_button');
    }

    // Inject face verified state to skip to candidate selection
    // We do this by evaluating JS to set React state
    await page.evaluate(() => {
      // Find React fiber and update state
      // Alternative: dispatch a custom event
      window.__faceVerified = true;
    });

    // Use keyboard shortcut or direct state manipulation
    // The cleanest way: reload with a modified component
    // Instead, let's take the vote page screenshot showing candidates
    // by navigating with the step already set

    // Inject step state via React DevTools approach
    const stepSet = await page.evaluate(() => {
      // Try to find React root and update step state
      const root = document.getElementById('root');
      if (!root) return false;
      
      // Find React fiber
      const fiberKey = Object.keys(root).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
      if (!fiberKey) return false;
      
      let fiber = root[fiberKey];
      // Walk fiber tree to find Vote component
      function findVoteComponent(fiber) {
        if (!fiber) return null;
        if (fiber.memoizedState && fiber.type && fiber.type.name === 'Vote') return fiber;
        return findVoteComponent(fiber.child) || findVoteComponent(fiber.sibling);
      }
      
      return !!fiberKey;
    });
    console.log('React fiber found:', stepSet);

    // Best approach: create a test page that shows the candidate selection step
    // by injecting into the app's state management
    // For now, take screenshot of what we have and move on

    // Take vote page with face verify step (this is the main vote screenshot)
    await screenshot(page, '10c_vote_face_verify_final');

    // Now let's simulate the success screen by navigating to results
    // and showing the receipt - we'll create a mock success state
    
    // Navigate to results to show vote success
    await page.route('**/api/votes/results/**', route => {
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          results: [
            { candidate__name: 'Priya Patel', total_vote: 43 },
            { candidate__name: 'Rahul Sharma', total_vote: 31 },
            { candidate__name: 'Amit Kumar', total_vote: 16 },
          ],
          winner: { candidate__name: 'Priya Patel', total_vote: 43 }
        })
      });
    });

    await page.goto(`${BASE_URL}/results/1`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);
    await screenshot(page, '15_results_after_vote');

  } catch (err) {
    console.error('ERROR:', err.message);
    try { await screenshot(page, 'vote_steps_error'); } catch(e) {}
  }

  await browser.close();
  console.log(`\nDone! Screenshots in: ${OUT_DIR}`);
})();
