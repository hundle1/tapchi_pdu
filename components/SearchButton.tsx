'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchProps {
    isDarkMode?: boolean;
}

export function SearchButton({ isDarkMode = false }: SearchProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/magazine?keyword=${encodeURIComponent(query.trim())}`);
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 1);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <form
            onSubmit={handleSearch}
            className={`
                hidden md:flex items-center
                bg-gray-100 rounded-full
                transition-all duration-500 ease-in-out
                fixed right-[20%]
                md:max-xl:-translate-x-[100px]
                xl:-translate-x-1/2
                ${isFocused ? 'xl:!-translate-x-[-220px] w-[500px] shadow-2xl px-5 py-3 z-50' : 'w-[220px] px-3 py-1 shadow-sm'}
            `}
        >
            <Search className={`w-5 h-5 text-gray-500 mr-3 flex-shrink-0 transition-transform duration-500 ${isFocused ? 'scale-110' : 'scale-100'}`} />
            <input
                type="text"
                placeholder="Tìm kiếm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                className={`
                    flex-1 bg-transparent border-none outline-none
                    text-gray-900 placeholder-gray-500
                    transition-all duration-500
                    w-24
                `}
            />
            {query.length > 0 && (
                <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="ml-2 p-1 rounded-full hover:bg-gray-200 transition"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            )}
            <button
                type="submit"
                className={`
                    ml-3 px-4 py-1 rounded-full
                    text-sm flex-shrink-0
                    transition-all duration-500 hover:bg-gray-200
                    ${isDarkMode ? 'text-black' : 'text-gray-900'}
                `}
            >
                Tìm
            </button>
        </form>
    );
}