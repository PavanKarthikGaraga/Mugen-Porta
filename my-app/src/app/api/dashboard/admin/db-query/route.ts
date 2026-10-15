import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyDevAccess } from '../auth-helper';

function splitSqlStatements(sql: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inBacktick = false;
    let inLineComment = false;
    let inBlockComment = false;

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        const nextChar = sql[i + 1];

        if (inLineComment) {
            if (char === '\n') {
                inLineComment = false;
                current += char;
            }
            continue;
        }

        if (inBlockComment) {
            if (char === '*' && nextChar === '/') {
                inBlockComment = false;
                i++;
            }
            continue;
        }

        if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
            if (char === '-' && nextChar === '-') {
                inLineComment = true;
                i++;
                continue;
            }
            if (char === '#') {
                inLineComment = true;
                continue;
            }
            if (char === '/' && nextChar === '*') {
                inBlockComment = true;
                i++;
                continue;
            }
        }

        if (char === "'" && !inDoubleQuote && !inBacktick) {
            if (sql[i - 1] !== '\\') {
                inSingleQuote = !inSingleQuote;
            }
        } else if (char === '"' && !inSingleQuote && !inBacktick) {
            if (sql[i - 1] !== '\\') {
                inDoubleQuote = !inDoubleQuote;
            }
        } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
            if (sql[i - 1] !== '\\') {
                inBacktick = !inBacktick;
            }
        }

        if (char === ';' && !inSingleQuote && !inDoubleQuote && !inBacktick) {
            const trimmed = current.trim();
            if (trimmed) statements.push(trimmed);
            current = '';
        } else {
            current += char;
        }
    }

    const lastTrimmed = current.trim();
    if (lastTrimmed) {
        statements.push(lastTrimmed);
    }

    return statements;
}

export async function POST(request) {
    // Verify dev access (admin + specific username)
    const authResult = await verifyDevAccess(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { query } = await request.json();

        if (!query || !query.trim()) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        const trimmedQuery = query.trim();
        const statements = splitSqlStatements(trimmedQuery);

        if (statements.length === 0) {
            return NextResponse.json(
                { error: 'No valid SQL statement found' },
                { status: 400 }
            );
        }

        const startTime = Date.now();
        const connection = await pool.getConnection();

        try {
            let lastRows: any = [];
            let lastFields: any = null;

            for (const stmt of statements) {
                const [rows, fields] = await connection.query(stmt);
                lastRows = rows;
                lastFields = fields;
            }

            const executionTime = Date.now() - startTime;

            return NextResponse.json({
                success: true,
                data: lastRows,
                metadata: {
                    statementCount: statements.length,
                    rowCount: Array.isArray(lastRows) ? lastRows.length : 0,
                    returnedRows: Array.isArray(lastRows) ? lastRows.length : 0,
                    isLimited: false,
                    executionTime: `${executionTime}ms`,
                    fields: lastFields ? lastFields.map((field: any) => ({
                        name: field.name,
                        type: field.type,
                        flags: field.flags
                    })) : []
                },
                query: trimmedQuery
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Database query error:', error);

        let errorMessage = 'Query execution failed';
        let statusCode = 500;

        if (error.code === 'ER_PARSE_ERROR') {
            errorMessage = 'SQL syntax error: ' + (error.sqlMessage || error.message);
            statusCode = 400;
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = 'Table does not exist: ' + (error.sqlMessage || error.message);
            statusCode = 400;
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
            errorMessage = 'Column does not exist: ' + (error.sqlMessage || error.message);
            statusCode = 400;
        } else if (error.code === 'ER_QUERY_TIMEOUT') {
            errorMessage = 'Query timeout: The query took too long to execute';
            statusCode = 408;
        } else if (error.sqlMessage || error.message) {
            errorMessage = error.sqlMessage || error.message;
            statusCode = 400;
        }

        return NextResponse.json(
            {
                error: errorMessage,
                code: error.code || 'UNKNOWN_ERROR',
                sql: error.sql || undefined
            },
            { status: statusCode }
        );
    }
}

// GET method to return sample queries and table information
export async function GET(request) {
    // Verify dev access (admin + specific username)
    const authResult = await verifyDevAccess(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        // Get list of tables
        const [tables] = await pool.execute<RowDataPacket[]>('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);

        // Get sample queries
        const sampleQueries = [
            {
                name: 'List all students',
                query: 'SELECT * FROM students LIMIT 10;',
                description: 'Get first 10 students with all their details'
            },
            {
                name: 'Student count by domain',
                query: 'SELECT selectedDomain, COUNT(*) as count FROM students GROUP BY selectedDomain;',
                description: 'Count students by selected domain'
            },
            {
                name: 'Active projects',
                query: 'SELECT * FROM projects WHERE status = "active";',
                description: 'List all active projects'
            },
            {
                name: 'Gender distribution',
                query: 'SELECT gender, COUNT(*) as count FROM students GROUP BY gender;',
                description: 'Student count by gender'
            },
            {
                name: 'Email queue status',
                query: 'SELECT status, COUNT(*) as count FROM email_queue GROUP BY status;',
                description: 'Email queue status summary'
            }
        ];

        return NextResponse.json({
            success: true,
            data: {
                tables: tableNames,
                sampleQueries
            }
        });

    } catch (error) {
        console.error('Error fetching database info:', error);
        return NextResponse.json(
            { error: 'Failed to fetch database information' },
            { status: 500 }
        );
    }
}
