// D:\NCHK\master_degree\tapchi_pdu\app\api\magazines\[id]\page\[pageNum]\route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';

// This endpoint serves PDF pages as images
// You can use a PDF rendering library here

export async function GET(
    request: Request,
    { params }: { params: { id: string; pageNum: string } }
) {
    try {
        const { id, pageNum } = params;
        const pageNumber = parseInt(pageNum);

        // Get magazine
        const magazine = await prisma.magazine.findUnique({
            where: { id },
            include: {
                fileUpload: true
            }
        });

        if (!magazine || !magazine.fileUpload) {
            return NextResponse.json(
                { error: 'Magazine not found' },
                { status: 404 }
            );
        }

        // For now, return the PDF URL
        // In production, you'd render the specific page as an image
        const pdfPath = path.join(process.cwd(), 'public', magazine.fileUpload.fileUrl);

        if (!fs.existsSync(pdfPath)) {
            return NextResponse.json(
                { error: 'PDF file not found' },
                { status: 404 }
            );
        }

        // Return PDF info (you'd actually render to image here)
        return NextResponse.json({
            magazineId: id,
            pageNumber,
            pdfUrl: magazine.fileUpload.fileUrl,
            // In production, return imageUrl or base64 image
            message: 'Use client-side PDF.js to render this page'
        });

    } catch (error) {
        console.error('Page render error:', error);
        return NextResponse.json(
            { error: 'Failed to render page' },
            { status: 500 }
        );
    }
}