// D:\NCHK\master_degree\tapchi_pdu\app\api\magazines\[id]\convert\route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';


export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const magazineId = params.id;

        const magazine = await prisma.magazine.findUnique({
            where: { id: magazineId },
            include: {
                fileUpload: true,
                pages: true
            }
        });

        if (!magazine || !magazine.fileUpload) {
            return NextResponse.json(
                { error: 'Magazine or PDF file not found' },
                { status: 404 }
            );
        }

        if (magazine.pages.length > 0) {
            return NextResponse.json({
                success: true,
                message: 'Pages already exist',
                pageCount: magazine.pages.length
            });
        }

        const pdfPath = path.join(process.cwd(), 'public', magazine.fileUpload.fileUrl);
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBuffer));
        const pageCount = pdfDoc.getPageCount();

        const pages = [];
        for (let i = 1; i <= pageCount; i++) {
            pages.push({
                magazineId,
                pageNumber: i,
                imageUrl: `/api/magazines/${magazineId}/page/${i}`,
                content: null
            });
        }

        await prisma.page.createMany({
            data: pages
        });

        return NextResponse.json({
            success: true,
            pageCount: pageCount,
            message: `Created ${pageCount} page records`
        });

    } catch (error) {
        console.error('Convert error:', error);
        return NextResponse.json(
            { error: 'Failed to convert PDF' },
            { status: 500 }
        );
    }
}