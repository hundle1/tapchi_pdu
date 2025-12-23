// ✅ SECURE VERSION - app/api/magazines/[id]/pdf/route.ts
// Serve file từ storage/ thay vì public/

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

const STORAGE_DIR = process.env.FILE_STORAGE_DIR || './storage/magazines';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        console.log('📄 PDF Request for magazine:', id);

        // ✅ Lấy magazine info
        const magazine = await prisma.magazine.findUnique({
            where: { id },
            include: {
                fileUpload: true
            }
        });

        if (!magazine) {
            return NextResponse.json(
                { error: 'Magazine not found' },
                { status: 404 }
            );
        }

        if (!magazine.fileUpload || !magazine.fileUpload.fileUrl) {
            return NextResponse.json(
                { error: 'No PDF file available for this magazine' },
                { status: 404 }
            );
        }

        // ✅ fileUrl giờ là fileId
        const fileId = magazine.fileUpload.fileUrl;
        const fileName = magazine.fileUpload.fileName;
        const fileExt = path.extname(fileName);

        // ✅ Build path từ storage dir
        const storageDir = path.resolve(process.cwd(), STORAGE_DIR);
        const filePath = path.join(storageDir, `${fileId}${fileExt}`);

        console.log('📂 Looking for file at:', filePath);

        // ✅ Check file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                {
                    error: 'PDF file not found on server',
                    details: process.env.NODE_ENV === 'development' ? filePath : undefined
                },
                { status: 404 }
            );
        }

        const stat = fs.statSync(filePath);
        console.log('📦 File size:', (stat.size / 1024 / 1024).toFixed(2), 'MB');

        // ✅ Determine MIME type
        const mimeType = mime.lookup(fileName) || 'application/pdf';

        // ✅ Track view (optional)
        await prisma.magazine.update({
            where: { id },
            data: {
                readCount: {
                    increment: 1
                }
            }
        }).catch(err => console.log('Failed to track view:', err));

        // ✅ Support Range requests (streaming)
        const range = req.headers.get('range');

        if (range) {
            // Partial content request
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
            const chunkSize = (end - start) + 1;

            const stream = fs.createReadStream(filePath, { start, end });

            return new NextResponse(stream as any, {
                status: 206,
                headers: {
                    'Content-Type': mimeType,
                    'Content-Length': chunkSize.toString(),
                    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
                    'Cache-Control': 'private, max-age=3600',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        } else {
            // Full content
            const buffer = fs.readFileSync(filePath);

            return new NextResponse(new Uint8Array(buffer), {
                status: 200,
                headers: {
                    'Content-Type': mimeType,
                    'Content-Length': stat.size.toString(),
                    'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
                    'Accept-Ranges': 'bytes',
                    'Cache-Control': 'private, max-age=3600',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

    } catch (err) {
        console.error('💥 PDF Route Error:', err);

        return NextResponse.json(
            {
                error: 'Failed to serve PDF',
                message: err instanceof Error ? err.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Range',
        },
    });
}