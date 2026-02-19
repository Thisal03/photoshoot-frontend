"use client";

import { useState } from "react";
import { Plus, X, Info, User, Loader2 } from "lucide-react";
import { usePhotoshootStore } from "@/store/usePhotoshootStore";
import { ItemType } from "@/types/photoshoot";
import { FileUploader } from "./FileUploader";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const FACIAL_ANGLES = [
    "Front face",
    "Left side (90 degree)",
    "Right side (90 degree)",
    "Slightly turned left (45 degree)",
    "Slightly turned right (45 degree)",
    "Body figure",
];

const MODEL_ITEM_TYPES: ItemType[] = [
    "Face (5 Angles) & Body",
    "Face & Body",
    "Hair",
    "Pose",
];

export function ModelSection() {
    const { config, addItem, removeItem } = usePhotoshootStore();
    const items = config.model;

    const [selectedType, setSelectedType] = useState<ItemType>(MODEL_ITEM_TYPES[0]);
    const [description, setDescription] = useState("");
    const [multiAngleUrls, setMultiAngleUrls] = useState<string[]>(new Array(6).fill(""));
    const [singleImageUrl, setSingleImageUrl] = useState("");
    const [strength, setStrength] = useState(0.8);

    const handleAddItem = () => {
        if (selectedType === "Face (5 Angles) & Body") {
            if (multiAngleUrls.some((url) => !url)) return;
            addItem("model", {
                type: selectedType,
                text: description,
                reference_image_urls: multiAngleUrls,
            });
            setMultiAngleUrls(new Array(6).fill(""));
        } else {
            if (!description && !singleImageUrl) return;
            addItem("model", {
                type: selectedType,
                text: description,
                reference_image_url: singleImageUrl,
                strength: selectedType === "Pose" ? strength : undefined,
            });
            setSingleImageUrl("");
        }
        setDescription("");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-tight text-white">👤 Model Settings</h3>
                <span className="text-xs font-medium px-2 py-1 bg-zinc-800 rounded text-zinc-400">
                    {items.length} {items.length === 1 ? "item" : "items"} added
                </span>
            </div>

            {/* Existing Items */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="flex items-center gap-4 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm group"
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">
                                {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-white">{item.type}</span>
                                </div>
                                <p className="text-xs text-zinc-500 truncate">
                                    {item.text || "No description"}
                                </p>
                            </div>
                            <div className="text-[10px] flex items-center gap-1 text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                                🖼️ {item.reference_image_urls?.length || (item.reference_image_url ? 1 : 0)} Image(s)
                            </div>
                            <button
                                onClick={() => removeItem("model", item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-950/30 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add New Model Item */}
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">Item Type</label>
                            <div className="flex flex-wrap gap-2">
                                {MODEL_ITEM_TYPES.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedType(t)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-xs font-medium transition-all border cursor-pointer",
                                            selectedType === t
                                                ? "bg-white text-zinc-950 border-white"
                                                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">Description</label>
                            <textarea
                                placeholder={`Describe the ${selectedType.toLowerCase()}...`}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-20 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                            />
                        </div>

                        {selectedType === "Face (5 Angles) & Body" ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                                    <User className="w-4 h-4" />
                                    UPLOAD ALL 6 REFERENCE ANGLES
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                    {FACIAL_ANGLES.map((angle, idx) => (
                                        <div key={angle} className="space-y-2">
                                            <div className="text-[10px] text-zinc-500 font-medium truncate uppercase">
                                                {angle}
                                            </div>
                                            <div className="relative group">
                                                {multiAngleUrls[idx] ? (
                                                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-zinc-700">
                                                        <img
                                                            src={multiAngleUrls[idx]}
                                                            className="w-full h-full object-cover"
                                                            alt={angle}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newUrls = [...multiAngleUrls];
                                                                newUrls[idx] = "";
                                                                setMultiAngleUrls(newUrls);
                                                            }}
                                                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors cursor-pointer"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <FileUploader
                                                        folder="model-refs"
                                                        onUploadComplete={(url) => {
                                                            const newUrls = [...multiAngleUrls];
                                                            newUrls[idx] = url;
                                                            setMultiAngleUrls(newUrls);
                                                        }}
                                                        className="aspect-[3/4]"
                                                        label=""
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <FileUploader
                                        folder="model-refs"
                                        label="Model Reference Image"
                                        onUploadComplete={(url) => setSingleImageUrl(url)}
                                    />
                                    {selectedType === "Pose" && (
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-sm font-medium text-zinc-300">Pose Strength</label>
                                                <span className="text-xs font-bold text-indigo-400">
                                                    {Math.round(strength * 100)}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={1}
                                                step={0.05}
                                                value={strength}
                                                onChange={(e) => setStrength(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                        </div>
                                    )}
                                </div>
                                {singleImageUrl && (
                                    <div className="relative aspect-square w-32 rounded-xl overflow-hidden border border-zinc-700 shadow-xl">
                                        <img src={singleImageUrl} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setSingleImageUrl("")}
                                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleAddItem}
                    disabled={
                        selectedType === "Face (5 Angles) & Body"
                            ? multiAngleUrls.some((u) => !u)
                            : !description && !singleImageUrl
                    }
                    className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 px-4 py-4 rounded-xl font-bold hover:bg-zinc-100 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-white/5 active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    Add to Model Configuration
                </button>
            </div>
        </div>
    );
}
