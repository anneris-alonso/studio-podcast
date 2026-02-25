import { requireAdmin } from '@/lib/auth-guards';
import prisma from '@/lib/db';
import { GlassCard } from '@/components/ui/glass-card';
import { formatDubaiDate } from '@/lib/format';
import { Activity, Search, Eye } from 'lucide-react';
import { AuditRowActions } from '@/components/admin/AuditRowActions';
import { AuditSearch } from '@/components/admin/AuditSearch';

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
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground text-sm">System activity and security trail.</p>
        </div>
      </div>

       <GlassCard className="p-4 flex gap-4 bg-white border-slate-200">
          <AuditSearch defaultValue={q} />
       </GlassCard>

      <GlassCard className="p-0 overflow-hidden border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 text-muted-foreground border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Time (Dubai)</th>
                <th className="px-6 py-4 font-semibold">Actor</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Entity</th>
                <th className="px-6 py-4 font-semibold text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-base">
                    No logs found matching your search.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-mono text-muted-foreground">
                      {formatDubaiDate(log.createdAt, 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm font-medium text-slate-700">{log.actorEmail}</span>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className="font-mono text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-full border border-primary/10">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                         <span className="text-xs font-semibold text-slate-800">{log.entity}</span>
                         {log.entityId && <span className="text-[10px] text-muted-foreground/60 ml-2 font-mono">#{log.entityId.substring(0,8)}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <AuditRowActions log={JSON.parse(JSON.stringify(log))} />
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
