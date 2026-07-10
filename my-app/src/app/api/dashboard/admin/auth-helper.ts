import { verifyToken } from '../../../../lib/jwt';
import { NextResponse } from 'next/server';
import {cookies} from "next/headers"; 

const DEV_USERNAME = process.env.DEV_USERNAME || '2300032048';

export async function verifyAdminToken(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;

    if (!token) {
        return {
            success: false,
            response: NextResponse.json(
                { error: 'Access denied. No token provided.' },
                { status: 401 }
            )
        };
    }

    try {
        const payload = await verifyToken(token);
        
        if (!payload) {
            return {
                success: false,
                response: NextResponse.json(
                    { error: 'Invalid or expired token' },
                    { status: 401 }
                )
            };
        }
        
        if (payload.role !== 'admin') {
            return {
                success: false,
                response: NextResponse.json(
                    { error: 'Access denied. Admin role required.' },
                    { status: 403 }
                )
            };
        }

        return {
            success: true,
            payload
        };
    } catch (error) {
        console.error('Admin token verification failed:', error);
        return {
            success: false,
            response: NextResponse.json(
                { error: 'Invalid token.' },
                { status: 401 }
            )
        };
    }
}

export async function verifyDevAccess(request) {
    const authResult = await verifyAdminToken(request);
    
    if (!authResult.success) {
        return authResult;
    }

    // Check if user has dev access (specific username)
    if (authResult.payload.username !== DEV_USERNAME) {
        return {
            success: false,
            response: NextResponse.json(
                { error: 'Access denied. Developer privileges required.' },
                { status: 403 }
            )
        };
    }

    return authResult;
}
