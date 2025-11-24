// \tapchi_pdu\app\api\admin\magazines\route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';

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

// 📋 GET danh sách tất cả magazines
export async function GET() {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    console.log('📋 Fetching all magazines...');

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

    // ✅ Transform data để khớp với frontend
    const transformedMagazines = magazines.map(mag => ({
      id: mag.id,
      tieuDe: mag.tieuDe,
      moTa: mag.moTa,
      anhBia: mag.anhBiaUrl || mag.anhBiaLocal || '/placeholder-magazine.jpg', // ✅ Combine 2 field
      trangThai: mag.trangThai,
      createdAt: mag.createdAt,
      TaiKhoanNguoiDung: mag.TaiKhoanNguoiDung,
      major: mag.major.length > 0 ? mag.major[0].name : 'Chưa phân loại', // ✅ Lấy major đầu tiên
      pages: [], // ✅ Placeholder vì schema không có pages
      tenTacGia: mag.tenTacGia,
      fileUpload: mag.fileUpload,
      categoryName: mag.categoryName,
    }));

    console.log('✅ Magazines fetched:', transformedMagazines.length);

    return NextResponse.json(transformedMagazines);

  } catch (error) {
    console.error('❌ GET /magazines error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Lỗi khi lấy danh sách tạp chí',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
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

    // Parse form data
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

    // ✅ VALIDATION CHI TIẾT
    console.log('📋 Form data received:', {
      tieuDe,
      tenTacGia,
      categoryIds,
      majorIds,
      fileReceived: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size
    });

    if (!tieuDe) {
      return NextResponse.json({ error: 'Tiêu đề là bắt buộc' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Chưa chọn file PDF' }, { status: 400 });
    }

    // ✅ Kiểm tra loại file
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: `File không đúng định dạng. Chỉ chấp nhận PDF. File hiện tại: ${file.type}`
      }, { status: 400 });
    }

    // ✅ Kiểm tra kích thước file (giới hạn 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File quá lớn. Kích thước tối đa: 50MB. File hiện tại: ${(file.size / 1024 / 1024).toFixed(2)}MB`
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

    // ✅ XỬ LÝ FILE
    console.log('📂 Processing file upload...');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Tạo thư mục lưu trữ
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'magazines');
    await fs.mkdir(uploadDir, { recursive: true });

    // Tạo tên file unique
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedName}`;
    const filePath = path.join(uploadDir, fileName);

    // Lưu file vào disk
    await fs.writeFile(filePath, new Uint8Array(buffer));
    console.log('✅ File saved to:', filePath);

    const publicUrl = `/uploads/magazines/${fileName}`;

    // ✅ LƯU VÀO DATABASE
    console.log('💾 Saving to database...');

    const result = await prisma.$transaction(async (tx) => {
      // Tạo record File
      const fileRecord = await tx.file.create({
        data: {
          fileName,
          fileType: file.type,
          fileUrl: publicUrl,
        },
      });

      console.log('✅ File record created:', fileRecord.id);

      // Tạo record Magazine (không include relations để nhanh hơn)
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
      maxWait: 10000, // Tăng thời gian chờ lên 10 giây
      timeout: 15000, // Timeout sau 15 giây
    });

    // Fetch đầy đủ data sau khi transaction hoàn tất
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

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ POST /magazines error:', error);

    // Chi tiết lỗi để debug
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack
    });

    return NextResponse.json(
      {
        error: 'Lỗi server khi tạo tạp chí',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}