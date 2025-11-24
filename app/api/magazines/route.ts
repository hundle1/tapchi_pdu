// \tapchi_pdu\app\api\magazines\route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const magazines = await prisma.magazine.findMany({
      where: {
        trangThai: 'PUBLISHED'
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        TaiKhoanNguoiDung: {
          select: {
            name: true,
            email: true
          }
        },
      }
    });

    return NextResponse.json(magazines);
  } catch (error) {
    console.error('Error fetching magazines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch magazines' },
      { status: 500 }
    );
  }
}