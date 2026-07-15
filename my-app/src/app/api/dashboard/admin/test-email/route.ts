import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { sendTestWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const result = await sendTestWelcomeEmail(email);

        if (result.success) {
            return NextResponse.json({ message: 'Test email sent successfully!' });
        } else {
            return NextResponse.json({ message: 'Failed to send test email', error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Test Email Error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
