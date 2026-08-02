/**
 * Formatting helpers for an activity's schedule (activity_date / start_time /
 * end_time), shared by the student catalogue and My Activities so both render
 * the same way.
 *
 * MySQL hands these back as an ISO timestamp for DATE and "HH:MM:SS" for TIME,
 * and any of them may be NULL on activities created before scheduling existed.
 */

export function formatActivityDate(value: any): string | null {
    if (!value) return null;
    const raw = typeof value === 'string' ? value.slice(0, 10) : value;
    const d = new Date(typeof raw === 'string' ? `${raw}T00:00:00` : raw);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// "14:30:00" -> "2:30 PM"
function formatTime(value: any): string | null {
    if (!value) return null;
    const [h, m] = String(value).split(':');
    const hour = Number(h);
    if (!Number.isFinite(hour)) return null;
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${m ?? '00'} ${suffix}`;
}

export function formatTimeRange(start: any, end: any): string | null {
    const s = formatTime(start);
    const e = formatTime(end);
    if (s && e) return `${s} – ${e}`;
    return s || e || null;
}
