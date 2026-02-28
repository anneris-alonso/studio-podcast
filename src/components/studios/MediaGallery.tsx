"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaItem {
  url: string;
  type: "IMAGE" | "VIDEO";
  sortOrder: number;
}

interface MediaGalleryProps {
  media: MediaItem[];
  studioName: string;
}

export function MediaGallery({ media, studioName }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  if (!media || media.length === 0) return null;

  const sortedMedia = [...media].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentMedia = sortedMedia[activeIndex];

  const next = () => setActiveIndex((prev) => (prev + 1) % sortedMedia.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + sortedMedia.length) % sortedMedia.length);

  return (
    <div className="space-y-4">
      {/* Main Feature Display */}
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 group shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            {currentMedia.type === "IMAGE" ? (
              <img
                src={currentMedia.url}
                alt={`${studioName} gallery ${activeIndex + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full relative">
                <img
                  src={`https://img.youtube.com/vi/${getYouTubeId(currentMedia.url)}/maxresdefault.jpg`}
                  alt="Video Preview"
                  className="w-full h-full object-cover opacity-50 grayscale"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            
            {/* Title Overlay Card (User's preferred style) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-8 left-8 right-8 p-8 glass-card rounded-3xl z-20 backdrop-blur-3xl border-white/10"
            >
              <h3 className="text-2xl font-bold mb-1">{studioName}</h3>
              <p className="text-white/40 text-[10px] tracking-[0.25em] font-bold uppercase">
                Studio City • Dubai Edition
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute inset-y-0 left-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        {sortedMedia.map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`flex-shrink-0 w-24 aspect-video rounded-xl border-2 transition-all relative overflow-hidden ${
              activeIndex === i ? "border-accent-violet scale-105 shadow-glow" : "border-white/10 opacity-50 hover:opacity-100"
            }`}
          >
            {item.type === "IMAGE" ? (
              <img src={item.url} alt={`Gallery thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <Play className="w-4 h-4 text-white/50" />
              </div>
            )}
            {activeIndex === i && <div className="absolute inset-0 bg-accent-violet/10" />}
          </button>
        ))}
      </div>

      {/* Modal View */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
            onClick={() => setShowModal(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 text-white hover:bg-white/10"
              onClick={() => setShowModal(false)}
            >
              <X className="w-8 h-8" />
            </Button>

            <div className="w-full max-w-6xl aspect-video relative" onClick={(e) => e.stopPropagation()}>
              {currentMedia.type === "IMAGE" ? (
                <img
                  src={currentMedia.url}
                  alt={studioName}
                  className="w-full h-full object-contain rounded-2xl"
                />
              ) : (
                  <iframe
                    src={getEmbedUrl(currentMedia.url)}
                    title={`Video for ${studioName}`}
                    className="w-full h-full rounded-2xl shadow-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getEmbedUrl(url: string) {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1`;
  return url;
}
