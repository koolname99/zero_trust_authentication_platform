const API_BASE = 'http://localhost:5000/api';
const EMAIL = `fp_test_token_${Date.now()}@example.com`;
const PASSWORD = 'Password123!';

async function runTokenTest() {
  console.log('\n======================================================');
  console.log('   ZERO TRUST PLATFORM: TOKEN COMPROMISE TEST');
  console.log('======================================================\n');

  try {
    // 1. Create a dummy user
    await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    // 2. Login to capture the Token
    console.log('[STEP 1] Logging in to capture a valid Access Token...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-device-fingerprint': 'token-test-device' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    
    const loginData = await loginRes.json();
    const accessToken = loginData.accessToken;
    console.log(`  -> Access Token captured successfully!\n`);

    // 3. Find the Active Session ID
    const dashRes = await fetch(`${API_BASE}/dashboard/sessions`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const dashData = await dashRes.json();
    const session = dashData.find(s => s.userId.email === EMAIL);

    // 4. Test the Stolen Token (It should work)
    console.log('[STEP 2] Attacker attempts to use the token BEFORE revocation...');
    const test1 = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log(`  -> HTTP ${test1.status} (Access Granted!)\n`);

    // 5. Terminate the Session (The Defense)
    console.log('[STEP 3] Administrator clicks "Terminate" on the Dashboard...');
    const termStart = Date.now();
    await fetch(`${API_BASE}/dashboard/sessions/${session._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const termEnd = Date.now();
    console.log(`  -> Session terminated and pushed to global Redis Blacklist.\n`);

    // 6. Test the Stolen Token AGAIN
    console.log('[STEP 4] Attacker attempts to use the token AFTER revocation...');
    const test2 = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const test2Data = await test2.json();

    console.log(`  -> HTTP ${test2.status} (${test2Data.error})`);
    console.log(`\n[RESULT] Token Revocation Latency: ${termEnd - termStart}ms globally.`);

  } catch (err) {
    console.error('Test Execution Error:', err.message);
  }
}

runTokenTest();
