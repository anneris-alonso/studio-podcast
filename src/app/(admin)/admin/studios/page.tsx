import { requireAdmin } from '@/lib/auth-guards';
import prisma from '@/lib/db';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Pencil, Archive } from 'lucide-react';
import StudioForm from './_components/studio-form'; // Client component for Create/Edit
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function StudiosPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  await requireAdmin();
  
  const q = searchParams.q || '';
  const status = searchParams.status || 'all';

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (status === 'active') where.isActive = true;
  if (status === 'inactive') where.isActive = false;

  const studios = await prisma.studioRoom.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Studio Management</h1>
          <p className="text-muted-foreground text-sm">Manage physical spaces and room details.</p>
        </div>
        <StudioForm />
      </div>

      {/* Filter Bar */}
      <GlassCard className="p-4 flex gap-4 bg-white/5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <form>
            <input 
              name="q" 
              defaultValue={q} 
              placeholder="Search studios..." 
              className="w-full bg-black/20 border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
          </form>
        </div>
        <div className="flex gap-2">
            <LinkButton href="/admin/studios?status=all" active={status === 'all'}>All</LinkButton>
            <LinkButton href="/admin/studios?status=active" active={status === 'active'}>Active</LinkButton>
            <LinkButton href="/admin/studios?status=inactive" active={status === 'inactive'}>Inactive</LinkButton>
        </div>
      </GlassCard>

      {/* Studios List */}
      <div className="space-y-4">
        {studios.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No studios found.</div>
        ) : (
          studios.map(studio => (
            <GlassCard key={studio.id} className="p-0 overflow-hidden flex flex-col md:flex-row border-white/5 group bg-black/20">
              <div className="w-full md:w-48 h-32 md:h-auto bg-white/5 relative">
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 text-xs">
                    {studio.coverImageUrl ? <img src={studio.coverImageUrl} className="w-full h-full object-cover" /> : 'No Image'}
                  </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{studio.name}</h3>
                      <Badge variant={studio.isActive ? "success" : "secondary"}>
                        {studio.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                        {studio.slug}
                      </span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <StudioForm studio={studio} mode="edit" />
                      {studio.isActive && (
                        <form action={async () => {
                          'use server';
                          // We need to import the action here or use a client component wrapper for the button
                          // Given Server Actions can be passed, usually best to use a client wrapper for confirmation
                          // For now, StudioForm handles edits. Deactivate can be part of Edit or separate.
                          // We will let StudioForm handle it.
                        }}>
                             {/* Deactivation is handled inside Edit Form usually */}
                        </form>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{studio.description}</p>
                  <div className="flex gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-white/20" />
                      Capacity: {studio.capacity}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-white/20" />
                      Equipment: {studio.equipmentSummary.slice(0, 30)}...
                    </span>
                  </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}

function LinkButton({ href, active, children }: any) {
    return (
        <a 
          href={href} 
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              active ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10 text-muted-foreground'
          }`}
        >
            {children}
        </a>
    )
}
