// app/magazine/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { useLoading } from '@/components/loading-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import PDFMagazineReader from '@/components/PDFMagazineReader';

interface FileUpload {
  fileUrl: string;
  fileName: string;
}

interface Magazine {
  id: string;
  tieuDe: string;
  moTa: string | null;
  anhBiaUrl: string;
  anhBiaLocal: string;
  createdAt: Date;
  trangThai: string;
  fileUpload?: FileUpload | null;
}

export default function MagazineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setLoading, setProgress } = useLoading();
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ✅ Fetch magazine
  const fetchMagazine = async (id: string, isRetry: boolean = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setProgress(10);
      }

      const response = await fetch(`/api/magazines/${id}`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setProgress(50);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Tạp chí không tồn tại');
        }
        throw new Error(`Lỗi ${response.status}: Không thể tải tạp chí`);
      }

      const data = await response.json();
      setProgress(80);

      if (!data || !data.id) {
        throw new Error('Dữ liệu tạp chí không hợp lệ');
      }

      setMagazine(data);
      setError(null);
      setProgress(100);

      console.log('✅ Magazine loaded:', {
        id: data.id,
        title: data.tieuDe,
        hasFileUpload: !!data.fileUpload,
        fileUrl: data.fileUpload?.fileUrl
      });

      if (!isRetry) {
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 500);
      }

    } catch (error) {
      console.error('❌ Error fetching magazine:', error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'Có lỗi xảy ra khi tải tạp chí';

      setError(errorMessage);
      setLoading(false);
      setProgress(0);
      toast.error(errorMessage);
    } finally {
      setPageLoading(false);
    }
  };

  // ✅ Retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setPageLoading(true);
    if (params.id) {
      fetchMagazine(params.id as string, true);
    }
  };

  // ✅ Initial fetch
  useEffect(() => {
    if (params.id) {
      fetchMagazine(params.id as string);
    }
  }, [params.id]);

  // ✅ Loading State
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-6">
            <Skeleton className="h-12 w-96 mb-4 bg-gray-800" />
            <Skeleton className="h-6 w-32 bg-gray-800" />
          </div>
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-2xl p-8">
            <Skeleton className="aspect-[3/4] max-w-2xl mx-auto bg-gray-700" />
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-400 animate-pulse">Đang tải tạp chí...</p>
          </div>
        </main>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-lg p-12 border border-gray-700">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-red-400 mb-4">
              Không thể tải tạp chí
            </h1>
            <p className="text-gray-400 mb-8 text-lg">{error}</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={handleRetry}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                size="lg"
              >
                <RefreshCcw className="mr-2 h-5 w-5" />
                Thử lại {retryCount > 0 && `(${retryCount})`}
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Về trang chủ
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ✅ No Magazine
  if (!magazine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-lg p-12 border border-gray-700">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-yellow-400 mb-4">
              Tạp chí không tồn tại
            </h1>
            <p className="text-gray-400 mb-8">
              Tạp chí bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Về trang chủ
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ✅ Main Content
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="py-6">
        {/* Magazine Header */}
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-2">
              {magazine.tieuDe}
            </h1>
            {magazine.moTa && (
              <p className="text-gray-400 text-sm">{magazine.moTa}</p>
            )}
            <div className="flex gap-3 mt-4 text-sm text-gray-500">
              <span className="bg-gray-700 px-3 py-1 rounded">
                📅 {new Date(magazine.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <span className={`px-3 py-1 rounded ${magazine.trangThai === 'PUBLISHED'
                ? 'bg-green-900/50 text-green-400'
                : 'bg-yellow-900/50 text-yellow-400'
                }`}>
                {magazine.trangThai === 'PUBLISHED' ? '✓ Đã xuất bản' : '⏳ Nháp'}
              </span>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        {magazine.fileUpload?.fileUrl ? (
          <PDFMagazineReader
            pdfUrl={magazine.fileUpload.fileUrl}
            title={magazine.tieuDe}
          />
        ) : (
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
              <AlertCircle className="h-16 w-16 mb-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white mb-3">
                Chưa có file PDF
              </h2>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                Tạp chí này chưa có file PDF để hiển thị.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Về trang chủ
                </Button>
                <Button
                  onClick={handleRetry}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}