import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MagazineCardProps {
  magazine: {
    id: string;
    tieuDe: string;
    moTa: string | null;
    anhBiaUrl: string;
    anhBiaLocal: string;
    createdAt: Date;
    trangThai: string;
  };
}

export function MagazineCard({ magazine }: MagazineCardProps) {
  return (
    <Card className="relative overflow-visible transition-all duration-300 hover:shadow-lg group/hover-zone">
      {/* Ảnh bìa */}
      <Link href={`/magazine/${magazine.id}`}>
        <div className="relative aspect-[6/8] overflow-hidden rounded-lg cursor-pointer">
          <Image
            src={magazine.anhBiaUrl?.trim() || magazine.anhBiaLocal?.trim() || "/placeholder-magazine.jpg"}
            alt={magazine.tieuDe || "Magazine cover"}
            fill
            className=" object-center group-hover/hover-zone:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          <div className="absolute top-2 right-2">
            <Badge
              variant={magazine.trangThai === 'PUBLISHED' ? 'default' : 'secondary'}
            >
              {magazine.trangThai === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
            </Badge>
          </div>
        </div>
      </Link>

      {/* Panel thông tin */}
      <div
        className="absolute left-full top-0 h-full w-[320px] bg-white border rounded-lg shadow-xl p-6
               opacity-0 invisible translate-x-4
               group-hover/hover-zone:opacity-100 group-hover/hover-zone:visible group-hover/hover-zone:translate-x-0
               transition-all duration-200 ease-in-out z-50 flex flex-col justify-between"
      >
        <div>
          <h3 className="font-semibold text-lg mb-3 text-orange-800">
            {magazine.tieuDe}
          </h3>
          {magazine.moTa && (
            <p className="text-sm text-gray-600 mb-4 whitespace-pre-line text-justify">
              {magazine.moTa}
            </p>
          )}
        </div>
        <div>
          <Link href={`/magazine/${magazine.id}`}>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              Xem tạp chí
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}