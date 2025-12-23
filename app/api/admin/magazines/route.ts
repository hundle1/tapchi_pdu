// ✅ SECURE VERSION - app/api/admin/magazines/route.ts
// Lưu file vào storage/ thay vì public/

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

// ✅ Lấy storage dir từ env
const STORAGE_DIR = process.env.FILE_STORAGE_DIR || './storage/magazines';

async function checkAdminAuth() {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.taiKhoanNguoiDung.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true },
  });

  return user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? user : null;
}

export async function GET() {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const magazines = await prisma.magazine.findMany({
      include: {
        fileUpload: true,
        categoryName: true,
        major: true,
        TaiKhoanNguoiDung: {
          select: { id: true, name: true, email: true }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedMagazines = magazines.map(mag => ({
      id: mag.id,
      tieuDe: mag.tieuDe,
      moTa: mag.moTa,
      anhBia: mag.anhBiaUrl || mag.anhBiaLocal || '/placeholder-magazine.jpg',
      trangThai: mag.trangThai,
      createdAt: mag.createdAt,
      TaiKhoanNguoiDung: mag.TaiKhoanNguoiDung,
      major: mag.major.length > 0 ? mag.major[0].name : 'Chưa phân loại',
      pages: [],
      tenTacGia: mag.tenTacGia,
      fileUpload: mag.fileUpload,
      categoryName: mag.categoryName,
    }));

    return NextResponse.json(transformedMagazines);

  } catch (error) {
    console.error('❌ GET /magazines error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách tạp chí' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const formData = await req.formData();

    const tieuDe = (formData.get('tieuDe') as string)?.trim();
    const tenTacGia = (formData.get('tenTacGia') as string)?.trim() || null;
    const moTa = (formData.get('moTa') as string)?.trim() || null;
    const anhBiaLocal = (formData.get('anhBiaLocal') as string)?.trim() || null;
    const anhBiaUrl = (formData.get('anhBiaUrl') as string)?.trim() || null;
    const ngayXuatBan = formData.get('ngayXuatBan') as string | null;
    const trangThai = (formData.get('trangThai') as string) || 'DRAFT';

    const categoryIds = formData.getAll('categoryName') as string[];
    const majorIds = formData.getAll('majorIds') as string[];

    const file = formData.get('file') as File | null;

    // Validations
    if (!tieuDe) {
      return NextResponse.json({ error: 'Tiêu đề là bắt buộc' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Chưa chọn file PDF' }, { status: 400 });
    }

    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: `File không đúng định dạng. Chỉ chấp nhận PDF.`
      }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File quá lớn. Kích thước tối đa: 50MB.`
      }, { status: 400 });
    }

    if (!tenTacGia) {
      return NextResponse.json({ error: 'Tên tác giả là bắt buộc' }, { status: 400 });
    }

    if (!anhBiaLocal && !anhBiaUrl) {
      return NextResponse.json({ error: 'Phải có ít nhất một ảnh bìa' }, { status: 400 });
    }

    if (!categoryIds.length) {
      return NextResponse.json({ error: 'Phải chọn ít nhất một chuyên mục' }, { status: 400 });
    }

    if (!majorIds.length) {
      return NextResponse.json({ error: 'Phải chọn ít nhất một ngành học' }, { status: 400 });
    }

    console.log('📂 Processing file upload...');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Tạo storage directory (NGOÀI public/)
    const storageDir = path.resolve(process.cwd(), STORAGE_DIR);
    await fs.mkdir(storageDir, { recursive: true });

    // ✅ Tạo fileId ngẫu nhiên (giống xettuyen project)
    const fileId = crypto.randomUUID();
    const fileExt = path.extname(file.name);

    // ✅ Lưu file với fileId thay vì tên gốc
    const filePath = path.join(storageDir, `${fileId}${fileExt}`);
    await fs.writeFile(filePath, new Uint8Array(buffer));

    console.log('✅ File saved to:', filePath);

    // ✅ Lưu vào DB
    console.log('💾 Saving to database...');

    const result = await prisma.$transaction(async (tx) => {
      // Lưu file record
      const fileRecord = await tx.file.create({
        data: {
          fileName: file.name,        // Tên gốc để hiển thị
          fileType: file.type,
          fileUrl: fileId,            // ✅ Chỉ lưu fileId (không lưu path)
        },
      });

      console.log('✅ File record created:', fileRecord.id);

      // Tạo magazine
      const magazine = await tx.magazine.create({
        data: {
          tieuDe,
          tenTacGia,
          moTa,
          anhBiaLocal,
          anhBiaUrl,
          trangThai,
          fileUploadId: fileRecord.id,
          taiKhoanNguoiDungId: user.id,
          ngayXuatBan: ngayXuatBan ? new Date(ngayXuatBan) : null,
          categoryName: {
            connect: categoryIds.map((id) => ({ id })),
          },
          major: {
            connect: majorIds.map((id) => ({ id })),
          },
        },
      });

      console.log('✅ Magazine created:', magazine.id);
      return magazine.id;
    }, {
      maxWait: 10000,
      timeout: 15000,
    });

    const magazineWithRelations = await prisma.magazine.findUnique({
      where: { id: result },
      include: {
        fileUpload: true,
        TaiKhoanNguoiDung: {
          select: { name: true, email: true }
        },
        categoryName: true,
        major: true,
      },
    });

    return NextResponse.json(magazineWithRelations);

  } catch (error) {
    console.error('❌ POST /magazines error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Lỗi server khi tạo tạp chí',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}