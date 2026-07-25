import { Metadata } from 'next';
import BadgeVerifyClient from '@/app/components/BadgeVerifyClient';
import { getBadgeVerification } from '@/lib/badgeVerification';

const ISSUER_NAME = 'KL SAC (Student Activity Center)';

export async function generateMetadata(
    { params }: { params: Promise<{ verificationId: string }> }
): Promise<Metadata> {
    const { verificationId } = await params;
    try {
        // Queried directly from the database (no self-HTTP round trip) -
        // that self-fetch used to be what made this page slow to load.
        const result = await getBadgeVerification(verificationId);
        if (result.valid) {
            const { badge, recipient } = result;
            const title = `${recipient.name} earned "${badge.name}" | SAMAM`;
            const description = `${recipient.name} was awarded the "${badge.name}" digital badge by ${ISSUER_NAME} SAMAM. ${badge.description || ''}`;
            return {
                title,
                description,
                openGraph: { title, description, type: 'website', siteName: `SAMAM — ${ISSUER_NAME}` },
                twitter: { card: 'summary', title, description },
            };
        }
    } catch { /* fallthrough */ }
    return {
        title: 'Badge Verification | SAMAM',
        description: `Verify a SAMAM digital badge issued by ${ISSUER_NAME}.`,
    };
}

export default async function BadgeVerifyPage(
    { params }: { params: Promise<{ verificationId: string }> }
) {
    const { verificationId } = await params;
    // Data is fetched once, server-side, and handed straight to the client
    // component as `initialData` - the page renders fully populated on the
    // first paint instead of showing a spinner and then re-fetching the
    // same data again in the browser.
    let initialData = null;
    try {
        const result = await getBadgeVerification(verificationId);
        initialData = result;
    } catch {
        initialData = null;
    }
    return <BadgeVerifyClient verificationId={verificationId} initialData={initialData} />;
}
