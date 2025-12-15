'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, RotateCcw, Printer, Download, Share2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// ✅ Config worker cho pdfjs
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFMagazineReaderProps {
  pdfUrl: string;
  title: string;
  className?: string;
}

export function PDFMagazineReader({ pdfUrl, title, className = '' }: PDFMagazineReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState(900);

  // ✅ Set responsive width
  useEffect(() => {
    const updateWidth = () => {
      setPageWidth(Math.min(window.innerWidth - 100, 900));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // ✅ Debug log
  useEffect(() => {
    console.log('📄 PDF Reader mounted');
    console.log('🔗 PDF URL:', pdfUrl);
    console.log('🌐 Full URL:', window.location.origin + pdfUrl);

    // Test if file exists
    fetch(pdfUrl, { method: 'HEAD' })
      .then(res => {
        console.log('✅ PDF file check:', res.status, res.statusText);
        if (!res.ok) {
          setError(`File không tồn tại (${res.status})`);
        }
      })
      .catch(err => {
        console.error('❌ PDF file check failed:', err);
        setError('Không thể kết nối đến file PDF');
      });
  }, [pdfUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('✅ PDF loaded successfully. Pages:', numPages);
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('❌ Error loading PDF:', error);
    console.error('📍 Failed URL:', pdfUrl);
    setError(`Lỗi tải PDF: ${error.message}`);
    setLoading(false);
  }

  const nextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, numPages]);

  function getVisiblePages(current: number, total: number, delta: number = 2) {
    const range: (number | string)[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);
    if (left > 2) range.push("...");

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < total - 1) range.push("...");
    if (total > 1) range.push(total);

    return range;
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 ${className}`}>
      {/* 🔍 Debug Panel */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-xs font-mono">
        <p className="font-bold mb-1">🔍 Debug Info:</p>
        <p>PDF URL: <span className="text-blue-600">{pdfUrl}</span></p>
        <p>Full Path: <span className="text-blue-600">{typeof window !== 'undefined' ? window.location.origin + pdfUrl : pdfUrl}</span></p>
        <p>Status: {loading ? '⏳ Loading...' : error ? '❌ Error' : '✅ Loaded'}</p>
        {error && <p className="text-red-600 mt-1">Error: {error}</p>}
      </div>

      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {numPages > 0 && getVisiblePages(currentPage, numPages).map((p, i) =>
            p === "..." ? (
              <span key={i} className="px-2 text-white">...</span>
            ) : (
              <Button
                key={i}
                variant={typeof p === "number" && p === currentPage ? "default" : "outline"}
                size="sm"
                className="w-9 h-9 rounded-full"
                onClick={() => goToPage(p as number)}
              >
                {p}
              </Button>
            )
          )}
        </div>
        <p className="text-center text-sm text-gray-400 hidden md:block">
          Sử dụng phím mũi tên ← → để chuyển trang
        </p>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="cursor-pointer bg-white rounded-sm px-2 py-1 hover:bg-gray-100"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer bg-white rounded-sm px-2 py-1 hover:bg-gray-100"
            onClick={() => window.open(pdfUrl, '_blank')}
          >
            <Download className="h-4 w-4" />
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer bg-white rounded-sm px-2 py-1 hover:bg-gray-100"
          >
            <Share2 className="h-4 w-4" />
          </Badge>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative flex justify-center bg-gray-900 rounded-lg shadow-2xl overflow-hidden min-h-[600px]">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-white">Đang tải tạp chí...</p>
                <p className="text-xs text-gray-500 mt-2">{pdfUrl}</p>
              </div>
            </div>
          }
          error={
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="text-center text-white max-w-md">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-xl mb-2">Không thể tải PDF</p>
                <p className="text-sm text-gray-400 mb-4">
                  {error || 'Vui lòng thử lại sau'}
                </p>
                <div className="bg-gray-800 p-3 rounded text-left text-xs">
                  <p className="text-gray-400">File path:</p>
                  <p className="text-orange-400 break-all">{pdfUrl}</p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </Button>
              </div>
            </div>
          }
          className="flex justify-center"
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-xl"
            width={pageWidth}
          />
        </Document>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
        <Button
          variant="outline"
          size="lg"
          onClick={prevPage}
          disabled={currentPage === 1}
          className="flex-1 min-w-[120px]"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Trang trước
        </Button>
        <div className="text-center">
          <p className="text-white font-medium">
            Trang {currentPage} / {numPages || '?'}
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="flex-1 min-w-[120px]"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Về đầu
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={nextPage}
          disabled={currentPage === numPages}
          className="flex-1 min-w-[120px]"
        >
          Trang sau
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}