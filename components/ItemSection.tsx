"use client";

import { useState } from "react";
import { Plus, X, Info } from "lucide-react";
import { usePhotoshootStore } from "@/store/usePhotoshootStore";
import { ItemType, PhotoshootConfig } from "@/types/photoshoot";
import { FileUploader } from "./FileUploader";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ItemSectionProps {
    sectionKey: keyof Omit<PhotoshootConfig, "meta" | "output">;
    title: string;
    itemTypes: ItemType[];
    s3Folder: string;
    presets?: Record<string, string[]>;
    extraFields?: Record<string, { label: string; min: number; max: number; default: number }>;
}

export function ItemSection({
    sectionKey,
    title,
    itemTypes,
    s3Folder,
    presets,
    extraFields,
}: ItemSectionProps) {
    const { config, addItem, removeItem } = usePhotoshootStore();
    const items = config[sectionKey];

    const [selectedType, setSelectedType] = useState<ItemType>(itemTypes[0]);
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [strength, setStrength] = useState(0.8);

    const handleAddItem = () => {
        if (!description && !imageUrl) return;

        addItem(sectionKey, {
            type: selectedType,
            text: description,
            reference_image_url: imageUrl,
            strength: extraFields?.[selectedType] ? strength : undefined,
        });

        setDescription("");
        setImageUrl("");
        setStrength(extraFields?.[selectedType]?.default || 0.8);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                    {items.length} {items.length === 1 ? "item" : "items"} added
                </span>
            </div>

            {/* Existing Items List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm group"
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-400">
                                {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">{item.type}</span>
                                    {item.strength !== undefined && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
                                            Strength: {Math.round(item.strength * 100)}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 truncate">
                                    {item.text || "No description"}
                                </p>
                            </div>
                            {item.reference_image_url && (
                                <div className="text-[10px] flex items-center gap-1 text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded">
                                    🖼️ Image attached
                                </div>
                            )}
                            <button
                                onClick={() => removeItem(sectionKey, item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {items.length > 0 && <hr className="border-zinc-100 dark:border-zinc-800" />}

            {/* Add New Item Form */}
            <div className="bg-zinc-50/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Type</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as ItemType)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            >
                                {itemTypes.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {presets?.[selectedType] && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                    <Info className="w-3 h-3" />
                                    Suggestions
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {presets[selectedType].map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => setDescription(preset)}
                                            className="text-[11px] px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-full hover:border-indigo-500/50 hover:text-indigo-600 transition-all"
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Description
                            </label>
                            <textarea
                                placeholder={`Describe the ${selectedType.toLowerCase()}...`}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                            />
                        </div>

                        {extraFields?.[selectedType] && (
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-medium">
                                        {extraFields[selectedType].label}
                                    </label>
                                    <span className="text-xs font-bold text-indigo-600">
                                        {Math.round(strength * 100)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={extraFields[selectedType].min}
                                    max={extraFields[selectedType].max}
                                    step={0.05}
                                    value={strength}
                                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <FileUploader
                            folder={s3Folder}
                            label="Reference Image (Optional)"
                            onUploadComplete={(url) => setImageUrl(url)}
                        />
                        {imageUrl && (
                            <div className="relative aspect-square w-24 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                <img src={imageUrl} alt="Reference" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setImageUrl("")}
                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleAddItem}
                    disabled={!description && !imageUrl}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 py-3 rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                    Add to {title}
                </button>
            </div>
        </div>
    );
}
