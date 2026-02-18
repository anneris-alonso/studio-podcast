"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, Music, Video, CheckCircle2 } from "lucide-react";

interface Asset {
  id: string;
  filename: string;
  kind: 'RAW' | 'EDIT_V1' | 'FINAL';
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulated current user - we'd normally get this from a session
  const userId = "test-user-uuid"; 

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch(`/api/bookings/${id}/assets`, {
          headers: { 'x-user-id': userId }
        });
        if (!res.ok) throw new Error("Failed to load assets");
        const data = await res.json();
        setAssets(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, [id]);

  const handleDownload = async (asset: Asset) => {
    try {
      // Direct download via API stream
      const response = await fetch(`/api/assets/${asset.id}/download`, {
        headers: { 'x-user-id': userId }
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = asset.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download file. Please try again.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const groupAssets = (kind: Asset['kind']) => assets.filter(a => a.kind === kind);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold premium-gradient-text mb-2">Booking Delivery</h1>
          <p className="text-muted-foreground">Access your raw recordings and polished edits here.</p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {(['RAW', 'EDIT_V1', 'FINAL'] as const).map((kind) => {
            const kindAssets = groupAssets(kind);
            return (
              <div key={kind} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-muted-foreground/80">
                    {kind === 'RAW' ? 'Original Recordings' : kind === 'EDIT_V1' ? 'First Edit' : 'Final Version'}
                  </h2>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kindAssets.length > 0 ? (
                    kindAssets.map((asset) => (
                      <GlassCard key={asset.id} className="group hover:border-primary/50 transition-all p-4 border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-md bg-primary/10 text-primary">
                            {asset.mimeType.includes('audio') ? <Music className="w-5 h-5" /> : 
                             asset.mimeType.includes('video') ? <Video className="w-5 h-5" /> : 
                             <FileText className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{asset.filename}</p>
                            <p className="text-[10px] text-muted-foreground uppercase opacity-70">
                              {formatSize(asset.sizeBytes)} • {new Date(asset.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDownload(asset)}
                          className="group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </GlassCard>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                      <p className="text-sm text-muted-foreground italic">No assets available for this section yet.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
