// D:\NCHK\master_degree\tapchi_pdu\lib\pdf-converter.ts

import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';


export async function convertPdfToImages(
    pdfBuffer: Buffer,
    magazineId: string
): Promise<string[]> {
    const imagePaths: string[] = [];

    try {
        // Load PDF
        const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBuffer));
        const pageCount = pdfDoc.getPageCount();

        // Create upload directory if not exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pages', magazineId);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Note: pdf-lib doesn't render to images directly
        // You need to use a library like pdf-poppler or puppeteer
        // Here's a conceptual approach using pdf-poppler:

        const { convert } = require('pdf-poppler');
        const opts = {
            format: 'jpeg',
            out_dir: uploadDir,
            out_prefix: 'page',
            page: null, // convert all pages
            scale: 2048 // higher quality
        };

        await convert(pdfBuffer, opts);

        // Save page records to database
        for (let i = 0; i < pageCount; i++) {
            const pageNum = i + 1;
            const imagePath = `/uploads/pages/${magazineId}/page-${pageNum}.jpg`;

            await prisma.page.create({
                data: {
                    magazineId,
                    pageNumber: pageNum,
                    imageUrl: imagePath,
                    content: null
                }
            });

            imagePaths.push(imagePath);
        }

        return imagePaths;
    } catch (error) {
        console.error('Error converting PDF:', error);
        throw error;
    }
}

// Simpler approach using canvas (client-side compatible)
export async function getPdfPageCount(pdfBuffer: Buffer): Promise<number> {
    const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBuffer));
    return pdfDoc.getPageCount();
}