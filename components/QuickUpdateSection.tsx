"use client";

import { useState } from "react";
import { Zap, Sparkles, Image as ImageIcon, Loader2, Download, Trash2, Plus, X, Maximize2 } from "lucide-react";
import { cn, forceDownload } from "@/lib/utils";
import { quickUpdate } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { FileUploader } from "./FileUploader";
import { ImageModal } from "./ImageModal";

export function QuickUpdateSection() {
    const [prompt, setPrompt] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [aspectRatio, setAspectRatio] = useState("4:5");
    const [resolution, setResolution] = useState("4K");

    const handleUploadComplete = (url: string) => {
        if (!imageUrls.includes(url)) {
            setImageUrls([...imageUrls, url]);
        }
    };

    const handleRemoveUrl = (url: string) => {
        setImageUrls(imageUrls.filter(u => u !== url));
    };

    const handleGenerate = async () => {
        if (!prompt) {
            setError("Please enter a prompt.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            const res = await quickUpdate({
                prompt,
                image_urls: imageUrls,
                aspect_ratio: aspectRatio,
                resolution: resolution
            });

            if (res.success && res.image) {
                setResult(res.image);
            } else {
                throw new Error(res.error || "Failed to generate image");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration side */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg font-semibold text-white">Quick Update Params</h3>
                    </div>

                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-zinc-300">
                                Prompt / Modification Instructions
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the changes or new image you want to generate (e.g., 'Change the model's outfit to a red dress' or 'Make the lighting more dramatic')"
                                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Aspect Ratio</label>
                                <select
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                    <option value="4:5">Instagram Portrait (4:5)</option>
                                    <option value="9:16">Story (9:16)</option>
                                    <option value="1:1">Square (1:1)</option>
                                    <option value="2:3">Default (2:3)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Resolution</label>
                                <select
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                    <option value="1K">1K</option>
                                    <option value="2K">2K</option>
                                    <option value="4K">4K</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3 text-zinc-300">
                                Reference Images (Optional)
                            </label>

                            <FileUploader
                                folder="quick-update-refs"
                                label="Upload Reference"
                                onUploadComplete={handleUploadComplete}
                                className="mb-6"
                            />

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <AnimatePresence>
                                    {imageUrls.map((url, index) => (
                                        <motion.div
                                            key={url}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="group relative aspect-square bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800"
                                        >
                                            <img src={url} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10">
                                                #{index + 1}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveUrl(url)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt}
                            className="w-full relative group bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Quick Generate
                                    </>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </button>

                        {error && (
                            <p className="text-xs text-red-500 text-center font-medium animate-pulse">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                {/* Result side */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold text-white">Preview Result</h3>
                    </div>

                    <div className="aspect-[2/3] bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden relative group shadow-2xl">
                        {result ? (
                            <>
                                <img src={result} alt="Generated result" className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                                        <button
                                            onClick={() => setSelectedImage(result)}
                                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors cursor-pointer"
                                        >
                                            <Maximize2 className="w-4 h-4" />
                                            Full View
                                        </button>
                                        <button
                                            onClick={() => forceDownload(result, "quick-update.png")}
                                            className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 py-3 rounded-xl font-bold hover:bg-zinc-100 transition-colors cursor-pointer"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Quick Update
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center space-y-4 px-10">
                                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800/50">
                                    {isGenerating ? (
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-zinc-700" />
                                    )}
                                </div>
                                <div className="max-w-[180px] mx-auto">
                                    <p className="text-sm font-medium text-zinc-500">
                                        {isGenerating ? "Gemini is perfecting your update..." : "Your updated image will appear here"}
                                    </p>
                                    <p className="text-[10px] text-zinc-700 mt-2 uppercase tracking-widest leading-relaxed">
                                        Powered by Gemini 3.0
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ImageModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageUrl={selectedImage || ""}
            />
        </div>
    );
}
