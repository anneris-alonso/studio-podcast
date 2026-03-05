import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationOtpOnly } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json(
                { message: "Email and code are required." },
                { status: 400 }
            );
        }

        const isValid = await verifyRegistrationOtpOnly(email, otp);

        if (isValid) {
            return NextResponse.json({ message: "Code verified successfully." });
        } else {
            return NextResponse.json(
                { message: "Invalid or expired code." },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return NextResponse.json(
            { message: "An unexpected error occurred during verification." },
            { status: 500 }
        );
    }
}
