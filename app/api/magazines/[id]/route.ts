// D:\NCHK\master_degree\tapchi_pdu\app\api\magazines\[id]\route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIX: Await params trước khi sử dụng
    const { id } = await params;

    const magazine = await prisma.magazine.findUnique({
      where: {
        id: id,
      },
      include: {
        TaiKhoanNguoiDung: {
          select: {
            name: true,
            email: true
          }
        },
        fileUpload: true,
        pages: {
          orderBy: {
            pageNumber: 'asc'
          }
        }
      }
    });

    if (!magazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      );
    }

    console.log('Magazine data:', {
      id: magazine.id,
      title: magazine.tieuDe,
      hasFileUpload: !!magazine.fileUpload,
      fileUrl: magazine.fileUpload?.fileUrl,
      pagesCount: magazine.pages?.length || 0
    });

    return NextResponse.json(magazine);
  } catch (error) {
    console.error('Error fetching magazine:', error);
    return NextResponse.json(
      { error: 'Failed to fetch magazine' },
      { status: 500 }
    );
  }
}