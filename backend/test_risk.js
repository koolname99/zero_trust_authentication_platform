const API_BASE = 'http://localhost:5000/api';
const EMAIL = `fp_test_${Date.now()}@example.com`;
const PASSWORD = 'Password123!';

async function runRiskTest() {
  console.log('\n======================================================');
  console.log('   ZERO TRUST PLATFORM: RISK ENGINE FALSE POSITIVE TEST');
  console.log('======================================================\n');

  try {
    // ---------------------------------------------------------
    // STEP 1: ESTABLISH BASELINE
    // ---------------------------------------------------------
    console.log('[STEP 1] Establishing Baseline (Registering new user)');
    await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    console.log(`  -> User Registered: ${EMAIL}`);
    const loginBaseline = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-device-fingerprint': 'device-baseline-123'
        },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    
    // We expect score to be around 0 or 10 because it's the very first login
    console.log(`  -> Baseline Login HTTP ${loginBaseline.status}. Device trusted.\n`);

    // ---------------------------------------------------------
    // STEP 2: FALSE POSITIVE CHECK (Minor Anomaly)
    // ---------------------------------------------------------
    console.log('[STEP 2] False Positive Check (Simulating a minor browser update)');
    console.log('  -> The user is logging in from their trusted home IP, but their browser footprint changed slightly.');
    
    const loginFP = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-device-fingerprint': 'device-updated-456' // New device penalty (+25)
        },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    const fpData = await loginFP.json();

    console.log(`  -> Risk Score Evaluated: ${fpData.riskScore}`);
    if (fpData.riskScore > 25) {
        console.log(`  -> [FAIL] System incorrectly penalized a minor anomaly too heavily! (Score > 25)`);
    } else {
        console.log(`  -> [PASS] System successfully authorized the user frictionlessly (Score <= 25).\n`);
    }

    // ---------------------------------------------------------
    // STEP 3: TRUE POSITIVE CHECK (Major Anomaly)
    // ---------------------------------------------------------
    console.log('[STEP 3] True Positive Check (Simulating a malicious attack pattern)');
    console.log('  -> Attacker guesses the password wrong twice, then gets it right from an unknown device.');
    
    // Two wrong guesses (+20 penalty)
    await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-device-fingerprint': 'hacker-device-999' },
        body: JSON.stringify({ email: EMAIL, password: 'wrong' })
    });
    await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-device-fingerprint': 'hacker-device-999' },
        body: JSON.stringify({ email: EMAIL, password: 'wrong' })
    });

    // Correct guess but heavily penalized
    const loginTP = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-device-fingerprint': 'hacker-device-999' // New device penalty (+25)
        },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    const tpData = await loginTP.json();

    console.log(`  -> Risk Score Evaluated: ${tpData.riskScore}`);
    if (tpData.riskScore > 25) {
        console.log(`  -> [PASS] System correctly calculated a high threat score (> 25) for a malicious attack!`);
    } else {
        console.log(`  -> [FAIL] System failed to penalize a malicious attack pattern!`);
    }

  } catch (err) {
    console.error('Test Execution Error:', err.message);
  }

  console.log('\n======================================================');
  console.log('   EVALUATION COMPLETE');
  console.log('======================================================\n');
}

runRiskTest();
