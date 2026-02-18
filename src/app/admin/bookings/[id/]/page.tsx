"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminUploadComponent } from "@/components/admin/AdminUploadComponent";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle2, Music, Video, Download } from "lucide-react";

interface Asset {
  id: string;
  filename: string;
  kind: 'RAW' | 'EDIT_V1' | 'FINAL';
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export default function AdminBookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = "admin-user-uuid"; // Simulated admin auth

  const fetchAssets = async () => {
    try {
      const res = await fetch(`/api/bookings/${id}/assets`, {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (err) {
      console.error("Failed to fetch assets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [id]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Admin: Manage Booking Assets</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">ID: {id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Sidebar */}
          <div className="lg:col-span-1">
            <AdminUploadComponent bookingId={id as string} onSuccess={fetchAssets} />
          </div>

          {/* Assets Table/List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Uploaded Assets</h3>
            
            <div className="space-y-2">
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <GlassCard key={asset.id} className="p-3 border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        {asset.mimeType.includes('audio') ? <Music className="w-4 h-4" /> : 
                         asset.mimeType.includes('video') ? <Video className="w-4 h-4" /> : 
                         <FileText className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/10 text-[9px] uppercase">
                            {asset.kind}
                          </span>
                          <p className="text-xs font-medium line-clamp-1">{asset.filename}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                           {formatSize(asset.sizeBytes)} • Uploaded {new Date(asset.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-sm text-muted-foreground italic">No assets found for this booking.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
