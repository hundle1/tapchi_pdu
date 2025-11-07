'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'

interface SidebarProps {
    role?: string
    onLogout?: () => void
}

const baseNavItems = [
    { label: 'Dashboard', href: '/admin/home', icon: LayoutDashboard },
    { label: 'Danh mục & Khoa', href: '/admin/options', icon: Users },
]

const superAdminNavItems = [
    { label: 'Quản lý Role', href: '/admin/role-management', icon: Shield },
]

export default function Sidebar({ role, onLogout }: SidebarProps) {
    const pathname = usePathname()

    const navItems =
        role === 'SUPER_ADMIN' ? [...baseNavItems, ...superAdminNavItems] : baseNavItems

    return (
        <aside className="fixed z-10 left-0 top-0 w-64 h-screen flex flex-col shadow-lg bg-white overflow-y-auto">
            {/* Header */}
            <div className="p-4 pt-7 border-b border-gray-200">
                <span className="font-bold text-xl">Hệ Thống Quản Lý</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link key={item.href} href={item.href} prefetch>
                            <Button
                                variant="ghost"
                                className={clsx(
                                    'w-full my-2 justify-start transition-all duration-200',
                                    'hover:bg-gray-100 hover:translate-x-1',
                                    isActive &&
                                    'bg-blue-50 text-black scale-105 font-semibold border-l-4 border-gray-600'
                                )}
                            >
                                <Icon
                                    className={clsx(
                                        'h-4 w-4 mr-2',
                                        isActive ? 'text-black' : 'text-gray-600'
                                    )}
                                />
                                {item.label}
                            </Button>
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-gray-200">
                <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-gray-100"
                    onClick={onLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                </Button>
            </div>
        </aside>
    )
}
