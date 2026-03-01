'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StudioSchema, StudioFormData } from '@/lib/validations/admin-catalog';
import { createStudioRoom, updateStudioRoom, deactivateStudioRoom } from '../../_actions/media-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Loader2, AlertTriangle, ImagePlus, Video, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StudioFormProps {
  studio?: any; // Start loosely typed to avoid strict Prisma type dependency on client, or define interface
  mode?: 'create' | 'edit';
}

export default function StudioForm({ studio, mode = 'create' }: StudioFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<StudioFormData>({
    resolver: zodResolver(StudioSchema),
    defaultValues: studio ? {
      name: studio.name,
      slug: studio.slug,
      description: studio.description,
      capacity: studio.capacity,
      equipmentSummary: studio.equipmentSummary,
      coverImageUrl: studio.coverImageUrl || '',
      isActive: studio.isActive,
      media: studio.media?.map((m: any) => ({
        url: m.url,
        type: m.type,
        sortOrder: m.sortOrder
      })) || [],
    } : {
      name: '',
      slug: '',
      description: '',
      capacity: 1,
      equipmentSummary: '',
      coverImageUrl: '',
      isActive: true,
      media: [],
    }
  });

  const media = form.watch('media') || [];

  const addMedia = (type: 'IMAGE' | 'VIDEO', url: string = '') => {
    form.setValue('media', [
      ...media,
      { url, type, sortOrder: media.length }
    ]);
  };

  const removeMedia = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    form.setValue('media', newMedia.map((m, i) => ({ ...m, sortOrder: i })));
  };

  const updateMediaUrl = (index: number, url: string) => {
    const newMedia = [...media];
    newMedia[index].url = url;
    form.setValue('media', newMedia);
  };

  const handleMultipleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const readFiles = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(readFiles);
    
    const currentMedia = form.getValues('media') || [];
    const newMediaItems = results.map((url, i) => ({
      url,
      type: 'IMAGE' as const,
      sortOrder: currentMedia.length + i
    }));

    form.setValue('media', [...currentMedia, ...newMediaItems]);
    
    // Reset the input so the same files can be selected again if needed
    e.target.value = '';
  };

  const onSubmit = async (data: StudioFormData) => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'create') {
        await createStudioRoom(data);
      } else {
        await updateStudioRoom(studio.id, data);
      }
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if(!confirm("Are you sure you want to deactivate this studio?")) return;
    setLoading(true);
    try {
      await deactivateStudioRoom(studio.id);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? (
          <Button variant="glass" className="gap-2">
            <Plus className="w-4 h-4" /> Add Studio
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="hover:text-primary">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto bg-card/95 border-border/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Studio' : `Edit ${studio?.name}`}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input {...form.register('name')} placeholder="e.g. Podcast Haven" className="bg-white/5 border-white/10" />
              {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Slug</label>
              <Input {...form.register('slug')} placeholder="e.g. podcast-haven" className="bg-white/5 border-white/10" />
              {form.formState.errors.slug && <p className="text-red-400 text-xs">{form.formState.errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea {...form.register('description')} className="bg-white/5 border-white/10 resize-none h-24" />
            {form.formState.errors.description && <p className="text-red-400 text-xs">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Capacity (People)</label>
              <Input 
                type="number" 
                {...form.register('capacity', { valueAsNumber: true })} 
                className="bg-white/5 border-white/10" 
              />
              {form.formState.errors.capacity && <p className="text-red-400 text-xs">{form.formState.errors.capacity.message}</p>}
            </div>
             <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Cover Image (Upload)</label>
              <Input 
                type="file" 
                accept="image/*"
                className="bg-white/5 border-white/10 file:text-white file:font-medium file:cursor-pointer cursor-pointer" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      form.setValue('coverImageUrl', reader.result as string, { shouldValidate: true });
                    };
                    reader.readAsDataURL(file);
                  } else {
                    form.setValue('coverImageUrl', '');
                  }
                }}
              />
              {form.watch('coverImageUrl') && (
                <div className="mt-2 text-[10px] text-emerald-400">✓ Image loaded ready to be saved</div>
              )}
              {form.formState.errors.coverImageUrl && <p className="text-red-400 text-xs">{form.formState.errors.coverImageUrl.message}</p>}
            </div>
          </div>

           <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Equipment Summary</label>
            <Textarea {...form.register('equipmentSummary')} placeholder="e.g. 4x Shure SM7B, Rodecaster Pro..." className="bg-white/5 border-white/10 h-20" />
            {form.formState.errors.equipmentSummary && <p className="text-red-400 text-xs">{form.formState.errors.equipmentSummary.message}</p>}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Media Gallery</label>
              <div className="flex gap-2">
                <div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    id="multi-image-upload"
                    className="hidden"
                    title="Upload images"
                    onChange={handleMultipleImages}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[10px] gap-1 bg-white/5 border-white/10"
                    onClick={() => document.getElementById('multi-image-upload')?.click()}
                  >
                    <ImagePlus className="w-3 h-3" /> Add Images
                  </Button>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[10px] gap-1 bg-white/5 border-white/10"
                  onClick={() => addMedia('VIDEO')}
                >
                  <Video className="w-3 h-3" /> Add Video Link
                </Button>
              </div>
            </div>

            {/* Images: 3-column grid */}
            {media.some(m => m.type === 'IMAGE') && (
              <div className="grid grid-cols-3 gap-2">
                {media.map((m, index) => m.type === 'IMAGE' && (
                  <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-white/10 bg-white/5">
                    {m.url ? (
                      <img src={m.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-white/30 hover:text-white/60 transition-colors">
                        <ImagePlus className="w-5 h-5 mb-1" />
                        <span className="text-[9px]">Pick image</span>
                        <input
                          type="file"
                          accept="image/*"
                          title="Upload image"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => updateMediaUrl(index, reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                    {/* Floating delete button */}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-black/70 hover:bg-red-500/80 text-white"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Videos: list rows */}
            {media.some(m => m.type === 'VIDEO') && (
              <div className="flex flex-col gap-2 mt-2">
                {media.map((m, index) => m.type === 'VIDEO' && (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 group">
                    <Video className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <Input 
                      placeholder="Video URL (YouTube, Vimeo, or direct link)"
                      value={m.url}
                      onChange={(e) => updateMediaUrl(index, e.target.value)}
                      className="h-7 text-xs bg-transparent border-none focus-visible:ring-0 px-0 py-0"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-black/60 hover:bg-red-500/80 text-white shrink-0"
                      title="Remove video"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {media.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-xl text-muted-foreground text-xs">
                No images or videos added yet.
              </div>
            )}
          </div>
          
           <div className="flex items-center gap-2">
             <input type="checkbox" {...form.register('isActive')} id="isActive" className="rounded bg-bg border-border/20" />
             <label htmlFor="isActive" className="text-sm font-medium">Active (Visible to public)</label>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/20 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex justify-between pt-4">
            {mode === 'edit' && (
              <Button type="button" variant="destructive" size="sm" onClick={handleDeactivate} disabled={loading}>
                 Deactivate
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="glass" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'create' ? 'Create Studio' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
