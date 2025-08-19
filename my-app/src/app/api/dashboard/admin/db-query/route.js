import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyDevAccess } from '../auth-helper';

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

        // Security check: Only allow SELECT, SHOW, DESCRIBE, EXPLAIN queries
        const allowedOperations = /^(SELECT|SHOW|DESCRIBE|DESC|EXPLAIN)\s+/i;
        if (!allowedOperations.test(trimmedQuery)) {
            return NextResponse.json(
                { error: 'Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed for security reasons' },
                { status: 403 }
            );
        }

        // Additional security: Block potentially dangerous patterns
        const dangerousPatterns = [
            /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE)/i,
            /--/,
            /\/\*/,
            /\*\//,
            /UNION.*SELECT/i,
            /LOAD_FILE/i,
            /INTO\s+OUTFILE/i,
            /INTO\s+DUMPFILE/i
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(trimmedQuery)) {
                return NextResponse.json(
                    { error: 'Query contains potentially dangerous patterns and has been blocked' },
                    { status: 403 }
                );
            }
        }

        const startTime = Date.now();
        
        // Execute the query with a timeout
        const connection = await pool.getConnection();
        
        try {
            // Set a query timeout (10 seconds)
            await connection.execute('SET SESSION max_execution_time = 10000');
            
            const [rows, fields] = await connection.execute(trimmedQuery);
            const executionTime = Date.now() - startTime;

            // Limit the number of rows returned to prevent memory issues
            const maxRows = 1000;
            const limitedRows = Array.isArray(rows) ? rows.slice(0, maxRows) : rows;
            const isLimited = Array.isArray(rows) && rows.length > maxRows;

            return NextResponse.json({
                success: true,
                data: limitedRows,
                metadata: {
                    rowCount: Array.isArray(rows) ? rows.length : 0,
                    returnedRows: Array.isArray(limitedRows) ? limitedRows.length : 0,
                    isLimited,
                    executionTime: `${executionTime}ms`,
                    fields: fields ? fields.map(field => ({
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

        // Handle specific MySQL errors
        if (error.code === 'ER_PARSE_ERROR') {
            errorMessage = 'SQL syntax error: ' + error.sqlMessage;
            statusCode = 400;
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = 'Table does not exist: ' + error.sqlMessage;
            statusCode = 400;
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
            errorMessage = 'Column does not exist: ' + error.sqlMessage;
            statusCode = 400;
        } else if (error.code === 'ER_QUERY_TIMEOUT') {
            errorMessage = 'Query timeout: The query took too long to execute';
            statusCode = 408;
        } else if (error.sqlMessage) {
            errorMessage = error.sqlMessage;
            statusCode = 400;
        }

        return NextResponse.json(
            { 
                error: errorMessage,
                code: error.code || 'UNKNOWN_ERROR'
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
        const [tables] = await pool.execute('SHOW TABLES');
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
                name: 'Students with project details',
                query: 'SELECT s.name, s.email, p.name as project_name, c.name as club_name FROM students s LEFT JOIN projects p ON s.projectId = p.id LEFT JOIN clubs c ON s.clubId = c.id LIMIT 10;',
                description: 'Get students with their project and club information'
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
