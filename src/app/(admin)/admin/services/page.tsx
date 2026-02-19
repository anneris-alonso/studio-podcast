import { requireAdmin } from '@/lib/auth-guards';
import prisma from '@/lib/db';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import ServiceForm from './_components/service-form';
import { Search, Settings } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  
  const { q: searchQ, status: searchStatus } = await searchParams;
  const q = searchQ || '';
  const status = searchStatus || 'all';

  const where: any = {};
  if (q) {
    where.name = { contains: q, mode: 'insensitive' };
  }
  if (status === 'active') where.isActive = true;
  if (status === 'inactive') where.isActive = false;

  const rawServices = await prisma.service.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  const services = rawServices.map(service => ({
    ...service,
    price: service.price.toNumber(),
    priceMinor: service.priceMinor, // Int, no conversion needed usually unless BigInt, but usually Int in Prisma is number in JS
    // If priceMinor is Decimal in schema (unlikely for "Minor" but check), convert it.
    // Assuming price is Decimal.
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services & Add-ons</h1>
          <p className="text-muted-foreground text-sm">Manage extra services like Editing, Equipment, etc.</p>
        </div>
        <ServiceForm />
      </div>

       {/* Filter Bar */}
      <GlassCard className="p-4 flex gap-4 bg-white/5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <form>
             <input 
               name="q" 
               defaultValue={q} 
               placeholder="Search services..." 
               className="w-full bg-black/20 border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
             />
          </form>
        </div>
        <div className="flex gap-2">
            <Link href="/admin/services?status=all" className={`px-4 py-2 rounded-md text-sm font-medium ${status === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'}`}>All</Link>
            <Link href="/admin/services?status=active" className={`px-4 py-2 rounded-md text-sm font-medium ${status === 'active' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'}`}>Active</Link>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(svc => (
          <GlassCard key={svc.id} className="flex flex-col border-white/5 bg-black/20 group hover:border-primary/30 transition-all">
             <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-2">
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-widest mb-1">{svc.category}</span>
                      <h3 className="font-bold text-lg line-clamp-1">{svc.name}</h3>
                   </div>
                   <Settings className="w-5 h-5 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                    <Badge variant={svc.isActive ? "success" : "secondary"} className="text-[10px]">
                      {svc.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                     <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                      {svc.slug}
                    </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">{svc.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-white/5 p-3 rounded-lg">
                   <div>
                       <p className="opacity-50 uppercase text-[9px]">Price</p>
                       <p className="font-bold text-white">AED {(svc.priceMinor / 100).toFixed(2)}</p>
                   </div>
                   <div>
                       <p className="opacity-50 uppercase text-[9px]">Unit</p>
                       <p className="font-bold text-white capitalize">{svc.unit.replace('_', ' ').toLowerCase()}</p>
                   </div>
                   <div className="col-span-2 border-t border-white/10 pt-2 mt-1">
                        <p className="opacity-50 uppercase text-[9px]">Quantity Logic</p>
                        <p className="font-mono text-white">Min: {svc.minQuantity} | Max: {svc.maxQuantity} | Step: {svc.stepQuantity}</p>
                   </div>
                </div>
             </div>

             <div className="p-4 border-t border-white/5 flex justify-end gap-2 bg-white/5">
                <ServiceForm service={svc} mode="edit" />
             </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
