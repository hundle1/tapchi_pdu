import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';

// ❗ KHÔNG dùng FILE_DIR nữa
// ❗ fileUpload.fileUrl PHẢI là đường dẫn tuyệt đối

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // ✅ Await params (Next.js 15+)
        const { id } = await params;

        console.log('📄 PDF Request for magazine:', id);

        // ✅ Fetch magazine with fileUpload
        const magazine = await prisma.magazine.findUnique({
            where: { id },
            include: {
                fileUpload: true
            }
        });

        console.log('📊 Magazine query result:', {
            found: !!magazine,
            hasFileUpload: !!magazine?.fileUpload,
            fileUrl: magazine?.fileUpload?.fileUrl
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

        // ✅ DÙNG TRỰC TIẾP ĐƯỜNG DẪN TUYỆT ĐỐI TỪ DB
        const filePath = magazine.fileUpload.fileUrl;

        console.log('📂 Looking for file at:', filePath);

        // ✅ Check file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                {
                    error: 'PDF file not found on server',
                    details: filePath
                },
                { status: 404 }
            );
        }

        // ✅ Read file
        const buffer = fs.readFileSync(filePath);

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Length': buffer.length.toString(),
                'Content-Disposition': `inline; filename="${encodeURIComponent(
                    magazine.fileUpload.fileName || 'magazine.pdf'
                )}"`,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
            }
        });

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

// ✅ OPTIONS cho CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
