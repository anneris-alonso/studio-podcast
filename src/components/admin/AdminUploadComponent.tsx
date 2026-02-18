"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";

interface AdminUploadComponentProps {
  bookingId: string;
  onSuccess?: () => void;
}

export function AdminUploadComponent({ bookingId, onSuccess }: AdminUploadComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<'RAW' | 'EDIT_V1' | 'FINAL'>('RAW');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = "admin-user-uuid"; // Simulated admin

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/upload`, {
        method: 'POST',
        headers: { 'x-user-id': userId },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setFile(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <GlassCard className="border-white/10 space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Internal Delivery Tool</h3>
        <Upload className="w-4 h-4 text-primary opacity-50" />
      </div>

      <div className="space-y-4">
        {/* Kind selector */}
        <div className="flex gap-2">
          {(['RAW', 'EDIT_V1', 'FINAL'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all border ${
                kind === k 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* File Drop Area */}
        <div className="relative">
          {!file ? (
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
              <p className="text-xs text-muted-foreground">Click or drag to select file</p>
              <p className="text-[10px] text-muted-foreground/50 mt-1">Max size: 50MB</p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="max-w-[150px]">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="p-1 hover:bg-white/5 rounded-md text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-[10px] text-destructive">{error}</p>}
        {success && (
          <div className="flex items-center gap-2 text-[10px] text-green-400 bg-green-400/10 p-2 rounded-md border border-green-400/20">
            <CheckCircle2 className="w-3 h-3" />
            Upload complete!
          </div>
        )}

        <Button 
          variant="glass" 
          className="w-full" 
          disabled={!file || uploading}
          onClick={handleUpload}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : 'Upload to Production'}
        </Button>
      </div>
    </GlassCard>
  );
}
