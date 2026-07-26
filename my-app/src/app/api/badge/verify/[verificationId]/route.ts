import { NextResponse } from 'next/server';
import { safeMessage } from '@/lib/apiSecurity';
import { getBadgeVerification } from '@/lib/badgeVerification';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ verificationId: string }> }
) {
    try {
        const { verificationId } = await params;
        const result: any = await getBadgeVerification(verificationId);

        if (!result.valid) {
            const message: string = result.message || 'Badge not found or verification ID is invalid';
            return NextResponse.json({ message }, { status: message.includes('required') ? 400 : 404 });
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Badge verification error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Verification failed') }, { status: 500 });
    }
}
