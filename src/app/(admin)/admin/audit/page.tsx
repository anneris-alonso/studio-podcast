import { requireAdmin } from '@/lib/auth-guards';
import prisma from '@/lib/db';
import { GlassCard } from '@/components/ui/glass-card';
import { formatDubaiDate } from '@/lib/format';
import { Activity, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  const where: any = {};
  if (q) {
     where.OR = [
       { action: { contains: q, mode: 'insensitive' } },
       { actorEmail: { contains: q, mode: 'insensitive' } },
       { entity: { contains: q, mode: 'insensitive' } }
     ];
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground text-sm">System activity and security trail.</p>
        </div>
      </div>

       <GlassCard className="p-4 flex gap-4 bg-white/5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <form>
            <input 
              name="q" 
              defaultValue={q} 
              placeholder="Search logs..." 
              className="w-full bg-black/20 border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
          </form>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden border-white/5 bg-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Time (Dubai)</th>
                <th className="px-6 py-4 font-medium">Actor</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Entity</th>
                <th className="px-6 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDubaiDate(log.createdAt, 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-xs">{log.actorEmail}</span>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono">{log.entity}</span>
                        {log.entityId && <span className="text-[10px] text-muted-foreground ml-2">#{log.entityId.substring(0,8)}</span>}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-xs text-muted-foreground">
                        {JSON.stringify(log.metadata)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
