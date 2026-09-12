// Capture candidate selection step and vote success
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
  const mockCandidates = [
    { id: 1, name: 'Rahul Sharma', party: 'Indian National Party', manifesto: 'Focus on education and infrastructure growth for all citizens of India.', election: 1 },
    { id: 2, name: 'Priya Patel', party: 'Progressive Alliance', manifesto: 'Healthcare reform and digital India initiative for modern governance.', election: 1 },
    { id: 3, name: 'Amit Kumar', party: 'Development Front', manifesto: 'Economic growth through industrial development and job creation programs.', election: 1 },
  ];

  await page.route('**/api/elections/candidate/**', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCandidates) });
  });
  await page.route('**/api/votes/has-voted/**', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ has_voted: false }) });
  });
  await page.route('**/api/elections/election/**', route => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([{ id: 1, name: 'General Election 2025', description: 'National parliamentary election.', start_date: '2025-01-01', end_date: '2099-12-31' }])
    });
  });
  await page.route('**/api/face/recognize-frame/**', route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Authenticated', user_id: 'V100', confidence: 45 }) });
  });
  await page.route('**/api/votes/vote/**', route => {
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        message: 'Vote Cast Successfully',
        receipt: { voter_id: 'V100', candidate: 'Priya Patel', party: 'Progressive Alliance', election: 'General Election 2025', timestamp: '2025-04-28T10:30:00.000Z', block_index: 42, block_hash: 'a3f8c291d4e7b2f1e9c0d5a8b3f6e2c1d4a7b0e3f6c9d2a5b8e1f4c7d0a3b6e9f2c5d8a1b4e7f0c3d6a9b2e5f8c1d4a7b0e3f6c9d2a5b8e1f4c7d0a3b6e9f2' }
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

    // Go to elections, click Vote Now
    await page.goto(`${BASE_URL}/elections`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Vote Now")').first().click();
    await page.waitForTimeout(1500);

    // We're on Vote page, step = 'face'
    // Inject face verified by finding the FaceVerify component's onSuccess
    // Use page.evaluate to find and call the React component's callback
    const injected = await page.evaluate(() => {
      // Find all React fiber nodes
      function findFibers(element, results = []) {
        if (!element) return results;
        const keys = Object.keys(element);
        const fiberKey = keys.find(k => k.startsWith('__reactFiber'));
        if (fiberKey) {
          let fiber = element[fiberKey];
          while (fiber) {
            if (fiber.memoizedProps && fiber.memoizedProps.onSuccess) {
              results.push(fiber);
            }
            fiber = fiber.return;
          }
        }
        for (const child of element.children || []) {
          findFibers(child, results);
        }
        return results;
      }

      // Try to find the FaceVerify onSuccess prop and call it
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const keys = Object.keys(el);
        const fiberKey = keys.find(k => k.startsWith('__reactFiber'));
        if (!fiberKey) continue;
        let fiber = el[fiberKey];
        while (fiber) {
          if (fiber.memoizedProps && typeof fiber.memoizedProps.onSuccess === 'function') {
            try {
              fiber.memoizedProps.onSuccess('V100');
              return 'called onSuccess';
            } catch(e) {
              return 'error: ' + e.message;
            }
          }
          fiber = fiber.return;
        }
      }
      return 'not found';
    });
    console.log('Face verify inject result:', injected);
    await page.waitForTimeout(1500);

    // Take screenshot of candidate selection step
    console.log('Candidate selection step...');
    await screenshot(page, '10d_vote_step2_candidates');

    // Select a candidate (click second one - Priya Patel)
    const candidateCards = page.locator('.candidate-card');
    const count = await candidateCards.count();
    console.log('Candidate cards found:', count);

    if (count > 0) {
      await candidateCards.nth(1).click(); // Select Priya Patel
      await page.waitForTimeout(500);
      await screenshot(page, '10e_vote_candidate_selected');

      // Click Cast Vote button
      const castBtn = page.locator('button:has-text("Cast Vote")');
      const castVisible = await castBtn.isVisible().catch(() => false);
      if (castVisible) {
        await castBtn.click();
        await page.waitForTimeout(800);
        // Confirmation modal
        await screenshot(page, '10f_vote_confirm_modal');

        // Click Confirm Vote
        const confirmBtn = page.locator('button:has-text("Confirm Vote")');
        const confirmVisible = await confirmBtn.isVisible().catch(() => false);
        if (confirmVisible) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
          // Success screen
          await screenshot(page, '10g_vote_success_receipt');
        }
      }
    }

  } catch (err) {
    console.error('ERROR:', err.message);
    try { await screenshot(page, 'candidate_step_error'); } catch(e) {}
  }

  await browser.close();
  console.log(`\nDone! Screenshots in: ${OUT_DIR}`);
})();
