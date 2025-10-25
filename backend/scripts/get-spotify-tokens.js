/**
 * Script to get your personal Spotify tokens
 * Run this once to get your access and refresh tokens
 * 
 * Usage: node scripts/get-spotify-tokens.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function getSpotifyTokens() {
  console.log('🎵 Spotify Token Generator');
  console.log('========================\n');
  
  console.log('This script will help you get your personal Spotify tokens.');
  console.log('You only need to do this once!\n');
  
  const clientId = await askQuestion('Enter your Spotify Client ID: ');
  const clientSecret = await askQuestion('Enter your Spotify Client Secret: ');
  
  console.log('\n📋 Step 1: Create Authorization URL');
  console.log('Copy and paste this URL in your browser:');
  
  const scopes = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-read-playback-state'
  ].join(' ');
  
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=http://localhost:3000/callback&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `show_dialog=true`;
  
  console.log(`\n${authUrl}\n`);
  
  console.log('📋 Step 2: Get Authorization Code');
  console.log('After authorizing, you\'ll be redirected to a URL like:');
  console.log('http://localhost:3000/callback?code=YOUR_CODE_HERE');
  console.log('Copy the code from the URL.\n');
  
  const authCode = await askQuestion('Enter the authorization code: ');
  
  console.log('\n🔄 Step 3: Exchanging code for tokens...');
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: 'http://localhost:3000/callback'
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ Error:', data.error_description);
      return;
    }

    console.log('\n✅ Success! Here are your tokens:\n');
    console.log('Add these to your .env file:\n');
    console.log(`SPOTIFY_CLIENT_ID=${clientId}`);
    console.log(`SPOTIFY_CLIENT_SECRET=${clientSecret}`);
    console.log(`SPOTIFY_ACCESS_TOKEN=${data.access_token}`);
    console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`);
    console.log(`SPOTIFY_TOKEN_EXPIRES_AT=${Date.now() + (data.expires_in * 1000)}`);
    
    console.log('\n🎉 Setup complete! Your Spotify widget will now work automatically.');
    console.log('The access token expires in 1 hour, but the refresh token will automatically get a new one.');
    
  } catch (error) {
    console.error('❌ Error getting tokens:', error.message);
  }
  
  rl.close();
}

getSpotifyTokens().catch(console.error);
