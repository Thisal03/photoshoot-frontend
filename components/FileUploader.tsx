"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadToS3 } from "@/lib/s3";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
    onUploadComplete: (url: string) => void;
    folder: string;
    label?: string;
    className?: string;
}

export function FileUploader({
    onUploadComplete,
    folder,
    label = "Upload Image",
    className,
}: FileUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const result = await uploadToS3(file, folder, file.name);

        if (result.success && result.url) {
            onUploadComplete(result.url);
        } else {
            setError(result.error || "Upload failed");
        }
        setIsUploading(false);
    };

    return (
        <div className={cn("space-y-2", className)}>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {label}
            </label>
            <div className="relative group">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                            <span className="text-xs text-zinc-500">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-zinc-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-xs text-zinc-500">PNG, JPG, JPEG</span>
                        </>
                    )}
                </div>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
