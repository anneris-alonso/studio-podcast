"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { AssetKind } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils'; // Ensure you have this utility

interface AdminUploadProps {
  bookingId: string;
}

export function AdminUploadComponent({ bookingId }: AdminUploadProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<AssetKind>(AssetKind.FINAL);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      router.refresh(); 
      
      setTimeout(() => {
          setIsOpen(false);
          setFile(null);
          setSuccess(false);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Upload Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-stone-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Upload Session Asset</DialogTitle>
          <DialogDescription className="text-stone-400">
            Select a file to upload for this booking. Max 50MB.
          </DialogDescription>
        </DialogHeader>

        {!success ? (
          <div className="space-y-4 py-4">
                <div className={cn(
                    "border-2 border-dashed border-white/10 rounded-lg p-8 text-center transition-colors relative cursor-pointer hover:border-primary/40 hover:bg-white/5",
                    file && "border-primary/50 bg-primary/5"
                )}>
                  <input title="file"
                  type="file" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {file ? (
                        <div className="flex flex-col items-center gap-2 text-primary">
                            <FileText className="w-8 h-8" />
                            <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                            <span className="text-xs opacity-70">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                  ) : (
                        <div className="flex flex-col items-center gap-2 text-stone-500">
                            <Upload className="w-8 h-8" />
                            <span className="font-medium text-sm">Click to browse</span>
                        </div>
                  )}
                </div>

                <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                        <input 
                        type="radio" 
                        name="kind" 
                        value="FINAL" 
                        checked={kind === 'FINAL'}
                        onChange={() => setKind('FINAL')}
                        className="sr-only peer"
                        />
                        <div className="h-10 rounded-md border border-white/10 bg-black/20 flex items-center justify-center text-sm font-medium text-stone-400 peer-checked:border-primary/50 peer-checked:text-primary peer-checked:bg-primary/10 transition-all">
                            FINAL
                        </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input 
                        type="radio" 
                        name="kind" 
                        value="RAW" 
                        checked={kind === 'RAW'}
                        onChange={() => setKind('RAW')}
                        className="sr-only peer"
                        />
                        <div className="h-10 rounded-md border border-white/10 bg-black/20 flex items-center justify-center text-sm font-medium text-stone-400 peer-checked:border-blue-500/50 peer-checked:text-blue-400 peer-checked:bg-blue-500/10 transition-all">
                            RAW
                        </div>
                    </label>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-md">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <Button 
                  onClick={handleUpload} 
                  disabled={!file || isUploading} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isUploading ? 'Uploading...' : 'Confirm Upload'}
                </Button>
            </div>
        ) : (
            <div className="py-8 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Upload Complete!</h3>
                  <p className="text-sm text-stone-400">The customer can now access this file.</p>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
