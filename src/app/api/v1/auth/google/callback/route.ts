import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface GoogleUserInfo {
  sub: string;       // Google's unique user ID
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name?: string;
  picture?: string;
}

/**
 * GET /api/v1/auth/google/callback
 *
 * Handles the OAuth 2.0 authorization code flow:
 *  1. Exchanges `code` for tokens
 *  2. Fetches Google user profile
 *  3. Finds or creates the User (and Company if brand-new)
 *  4. Issues a JWT session cookie
 *  5. Redirects to /app/dashboard
 */
export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // ── Handle user-denied consent ──────────────────────────────────────────
  if (error || !code) {
    const reason = error || 'no_code';
    return NextResponse.redirect(`${appUrl}/login?error=google_${reason}`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${appUrl}/api/v1/auth/google/callback`;

    // ── Step 1: Exchange authorization code for tokens ───────────────────
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('Google token exchange failed:', errBody);
      return NextResponse.redirect(`${appUrl}/login?error=google_token_failed`);
    }

    const tokens: GoogleTokenResponse = await tokenRes.json();

    // ── Step 2: Fetch Google user profile ────────────────────────────────
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      console.error('Google userinfo fetch failed');
      return NextResponse.redirect(`${appUrl}/login?error=google_profile_failed`);
    }

    const googleUser: GoogleUserInfo = await userInfoRes.json();

    if (!googleUser.email_verified) {
      return NextResponse.redirect(`${appUrl}/login?error=google_email_unverified`);
    }

    // ── Step 3: Find or create the user in our database ─────────────────
    // Note: googleId field will be available after running `prisma migrate dev`
    let user = await db.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.sub },
          { email: googleUser.email.toLowerCase().trim() },
        ],
        deletedAt: null,
      },
      include: { company: true },
    });

    if (user) {
      // Link Google ID if this is an existing email/password user logging in via Google
      if (!user.googleId) {
        user = await db.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.sub },
          include: { company: true },
        });
      }
    } else {
      // ── Brand-new user — create Company + User ──────────────────────────
      const newCompany = await db.company.create({
        data: {
          name: `${googleUser.given_name}'s Workspace`,
          email: googleUser.email,
        },
      });

      user = await db.user.create({
        data: {
          companyId: newCompany.id,
          email: googleUser.email.toLowerCase().trim(),
          name: googleUser.name,
          googleId: googleUser.sub,
          // passwordHash omitted — field is optional for Google-only users
          role: 'Owner',       // First user of a new company is Owner
        },
        include: { company: true },
      });

      // Audit log for new user
      await db.auditLog.create({
        data: {
          companyId: newCompany.id,
          userId: user.id,
          action: 'Register',
          entity: 'User',
          entityId: user.id,
          details: 'New user registered via Google OAuth',
        },
      });
    }

    // ── Step 4: Create JWT session ───────────────────────────────────────
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    });

    // Audit log for login
    await db.auditLog.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        action: 'Login',
        entity: 'User',
        entityId: user.id,
        details: 'Successful login via Google OAuth',
      },
    });

    // ── Step 5: Set session cookie and redirect ──────────────────────────
    const response = NextResponse.redirect(`${appUrl}/app/dashboard`);
    setSessionCookie(response, token);
    return response;

  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}/login?error=google_internal`);
  }
}
