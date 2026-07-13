import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ 
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        db: process.env.DB_NAME
    });
}
