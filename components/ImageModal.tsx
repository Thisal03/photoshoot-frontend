"use client";

import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Reset scale and position when modal closes or scale returns to 1
    useEffect(() => {
        if (!isOpen) {
            setScale(1);
            animate(x, 0, { type: "spring", damping: 25, stiffness: 200 });
            animate(y, 0, { type: "spring", damping: 25, stiffness: 200 });
        }

        if (scale === 1) {
            animate(x, 0, { type: "spring", damping: 25, stiffness: 200 });
            animate(y, 0, { type: "spring", damping: 25, stiffness: 200 });
        }

        // Get container size
        if (isOpen && containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            setContainerSize({ width: clientWidth, height: clientHeight });
        }
    }, [isOpen, imageUrl, scale, x, y]);

    const handleWheel = (e: React.WheelEvent) => {
        if (!isOpen) return;

        // Prevent page scroll when zooming
        e.preventDefault();

        const delta = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(scale + delta, 1), 5);
        setScale(newScale);
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { clientWidth, clientHeight } = e.currentTarget;
        setImgDimensions({ width: clientWidth, height: clientHeight });
    };

    // Calculate constraints: how far the image can move before a border hits the edge
    const horizontalConstraint = Math.max(0, (imgDimensions.width * scale - containerSize.width) / 2);
    const verticalConstraint = Math.max(0, (imgDimensions.height * scale - containerSize.height) / 2);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10"
                    onWheel={handleWheel}
                >
                    {/* Header/Controls */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[110]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-900/80 rounded-lg border border-zinc-800">
                                <Maximize2 className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-semibold hidden md:block">Image Full View</h3>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Zoom Controls */}
                            <div className="flex items-center bg-zinc-900/80 rounded-xl border border-zinc-800 p-1 mr-4">
                                <button
                                    onClick={handleZoomOut}
                                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-5 h-5" />
                                </button>
                                <span className="px-3 text-xs font-bold text-zinc-500 min-w-[50px] text-center">
                                    {Math.round(scale * 100)}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer border border-white/10"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div
                        ref={containerRef}
                        className="relative w-full h-full flex items-center justify-center overflow-hidden"
                    >
                        <motion.div
                            drag={scale > 1}
                            dragConstraints={{
                                left: -horizontalConstraint,
                                right: horizontalConstraint,
                                top: -verticalConstraint,
                                bottom: verticalConstraint,
                            }}
                            dragElastic={0.1}
                            dragMomentum={true}
                            onDragStart={() => setIsDragging(true)}
                            onDragEnd={() => setIsDragging(false)}
                            style={{
                                scale,
                                x,
                                y,
                                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                            }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: scale, opacity: 1 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative flex items-center justify-center pointer-events-auto"
                        >
                            <img
                                src={imageUrl}
                                alt="Full view"
                                onLoad={handleImageLoad}
                                className="max-w-none max-h-[85vh] object-contain shadow-2xl rounded-sm pointer-events-none select-none"
                                draggable={false}
                            />
                        </motion.div>
                    </div>

                    {/* Footer Info */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500 uppercase tracking-widest font-medium text-center">
                        Use mouse wheel or zoom buttons to inspect details • Drag to pan when zoomed
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
