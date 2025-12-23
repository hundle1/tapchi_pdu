import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

/* ================= AUTH ================= */

async function checkAdminAuth() {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.taiKhoanNguoiDung.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true },
  });

  return user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
    ? user
    : null;
}

/* ================= GET ================= */

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
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const transformed = magazines.map((mag) => ({
      id: mag.id,
      tieuDe: mag.tieuDe,
      moTa: mag.moTa,
      anhBia: mag.anhBiaUrl || mag.anhBiaLocal || '/placeholder-magazine.jpg',
      trangThai: mag.trangThai,
      createdAt: mag.createdAt,
      TaiKhoanNguoiDung: mag.TaiKhoanNguoiDung,
      major: mag.major.length ? mag.major[0].name : 'Chưa phân loại',
      pages: [],
      tenTacGia: mag.tenTacGia,
      fileUpload: mag.fileUpload,
      categoryName: mag.categoryName,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('❌ GET /admin/magazines error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách tạp chí' },
      { status: 500 }
    );
  }
}

/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const formData = await req.formData();

    const tieuDe = (formData.get('tieuDe') as string)?.trim();
    const tenTacGia = (formData.get('tenTacGia') as string)?.trim();
    const moTa = (formData.get('moTa') as string)?.trim() || null;
    const anhBiaLocal = (formData.get('anhBiaLocal') as string)?.trim() || null;
    const anhBiaUrl = (formData.get('anhBiaUrl') as string)?.trim() || null;
    const ngayXuatBan = formData.get('ngayXuatBan') as string | null;
    const trangThai = (formData.get('trangThai') as string) || 'DRAFT';

    const categoryIds = formData.getAll('categoryName') as string[];
    const majorIds = formData.getAll('majorIds') as string[];
    const file = formData.get('file') as File | null;

    /* ===== VALIDATE ===== */

    if (!tieuDe) {
      return NextResponse.json({ error: 'Tiêu đề là bắt buộc' }, { status: 400 });
    }

    if (!tenTacGia) {
      return NextResponse.json({ error: 'Tên tác giả là bắt buộc' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Chưa chọn file PDF' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Chỉ chấp nhận file PDF' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File vượt quá 50MB' }, { status: 400 });
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

    /* ===== FILE STORAGE ===== */

    const STORAGE_DIR =
      process.env.FILE_STORAGE_DIR ||
      path.join(process.cwd(), 'storage', 'magazines');

    await fs.mkdir(STORAGE_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = `${crypto.randomUUID()}.pdf`;
    const filePath = path.join(STORAGE_DIR, fileId);

    await fs.writeFile(filePath, new Uint8Array(buffer));

    /* ===== DB TRANSACTION ===== */

    const magazineId = await prisma.$transaction(async (tx) => {
      const fileRecord = await tx.file.create({
        data: {
          fileName: file.name,
          fileType: file.type,
          fileUrl: fileId, // ✅ chỉ lưu fileId
        },
      });

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

      return magazine.id;
    });

    const result = await prisma.magazine.findUnique({
      where: { id: magazineId },
      include: {
        fileUpload: true,
        TaiKhoanNguoiDung: {
          select: { name: true, email: true },
        },
        categoryName: true,
        major: true,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ POST /admin/magazines error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi tạo tạp chí' },
      { status: 500 }
    );
  }
}
