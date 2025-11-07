import Sidebar from "@/components/Sidebar"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let role: string = "USER"
    let hasToken = false

    try {
        // Lấy token từ cookie
        const cookieStore = cookies()
        const token = (await cookieStore).get("admin_token")?.value

        if (token) {
            hasToken = true
            const decoded = verifyToken(token) as { userId?: string } | null
            if (decoded?.userId) {
                const user = await prisma.taiKhoanNguoiDung.findUnique({
                    where: { id: decoded.userId },
                    select: { role: true },
                })
                role = user?.role ?? "USER"
            }
        }
    } catch (err) {
        console.error("Auth error in layout:", err)
    }

    // 👉 Nếu chưa đăng nhập thì chỉ hiển thị children (không có Sidebar)
    if (!hasToken) {
        return (
            <div className="min-h-screen flex">
                <main className="flex-1 bg-gray-50 p-6">{children}</main>
            </div>
        )
    }

    // 👉 Nếu đã đăng nhập thì hiển thị Sidebar
    return (
        <div className="min-h-screen flex">
            <Sidebar role={role} />
            <main className="flex-1 bg-gray-50 p-6 ml-60">{children}</main>
        </div>
    )
}
