'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PackageSchema, PackageFormData } from '@/lib/validations/admin-catalog';
import { createPackage, updatePackage, deactivatePackage } from '../../_actions/package-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PackageUnit } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PackageForm({ pkg, mode = 'create' }: { pkg?: any; mode?: 'create' | 'edit' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Helper to init default values, converting price minor -> AED
  const defaultValues = pkg ? {
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description,
      studioRoomId: pkg.studioRoomId || undefined, // or null handling
      unit: pkg.unit,
      pricePerUnitMinor: pkg.pricePerUnitMinor, // will be managed as AED in UI local state?
      durationMinutes: pkg.durationMinutes,
      minQuantity: pkg.minQuantity,
      maxQuantity: pkg.maxQuantity,
      stepQuantity: pkg.stepQuantity,
      isActive: pkg.isActive,
  } : {
      name: '',
      slug: '',
      description: '',
      unit: PackageUnit.HOUR,
      pricePerUnitMinor: 0,
      durationMinutes: 60,
      minQuantity: 1,
      maxQuantity: 10,
      stepQuantity: 1,
      isActive: true,
  };

  const form = useForm<PackageFormData>({
    resolver: zodResolver(PackageSchema),
    defaultValues
  });

  const unit = form.watch('unit');

  // Enforce Fixed Minutes Rules on UI change
  useEffect(() => {
     if (unit === PackageUnit.FIXED_MINUTES) {
        form.setValue('minQuantity', 1);
        form.setValue('maxQuantity', 1);
        form.setValue('stepQuantity', 1);
     }
  }, [unit, form]);

  const onSubmit = async (data: PackageFormData) => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'create') {
        await createPackage(data);
      } else {
        await updatePackage(pkg.id, data);
      }
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error saving package');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if(!confirm("Deactivate this package?")) return;
    setLoading(true);
    try {
      await deactivatePackage(pkg.id);
      setOpen(false);
      router.refresh();
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // Internal state for AED price input to avoid raw fils editing
  const [priceAed, setPriceAed] = useState<string>(pkg ? (pkg.pricePerUnitMinor / 100).toFixed(2) : '0.00');

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const val = e.target.value;
     setPriceAed(val);
     const minor = Math.round(parseFloat(val || '0') * 100);
     form.setValue('pricePerUnitMinor', minor);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? <Button variant="glass" className="gap-2"><Plus className="w-4 h-4" /> Add Package</Button> : <Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>}
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl sm:max-w-2xl h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{mode === 'create' ? 'New Package' : `Edit ${pkg.name}`}</DialogTitle></DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             {/* General Info */}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Name</label>
                    <Input {...form.register('name')} className="bg-white/5" />
                    {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Slug</label>
                    <Input {...form.register('slug')} className="bg-white/5" />
                    {form.formState.errors.slug && <p className="text-red-400 text-xs">{form.formState.errors.slug.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea {...form.register('description')} className="bg-white/5" />
            </div>

            {/* Config */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                 <div className="space-y-2">
                     <label className="text-xs text-muted-foreground">Unit Type</label>
                     <Select 
                        onValueChange={(v) => form.setValue('unit', v as any)} 
                        defaultValue={form.getValues('unit')}
                     >
                         <SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger>
                         <SelectContent>
                             <SelectItem value="HOUR">Hour</SelectItem>
                             <SelectItem value="DAY">Day</SelectItem>
                             <SelectItem value="FIXED_MINUTES">Fixed Minutes</SelectItem>
                         </SelectContent>
                     </Select>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Price (AED)</label>
                    <Input 
                       type="number" step="0.01" min="0" 
                       value={priceAed} 
                       onChange={handlePriceChange} 
                       className="bg-white/5"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Duration (Mins)</label>
                    <Input 
                        type="number" 
                        {...form.register('durationMinutes', { valueAsNumber: true })} 
                        className="bg-white/5" 
                        disabled={unit !== 'FIXED_MINUTES'} 
                    />
                 </div>
            </div>

            {/* Constraints */}
            <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Min Qty</label>
                    <Input 
                        type="number" 
                        {...form.register('minQuantity', { valueAsNumber: true })} 
                        className="bg-white/5"
                        disabled={unit === 'FIXED_MINUTES'}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Max Qty</label>
                    <Input 
                        type="number" 
                        {...form.register('maxQuantity', { valueAsNumber: true })} 
                        className="bg-white/5"
                        disabled={unit === 'FIXED_MINUTES'}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Step Qty</label>
                    <Input 
                        type="number" 
                        {...form.register('stepQuantity', { valueAsNumber: true })} 
                        className="bg-white/5"
                        disabled={unit === 'FIXED_MINUTES'}
                    />
                 </div>
            </div>

            <div className="pt-2">
                 <label className="flex items-center gap-2 text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                    <input type="checkbox" {...form.register('isActive')} className="rounded bg-black/50 border-white/20" />
                    Is Active?
                 </label>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <div className="flex justify-between pt-4">
                 {mode === 'edit' && <Button type="button" variant="destructive" size="sm" onClick={handleDeactivate}>Deactivate</Button>}
                 <div className="flex gap-2 ml-auto">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="glass" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                    </Button>
                 </div>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
