const API_BASE = 'http://localhost:5000/api';
const EMAIL = 'bruteforce_test@example.com';

async function runBruteForceTest() {
  console.log('\n======================================================');
  console.log('   ZERO TRUST PLATFORM: BRUTE-FORCE ATTACK TEST (5.1)');
  console.log('======================================================\n');

  try {
    console.log('[STEP 1] Firing 15 concurrent login attempts...');
    let blockedCount = 0;
    const startBruteForce = Date.now();

    const loginAttempts = Array.from({ length: 15 }).map((_, i) => 
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: 'WrongPassword123' })
      })
    );
    
    const results = await Promise.all(loginAttempts);
    const endBruteForce = Date.now();
    
    results.forEach((res, i) => {
       if (res.status === 429) blockedCount++;
       console.log(`  -> Attempt ${i + 1}: HTTP ${res.status}`);
    });

    console.log(`\n[RESULT] Redis Rate Limiter intercepted ${blockedCount} volumetric requests.`);
    console.log(`[METRIC] Mitigation Time: ${endBruteForce - startBruteForce}ms globally.\n`);

  } catch (err) {
    console.error('Test Execution Error:', err.message);
  }
}

runBruteForceTest();
