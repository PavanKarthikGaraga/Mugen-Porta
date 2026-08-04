import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { verifyAdminToken } from '../../auth-helper';
import { ensureLeadChildClubsColumn } from '@/lib/leadScope';

const VALID_DOMAINS = ['TEC', 'LCH', 'IIE', 'HWB', 'ESO'];

// Idempotent, matching the sibling create route's ensureCouncilTable — a
// council row edited before that route ever ran (e.g. this endpoint hit
// first) still needs assignedDomains to exist.
async function ensureCouncilDomainsColumn() {
    try {
        await pool.query(`ALTER TABLE council ADD COLUMN assignedDomains JSON NULL`);
    } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
}

export async function POST(request, { params }) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { username } = params;
        const body = await request.json();
        const { name, email, phoneNumber, year, branch, clubId, assignedClubs, assignedDomains, childClubIds, password } = body;

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // A blank password field means "leave it as-is" — only touch it when
        // the admin actually typed a new one.
        const newPassword = typeof password === 'string' && password.trim().length > 0 ? password.trim() : null;
        if (newPassword && newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const domainList: string[] = Array.isArray(assignedDomains)
            ? assignedDomains.filter((d: any) => typeof d === 'string' && VALID_DOMAINS.includes(d))
            : [];

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Get current user role
            const [userResult] = await connection.execute(
                'SELECT role FROM users WHERE username = ?',
                [username]
            );

            if (userResult.length === 0) {
                await connection.rollback();
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            const role = userResult[0].role;

            if (role === 'council' && domainList.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'At least one domain must be assigned for council' }, { status: 400 });
            }

            // Update users table — name/email for everyone; password only
            // when a new one was actually supplied. Council has no name/email
            // of its own (they're synthesized at creation — see admin/users/
            // route.ts), so this just leaves those columns as they are for
            // council when the request doesn't include them.
            if (newPassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 12);
                await connection.execute(
                    'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), password = ?, plainPassword = ? WHERE username = ?',
                    [name || null, email || null, hashedPassword, newPassword, username]
                );
            } else {
                await connection.execute(
                    'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE username = ?',
                    [name || null, email || null, username]
                );
            }

            // Update role-specific table
            if (role === 'lead') {
                await ensureLeadChildClubsColumn();

                // Child clubs are TEC-domain-only: a lead can only be mapped
                // to additional clubs beyond their parent club when that
                // parent club is itself in TEC, and every proposed child
                // club must also be in TEC. Validated here rather than
                // trusted from the request body, since this determines what
                // students/data the lead can see and manage.
                let childClubIdsJson: string | null = null;
                if (Array.isArray(childClubIds) && childClubIds.length > 0) {
                    const [parentRows]: any = await connection.execute(
                        'SELECT domain FROM clubs WHERE id = ?',
                        [clubId]
                    );
                    if (parentRows[0]?.domain !== 'TEC') {
                        await connection.rollback();
                        return NextResponse.json({ error: "Child clubs can only be assigned when the lead's parent club is in the TEC domain" }, { status: 400 });
                    }

                    const uniqueChildIds = Array.from(new Set(
                        (childClubIds as any[]).filter((id) => typeof id === 'string' && id && id !== clubId)
                    ));
                    if (uniqueChildIds.length > 0) {
                        const placeholders = uniqueChildIds.map(() => '?').join(',');
                        const [childRows]: any = await connection.execute(
                            `SELECT id FROM clubs WHERE id IN (${placeholders}) AND domain = 'TEC'`,
                            uniqueChildIds
                        );
                        const validIds = new Set(childRows.map((r: any) => r.id));
                        const invalid = uniqueChildIds.filter((id) => !validIds.has(id));
                        if (invalid.length > 0) {
                            await connection.rollback();
                            return NextResponse.json({ error: `These clubs are not in the TEC domain: ${invalid.join(', ')}` }, { status: 400 });
                        }
                        childClubIdsJson = JSON.stringify(uniqueChildIds);
                    }
                }

                await connection.execute(
                    'UPDATE leads SET name = ?, email = ?, phoneNumber = ?, year = ?, branch = ?, clubId = ?, childClubIds = ? WHERE username = ?',
                    [name, email, phoneNumber, year, branch, clubId, childClubIdsJson, username]
                );
            } else if (role === 'faculty') {
                // faculty has no year/branch columns (that's students/leads only)
                await connection.execute(
                    'UPDATE faculty SET name = ?, email = ?, phoneNumber = ?, assignedClubs = ? WHERE username = ?',
                    [name, email, phoneNumber, JSON.stringify(assignedClubs), username]
                );
            } else if (role === 'council') {
                await ensureCouncilDomainsColumn();
                await connection.execute(
                    'UPDATE council SET assignedDomain = ?, assignedDomains = ? WHERE username = ?',
                    [domainList[0], JSON.stringify(domainList), username]
                );
            }

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: 'User updated successfully'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
