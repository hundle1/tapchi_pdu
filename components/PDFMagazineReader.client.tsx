// D:\NCHK\master_degree\tapchi_pdu\components\PDFMagazineReader.client.tsx
'use client';
import React, { useState, useEffect, Suspense } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Printer,
    Download,
    Share2,
    Loader2,
    AlertCircle,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// ✅ IMPORTANT: Sử dụng dynamic import cho react-pdf components
import dynamic from 'next/dynamic';

// ✅ Dynamic import cho Document và Page với ssr: false
const PDFDocument = dynamic(
    () => import('react-pdf').then((mod) => mod.Document),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 className="h-16 w-16 animate-spin text-orange-500" />
            </div>
        )
    }
);

const PDFPage = dynamic(
    () => import('react-pdf').then((mod) => mod.Page),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-[800px]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        )
    }
);

// ✅ Import pdfjs một cách an toàn
let pdfjs: any = null;
if (typeof window !== 'undefined') {
    import('react-pdf').then((reactPdf) => {
        pdfjs = reactPdf.pdfjs;
        // ✅ Config worker với CDN an toàn hơn
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    });
}

interface PDFMagazineReaderProps {
    magazineId: string;
    title: string;
}

export default function PDFMagazineReader({
    magazineId,
    title,
}: PDFMagazineReaderProps) {
    const pdfUrl = `/api/magazines/${magazineId}/pdf`;
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageWidth, setPageWidth] = useState(900);
    const [scale, setScale] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [pdfjsReady, setPdfjsReady] = useState(false);

    // ✅ Check if mounted (client-side only)
    useEffect(() => {
        setMounted(true);

        // ✅ Load pdfjs khi component mount
        if (typeof window !== 'undefined') {
            import('react-pdf').then((reactPdf) => {
                const pdfjsInstance = reactPdf.pdfjs;
                pdfjsInstance.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsInstance.version}/pdf.worker.min.js`;
                setPdfjsReady(true);
            });
        }
    }, []);

    // ✅ Responsive width
    useEffect(() => {
        if (!mounted) return;

        const updateWidth = () => {
            const maxWidth = isFullscreen ? window.innerWidth - 50 : 900;
            const calculatedWidth = Math.min(window.innerWidth - 100, maxWidth);
            setPageWidth(Math.max(calculatedWidth, 320));
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [isFullscreen, mounted]);

    // ✅ PDF Load Success
    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        console.log('✅ PDF loaded:', numPages, 'pages');
        setNumPages(numPages);
        setLoading(false);
        setError(null);
        toast.success(`Tải thành công ${numPages} trang`);
    }

    // ✅ PDF Load Error
    function onDocumentLoadError(error: Error) {
        console.error('❌ PDF load error:', error);

        let errorMessage = 'Không thể tải file PDF';
        if (error.message.includes('Missing PDF')) {
            errorMessage = 'File PDF không tồn tại hoặc đã bị xóa';
        } else if (error.message.includes('Invalid PDF')) {
            errorMessage = 'File PDF bị hỏng hoặc không hợp lệ';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra đường truyền';
        }

        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
    }

    // ✅ Navigation
    const nextPage = () => {
        if (currentPage < numPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= numPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // ✅ Zoom
    const zoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3.0));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const resetZoom = () => {
        setScale(1.0);
    };

    // ✅ Fullscreen
    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
    };

    // ✅ Share
    const handleShare = async () => {
        const shareData = {
            title: title,
            text: `Đọc tạp chí: ${title}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('Chia sẻ thành công!');
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Đã copy link!');
                }
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Đã copy link vào clipboard!');
        }
    };

    // ✅ Keyboard shortcuts
    useEffect(() => {
        if (!mounted) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case 'ArrowRight':
                case 'PageDown':
                    nextPage();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    prevPage();
                    break;
                case 'Home':
                    goToPage(1);
                    break;
                case 'End':
                    goToPage(numPages);
                    break;
                case '+':
                case '=':
                    zoomIn();
                    break;
                case '-':
                    zoomOut();
                    break;
                case '0':
                    resetZoom();
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, numPages, mounted]);

    // ✅ Page pills generator
    function getVisiblePages(current: number, total: number) {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const range: (number | string)[] = [];
        const delta = 2;
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

    // ✅ Return loading if not mounted yet
    if (!mounted || !pdfjsReady) {
        return (
            <div className="flex items-center justify-center min-h-[600px] bg-gray-900 rounded-lg">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-white text-lg">Đang khởi tạo PDF Reader...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-6xl mx-auto px-4`}>
            {/* Header Controls */}
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                {/* Page Pills */}
                <div className="flex gap-2 flex-wrap">
                    {numPages > 0 && getVisiblePages(currentPage, numPages).map((p, i) =>
                        p === "..." ? (
                            <span key={i} className="px-2 text-white self-center">...</span>
                        ) : (
                            <Button
                                key={i}
                                variant={p === currentPage ? "default" : "outline"}
                                size="sm"
                                className={`w-9 h-9 rounded-full transition-all ${p === currentPage
                                    ? 'bg-orange-500 hover:bg-orange-600 scale-110 shadow-lg'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                onClick={() => goToPage(p as number)}
                            >
                                {p}
                            </Button>
                        )
                    )}
                </div>

                {/* Keyboard Hint */}
                <p className="text-center text-xs text-gray-400 hidden lg:block">
                    ⌨️ ← → trang | +/- zoom | F fullscreen
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Badge
                        variant="outline"
                        className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-sm px-3 py-2 text-white transition-all hover:scale-105"
                        onClick={zoomOut}
                        title="Thu nhỏ"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Badge>
                    <Badge
                        variant="outline"
                        className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-sm px-3 py-2 text-white transition-all hover:scale-105"
                        onClick={zoomIn}
                        title="Phóng to"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Badge>
                    <Badge
                        variant="outline"
                        className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-sm px-3 py-2 text-white transition-all hover:scale-105"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-sm px-3 py-2 text-white transition-all hover:scale-105"
                        onClick={() => window.print()}
                        title="In"
                    >
                        <Printer className="h-4 w-4" />
                    </Badge>
                    <Badge
                        variant="outline"
                        className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-sm px-3 py-2 text-white transition-all hover:scale-105"
                        onClick={() => window.open(pdfUrl, '_blank')}
                        title="Tải xuống"
                    >
                        <Download className="h-4 w-4" />
                    </Badge>
                    <Badge
                        variant="outline"
                        className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-sm px-3 py-2 text-white transition-all hover:scale-105"
                        onClick={handleShare}
                        title="Chia sẻ"
                    >
                        <Share2 className="h-4 w-4" />
                    </Badge>
                </div>
            </div>

            {/* PDF Viewer Container */}
            <div className={`relative flex justify-center bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg shadow-2xl overflow-hidden transition-all ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[600px]'
                }`}>
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[600px]">
                        <div className="text-center">
                            <Loader2 className="h-16 w-16 animate-spin text-orange-500 mx-auto mb-4" />
                            <p className="text-white text-lg font-medium">Đang tải tạp chí...</p>
                            <p className="text-gray-400 text-sm mt-2">Vui lòng đợi trong giây lát</p>
                        </div>
                    </div>
                }>
                    <PDFDocument
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <div className="flex items-center justify-center min-h-[600px]">
                                <div className="text-center">
                                    <Loader2 className="h-16 w-16 animate-spin text-orange-500 mx-auto mb-4" />
                                    <p className="text-white text-lg font-medium">Đang tải tạp chí...</p>
                                    <p className="text-gray-400 text-sm mt-2">Vui lòng đợi trong giây lát</p>
                                </div>
                            </div>
                        }
                        error={
                            <div className="flex items-center justify-center min-h-[600px]">
                                <div className="text-center text-white max-w-md px-4">
                                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">Không thể tải PDF</h3>
                                    <p className="text-sm text-gray-400 mb-6">
                                        {error || 'Đã xảy ra lỗi khi tải file. Vui lòng thử lại sau.'}
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.reload()}
                                            className="bg-orange-500 hover:bg-orange-600 text-white border-none"
                                        >
                                            Thử lại
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.history.back()}
                                            className="bg-gray-700 hover:bg-gray-600 text-white border-none"
                                        >
                                            Quay lại
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        }
                        className="flex justify-center p-4"
                        options={{
                            cMapUrl: `https://unpkg.com/pdfjs-dist/legacy/cmaps/`,
                            cMapPacked: true,
                        }}
                    >
                        <PDFPage
                            pageNumber={currentPage}
                            renderTextLayer
                            renderAnnotationLayer
                            className="shadow-2xl"
                            width={pageWidth}
                            scale={scale}
                            loading={
                                <div className="flex items-center justify-center h-[800px]">
                                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                </div>
                            }
                        />
                    </PDFDocument>
                </Suspense>
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-between mt-6 gap-4 flex-wrap">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="flex-1 min-w-[140px] bg-gray-800 hover:bg-gray-700 text-white border-gray-700 disabled:opacity-50"
                >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Trang trước
                </Button>

                <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-3">
                    <p className="text-white font-bold text-lg">
                        Trang {currentPage} / {numPages || '?'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{title}</p>
                </div>

                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="flex-1 min-w-[140px] bg-gray-800 hover:bg-gray-700 text-white border-gray-700 disabled:opacity-50 hidden md:flex"
                >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Về đầu
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    onClick={nextPage}
                    disabled={currentPage === numPages}
                    className="flex-1 min-w-[140px] bg-gray-800 hover:bg-gray-700 text-white border-gray-700 disabled:opacity-50"
                >
                    Trang sau
                    <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
            </div>

            {/* Info Bar */}
            <div className="mt-4 text-center text-sm text-gray-500">
                <p>Zoom: {Math.round(scale * 100)}% | Tổng {numPages} trang</p>
            </div>
        </div>
    );
}