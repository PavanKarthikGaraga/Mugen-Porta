-- ============================================================================
-- Migrate badge_definitions.icon from emoji glyphs to stable icon names
-- ============================================================================
--
-- WHY
--   badge_definitions.icon was seeded with emoji (🏆, 🧠, 💃, …). Emoji look
--   unprofessional in the badge wallet, and render as missing-glyph boxes in
--   the downloadable PDF/SVG credential, which embeds no emoji font.
--
--   The app now resolves icons through my-app/src/lib/badgeIcons.tsx, which
--   maps each name to a Feather vector icon. That module still understands the
--   old emoji, so the UI is already correct whether or not you run this file —
--   running it just cleans the stored data so new tooling doesn't have to
--   carry the emoji lookup forever.
--
-- SAFETY
--   Only UPDATE statements against a single column. No schema changes, no
--   DELETEs, no stored procedures, so this runs on any MySQL version.
--   Take a backup of badge_definitions first if you want to be able to roll
--   back:  CREATE TABLE badge_definitions_bak_icons AS SELECT * FROM badge_definitions;
--
-- HOW TO RUN
--   mysql -u <user> -p <database> < db/migrate_badge_icons.sql
--   (or paste into phpMyAdmin's Import / SQL tab)
-- ============================================================================

START TRANSACTION;

-- ── Literary, Cultural & Heritage packs ──────────────────────────────────────
UPDATE badge_definitions SET icon = 'activity'      WHERE icon = '💃';  -- Dance
UPDATE badge_definitions SET icon = 'users'         WHERE icon = '🎭';  -- Theatre
UPDATE badge_definitions SET icon = 'film'          WHERE icon = '🎬';  -- Film
UPDATE badge_definitions SET icon = 'music'         WHERE icon = '🎵';  -- Music
UPDATE badge_definitions SET icon = 'book-open'     WHERE icon = '📖';  -- Literature
UPDATE badge_definitions SET icon = 'scissors'      WHERE icon = '🧵';  -- Textile & craft
UPDATE badge_definitions SET icon = 'shopping-bag'  WHERE icon = '👗';  -- Fashion
UPDATE badge_definitions SET icon = 'feather'       WHERE icon = '🎨';  -- Fine art
UPDATE badge_definitions SET icon = 'trending-up'   WHERE icon = '🧗';  -- Adventure
UPDATE badge_definitions SET icon = 'target'        WHERE icon = '🎮';  -- Gaming & esports
UPDATE badge_definitions SET icon = 'camera'        WHERE icon = '📷';  -- Photography

-- ── Technology & Emerging Technologies packs ─────────────────────────────────
-- Some of these were stored with a trailing variation selector (U+FE0F) and
-- some without, so both spellings are handled.
UPDATE badge_definitions SET icon = 'cpu'           WHERE icon = '🧠';   -- Artificial Intelligence
UPDATE badge_definitions SET icon = 'link'          WHERE icon IN ('⛓️', '⛓');  -- Blockchain & Web3
UPDATE badge_definitions SET icon = 'cloud'         WHERE icon IN ('☁️', '☁');  -- Cloud & DevOps
UPDATE badge_definitions SET icon = 'shield'        WHERE icon IN ('🛡️', '🛡');  -- Cybersecurity
UPDATE badge_definitions SET icon = 'bar-chart-2'   WHERE icon = '📊';   -- Data Science
UPDATE badge_definitions SET icon = 'wifi'          WHERE icon = '🔌';   -- Internet of Things
UPDATE badge_definitions SET icon = 'sun'           WHERE icon = '🌾';   -- AgriTech
UPDATE badge_definitions SET icon = 'activity'      WHERE icon = '🧬';   -- Biotechnology
UPDATE badge_definitions SET icon = 'send'          WHERE icon = '🚀';   -- SpaceTech
UPDATE badge_definitions SET icon = 'tool'          WHERE icon = '🤖';   -- Robotics
UPDATE badge_definitions SET icon = 'dollar-sign'   WHERE icon = '💰';   -- FinTech
UPDATE badge_definitions SET icon = 'home'          WHERE icon IN ('🏙️', '🏙');  -- Smart Cities
UPDATE badge_definitions SET icon = 'book'          WHERE icon = '📚';   -- EdTech
UPDATE badge_definitions SET icon = 'file-text'     WHERE icon IN ('⚖️', '⚖');  -- Technology Policy

-- ── Generic / milestone badges ───────────────────────────────────────────────
UPDATE badge_definitions SET icon = 'star'          WHERE icon IN ('⭐', '🌟');
UPDATE badge_definitions SET icon = 'globe'         WHERE icon = '🌍';
UPDATE badge_definitions SET icon = 'trending-up'   WHERE icon = '🌱';
UPDATE badge_definitions SET icon = 'activity'      WHERE icon = '🏃';
UPDATE badge_definitions SET icon = 'award'         WHERE icon IN ('🏅', '🏆');
UPDATE badge_definitions SET icon = 'zap'           WHERE icon = '💡';
UPDATE badge_definitions SET icon = 'cpu'           WHERE icon = '💻';
UPDATE badge_definitions SET icon = 'mic'           WHERE icon IN ('🗣️', '🗣');
UPDATE badge_definitions SET icon = 'compass'       WHERE icon = '🧭';
UPDATE badge_definitions SET icon = 'lock'          WHERE icon = '🔒';

-- ── Catch-all ────────────────────────────────────────────────────────────────
-- Anything still holding a non-ASCII character (an emoji added after this file
-- was written) falls back to a sensible icon for its domain, so no badge is
-- left rendering a broken glyph.
UPDATE badge_definitions
SET icon = CASE UPPER(COALESCE(domain, ''))
    WHEN 'TEC' THEN 'cpu'
    WHEN 'LCH' THEN 'book-open'
    WHEN 'ESO' THEN 'heart'
    WHEN 'IIE' THEN 'zap'
    WHEN 'HWB' THEN 'activity'
    ELSE 'award'
END
WHERE icon IS NOT NULL
  AND icon <> ''
  AND icon REGEXP '[^ -~]';

-- Badges with no icon at all also get their domain default.
UPDATE badge_definitions
SET icon = CASE UPPER(COALESCE(domain, ''))
    WHEN 'TEC' THEN 'cpu'
    WHEN 'LCH' THEN 'book-open'
    WHEN 'ESO' THEN 'heart'
    WHEN 'IIE' THEN 'zap'
    WHEN 'HWB' THEN 'activity'
    ELSE 'award'
END
WHERE icon IS NULL OR icon = '';

COMMIT;

-- ── Verification ─────────────────────────────────────────────────────────────
-- Expect zero rows. Any row returned still holds a non-ASCII icon value.
SELECT id, code, name, domain, icon
FROM badge_definitions
WHERE icon REGEXP '[^ -~]';

-- Sanity check: the distribution of icons now in use.
SELECT icon, COUNT(*) AS badges
FROM badge_definitions
GROUP BY icon
ORDER BY badges DESC;
