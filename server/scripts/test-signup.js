/*
Simple test script to simulate user signup and OTP verification.
Run from the `server` folder with: `node scripts/test-signup.js`
Make sure your server is running (npm run dev) and MONGO_URI is configured.

This script tries to:
 1. POST /api/user/signup
 2. If server returns an OTP (development mode), it runs verification.
 3. Otherwise it asks you to run /api/auth/resend-otp or check email.
*/

import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE || 'http://localhost:4001';

async function signup() {
  const payload = {
    name: 'Test User Script',
    email: `testscript+${Date.now()}@example.com`,
    password: 'secret123',
    password_confirmation: 'secret123',
    // omit contact intentionally to test server-side handling
    // contact: ''
    role: 'user1'
  };

  console.log('Signing up with', payload.email);

  const res = await fetch(`${API_BASE}/api/user/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  try {
    const data = JSON.parse(text);
    console.log('Signup response:', res.status, data);
    return data;
  } catch (err) {
    console.log('Signup returned non-JSON:', text);
    return null;
  }
}

async function verify(email, otp) {
  console.log('Verifying', email, otp);
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json();
  console.log('Verify response:', res.status, data);
  return data;
}

(async () => {
  try {
    const signupResult = await signup();
    if (!signupResult) return;

    if (signupResult.otp) {
      // In development the API may return OTP directly
      await verify(signupResult.data?.email || signupResult.email || signupResult.data?.account?.email || signupResult.email, signupResult.otp || signupResult.data?.otp);
      return;
    }

    // If no OTP in response, check returned account info
    const email = signupResult.data?.email || signupResult.email || (signupResult.account && signupResult.account.email);
    if (!email) {
      console.log('Could not determine email from signup response. Inspect response above.');
      return;
    }

    console.log(`Signup succeeded for ${email}. If you are in development, call /api/auth/resend-otp to get OTP or check console logs for OTP.`);

    // Optionally attempt resend-otp in development
    const resendRes = await fetch(`${API_BASE}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const resendData = await resendRes.json();
    console.log('Resend OTP response:', resendRes.status, resendData);

    if (resendData.otp) {
      await verify(email, resendData.otp);
    } else {
      console.log('OTP not returned in response. Check email or server logs.');
    }

  } catch (error) {
    console.error('Test script error:', error);
  }
})();
