// D:\NCHK\master_degree\tapchi_pdu\app\magazine\[id]\page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { useLoading } from '@/components/loading-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { PDFMagazineReader } from '@/components/magazine-reader';

interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
  content: string | null;
}

interface Magazine {
  id: string;
  tieuDe: string;
  moTa: string | null;
  anhBiaUrl: string;
  anhBiaLocal: string;
  createdAt: Date;
  trangThai: string;
  pages: Page[];
  fileUpload?: {
    fileUrl: string;
    fileName: string;
  };
  needsConversion?: boolean;
}

export default function MagazineDetailPage() {
  const params = useParams();
  const { setLoading, setProgress } = useLoading();
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMagazine(params.id as string);
    }
  }, [params.id]);

  const fetchMagazine = async (id: string) => {
    try {
      setLoading(true);
      setProgress(10);

      const response = await fetch(`/api/magazines/${id}`);
      setProgress(50);

      if (!response.ok) {
        throw new Error('Không thể tải tạp chí');
      }

      const data = await response.json();
      setProgress(80);

      setMagazine(data);
      setProgress(100);

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error fetching magazine:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      setLoading(false);
      setProgress(0);
    } finally {
      setPageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-6">
            <Skeleton className="h-12 w-96 mb-4" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-lg shadow-2xl p-8">
            <Skeleton className="aspect-[3/4] max-w-2xl mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error || 'Không tìm thấy tạp chí'}
            </h1>
            <p className="text-gray-600">
              Tạp chí không tồn tại hoặc đã bị xóa.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Debug log
  console.log('Magazine state:', {
    hasMagazine: !!magazine,
    hasFileUpload: !!magazine?.fileUpload,
    fileUrl: magazine?.fileUpload?.fileUrl,
    magazineData: magazine
  });

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="py-4">
        {magazine?.fileUpload?.fileUrl ? (
          <PDFMagazineReader
            pdfUrl={magazine.fileUpload.fileUrl}
            title={magazine.tieuDe}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
            <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
            <p className="text-gray-400 mb-4">Không tìm thấy file PDF</p>
            <p className="text-sm text-gray-500">
              {magazine ? 'Vui lòng upload file PDF cho tạp chí này' : 'Đang tải...'}
            </p>
            {/* Debug info */}
            <div className="mt-4 text-xs text-gray-600 font-mono">
              <p>Magazine ID: {magazine?.id}</p>
              <p>Has fileUpload: {magazine?.fileUpload ? 'Yes' : 'No'}</p>
              <p>File URL: {magazine?.fileUpload?.fileUrl || 'None'}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}