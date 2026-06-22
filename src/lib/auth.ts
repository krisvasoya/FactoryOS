import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'fallback-super-secret-key-at-least-32-chars-long' : undefined);
export const JWT_SECRET = new TextEncoder().encode(secret || 'temporary-placeholder-secret-for-build-purposes-only-change-in-prod');

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

// Hashing Functions
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session JWT Handling
export async function createSessionToken(user: UserSession): Promise<string> {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable must be set in production.");
  }
  return new jose.SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable must be set in production.");
  }
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

// Get session from request cookies
export async function getSession(req: NextRequest): Promise<UserSession | null> {
  const token = req.cookies.get('session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// Role checking helper
export function checkRole(userRole: string, allowedRoles: string[]): boolean {
  if (userRole === 'Owner') return true; // Owner has access to everything
  return allowedRoles.includes(userRole);
}

// Set session cookie
export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
}

// Clear session cookie
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
