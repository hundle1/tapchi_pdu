// D:\NCHK\master_degree\tapchi_pdu\components\PDFMagazineReader.tsx
import dynamic from 'next/dynamic';

// ✅ Dynamic import với ssr: false
const PDFMagazineReaderClient = dynamic(
    () => import('./PDFMagazineReader.client'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[600px] bg-gray-900 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Đang khởi tạo PDF Reader...</p>
                </div>
            </div>
        )
    }
);

export default PDFMagazineReaderClient;