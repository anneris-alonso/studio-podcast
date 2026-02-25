import { NextRequest, NextResponse } from "next/server";
import { verifyGoogleToken } from "@/lib/google-auth";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

const SESSION_COOKIE_NAME = 'studio_session';
const SESSION_EXPIRY_DAYS = 7;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    try {
        const payload = await verifyGoogleToken(code);
        
        if (!payload || !payload.email) {
            return NextResponse.redirect(new URL('/login?error=invalid_google_account', request.url));
        }

        const email = payload.email;
        const name = payload.name || email.split('@')[0];
        const googleId = payload.sub;

        // 1. Find or create user
        let user = await (prisma.user as any).findFirst({
            where: {
                OR: [
                    { googleId },
                    { email }
                ]
            }
        });

        if (!user) {
            user = await (prisma.user as any).create({
                data: {
                    email,
                    name,
                    googleId,
                    role: 'CLIENT'
                }
            });
            logger.info("New user created via Google login", { userId: user.id, email });
        } else if (!(user as any).googleId) {
            // Link Google ID to existing account if not linked
            user = await (prisma.user as any).update({
                where: { id: user.id },
                data: { googleId }
            });
            logger.info("Google ID linked to existing user account", { userId: user.id, email });
        }

        // 2. Create Session (Same logic as lib/auth.ts login)
        const session = await prisma.session.create({
            data: {
                userId: user.id,
                expiresAt: new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            },
        });

        // 3. Set Cookie
        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE_NAME, session.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: session.expiresAt,
        });

        logger.info("User logged in via Google", { userId: user.id, email, role: user.role });

        // 4. Redirect based on role
        const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
        const redirectUrl = isAdmin ? "/admin/studios" : "/account/bookings";
    
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error: any) {
        logger.error("Google Auth Callback error", { error: error.message });
        return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
    }
}
