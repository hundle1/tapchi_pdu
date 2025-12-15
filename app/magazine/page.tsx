'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { MagazineCard } from '@/components/magazine-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Magazine {
  id: string;
  tieuDe: string;
  moTa: string | null;
  anhBia: string;
  anhBiaUrl: string;
  anhBiaLocal: string;
  createdAt: Date;
  trangThai: string;
}

function MagazineCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
      <CardContent className="p-4">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </CardContent>
    </Card>
  );
}

const ITEMS_PER_PAGE = 30;

export default function MagazineListPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [filteredMagazines, setFilteredMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const keyword = searchParams.get('keyword') || '';

  useEffect(() => {
    if (keyword) {
      setSearchInput(keyword);
      setActiveSearchTerm(keyword);
    }
  }, [keyword]);

  useEffect(() => {
    fetchMagazines();
  }, []);

  useEffect(() => {
    filterMagazines();
    setCurrentPage(1);
  }, [magazines, activeSearchTerm, sortBy]);

  const fetchMagazines = async () => {
    try {
      const response = await fetch('/api/magazines');
      const data = await response.json();

      // FIX: Đảm bảo data là array
      console.log('API Response:', data); // Debug log

      if (Array.isArray(data)) {
        setMagazines(data);
      } else if (data && typeof data === 'object') {
        // Nếu API trả về object, tìm property chứa array
        const magazinesArray = data.magazines || data.data || [];
        setMagazines(Array.isArray(magazinesArray) ? magazinesArray : []);
      } else {
        console.error('Invalid data format:', data);
        setMagazines([]);
      }
    } catch (error) {
      console.error('Error fetching magazines:', error);
      setMagazines([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMagazines = () => {
    // FIX: Kiểm tra magazines là array trước khi filter
    if (!Array.isArray(magazines)) {
      console.error('magazines is not an array:', magazines);
      setFilteredMagazines([]);
      return;
    }

    let filtered = magazines.filter(magazine =>
      magazine.trangThai === 'PUBLISHED' &&
      magazine.tieuDe.toLowerCase().includes(activeSearchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tieuDe':
          return a.tieuDe.localeCompare(b.tieuDe);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredMagazines(filtered);
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchInput);
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set('keyword', searchInput);
    } else {
      params.delete('keyword');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveSearchTerm('');
    const params = new URLSearchParams(searchParams);
    params.delete('keyword');
    router.replace(pathname, { scroll: false });
  };

  // Pagination
  const totalPages = Math.ceil(filteredMagazines.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMagazines = filteredMagazines.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        pages.push(2, 3, 4);
        pages.push('...');
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('...');
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Danh sách tạp chí
          </h1>
          <p className="text-sm md:text-base">
            Khám phá toàn bộ bộ sưu tập tạp chí văn hóa phương đông
          </p>
        </div>

        {/* Modern Filter Section */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm tạp chí theo tiêu đề..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 pr-10 h-12 text-base"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={handleSearch}
                  className="h-12 px-8 bg-white border-2 border-[#091577] text-black hover:bg-[#091577] hover:text-white font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm
                </Button>
              </div>

              {/* Sort Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="font-medium">Sắp xếp:</span>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-56 h-10">
                    <SelectValue placeholder="Chọn cách sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Mới nhất</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tieuDe">
                      <div className="flex items-center gap-2">
                        <span>🔤</span>
                        <span>Theo tiêu đề (A-Z)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Active Filters Display */}
          {activeSearchTerm && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Đang tìm kiếm:</span>
              <div className="inline-flex items-center gap-2 bg-[#091577] text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                <span>&quot;{activeSearchTerm}&quot;</span>
                <button
                  onClick={clearSearch}
                  className="hover:bg-white hover:text-black rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                ({filteredMagazines.length} kết quả)
              </span>
            </div>
          )}
        </div>

        {/* Magazine Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 30 }).map((_, i) => (
              <MagazineCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredMagazines.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold text-orange-600">{startIndex + 1}-{Math.min(endIndex, filteredMagazines.length)}</span> trong tổng số <span className="font-semibold text-orange-600">{filteredMagazines.length}</span> tạp chí
              </div>
              <div className="text-sm text-gray-500">
                Trang {currentPage}/{totalPages}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {currentMagazines.map((magazine) => (
                <MagazineCard key={magazine.id} magazine={magazine} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="inline-flex items-center gap-1 bg-white rounded-lg shadow-md p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="h-10 w-10 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Trang đầu"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-10 w-10 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Trang trước"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => goToPage(page as number)}
                          className={`h-10 min-w-[2.5rem] px-3 font-medium transition-all ${currentPage === page
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-md'
                            : 'hover:bg-orange-50 text-gray-700'
                            }`}
                        >
                          {page}
                        </Button>
                      )
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-10 w-10 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Trang sau"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-10 w-10 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Trang cuối"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">
                {activeSearchTerm ? 'Không tìm thấy tạp chí nào phù hợp' : 'Chưa có tạp chí nào được xuất bản'}
              </p>
              <p className="text-gray-500 text-sm">
                {activeSearchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Vui lòng quay lại sau'}
              </p>
              {activeSearchTerm && (
                <Button
                  onClick={clearSearch}
                  variant="outline"
                  className="mt-4"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}