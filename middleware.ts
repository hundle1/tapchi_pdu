// D:\NCHK\master_degree\tapchi_pdu\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Serve PDF files từ public/uploads
    if (pathname.startsWith('/uploads/magazines/')) {
        const response = NextResponse.next();

        // Set headers cho PDF
        response.headers.set('Content-Type', 'application/pdf');
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Cache-Control', 'public, max-age=31536000');

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/uploads/:path*',
};
