// master_degree\tapchi_pdu\app\page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, Users, TrendingUp, Search, Menu, X, Moon, Sun, Palette, History, Brain, Utensils, Building2 } from 'lucide-react';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';


// Mock data
const mockMagazines = [
  { id: '1', tieuDe: 'Văn Hóa Phương Đông', moTa: 'Khám phá những giá trị văn hóa truyền thống', anhBia: '/assets/slider_1.png' },
  { id: '2', tieuDe: 'Nghệ Thuật Á Đông', moTa: 'Tinh hoa nghệ thuật từ các quốc gia châu Á', anhBia: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400' },
  { id: '3', tieuDe: 'Triết Học Phương Đông', moTa: 'Khám phá sâu sắc về tư tưởng triết học', anhBia: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' },
  { id: '4', tieuDe: 'Lịch Sử Cổ Đại', moTa: 'Hành trình trở về quá khứ huy hoàng', anhBia: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400' },
];

const categories = [
  { id: 1, name: 'Văn Học', icon: BookOpen, gradient: 'from-blue-500 via-blue-600 to-indigo-600', count: 24 },
  { id: 2, name: 'Nghệ Thuật', icon: Palette, gradient: 'from-purple-500 via-purple-600 to-pink-600', count: 18 },
  { id: 3, name: 'Lịch Sử', icon: History, gradient: 'from-amber-500 via-orange-600 to-red-600', count: 32 },
  { id: 4, name: 'Triết Học', icon: Brain, gradient: 'from-cyan-500 via-blue-600 to-indigo-600', count: 15 },
  { id: 5, name: 'Ẩm Thực', icon: Utensils, gradient: 'from-emerald-500 via-green-600 to-teal-600', count: 21 },
  { id: 6, name: 'Kiến Trúc', icon: Building2, gradient: 'from-slate-500 via-gray-600 to-zinc-600', count: 12 },
];

const stats = [
  { icon: BookOpen, value: '500+', label: 'Tạp Chí', gradient: 'from-blue-500 to-indigo-600' },
  { icon: Users, value: '10K+', label: 'Độc Giả', gradient: 'from-purple-500 to-pink-600' },
  { icon: TrendingUp, value: '50K+', label: 'Lượt Đọc', gradient: 'from-emerald-500 to-teal-600' },
  { icon: Sparkles, value: '100+', label: 'Tác Giả', gradient: 'from-amber-500 to-orange-600' },
];

export default function ModernMagazineHome() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const featuredRef = useRef(null);
  const categoriesRef = useRef(null);
  const statsRef = useRef(null);

  const SLIDE_INTERVAL = 10000;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    [featuredRef, categoriesRef, statsRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 3);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 3) % 3);

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isDarkMode
      ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white'
      : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900'
      }`}>
      {/* Animated Background - Light Mode */}
      {!isDarkMode && (
        <div className="fixed inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 md:w-96 md:h-96 bg-[#091577] opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      )}

      {/* Animated Background - Dark Mode */}
      {isDarkMode && (
        <div className="fixed inset-0 opacity-30 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 md:w-96 md:h-96 bg-[#091577] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      )}

      {/* Navbar - Responsive */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`fixed inset-0 z-40 backdrop-blur-xl md:hidden transition-colors ${isDarkMode ? 'bg-black/95' : 'bg-white/95'
          }`}>
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-xl px-4">
            <a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>
              Trang Chủ
            </a>
            <a href="magazine" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>
              Danh Mục
            </a>
            <a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>
              Giới Thiệu
            </a>
            <button className="px-8 py-3 bg-gradient-to-r from-[#091577] to-blue-600 text-white rounded-full shadow-xl w-full max-w-xs">
              Đăng Nhập
            </button>
          </div>
        </div>
      )}

      {/* Hero Slider Section - Responsive */}
      <section className="relative z-10 h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        <div
          className="flex transition-transform duration-1000 ease-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {mockMagazines.slice(0, 3).map((mag, idx) => (
            <div key={idx} className="min-w-full h-full relative">
              <div
                className="absolute inset-0 z-10"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(to bottom, transparent, transparent, rgba(0,0,0,0.4))'
                    : 'linear-gradient(to bottom, transparent, transparent, rgba(255,255,255,0.2))'
                }}
              />
              <Image
                fill
                src={mag.anhBia}
                alt={mag.tieuDe}
                className="w-full h-full object-cover"
              />
              {/* Content - Responsive positioning */}
              <div className="absolute bottom-0 left-0 z-20 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12 lg:pb-16">
                  <div className="max-w-xl space-y-2 md:space-y-4 mb-40 ml-10 md:ml-16 lg:ml-[-200px] lg:mb-20">
                    {/* Sale badge - Responsive text */}
                    <div
                      className="inline-flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-md rounded-lg text-xs md:text-xs font-semibold tracking-wider"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: isDarkMode ? '#ffffff' : '#111827',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(17,24,39,0.1)'}`
                      }}
                    >
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="hidden sm:inline">GIẢM GIÁ LÊN ĐẾN 30% OFF</span>
                      <span className="sm:hidden">SALE 30% OFF</span>
                    </div>

                    {/* Title - Responsive size */}
                    <h1
                      className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight"
                      style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
                    >
                      Khám Phá Cuốn Sách
                      <br />
                      <span className="italic">Yêu Thích Tiếp Theo</span>
                    </h1>

                    {/* CTA Button - Responsive size */}
                    <button
                      className="inline-flex items-center px-6 md:px-8 py-2.5 md:py-3 text-xs md:text-sm font-semibold tracking-wider transition-all"
                      style={{
                        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#111827'
                      }}
                    >
                      MUA NGAY
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons - Responsive positioning */}
        <button
          onClick={prevSlide}
          className="absolute hover:scale-125 left-2 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all rounded-full backdrop-blur-xl"
          style={{
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            color: isDarkMode ? '#ffffff' : 'white'
          }}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute hover:scale-125 right-2 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all rounded-full backdrop-blur-xl"
          style={{
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            color: isDarkMode ? '#ffffff' : 'white'
          }}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Slide Counter - Responsive */}
        <div className="absolute bottom-0 z-30">
          <div
            className={`
              pl-8 md:pl-16 pr-16 md:pr-32 pt-6 md:pt-12 pb-2 md:pb-4 text-sm font-medium
              ${isDarkMode ? 'bg-black' : 'bg-white'}
              [clip-path:polygon(0_0,70%_0,100%_100%,0%_100%)]
              w-40 md:w-64
            `}
          >
            <div
              className="text-base md:text-[20px] font-bold"
              style={isDarkMode ? { color: 'white' } : { color: 'black' }}
            >
              <span className='text-gray-400'>{currentSlide + 1}</span>
              <span> — 3</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Magazines Section - Responsive Grid */}
      <section ref={featuredRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 opacity-0 translate-y-20 transition-all duration-1000">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-[#091577] to-blue-600 bg-clip-text text-transparent">
            Tạp Chí Nổi Bật
          </h2>
          <p className={`text-base md:text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Những tác phẩm được yêu thích nhất
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {mockMagazines.map((mag, idx) => (
            <div
              key={mag.id}
              className={`group relative backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${isDarkMode
                ? 'bg-white/5 border-white/10 hover:border-blue-500/50 hover:shadow-blue-500/20'
                : 'bg-white border-gray-200 hover:border-[#091577]/50 hover:shadow-[#091577]/20'
                }`}
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <Image
                  fill
                  src={mag.anhBia}
                  alt={mag.tieuDe}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-4 md:p-6">
                <h3 className={`text-lg md:text-xl font-bold mb-2 transition-colors ${isDarkMode ? 'group-hover:text-blue-400' : 'group-hover:text-[#091577]'
                  }`}>
                  {mag.tieuDe}
                </h3>
                <p className={`text-xs md:text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {mag.moTa}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {mag.author}
                  </span>
                  <button className="px-3 md:px-4 py-1 bg-gradient-to-r from-[#091577] to-blue-600 text-white rounded-full text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Xem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className={`text-5xl lg:text-6xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
            Danh Mục Sách
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Khám phá theo chủ đề yêu thích
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isSelected
                  ? `bg-gradient-to-br ${cat.gradient} border-transparent shadow-2xl scale-105`
                  : isDarkMode
                    ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                    : 'bg-white backdrop-blur-xl border-slate-200 hover:border-slate-300 shadow-md hover:shadow-xl'
                  }`}
              >
                {/* Gradient overlay on hover */}
                {!isSelected && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                )}

                <div className="relative p-8 space-y-4">
                  <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center transition-all duration-500 ${isSelected
                    ? 'bg-white/20 backdrop-blur-sm scale-110'
                    : isDarkMode
                      ? 'bg-slate-700/50 group-hover:bg-slate-700'
                      : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}>
                    <IconComponent className={`w-7 h-7 transition-colors duration-200 ${isSelected ? 'text-white' : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`} />
                  </div>

                  <div className="space-y-1">
                    <h3 className={`font-semibold text-base ${isSelected ? 'text-white' : isDarkMode ? 'text-slate-200' : 'text-slate-900'
                      }`}>
                      {cat.name}
                    </h3>
                    <p className={`text-sm ${isSelected
                      ? 'text-white/80'
                      : isDarkMode ? 'text-slate-500' : 'text-slate-500'
                      }`}>
                      {cat.count} tạp chí
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Category Content */}
        {selectedCategory && (
          <div className={`mt-10 p-8 rounded-3xl border transition-all duration-500 animate-in ${isDarkMode
            ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700/50'
            : 'bg-white backdrop-blur-xl border-slate-200 shadow-xl'
            }`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {categories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${isDarkMode
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockMagazines.map((mag) => (
                <div
                  key={mag.id}
                  className={`group rounded-2xl p-5 transition-all duration-200 hover:scale-105 ${isDarkMode
                    ? 'bg-slate-700/30 hover:bg-slate-700/50'
                    : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                >
                  <Image
                    src={mag.anhBia}
                    fill
                    alt={mag.tieuDe}
                    className="w-full aspect-[3/4] object-cover rounded-xl mb-4 shadow-lg"
                  />
                  <h4 className={`font-semibold text-base mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                    {mag.tieuDe}
                  </h4>
                  <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                    {mag.moTa}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;

            return (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-3xl border-2 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${isDarkMode
                  ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600'
                  : 'bg-white backdrop-blur-xl border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl'
                  }`}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                <div className="relative p-10 text-center space-y-5">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>

                  <div className="space-y-2">
                    <div className={`text-5xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className={`text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-16 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Bắt Đầu Hành Trình Khám Phá
              </h2>
              <p className="text-xl text-white/90">
                Tham gia cộng đồng hàng nghìn độc giả đam mê văn hóa phương đông
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="w-full sm:flex-1 px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-white/40 focus:border-white/50 transition-all duration-200 text-base"
              />
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 rounded-2xl font-semibold text-base hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap">
                Đăng Ký Ngay
              </button>
            </div>

            <p className="text-sm text-white/70">
              Miễn phí • Không cần thẻ tín dụng • Hủy bất cứ lúc nào
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Responsive */}
      <footer className={`relative z-10 border-t backdrop-blur-xl transition-colors ${isDarkMode
        ? 'border-white/10 bg-black/20'
        : 'border-gray-200 bg-white/70'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#091577] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="text-lg md:text-xl font-bold">Phương Đông</span>
              </div>
              <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Nền tảng số hóa văn hóa truyền thống phương đông
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Về Chúng Tôi</h4>
              <ul className={`space-y-2 text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>Giới Thiệu</a></li>
                <li><a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>Đội Ngũ</a></li>
                <li><a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>Liên Hệ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Danh Mục</h4>
              <ul className={`space-y-2 text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>Văn Học</a></li>
                <li><a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>Nghệ Thuật</a></li>
                <li><a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>Lịch Sử</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Kết Nối</h4>
              <ul className={`space-y-2 text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>Facebook</a></li>
                <li><a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>Instagram</a></li>
                <li><a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-[#091577]'}`}>Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className={`pt-6 md:pt-8 border-t text-center text-xs md:text-sm ${isDarkMode ? 'border-white/10 text-gray-400' : 'border-gray-200 text-gray-600'
            }`}>
            <p>© 2025 Tạp Chí Phương Đông. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: animate-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}