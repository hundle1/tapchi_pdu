'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface SearchProps {
    isDarkMode?: boolean;
    onToggleTheme?: () => void;
}

export function SearchButton({ isDarkMode = false, onToggleTheme }: SearchProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        console.log('Searching for:', query.trim());
        router.push(`/magazine?keyword=${encodeURIComponent(query.trim())}`);
    };


    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 1);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
        <div
            onSubmit={handleSearch}
            className={`hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1 
                transition-all duration-500 ease-in-out
                ${isFocused
                    ? 'fixed z-50 top-52 left-1/2 -translate-x-1/2 w-[500px] shadow-2xl scale-100 px-5 py-3'
                    : 'shadow-sm'
                }
                ${scrolled ? 'md:static md:top-auto md:left-auto md:translate-x-0 md:w-32' : 'md:w-32'}
                `}
            style={{
                transitionProperty: 'all',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            <Search className={`w-4 h-4 text-gray-500 mr-3 flex-shrink-0 transition-all duration-500 ${isFocused ? 'scale-110' : 'scale-100'}`} />
            <input
                type="text"
                placeholder="Tìm kiếm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSearch(e);
                    }
                }}
                className="
                    flex-1 bg-transparent border-none outline-none w-32
                    text-gray-900 placeholder-gray-500
                    focus:outline-none
                    transition-all duration-500
                "
            />
            <button
                type="button"
                onClick={handleSearch}
                className={`px-3 py-1 text-sm flex-shrink-0 rounded-full    
                    transition-all duration-500 hover:bg-gray-200
                    ${isDarkMode ? "text-black" : "text-gray-900"}
                    ${isFocused ? 'opacity-100 translate-x-0' : 'opacity-80'}`}
            >
                Tìm
            </button>
        </div>
    );
}

function useEffect(arg0: () => () => void, arg1: never[]) {
    throw new Error('Function not implemented.');
}
