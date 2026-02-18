'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServiceSchema, ServiceFormData } from '@/lib/validations/admin-catalog';
import { createService, updateService, deactivateService } from '../../_actions/service-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ServiceUnit } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ServiceForm({ service, mode = 'create' }: { service?: any; mode?: 'create' | 'edit' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const defaultValues = service ? {
      name: service.name,
      slug: service.slug,
      description: service.description,
      category: service.category,
      unit: service.unit,
      priceMinor: service.priceMinor,
      minQuantity: service.minQuantity,
      maxQuantity: service.maxQuantity,
      stepQuantity: service.stepQuantity,
      isActive: service.isActive,
  } : {
      name: '',
      slug: '',
      description: '',
      category: 'EXTRA',
      unit: ServiceUnit.PER_BOOKING,
      priceMinor: 0,
      minQuantity: 1,
      maxQuantity: 1,
      stepQuantity: 1,
      isActive: true,
  };

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceSchema),
    defaultValues
  });

  const [priceAed, setPriceAed] = useState<string>(service ? (service.priceMinor / 100).toFixed(2) : '0.00');

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const val = e.target.value;
     setPriceAed(val);
     const minor = Math.round(parseFloat(val || '0') * 100);
     form.setValue('priceMinor', minor);
  };

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'create') {
        await createService(data);
      } else {
        await updateService(service.id, data);
      }
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error saving service');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if(!confirm("Deactivate this service?")) return;
    setLoading(true);
    try {
      await deactivateService(service.id);
      setOpen(false);
      router.refresh();
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'create' ? <Button variant="glass" className="gap-2"><Plus className="w-4 h-4" /> Add Service</Button> : <Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>}
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-white/10 backdrop-blur-xl sm:max-w-xl">
        <DialogHeader><DialogTitle>{mode === 'create' ? 'New Service' : `Edit ${service.name}`}</DialogTitle></DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             {/* General */}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Name</label>
                    <Input {...form.register('name')} className="bg-white/5" />
                    {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Slug</label>
                    <Input {...form.register('slug')} className="bg-white/5" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea {...form.register('description')} className="bg-white/5 h-20" />
            </div>

            {/* Config */}
             <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                 <div className="space-y-2">
                     <label className="text-xs text-muted-foreground">Category</label>
                     <Select 
                        onValueChange={(v) => form.setValue('category', v as any)} 
                        defaultValue={form.getValues('category')}
                     >
                         <SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger>
                         <SelectContent>
                             <SelectItem value="RECORDING">Recording</SelectItem>
                             <SelectItem value="EDITING">Editing</SelectItem>
                             <SelectItem value="EXTRA">Extra</SelectItem>
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
                     <label className="text-xs text-muted-foreground">Billing Unit</label>
                     <Select 
                        onValueChange={(v) => form.setValue('unit', v as any)} 
                        defaultValue={form.getValues('unit')}
                     >
                         <SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger>
                         <SelectContent>
                             <SelectItem value="PER_BOOKING">Per Booking</SelectItem>
                             <SelectItem value="PER_HOUR">Per Hour</SelectItem>
                             <SelectItem value="PER_DAY">Per Day</SelectItem>
                             <SelectItem value="FIXED">Fixed</SelectItem>
                         </SelectContent>
                     </Select>
                 </div>
            </div>

            {/* Constraints */}
            <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Min</label>
                    <Input type="number" {...form.register('minQuantity', { valueAsNumber: true })} className="bg-white/5" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Max</label>
                    <Input type="number" {...form.register('maxQuantity', { valueAsNumber: true })} className="bg-white/5" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Step</label>
                    <Input type="number" {...form.register('stepQuantity', { valueAsNumber: true })} className="bg-white/5" />
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
