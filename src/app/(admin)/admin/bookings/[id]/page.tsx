import { requireAdmin } from '@/lib/auth-guards';
import prisma from '@/lib/db';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatAED, formatDubaiDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Mail, 
  Clock, 
  FileText,
  Upload,
  Download,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminUploadComponent } from '@/components/admin/AdminUploadComponent';
import { resendInvite } from '../_actions';
import { BookingActions } from '@/components/admin/BookingActions';

export const dynamic = 'force-dynamic';

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      room: true,
      lineItems: true,
      assets: true
    }
  });

  if (!booking) notFound();

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Link href="/admin/bookings">
           <Button variant="ghost" size="icon" className="rounded-full">
             <ArrowLeft className="w-4 h-4" />
           </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Booking #{booking.id.substring(0, 8)}
            <StatusBadge status={booking.status} />
            {booking.paidAt && <Badge variant="outline" className="border-emerald-500 text-emerald-500">PAID</Badge>}
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
             <Calendar className="w-3 h-3" />
             {formatDubaiDate(booking.startTime, 'PPP')}
             <span className="w-1 h-1 rounded-full bg-white/20" />
             <Clock className="w-3 h-3" />
             {formatDubaiDate(booking.startTime, 'HH:mm')} - {formatDubaiDate(booking.endTime, 'HH:mm')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Line Items */}
        <div className="lg:col-span-2 space-y-6">
           <GlassCard className="p-6 space-y-6 bg-white/5 border-white/10">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                 <FileText className="w-4 h-4 text-primary" />
                 Invoice Details
              </h3>
              
              <div className="space-y-4">
                {/* Line Items */}
                <div className="border rounded-lg border-white/10 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-muted-foreground text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Item</th>
                                <th className="px-4 py-3 text-right">Qty</th>
                                <th className="px-4 py-3 text-right">Unit Price</th>
                                <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {booking.lineItems.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3">{item.nameSnapshot}</td>
                                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right">{formatAED(item.unitPriceMinorSnapshot)}</td>
                                    <td className="px-4 py-3 text-right font-medium">{formatAED(item.totalPriceMinorSnapshot)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-white/5 font-bold">
                            <tr>
                                <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                                <td className="px-4 py-3 text-right text-primary">{formatAED(booking.totalPriceMinorSnapshot)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Used Credits */}
                {booking.usedCreditMinutes > 0 && (
                     <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 p-3 rounded-md">
                        <Clock className="w-4 h-4" />
                        <span>Credits Used: <strong>{booking.usedCreditMinutes} mins</strong></span>
                     </div>
                )}
              </div>
           </GlassCard>

           {/* Assets Section */}
           <GlassCard className="p-6 space-y-4 bg-white/5 border-white/10">
              <div className="flex items-center justify-between">
                 <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Session Assets
                 </h3>
                 <AdminUploadComponent bookingId={booking.id} />
              </div>
              
              {booking.assets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-white/10 rounded-lg">
                      No assets uploaded for this session yet.
                  </div>
              ) : (
                  <ul className="space-y-2">
                      {booking.assets.map(asset => (
                          <li key={asset.id} className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${asset.kind === 'RAW' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                      {asset.kind === 'RAW' ? 'RAW' : 'FIN'}
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-sm font-medium">{asset.filename}</span>
                                      <span className="text-xs text-muted-foreground">{formatBytes(asset.sizeBytes)} • {formatDubaiDate(asset.createdAt, 'MMM dd')}</span>
                                  </div>
                              </div>
                              <a href={`/api/assets/${asset.storageKey}`} download={asset.filename} target="_blank" rel="noopener noreferrer" title={`Download ${asset.filename}`}>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary">
                                      <Download className="w-4 h-4" />
                                  </Button>
                              </a>
                          </li>
                      ))}
                  </ul>
              )}
           </GlassCard>
        </div>

        {/* Right Column: Customer & Actions */}
        <div className="space-y-6">
            {/* Customer Card */}
            <GlassCard className="p-6 space-y-4 bg-white/5 border-white/10">
                 <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer
                 </h3>
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {booking.user.name[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium">{booking.user.name}</p>
                        <p className="text-xs text-muted-foreground">{booking.user.email}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2 text-xs">
                     <Link href={`mailto:${booking.user.email}`} className="col-span-2">
                         <Button variant="outline" size="sm" className="w-full">
                             <Mail className="w-3 h-3 mr-2" />
                             Send Email
                         </Button>
                     </Link>
                 </div>
            </GlassCard>

             {/* Actions Card */}
            <GlassCard className="p-6 space-y-4 bg-white/5 border-white/10">
                 <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Actions
                 </h3>
                 
                 <div className="space-y-2">
                    <BookingActions bookingId={booking.id} status={booking.status} />
                 </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
