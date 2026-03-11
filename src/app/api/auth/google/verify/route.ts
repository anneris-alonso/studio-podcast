import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from 'google-auth-library';
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

const SESSION_COOKIE_NAME = 'studio_session';
const SESSION_EXPIRY_DAYS = 7;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: "missing_token" }, { status: 400 });
        }

        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        
        if (!payload || !payload.email) {
            return NextResponse.json({ error: "invalid_token" }, { status: 401 });
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
            logger.info("New user created via Google client-side login", { userId: user.id, email });
        } else if (!(user as any).googleId) {
            // Link Google ID to existing account if not linked
            user = await (prisma.user as any).update({
                where: { id: user.id },
                data: { googleId }
            });
            logger.info("Google ID linked to existing user account", { userId: user.id, email });
        }

        // 2. Create Session
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

        logger.info("User logged in via Google (Client-Side)", { userId: user.id, email, role: user.role });

        return NextResponse.json({ 
            success: true, 
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error: any) {
        logger.error("Google Token Verification error", { error: error.message });
        return NextResponse.json({ error: "verification_failed" }, { status: 500 });
    }
}
