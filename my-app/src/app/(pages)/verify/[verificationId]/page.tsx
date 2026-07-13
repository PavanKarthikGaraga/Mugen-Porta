import { Metadata } from 'next';
import BadgeVerifyClient from '@/app/components/BadgeVerifyClient';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function generateMetadata(
    { params }: { params: Promise<{ verificationId: string }> }
): Promise<Metadata> {
    const { verificationId } = await params;
    try {
        const res = await fetch(`${APP_URL}/api/verify/${verificationId}`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data.valid) {
                const { badge, recipient } = data;
                const title = `${recipient.name} earned "${badge.name}" | SAMAM`;
                const description = `${recipient.name} was awarded the "${badge.name}" digital badge by KL University SAMAM. ${badge.description || ''}`;
                return {
                    title,
                    description,
                    openGraph: { title, description, type: 'website', siteName: 'SAMAM — KL University' },
                    twitter: { card: 'summary', title, description },
                };
            }
        }
    } catch { /* fallthrough */ }
    return {
        title: 'Badge Verification | SAMAM',
        description: 'Verify a SAMAM digital badge issued by KL University.',
    };
}

export default async function BadgeVerifyPage(
    { params }: { params: Promise<{ verificationId: string }> }
) {
    const { verificationId } = await params;
    return <BadgeVerifyClient verificationId={verificationId} />;
}
