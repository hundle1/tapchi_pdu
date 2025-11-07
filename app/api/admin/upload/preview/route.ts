// app/api/admin/upload/preview/route.ts
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const pdf = (await import('pdf-parse')).default;
        const mammoth = (await import('mammoth')).default;
        const formData = await req.formData();
        const file = formData.get("file") as Blob | null;
        console.log("📄 file debug:", file);
        if (!file) {
            return NextResponse.json({ error: "Không nhận được file từ formData" }, { status: 400 });
        }
        const filename = formData.get("filename") as string | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        console.log("📥 Received file:", {
            name: filename,
            size: (file as any).size,
            type: (file as any).type,
        });

        const bytes = await new Response(file).arrayBuffer();
        const buffer = Buffer.from(bytes);

        const mime = (file as any).type || "";
        if (!mime.includes("pdf")) {
            return NextResponse.json(
                { error: "Only PDF files are supported" },
                { status: 415 }
            );
        }

        let pageCount: number | null = null;
        try {
            const data = await pdfParse(buffer);
            pageCount = data.numpages || null;
        } catch (e) {
            console.error("PDF parse error:", e);
            return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
        }

        return NextResponse.json({
            pageCount,
            detectedType: "pdf",
            filename: filename || "unknown.pdf",
        });
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
