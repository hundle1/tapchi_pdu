// D:\NCHK\master_degree\tapchi_pdu\app\api\magazines\upload\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const magazineId = formData.get('magazineId') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        if (!magazineId) {
            return NextResponse.json(
                { error: 'Magazine ID required' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Verify it's a PDF
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'Only PDF files are allowed' },
                { status: 400 }
            );
        }

        // Load PDF to get page count
        const pdfDoc = await PDFDocument.load(new Uint8Array(buffer));
        const pageCount = pdfDoc.getPageCount();

        // Save PDF file
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pdfs');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const fileName = `${magazineId}-${Date.now()}.pdf`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, new Uint8Array(buffer));

        const fileUrl = `/uploads/pdfs/${fileName}`;

        // Create File record
        const fileRecord = await prisma.file.create({
            data: {
                fileName: file.name,
                fileType: file.type,
                fileUrl: fileUrl
            }
        });

        // Update magazine with file
        await prisma.magazine.update({
            where: { id: magazineId },
            data: {
                fileUploadId: fileRecord.id
            }
        });

        return NextResponse.json({
            success: true,
            fileId: fileRecord.id,
            fileUrl: fileUrl,
            pageCount: pageCount,
            message: `PDF uploaded successfully with ${pageCount} pages`
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}