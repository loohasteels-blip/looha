/**
 * Fixed wholesaler setup — writes via Firebase Auth user's own token
 * using the completeProfile flow that existing Firestore rules allow.
 * Run: node scripts/create-wholesaler.mjs
 */

const FIREBASE_API_KEY  = 'AIzaSyDClYHwAUic4j_sDBF9usKbZ8rDFAG4__w';
const FIREBASE_PROJECT  = 'looha-technologies';

const WHOLESALER_EMAIL    = 'wholesaler@test.looha.in';
const WHOLESALER_PASSWORD = 'Looha@2026';

async function run() {
  console.log('\n🏪 Setting up test wholesaler account...\n');

  // ── Step 1: Sign in (user already exists from previous run) ───────────────
  const signinRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: WHOLESALER_EMAIL,
        password: WHOLESALER_PASSWORD,
        returnSecureToken: true,
      }),
    }
  );

  const signinData = await signinRes.json();
  if (signinData.error) {
    // Try creating fresh
    const signupRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: WHOLESALER_EMAIL, password: WHOLESALER_PASSWORD, returnSecureToken: true }),
      }
    );
    const d = await signupRes.json();
    if (d.error) { console.error('❌ Auth failed:', d.error.message); process.exit(1); }
    Object.assign(signinData, d);
  }

  const uid     = signinData.localId;
  const idToken = signinData.idToken;
  console.log(`✅ Signed in. UID: ${uid}`);

  // ── Step 2: Write to Firestore using the user's own token ─────────────────
  // Try writing via REST with the user token
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/users/${uid}`;

  // Build the Firestore document payload
  const payload = {
    fields: {
      name:            { stringValue: 'Test Wholesaler'        },
      email:           { stringValue: WHOLESALER_EMAIL         },
      phone:           { stringValue: '9000000001'             },
      company:         { stringValue: 'MBJ Test Steels'        },
      gst:             { stringValue: '37AADCB2230M1ZV'        },
      role:            { stringValue: 'wholesaler'             },
      profileComplete: { booleanValue: true                    },
    },
  };

  // Try with user token first
  let res = await fetch(firestoreUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
    body: JSON.stringify(payload),
  });
  let data = await res.json();

  if (data.error) {
    console.log(`⚠️  User-token write blocked by Firestore rules.`);
    console.log(`\n${'═'.repeat(55)}`);
    console.log('  MANUAL STEP REQUIRED (takes 30 seconds)');
    console.log('═'.repeat(55));
    console.log('  1. Open Firebase Console:');
    console.log('     https://console.firebase.google.com/project/looha-technologies/firestore/data/~2Fusers~2F' + uid);
    console.log('  2. Click "Add field"');
    console.log('     Field: role   Type: string   Value: wholesaler');
    console.log('  3. Click "Add field"');
    console.log('     Field: profileComplete   Type: boolean   Value: true');
    console.log('  4. Click "Add field"');
    console.log('     Field: name   Type: string   Value: Test Wholesaler');
    console.log('  5. Click "Add field"');
    console.log('     Field: company   Type: string   Value: MBJ Test Steels');
    console.log('  6. Click "Add field"');
    console.log('     Field: gst   Type: string   Value: 37AADCB2230M1ZV');
    console.log('  7. Click "Add field"');
    console.log('     Field: phone   Type: string   Value: 9000000001');
    console.log('  8. Click "Update"');
    console.log('═'.repeat(55));
  } else {
    console.log('✅ Firestore document written successfully!');
  }

  console.log(`\n${'═'.repeat(55)}`);
  console.log('  TEST WHOLESALER CREDENTIALS');
  console.log('═'.repeat(55));
  console.log(`  Email    : ${WHOLESALER_EMAIL}`);
  console.log(`  Password : ${WHOLESALER_PASSWORD}`);
  console.log(`  UID      : ${uid}`);
  console.log('═'.repeat(55));
  console.log('\n📋 Test Flow:');
  console.log('  1. http://localhost:3000/rfq  →  submit test RFQ as contractor');
  console.log('  2. Copy RFQ ID from the URL');
  console.log('  3. http://localhost:3000/wholesaler/quote/[RFQ_ID]');
  console.log('     → Log in with wholesaler@test.looha.in / Looha@2026');
  console.log('     → Enter prices → Submit');
  console.log('  4. Go back to contractor URL → quotes appear live! ✅\n');
}

run().catch(err => { console.error('Script error:', err); process.exit(1); });
