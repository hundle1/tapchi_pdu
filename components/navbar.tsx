'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Users, Search } from 'lucide-react';
import { SearchButton } from '@/components/SearchButton';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'TRANG CHỦ', href: '/' },
  { name: 'DANH MỤC', href: '/magazine' },
  { name: 'TÍNH NĂNG', href: '/features' },
];

interface NavbarProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function Navbar({ isDarkMode = false, onToggleTheme }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileQuery, setMobileQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 1);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileSearch = () => {
    if (!mobileQuery.trim()) return;
    router.push(`/magazine?keyword=${encodeURIComponent(mobileQuery.trim())}`);
    setOpen(false);
    setMobileQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMobileSearch();
    }
  };

  return (
    <nav
      className={`
        backdrop-blur-sm border-b sticky top-0 z-50 
        transition-all duration-500 ease-[cubic-bezier(0.22, 1, 0.36, 1)]
        group
        ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/95 border-gray-200'}
        ${scrolled ? 'h-16' : 'h-24'}
        hover:h-24
      `}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full relative">
          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className={`p-2 transition-colors md:hidden ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                aria-label="Toggle menu"
              >
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className={`w-[300px] sm:w-[400px] transition-colors duration-700 ${isDarkMode
                ? 'bg-slate-900 border-white/10 text-white'
                : 'bg-white border-gray-200'
                }`}
            >
              <div className="flex flex-col space-y-6 mt-8">
                <div className="flex flex-col items-center pb-6 border-b border-gray-200 dark:border-white/10">
                  <div
                    className={`text-xl font-serif font-bold tracking-wider text-center ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                  >
                    PHƯƠNG ĐÔNG UNIVERSITY
                  </div>
                  <div
                    className={`text-xs tracking-widest mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                  >
                    TẠP CHÍ & VĂN HÓA
                  </div>
                </div>

                {/* Mobile Search */}
                <div className="px-4">
                  <div className={`flex items-center bg-gray-100 rounded-full px-4 py-3 ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <Search className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={mobileQuery}
                      onChange={(e) => setMobileQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={`flex-1 bg-transparent border-none outline-none ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
                    />
                    {mobileQuery.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setMobileQuery('')}
                        className={`ml-2 p-1 rounded-full transition ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-gray-200'}`}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleMobileSearch}
                      className={`ml-3 px-4 py-1 rounded-full text-sm transition ${isDarkMode ? 'text-white hover:bg-white/20' : 'text-gray-900 hover:bg-gray-200'}`}
                    >
                      Tìm
                    </button>
                  </div>
                </div>

                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors px-4 py-2 rounded-lg ${isDarkMode
                      ? 'text-gray-200 hover:text-white hover:bg-white/5'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation - Left */}
          <div className="
            hidden md:flex items-center space-x-6 lg:space-x-8 
            transform-gpu will-change-transform
            transition-all duration-300 ease-[cubic-bezier(0.22, 1, 0.36, 1)]
            "
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  transform-gpu will-change-transform
                  transition-all duration-200 ease-[cubic-bezier(0.22, 1, 0.36, 1)]
                  text-xs lg:text-sm font-medium
                  hover:scale-105
                  ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}
                  ${scrolled ? 'lg:text-xs' : ''}
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Logo - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 flex flex-col items-center transition-all duration-200">
            <Link href="/" className="flex flex-col items-center">
              {/* Text Logo */}
              <div
                className={`font-bold tracking-wider text-center transition-all duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
                  } ${scrolled
                    ? 'text-sm md:text-base mt-2 md:mt-3'
                    : 'text-base md:text-2xl lg:text-3xl mt-3 md:mt-5'
                  }`}
              >
                TẠP CHÍ PHƯƠNG ĐÔNG
              </div>

              <div
                className={`tracking-widest text-center transition-all duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  } ${scrolled
                    ? 'text-[8px] md:text-[10px] mt-0.5'
                    : 'text-[10px] md:text-xs mt-1'
                  }`}
              >
                TẠP CHÍ & VĂN HÓA
              </div>

              {/* Logo Image - Slide up on scroll (faster animation) */}
              <div
                className={`relative bg-white rounded-bl-full rounded-br-full overflow-hidden transition-all duration-200 ${scrolled
                  ? 'w-0 h-0 opacity-0 -translate-y-full'
                  : 'w-32 h-20 md:w-44 md:h-28 opacity-100 translate-y-0'
                  } ${isDarkMode ? 'bg-black' : 'bg-white'}
                  `}
              >
                <Image
                  src="/assets/pdulogo.png"
                  alt="PDU Logo"
                  fill
                  className="object-contain pb-2 md:pb-3"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 md:space-x-4 transition-all duration-500 ">
            <SearchButton isDarkMode={isDarkMode} />

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`
                  p-1.5 md:p-2 rounded-full transition-all duration-200
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  cursor-pointer group-hover:shadow-lg
                  ${isDarkMode
                    ? 'bg-black text-yellow-400 hover:bg-white hover:text-black'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                  }
                `}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Moon className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>
            )}


            <Link href="/admin">
              <button
                className={`hidden md:block transition-colors ${isDarkMode
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-gray-900'
                  }`}
                aria-label="Users"
              >
                <Users className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}