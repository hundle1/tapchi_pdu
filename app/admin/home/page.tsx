'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit, Eye, Trash, BookOpen, FolderPen, LibraryBig, Slash, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import Link from 'next/link'
import FilterByKhoa from '@/components/FilterByKhoa'
import Image from 'next/image'

interface Magazine {
  id: string
  tieuDe: string
  moTa: string | null
  anhBia: string
  trangThai: string
  createdAt: string
  TaiKhoanNguoiDung: {
    name: string | null
    email: string
  }
  major: string
  pages: { id: string }[]
  tenTacGia: string | null
}

type ViewMode = 'grid' | 'table'

export default function AdminHomePage() {
  const router = useRouter()
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState<any>(null)
  const [selectedKhoa, setSelectedKhoa] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE_GRID = 12
  const ITEMS_PER_PAGE_TABLE = 15

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchMagazines()
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchMagazines = async () => {
    try {
      console.log('🔄 Fetching magazines...')
      const response = await fetch('/api/admin/magazines')

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Magazines loaded:', data)
        setMagazines(data)
      } else {
        const error = await response.json()
        console.error('❌ Error response:', error)
        toast.error(error.error || 'Không thể tải danh sách tạp chí')
      }
    } catch (error) {
      console.error('❌ Error fetching magazines:', error)
      toast.error('Không thể tải danh sách tạp chí')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tạp chí này?')) return

    try {
      const response = await fetch(`/api/admin/magazines/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Xóa thành công')
        fetchMagazines()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Không thể xóa')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Có lỗi xảy ra')
    }
  }

  const filteredMagazines = magazines.filter((magazine) => {
    const matchSearch = magazine.tieuDe.toLowerCase().includes(searchTerm.toLowerCase())
    const matchKhoa = selectedKhoa ? magazine.major === selectedKhoa : true
    return matchSearch && matchKhoa
  })

  // Pagination logic
  const itemsPerPage = viewMode === 'grid' ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_TABLE
  const totalPages = Math.ceil(filteredMagazines.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMagazines = filteredMagazines.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedKhoa, viewMode])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tạp Chí Phương Đông Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Hệ thống quản lý tạp chí của Đại học Phương Đông
            </p>
          </div>
          <div className="flex gap-1 items-end">
            <Slash className='scale-75' />
            <Badge className="mt-2 cursor-pointer">
              <Link href="/">← Về trang đọc</Link>
            </Badge>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          <Card className="shadow-md border-l-4 border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tổng số</CardTitle>
              <LibraryBig className="text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{magazines.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Đã xuất bản</CardTitle>
              <BookOpen className="text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {magazines.filter((m) => m.trangThai === 'PUBLISHED').length}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-gray-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bản nháp</CardTitle>
              <FolderPen className="text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">
                {magazines.filter((m) => m.trangThai === 'DRAFT').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Magazine List/Grid */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <CardTitle>Danh sách tạp chí</CardTitle>
              <div className="flex gap-2">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8"
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Dạng lưới
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8"
                  >
                    <List className="h-4 w-4 mr-1" />
                    Dạng bảng
                  </Button>
                </div>
                <Button
                  onClick={() => router.push('/admin/addnew')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" /> Thêm tạp chí
                </Button>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm tạp chí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-96">
                <FilterByKhoa
                  selectedKhoa={selectedKhoa}
                  onChange={setSelectedKhoa}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-6">
                {currentMagazines.map((magazine) => (
                  <Card key={magazine.id} className="group hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-0">
                      {/* Cover Image */}
                      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                        <Image
                          src={magazine.anhBia || '/placeholder-magazine.jpg'}
                          alt={magazine.tieuDe}
                          fill
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant={magazine.trangThai === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {magazine.trangThai === 'PUBLISHED' ? 'Xuất bản' : 'Nháp'}
                          </Badge>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px]">
                          {magazine.tieuDe}
                        </h3>

                        <div className="space-y-1 text-xs text-gray-600">
                          <p className="flex items-center gap-1">
                            <span className="font-medium">Tác giả:</span>
                            <span className="truncate">
                              {magazine.tenTacGia || magazine.TaiKhoanNguoiDung.name || magazine.TaiKhoanNguoiDung.email}
                            </span>
                          </p>
                          {/* <p className="flex items-center gap-1">
                            <span className="font-medium">Ngành:</span>
                            <Badge variant="outline" className="text-xs">{magazine.major}</Badge>
                          </p> */}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/magazine/${magazine.id}`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Xem
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/admin/update/${magazine.id}`)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Sửa
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(magazine.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Tiêu đề</TableHead>
                      <TableHead className="w-[100px]">Ảnh bìa</TableHead>
                      <TableHead className="w-[120px]">Trạng thái</TableHead>
                      <TableHead className="w-[150px]">Ngành học</TableHead>
                      <TableHead className="w-[200px]">Tác giả</TableHead>
                      <TableHead className="w-[150px] text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMagazines.map((magazine) => (
                      <TableRow key={magazine.id}>
                        <TableCell className="font-medium">
                          {magazine.tieuDe}
                        </TableCell>
                        <TableCell>
                          <Image
                            src={magazine.anhBia || '/placeholder-magazine.jpg'}
                            alt={magazine.tieuDe}
                            width={60}
                            height={80}
                            className="object-cover rounded-md"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={magazine.trangThai === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {magazine.trangThai === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{magazine.major}</Badge>
                        </TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          {magazine.tenTacGia || magazine.TaiKhoanNguoiDung.name || magazine.TaiKhoanNguoiDung.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/magazine/${magazine.id}`)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/update/${magazine.id}`)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(magazine.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Xóa"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Empty State */}
            {currentMagazines.length === 0 && (
              <div className="text-center py-12">
                <LibraryBig className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {searchTerm || selectedKhoa ? 'Không tìm thấy tạp chí' : 'Chưa có tạp chí nào'}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm || selectedKhoa
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                    : 'Click nút "Thêm tạp chí" để tạo tạp chí đầu tiên'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Hiển thị <span className="font-medium">{startIndex + 1}</span> -{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredMagazines.length)}</span> trong tổng số{' '}
                  <span className="font-medium">{filteredMagazines.length}</span> tạp chí
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Trước
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first, last, current, and nearby pages
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                      })
                      .map((page, index, arr) => {
                        // Add ellipsis
                        const prevPage = arr[index - 1]
                        const showEllipsis = prevPage && page - prevPage > 1

                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                            <Button
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-9"
                            >
                              {page}
                            </Button>
                          </div>
                        )
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}