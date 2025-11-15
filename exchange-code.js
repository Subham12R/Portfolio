// Quick script to exchange WakaTime OAuth code
// Run: node exchange-code.js

const code = 'wWbNugCDAgamcTS8sSnM3UeScuPSFMKDQIkIY6QVNAdX9CpoeSioGLzUSw7Reg5ozmokTUOBwYhsQOEq';
const API_URL = process.env.API_URL || 'https://portfolio-ea4s.onrender.com';
// IMPORTANT: This must match the redirect_uri used in the authorization URL
const REDIRECT_URI = 'https://subham12r.netlify.app/callback';

async function exchange() {
  try {
    console.log('🔄 Exchanging authorization code...\n');
    console.log('📍 Using redirect_uri:', REDIRECT_URI);
    console.log('⚠️  Note: Authorization codes are single-use. If this fails, get a fresh code.\n');
    
    const response = await fetch(`${API_URL}/api/wakatime/oauth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Tokens received.\n');
      console.log('📝 Add these to your backend/.env file:\n');
      if (data.tokens) {
        console.log(`WAKATIME_ACCESS_TOKEN=${data.tokens.access_token}`);
        console.log(`WAKATIME_REFRESH_TOKEN=${data.tokens.refresh_token}`);
        console.log(`WAKATIME_TOKEN_EXPIRES_AT=${data.tokens.expires_at}\n`);
      }
      console.log('✨ Real-time data fetching is now active!');
    } else {
      console.error('❌ Error:', data.error || data.message);
      if (data.details) {
        console.error('📋 Details:', JSON.stringify(data.details, null, 2));
      }
      if (data.error === 'invalid_request') {
        console.error('\n💡 This usually means:');
        console.error('   1. The authorization code was already used (single-use)');
        console.error('   2. The redirect_uri doesn\'t match');
        console.error('   3. The code has expired');
        console.error('\n🔄 Solution: Get a fresh authorization code by visiting:');
        console.error(`   ${API_URL}/api/wakatime/oauth/authorize`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Tip: Make sure your backend server is running on port 5000');
  }
}

exchange();

