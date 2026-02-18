"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border border-white/10 backdrop-blur-xl animate-in slide-in-from-right-10 fade-in duration-300",
                            t.type === "success" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            t.type === "error" && "bg-red-500/10 text-red-500 border-red-500/20",
                            t.type === "info" && "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        )}
                    >
                        {t.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                        {t.type === "error" && <AlertCircle className="w-5 h-5" />}
                        {t.type === "info" && <Info className="w-5 h-5" />}
                        <span className="text-sm font-semibold">{t.message}</span>
                        <button title="Close" aria-label="Close"
                            onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                            className="ml-2 hover:opacity-70 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}
