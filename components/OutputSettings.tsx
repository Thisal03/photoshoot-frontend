"use client";

import { usePhotoshootStore } from "@/store/usePhotoshootStore";
import { Settings, Image as ImageIcon, Sparkles, Zap, Download, Loader2, Plus, Maximize2 } from "lucide-react";
import { cn, forceDownload } from "@/lib/utils";
import { useState } from "react";
import { generatePhotoshoot } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ImageModal } from "./ImageModal";

const PLATFORM_OPTIONS = {
    "Instagram Portrait (4:5)": "4:5",
    "Instagram Story (9:16)": "9:16",
    "Instagram Square (1:1)": "1:1",
    "Default (2:3)": "2:3",
};

const QUALITY_OPTIONS = ["1K", "2K", "4K"];
const VARIETY_OPTIONS = ["Subtle Variations", "Dynamic Angles"];

export function OutputSettings() {
    const { config, updateOutput } = usePhotoshootStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        const totalItems = config.model.length + config.outfits.length + config.accessories.length + config.environment.length;
        if (totalItems === 0) {
            setError("Please add at least one item to generate.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setResults([]);
        setProgress(0);

        const allImages: string[] = [];
        const count = config.output.count;

        try {
            for (let i = 0; i < count; i++) {
                setProgress(i + 1);
                // Create a config override for single image generation
                const singleConfig = { ...config, output: { ...config.output, count: 1 } };
                const result = await generatePhotoshoot(singleConfig);

                if (result.success && result.images) {
                    allImages.push(...result.images);
                    // Add result immediately for better UX
                    setResults([...allImages]);
                } else {
                    throw new Error(result.error || `Failed to generate image ${i + 1}`);
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Settings Form */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold text-white">Generation Parameters</h3>
                    </div>

                    <div className="space-y-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-300 flex items-center gap-2">
                                Platform Preset
                            </label>
                            <select
                                value={config.output.platform_preset}
                                onChange={(e) => {
                                    const preset = e.target.value;
                                    updateOutput({
                                        platform_preset: preset,
                                        aspect_ratio: PLATFORM_OPTIONS[preset as keyof typeof PLATFORM_OPTIONS],
                                    });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                            >
                                {Object.keys(PLATFORM_OPTIONS).map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Image Count</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={config.output.count}
                                    onChange={(e) => updateOutput({ count: parseInt(e.target.value) })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Quality</label>
                                <select
                                    value={config.output.quality}
                                    onChange={(e) => updateOutput({ quality: e.target.value as any })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                    {QUALITY_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">Batch Variety</label>
                            <div className="grid grid-cols-2 gap-2">
                                {VARIETY_OPTIONS.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() =>
                                            updateOutput({
                                                batch_variety: opt.includes("Subtle") ? "subtle_variations" : "dynamic_angles",
                                            })
                                        }
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                                            (opt.includes("Subtle") && config.output.batch_variety === "subtle_variations") ||
                                                (opt.includes("Dynamic") && config.output.batch_variety === "dynamic_angles")
                                                ? "bg-indigo-600 border-indigo-500 text-white"
                                                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Config Summary & Action */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg font-semibold text-white">Ready for Generation</h3>
                    </div>

                    <div className="space-y-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden">
                        <div className="space-y-3">
                            {[
                                { label: "Model Items", value: config.model.length },
                                { label: "Outfits", value: config.outfits.length },
                                { label: "Accessories", value: config.accessories.length },
                                { label: "Environment", value: config.environment.length },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">{item.label}</span>
                                    <span className={cn("font-bold", item.value > 0 ? "text-white" : "text-zinc-700")}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full relative group bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden active:scale-[0.98]"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating {progress} of {config.output.count}...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate Photoshoot
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
            </div>

            {/* Results Gallery */}
            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 pt-10 border-t border-zinc-800"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <ImageIcon className="w-6 h-6 text-indigo-500" />
                                Generated Results
                            </h3>
                            <div className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                                {results.length} Images Perfected
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((url, idx) => (
                                <motion.div
                                    key={url}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative aspect-[4/5] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl"
                                >
                                    <img src={url} alt={`Generated result ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                                            <button
                                                onClick={() => setSelectedImage(url)}
                                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-500 transition-colors cursor-pointer"
                                            >
                                                <Maximize2 className="w-4 h-4" />
                                                Full View
                                            </button>
                                            <button
                                                onClick={() => forceDownload(url, `photoshoot-${idx + 1}.png`)}
                                                className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-100 transition-colors cursor-pointer"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ImageModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageUrl={selectedImage || ""}
            />

            {/* JSON Previews (Expanders) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                <details className="group bg-zinc-900/30 border border-zinc-900 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all list-none">
                        <span className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            View App Configuration JSON
                        </span>
                        <Plus className="w-4 h-4 group-open:rotate-45 transition-transform" />
                    </summary>
                    <div className="p-4 bg-black/50 border-t border-zinc-900">
                        <pre className="text-[10px] sm:text-xs text-indigo-400 overflow-x-auto p-4 bg-zinc-950 rounded-lg">
                            {JSON.stringify(config, null, 2)}
                        </pre>
                    </div>
                </details>

                <details className="group bg-zinc-900/30 border border-zinc-900 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all list-none">
                        <span className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            View Gemini API Payload Preview
                        </span>
                        <Plus className="w-4 h-4 group-open:rotate-45 transition-transform" />
                    </summary>
                    <div className="p-4 bg-black/50 border-t border-zinc-900">
                        <pre className="text-[10px] sm:text-xs text-yellow-400 overflow-x-auto p-4 bg-zinc-950 rounded-lg">
                            {/* Note: This is a preview of the metadata part, images are excluded here for clarity */}
                            {JSON.stringify({ ...config, meta: { ...config.meta, notice: "Image base64 parts are handled dynamically" } }, null, 2)}
                        </pre>
                    </div>
                </details>
            </div>
        </div>
    );
}
