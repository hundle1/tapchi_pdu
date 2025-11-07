// \components\FileUploader.tsx
"use client";

import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Accept } from "react-dropzone";

interface FileUploaderProps {
    label?: string;
    accept?: Accept;
    file: File | null;
    onFileChange: (file: File | null) => void;
}

export default function FileUploader({
    label = "Chọn file",
    accept = { "application/pdf": [".pdf"] },
    file,
    onFileChange,
}: FileUploaderProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles && acceptedFiles.length > 0) {
                onFileChange(acceptedFiles[0]);
            }
        },
        [onFileChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple: false,
    });

    // ✅ Cho phép dán file từ clipboard (Ctrl+V)
    useEffect(() => {
        const onPaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                const it = items[i];
                if (it.kind === "file") {
                    const f = it.getAsFile();
                    if (f) {
                        onFileChange(f);
                        break;
                    }
                }
            }
        };
        window.addEventListener("paste", onPaste);
        return () => window.removeEventListener("paste", onPaste);
    }, [onFileChange]);

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
          ${isDragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
            >
                <input {...getInputProps()} />
                {file ? (
                    <div className="text-sm text-gray-700 flex flex-col items-center space-y-2">
                        <p>
                            File đã chọn: <span className="font-medium">{file.name}</span>
                        </p>

                        <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center space-x-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFileChange(null);
                            }}
                        >
                            <X className="w-4 h-4" />
                            <span>Xóa file</span>
                        </Button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        Kéo & thả file PDF vào đây, hoặc click để chọn <br />
                        (Hỗ trợ Ctrl + V để dán file từ clipboard)
                    </p>
                )}
            </div>
        </div>
    );
}
