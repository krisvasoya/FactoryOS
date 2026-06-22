import { NextResponse } from 'next/server';

/**
 * GET /api/v1/auth/google
 * Builds the Google OAuth 2.0 authorization URL and redirects the user there.
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
    return NextResponse.json(
      { error: 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.' },
      { status: 503 }
    );
  }

  const redirectUri = `${appUrl}/api/v1/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account', // Always show account picker
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(googleAuthUrl);
}
