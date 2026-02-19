"use client";

import { useState } from "react";
import { ModelSection } from "@/components/ModelSection";
import { ItemSection } from "@/components/ItemSection";
import { OutputSettings } from "@/components/OutputSettings";
import { QuickUpdateSection } from "@/components/QuickUpdateSection";
import { Camera, User, Shirt, Sparkles, Box, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "model", label: "Model", icon: User },
  { id: "outfits", label: "Outfits", icon: Shirt },
  { id: "accessories", label: "Accessories", icon: Sparkles },
  { id: "environment", label: "Environment", icon: Box },
  { id: "generate", label: "Generate", icon: Camera },
];

type AppMode = "photoshoot" | "quick_update";

export default function PhotoshootGenerator() {
  const [mode, setMode] = useState<AppMode>("photoshoot");
  const [activeTab, setActiveTab] = useState("model");

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Photoshoot Generator</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Professional AI Fashion Photography
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {mode === "photoshoot" && (
              <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                      activeTab === tab.id
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                    )}
                  >
                    <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-indigo-400" : "")} />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setMode("photoshoot")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                  mode === "photoshoot"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Photoshoot
              </button>
              <button
                onClick={() => setMode("quick_update")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                  mode === "quick_update"
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Zap className="w-3 h-3" />
                Quick Update
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Mobile Navigation */}
        {mode === "photoshoot" && (
          <div className="md:hidden flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 mb-8 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer",
                  activeTab === tab.id
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {mode === "photoshoot" ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {activeTab === "model" && <ModelSection />}

                {activeTab === "outfits" && (
                  <ItemSection
                    sectionKey="outfits"
                    title="👗 Outfits Configuration"
                    s3Folder="outfit-refs"
                    itemTypes={[
                      "Dress", "Top", "Bottom", "Jacket", "Coat", "Shirt",
                      "Pants", "Skirt", "Sweater", "Shoes", "Other"
                    ]}
                  />
                )}

                {activeTab === "accessories" && (
                  <ItemSection
                    sectionKey="accessories"
                    title="💍 Accessories & Jewelry"
                    s3Folder="accessory-refs"
                    itemTypes={[
                      "Necklace", "Earrings", "Ring", "Bracelet", "Watch",
                      "Belt", "Bag", "Hat", "Scarf", "Sunglasses", "Other"
                    ]}
                  />
                )}

                {activeTab === "environment" && (
                  <ItemSection
                    sectionKey="environment"
                    title="🏞️ Environment & Photography"
                    s3Folder="environment-refs"
                    itemTypes={["Background", "Aesthetic", "Framing", "Lighting", "Shadows", "Theme"]}
                    presets={{
                      Background: ["Professional studio", "Indoor lifestyle", "Outdoor urban", "Outdoor nature"],
                      Aesthetic: ["Commercial", "Editorial", "Lifestyle", "High Fashion", "Casual"],
                      Framing: ["Full body", "3/4 body", "Waist up", "Close up"],
                      Lighting: ["Soft warm", "Studio clean", "Golden hour", "Hard shadows", "Natural"],
                    }}
                  />
                )}

                {activeTab === "generate" && <OutputSettings />}
              </motion.div>
            ) : (
              <motion.div
                key="quick_update"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <QuickUpdateSection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="py-10 px-6 border-t border-zinc-900 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-500 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            System Online • Powered by Gemini AI & Supabase
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors cursor-pointer">Documentation</a>
            <a href="#" className="hover:text-white transition-colors cursor-pointer">API Status</a>
            <a href="#" className="hover:text-white transition-colors cursor-pointer">Help Center</a>
          </div>
        </div>
      </footer>

      {/* Background Glows */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
