import { requireAdmin } from '@/lib/auth-guards';
import prisma from '@/lib/db';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import PackageForm from './_components/package-form';
import { Search } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PackagesPage({
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

  const rawPackages = await prisma.package.findMany({
    where,
    include: { studioRoom: true },
    orderBy: { name: 'asc' },
  });

  const packages = rawPackages.map(pkg => ({
    ...pkg,
    pricePerUnitMinor: pkg.pricePerUnitMinor,
    studioRoom: pkg.studioRoom ? {
        ...pkg.studioRoom,
        hourlyRate: pkg.studioRoom.hourlyRate ? pkg.studioRoom.hourlyRate.toNumber() : null // Handle hourlyRate if it's a Decimal
    } : null
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Package Management</h1>
          <p className="text-muted-foreground text-sm">Configure pricing, units, and booking rules.</p>
        </div>
        
        {/* Pass studios for selection if needed, or fetch in form */}
        <PackageForm />
      </div>

       {/* Filter Bar */}
      <GlassCard className="p-4 flex gap-4 bg-white/5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <form>
             <input 
               name="q" 
               defaultValue={q} 
               placeholder="Search packages..." 
               className="w-full bg-black/20 border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
             />
          </form>
        </div>
        <div className="flex gap-2">
            <Link href="/admin/packages?status=all" className={`px-4 py-2 rounded-md text-sm font-medium ${status === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'}`}>All</Link>
            <Link href="/admin/packages?status=active" className={`px-4 py-2 rounded-md text-sm font-medium ${status === 'active' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'}`}>Active</Link>
            <Link href="/admin/packages?status=inactive" className={`px-4 py-2 rounded-md text-sm font-medium ${status === 'inactive' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'}`}>Inactive</Link>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <GlassCard key={pkg.id} className="flex flex-col border-white/5 bg-black/20 group relative overflow-hidden">
             
             {/* Studio Badge */}
             {pkg.studioRoom && (
                <div className="absolute top-0 right-0 px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold uppercase rounded-bl-lg">
                   {pkg.studioRoom.name}
                </div>
             )}

             <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="font-bold text-lg line-clamp-1" title={pkg.name}>{pkg.name}</h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <Badge variant={pkg.isActive ? "success" : "secondary"} className="text-[10px]">
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                      {pkg.slug}
                    </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 h-10">{pkg.description}</p>

                <div className="space-y-2 text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                   <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-bold text-primary">
                         AED {(pkg.pricePerUnitMinor / 100).toFixed(2)}
                      </span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit</span>
                      <span className="capitalize">{pkg.unit.replace('_', ' ').toLowerCase()}</span>
                   </div>
                   {pkg.unit === 'FIXED_MINUTES' && (
                       <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration</span>
                          <span>{pkg.durationMinutes} mins</span>
                       </div>
                   )}
                   <div className="flex justify-between">
                      <span className="text-muted-foreground">Qty Range</span>
                      <span>{pkg.minQuantity} - {pkg.maxQuantity} (Step {pkg.stepQuantity})</span>
                   </div>
                </div>
             </div>

             <div className="p-4 border-t border-white/5 flex justify-end gap-2 bg-white/5">
                <PackageForm pkg={pkg} mode="edit" />
             </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
