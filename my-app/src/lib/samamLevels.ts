/**
 * The canonical SAMAM level ladder.
 *
 * These thresholds live in app/Data/activities-mock.ts (LEVELS), but that
 * file is a multi-megabyte mock catalogue — not something an API route
 * should pull in. Duplicated here as the lightweight server-side source of
 * truth so level, next level and progress are all computed from a student's
 * actual points rather than read from student_profiles.level_progress, a
 * column nothing keeps up to date (it reads 0 for everyone).
 */

export interface SamamLevel {
    id: string;
    name: string;
    creditsRequired: number;
}

export const SAMAM_LEVELS: SamamLevel[] = [
    { id: 'explorer',     name: 'Explorer',     creditsRequired: 0    },
    { id: 'foundation',   name: 'Foundation',   creditsRequired: 500  },
    { id: 'practitioner', name: 'Practitioner', creditsRequired: 1250 },
    { id: 'leader',       name: 'Leader',       creditsRequired: 2000 },
    { id: 'innovator',    name: 'Innovator',    creditsRequired: 3000 },
    { id: 'fellow',       name: 'Fellow',       creditsRequired: 4500 },
];

export interface ResolvedLevel {
    level: string;
    nextLevel: string | null;
    /** Points needed to reach the next level; null once at the top. */
    nextLevelAt: number | null;
    /** 0-100, progress from the current level's floor to the next one. */
    levelProgress: number;
}

export function resolveLevel(points: number): ResolvedLevel {
    const total = Number.isFinite(points) && points > 0 ? points : 0;

    // Highest level whose threshold the student has met.
    let idx = 0;
    for (let i = SAMAM_LEVELS.length - 1; i >= 0; i--) {
        if (total >= SAMAM_LEVELS[i].creditsRequired) { idx = i; break; }
    }

    const current = SAMAM_LEVELS[idx];
    const next = SAMAM_LEVELS[idx + 1] ?? null;

    if (!next) {
        return { level: current.name, nextLevel: null, nextLevelAt: null, levelProgress: 100 };
    }

    const span = next.creditsRequired - current.creditsRequired;
    const gained = total - current.creditsRequired;
    const levelProgress = span > 0
        ? Math.max(0, Math.min(100, Math.round((gained / span) * 100)))
        : 0;

    return {
        level: current.name,
        nextLevel: next.name,
        nextLevelAt: next.creditsRequired,
        levelProgress,
    };
}
