// // app/magazine/[id]/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { Navbar } from '@/components/navbar';
// import { useLoading } from '@/components/loading-provider';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Button } from '@/components/ui/button';
// import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
// import { toast } from 'sonner';
// import dynamic from 'next/dynamic';

// // Dynamic import PDFMagazineReader to avoid SSR issues
// const PDFMagazineReader = dynamic(
//   () => import('@/components/PDFMagazineReader'),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="flex items-center justify-center min-h-[600px]">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
//       </div>
//     )
//   }
// );

// interface FileUpload {
//   fileUrl: string;
//   fileName: string;
// }

// interface Magazine {
//   id: string;
//   tieuDe: string;
//   moTa: string | null;
//   anhBiaUrl: string;
//   anhBiaLocal: string;
//   createdAt: Date;
//   trangThai: string;
//   fileUpload?: FileUpload | null;
// }

// export default function MagazineDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const { setLoading, setProgress } = useLoading();
//   const [magazine, setMagazine] = useState<Magazine | null>(null);
//   const [pageLoading, setPageLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [retryCount, setRetryCount] = useState(0);

//   // ✅ Fixed: Removed incorrect Content-Type header
//   const fetchMagazine = async (id: string, isRetry: boolean = false) => {
//     try {
//       if (!isRetry) {
//         setLoading(true);
//         setProgress(10);
//       }

//       console.log('🔄 Fetching magazine:', id);

//       // ✅ FIX: Removed 'Content-Type': 'application/pdf' header
//       // API trả về JSON, không phải PDF
//       const response = await fetch(`/api/magazines/${id}`, {
//         cache: 'no-store',
//         headers: {
//           'Accept': 'application/json', // Đúng header cho JSON response
//         }
//       });

//       setProgress(50);

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('❌ API Error:', {
//           status: response.status,
//           statusText: response.statusText,
//           error: errorData
//         });

//         if (response.status === 404) {
//           throw new Error('Tạp chí không tồn tại');
//         }
//         throw new Error(`Lỗi ${response.status}: ${errorData.error || 'Không thể tải tạp chí'}`);
//       }

//       const data = await response.json();
//       setProgress(80);

//       console.log('✅ Magazine data received:', {
//         id: data.id,
//         title: data.tieuDe,
//         hasFileUpload: !!data.fileUpload,
//         fileUrl: data.fileUpload?.fileUrl,
//         fileName: data.fileUpload?.fileName
//       });

//       if (!data || !data.id) {
//         throw new Error('Dữ liệu tạp chí không hợp lệ');
//       }

//       setMagazine(data);
//       setError(null);
//       setProgress(100);

//       if (!isRetry) {
//         setTimeout(() => {
//           setLoading(false);
//           setProgress(0);
//         }, 500);
//       }

//     } catch (error) {
//       console.error('❌ Error fetching magazine:', error);

//       const errorMessage = error instanceof Error
//         ? error.message
//         : 'Có lỗi xảy ra khi tải tạp chí';

//       setError(errorMessage);
//       setLoading(false);
//       setProgress(0);
//       toast.error(errorMessage);
//     } finally {
//       setPageLoading(false);
//     }
//   };

//   // ✅ Retry handler
//   const handleRetry = () => {
//     setRetryCount(prev => prev + 1);
//     setError(null);
//     setPageLoading(true);
//     if (params.id) {
//       fetchMagazine(params.id as string, true);
//     }
//   };

//   // ✅ Initial fetch
//   useEffect(() => {
//     if (params.id) {
//       fetchMagazine(params.id as string);
//     }
//   }, [params.id]);

//   // ✅ Loading State
//   if (pageLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
//         <Navbar />
//         <main className="max-w-6xl mx-auto px-4 py-12">
//           <div className="mb-6">
//             <Skeleton className="h-12 w-96 mb-4 bg-gray-800" />
//             <Skeleton className="h-6 w-32 bg-gray-800" />
//           </div>
//           <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-2xl p-8">
//             <Skeleton className="aspect-[3/4] max-w-2xl mx-auto bg-gray-700" />
//           </div>
//           <div className="text-center mt-8">
//             <p className="text-gray-400 animate-pulse">Đang tải tạp chí...</p>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // ✅ Error State
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
//         <Navbar />
//         <main className="max-w-4xl mx-auto px-4 py-12">
//           <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-lg p-12 border border-gray-700">
//             <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
//             <h1 className="text-3xl font-bold text-red-400 mb-4">
//               Không thể tải tạp chí
//             </h1>
//             <p className="text-gray-400 mb-8 text-lg">{error}</p>
//             <div className="flex gap-4 justify-center flex-wrap">
//               <Button
//                 onClick={handleRetry}
//                 className="bg-orange-500 hover:bg-orange-600 text-white"
//                 size="lg"
//               >
//                 <RefreshCcw className="mr-2 h-5 w-5" />
//                 Thử lại {retryCount > 0 && `(${retryCount})`}
//               </Button>
//               <Button
//                 onClick={() => router.push('/')}
//                 variant="outline"
//                 className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
//                 size="lg"
//               >
//                 <ArrowLeft className="mr-2 h-5 w-5" />
//                 Về trang chủ
//               </Button>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // ✅ No Magazine
//   if (!magazine) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
//         <Navbar />
//         <main className="max-w-4xl mx-auto px-4 py-12">
//           <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-lg p-12 border border-gray-700">
//             <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
//             <h1 className="text-3xl font-bold text-yellow-400 mb-4">
//               Tạp chí không tồn tại
//             </h1>
//             <p className="text-gray-400 mb-8">
//               Tạp chí bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
//             </p>
//             <Button
//               onClick={() => router.push('/')}
//               className="bg-orange-500 hover:bg-orange-600 text-white"
//               size="lg"
//             >
//               <ArrowLeft className="mr-2 h-5 w-5" />
//               Về trang chủ
//             </Button>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // ✅ Main Content
//   return (
//     <div className="min-h-screen bg-black">
//       <Navbar />

//       <main className="py-6">
//         {/* Magazine Header */}
//         <div className="max-w-6xl mx-auto px-4 mb-6">
//           <div className="flex items-center gap-4 mb-4">
//             <Button
//               onClick={() => router.push('/')}
//               variant="outline"
//               className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
//             >
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Quay lại
//             </Button>
//           </div>

//           <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
//             <h1 className="text-3xl font-bold text-white mb-2">
//               {magazine.tieuDe}
//             </h1>
//             {magazine.moTa && (
//               <p className="text-gray-400 text-sm">{magazine.moTa}</p>
//             )}
//             <div className="flex gap-3 mt-4 text-sm text-gray-500">
//               <span className="bg-gray-700 px-3 py-1 rounded">
//                 📅 {new Date(magazine.createdAt).toLocaleDateString('vi-VN')}
//               </span>
//               <span className={`px-3 py-1 rounded ${magazine.trangThai === 'PUBLISHED'
//                   ? 'bg-green-900/50 text-green-400'
//                   : 'bg-yellow-900/50 text-yellow-400'
//                 }`}>
//                 {magazine.trangThai === 'PUBLISHED' ? '✓ Đã xuất bản' : '⏳ Nháp'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* PDF Viewer */}
//         {magazine.fileUpload?.fileUrl ? (
//           <PDFMagazineReader
//             magazineId={magazine.id}
//             title={magazine.tieuDe}
//           />
//         ) : (
//           <div className="max-w-6xl mx-auto px-4">
//             <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
//               <AlertCircle className="h-16 w-16 mb-6 text-yellow-500" />
//               <h2 className="text-2xl font-bold text-white mb-3">
//                 Chưa có file PDF
//               </h2>
//               <p className="text-gray-400 mb-6 text-center max-w-md">
//                 Tạp chí này chưa có file PDF để hiển thị.
//               </p>
//               <div className="flex gap-4">
//                 <Button
//                   onClick={() => router.push('/')}
//                   variant="outline"
//                   className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
//                 >
//                   <ArrowLeft className="mr-2 h-4 w-4" />
//                   Về trang chủ
//                 </Button>
//                 <Button
//                   onClick={handleRetry}
//                   className="bg-orange-500 hover:bg-orange-600 text-white"
//                 >
//                   <RefreshCcw className="mr-2 h-4 w-4" />
//                   Thử lại
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


// D:\NCHK\master_degree\tapchi_pdu\app\magazine\[id]\page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function TestPDFPage() {
  const params = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const magazineId = params.id as string;
    const results: any = {};

    try {
      // Test 1: Magazine metadata
      console.log('🔍 Test 1: Fetching magazine metadata...');
      const metaRes = await fetch(`/api/magazines/${magazineId}`, {
        // Thêm header để bypass IDM
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      results.metadata = {
        status: metaRes.status,
        ok: metaRes.ok,
        data: metaRes.ok ? await metaRes.json() : await metaRes.text()
      };

      // Test 2: PDF endpoint (bypass IDM)
      console.log('🔍 Test 2: Fetching PDF...');
      const pdfRes = await fetch(`/api/magazines/${magazineId}/pdf`, {
        // ✅ Bypass IDM bằng header
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        // Tắt cache
        cache: 'no-store'
      });

      results.pdf = {
        status: pdfRes.status,
        ok: pdfRes.ok,
        contentType: pdfRes.headers.get('content-type'),
        contentLength: pdfRes.headers.get('content-length'),
        isPDF: pdfRes.headers.get('content-type')?.includes('pdf'),
        headers: Object.fromEntries(pdfRes.headers.entries())
      };

      if (!pdfRes.ok) {
        const errorText = await pdfRes.text();
        results.pdf.error = errorText;
        try {
          results.pdf.errorJson = JSON.parse(errorText);
        } catch { }
      }

      // Test 3: Check if PDF can be loaded as blob
      if (pdfRes.ok) {
        const blob = await pdfRes.blob();
        results.pdf.blobSize = `${(blob.size / 1024 / 1024).toFixed(2)} MB`;
        results.pdf.blobType = blob.type;

        // Create object URL for preview
        results.pdf.objectUrl = URL.createObjectURL(blob);
      }

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Test error:', error);
    }

    setResult(results);
    setLoading(false);
    console.log('📊 Test Results:', results);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 PDF Debug Tool</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <p className="mb-4">Magazine ID: <code className="bg-gray-700 px-2 py-1 rounded">{params.id}</code></p>

          <button
            onClick={testEndpoints}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-all"
          >
            {loading ? '⏳ Testing...' : '🧪 Run Tests'}
          </button>
        </div>

        {/* IDM Warning */}
        <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-yellow-400 mb-2">⚠️ IDM (Internet Download Manager) Warning</h3>
          <p className="text-sm text-yellow-200">
            tìm cách khắc phục để trình duyệt không bắt link PDF tải về tự động. Vì tôi muốn web tương thích với tất cả
            các trình duyệt và có hoặc không phụ thuộc vào các phần mềm bên thứ ba như IDM.
          </p>
        </div>

        {result && (
          <div className="space-y-4">
            {/* Error Summary */}
            {result.error && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-3 text-red-400">❌ Error</h2>
                <p className="text-red-300">{result.error}</p>
              </div>
            )}

            {/* Metadata Test */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-3">
                1️⃣ Magazine Metadata API
                {result.metadata?.ok ? ' ✅' : ' ❌'}
              </h2>
              <div className="bg-gray-900 p-4 rounded text-sm overflow-auto max-h-96">
                <p>Status: <span className={result.metadata?.ok ? 'text-green-400' : 'text-red-400'}>
                  {result.metadata?.status}
                </span></p>
                <pre className="mt-2">{JSON.stringify(result.metadata?.data, null, 2)}</pre>
              </div>
            </div>

            {/* PDF Test */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-3">
                2️⃣ PDF Endpoint
                {result.pdf?.ok ? ' ✅' : ' ❌'}
              </h2>
              <div className="bg-gray-900 p-4 rounded text-sm space-y-2">
                <p>Status: <span className={result.pdf?.ok ? 'text-green-400' : 'text-red-400'}>
                  {result.pdf?.status}
                </span></p>
                <p>Content-Type: <span className={result.pdf?.isPDF ? 'text-green-400' : 'text-red-400'}>
                  {result.pdf?.contentType || 'N/A'}
                </span></p>
                {result.pdf?.contentLength && (
                  <p>Content-Length: {(parseInt(result.pdf.contentLength) / 1024 / 1024).toFixed(2)} MB</p>
                )}
                {result.pdf?.blobSize && (
                  <p>Blob Size: {result.pdf.blobSize}</p>
                )}

                {/* Response Headers */}
                {result.pdf?.headers && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                      📋 Response Headers
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto">
                      {JSON.stringify(result.pdf.headers, null, 2)}
                    </pre>
                  </details>
                )}

                {/* Error Details */}
                {result.pdf?.error && (
                  <div className="mt-2 p-3 bg-red-900/30 rounded border border-red-500">
                    <p className="text-red-400 font-bold mb-2">Error Response:</p>
                    {result.pdf?.errorJson ? (
                      <pre className="text-xs text-red-300 overflow-auto">
                        {JSON.stringify(result.pdf.errorJson, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-red-300 text-xs">{result.pdf.error}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* PDF Preview */}
            {result.pdf?.ok && result.pdf?.objectUrl && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-3">3️⃣ PDF Preview</h2>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={result.pdf.objectUrl}
                    className="w-full h-[600px] border-0"
                    title="PDF Preview"
                  />
                </div>
              </div>
            )}

            {/* Direct Links */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-3">4️⃣ Direct Links</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Open in new tab (might be blocked by IDM):</p>
                  <a
                    href={`/api/magazines/${params.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-semibold transition-all"
                  >
                    📄 Open PDF
                  </a>
                </div>

                {result.pdf?.ok && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Download using Blob (bypass IDM):</p>
                    <button
                      onClick={() => {
                        if (result.pdf?.objectUrl) {
                          const a = document.createElement('a');
                          a.href = result.pdf.objectUrl;
                          a.download = `magazine-${params.id}.pdf`;
                          a.click();
                        }
                      }}
                      className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-semibold transition-all"
                    >
                      💾 Download PDF
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-3">📋 Summary</h2>
              <ul className="space-y-2 text-sm">
                <li className={result.metadata?.ok ? 'text-green-400' : 'text-red-400'}>
                  {result.metadata?.ok ? '✅' : '❌'} Metadata API: {result.metadata?.ok ? 'Working' : 'Failed'}
                </li>
                <li className={result.pdf?.ok ? 'text-green-400' : 'text-red-400'}>
                  {result.pdf?.ok ? '✅' : '❌'} PDF Endpoint: {result.pdf?.ok ? 'Working' : 'Failed'}
                </li>
                <li className={result.pdf?.isPDF ? 'text-green-400' : 'text-red-400'}>
                  {result.pdf?.isPDF ? '✅' : '❌'} Content-Type: {result.pdf?.contentType || 'N/A'}
                </li>
                <li className={result.pdf?.blobSize ? 'text-green-400' : 'text-red-400'}>
                  {result.pdf?.blobSize ? '✅' : '❌'} File Size: {result.pdf?.blobSize || 'Not available'}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}