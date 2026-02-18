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
import { Plus, Pencil, Loader2, AlertTriangle } from 'lucide-react';
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
    } : {
      name: '',
      slug: '',
      description: '',
      capacity: 1,
      equipmentSummary: '',
      coverImageUrl: '',
      isActive: true,
    }
  });

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
      <DialogContent className="sm:max-w-[600px] bg-black/90 border-white/10 backdrop-blur-xl">
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
              <label className="text-xs font-medium text-muted-foreground">Cover Image URL</label>
              <Input {...form.register('coverImageUrl')} placeholder="https://..." className="bg-white/5 border-white/10" />
              {form.formState.errors.coverImageUrl && <p className="text-red-400 text-xs">{form.formState.errors.coverImageUrl.message}</p>}
            </div>
          </div>

           <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Equipment Summary</label>
            <Textarea {...form.register('equipmentSummary')} placeholder="e.g. 4x Shure SM7B, Rodecaster Pro..." className="bg-white/5 border-white/10 h-20" />
            {form.formState.errors.equipmentSummary && <p className="text-red-400 text-xs">{form.formState.errors.equipmentSummary.message}</p>}
          </div>
          
           <div className="flex items-center gap-2">
             <input type="checkbox" {...form.register('isActive')} id="isActive" className="rounded bg-white/10 border-white/20" />
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
