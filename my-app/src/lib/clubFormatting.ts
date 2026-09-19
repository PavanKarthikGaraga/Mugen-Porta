export function formatClubDomain(clubName: string | null | undefined): string {
    if (!clubName) return '';
    const trimmed = clubName.trim();
    if (trimmed.toLowerCase().endsWith('club')) {
        return trimmed;
    }
    return `${trimmed} CLUB`;
}
