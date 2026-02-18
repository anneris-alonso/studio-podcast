import { requireUser } from "@/lib/auth-guards";
import { getBookingDetailForUser } from "@/server/data-access";
import { formatAED, formatDubaiDate } from "@/lib/format";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Mail,
  Video,
  FileBox
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";

export default async function BookingDetailPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const user = await requireUser();
  const booking = await getBookingDetailForUser(user.id, params.bookingId);

  if (!booking) {
    notFound();
  }

  const packageItem = booking.lineItems.find(li => !li.serviceId);
  const addOns = booking.lineItems.filter(li => li.serviceId);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <Link 
        href="/account/bookings" 
        className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors gap-2 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Bookings
      </Link>

      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-4">
          <header>
            <h1 className="text-4xl font-bold tracking-tight">{booking.room.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-white/70">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                {formatDubaiDate(booking.startTime, "PPPP")}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                {formatDubaiDate(booking.startTime, "p")} - {formatDubaiDate(booking.endTime, "p")}
              </span>
            </div>
          </header>

          <div className="flex items-center gap-4">
            <StatusBadge status={booking.status} />
            <div className="flex items-center gap-2 text-sm text-white/50">
            {booking.calendarInviteSentAt ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Calendar invite sent</span>
                <Link 
                  href={`/api/bookings/${booking.id}/calendar`}
                  className="ml-4 flex items-center gap-1.5 text-[10px] font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider"
                  aria-label="Download calendar invite (.ics)"
                >
                  <Download className="w-3 h-3" />
                  Download .ICS
                </Link>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-white/20" />
                <span>Invite pending</span>
              </>
            )}
            </div>
          </div>
        </div>

        <GlassCard className="w-full md:w-auto min-w-[240px] border-l-4 border-amber-500">
          <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Grand Total</p>
          <p className="text-4xl font-black mt-1">{formatAED(booking.totalPriceMinorSnapshot)}</p>
          {booking.usedCreditMinutes > 0 && (
            <p className="text-[10px] text-emerald-400 mt-2 font-bold uppercase">
              Paid with {booking.usedCreditMinutes} minutes credit
            </p>
          )}
        </GlassCard>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Package & Add-ons breakdown */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileBox className="w-4 h-4 text-amber-500" />
              </div>
              Breakdown
            </h2>
            <div className="space-y-1 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              {/* Package Line */}
              {packageItem && (
                <div className="p-5 flex justify-between items-center bg-white/5 border-b border-white/5">
                  <div>
                    <p className="font-bold text-lg">{packageItem.nameSnapshot}</p>
                    <p className="text-xs text-white/40">Base Package Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatAED(packageItem.totalPriceMinorSnapshot)}</p>
                    <p className="text-[10px] text-white/30 truncate">{packageItem.quantity} unit @ {formatAED(packageItem.unitPriceMinorSnapshot)}</p>
                  </div>
                </div>
              )}
              
              {/* Add-ons */}
              {addOns.map((item) => (
                <div key={item.id} className="p-5 flex justify-between items-center border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-medium text-white/90">{item.nameSnapshot}</p>
                    <p className="text-xs text-white/40">Additional Service</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatAED(item.totalPriceMinorSnapshot)}</p>
                    <p className="text-[10px] text-white/30 truncate">{item.quantity} × {formatAED(item.unitPriceMinorSnapshot)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Secure Assets (Files) */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Video className="w-4 h-4 text-blue-500" />
              </div>
              Session Files
            </h2>
            {booking.assets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {booking.assets.map((asset) => (
                  <div key={asset.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <Badge variant="outline" className="text-[8px] uppercase">{asset.kind}</Badge>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate max-w-[150px]">{asset.filename}</p>
                        <p className="text-[10px] text-white/40">{(asset.sizeBytes / 1024 / 1024).toFixed(1)} MB • {asset.kind}</p>
                      </div>
                    </div>
                    <a 
                      href={`/api/assets/${asset.id}/download`}
                      className="p-2 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors"
                      download
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/3">
                <Video className="w-8 h-8 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 text-sm">No files uploaded for this session yet.</p>
                <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">Files will appear here after post-production</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-10">
          {/* Invoice Summary */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-emerald-500" />
              </div>
              Payment
            </h2>
              {booking.invoice ? (
                <GlassCard className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40">Invoice #</span>
                    <span className="font-mono text-white/80">{booking.invoice.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40">Paid at</span>
                    <span className="text-white/80">{booking.invoice.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-tighter">Amount Paid</p>
                      <p className="text-xl font-bold">{formatAED(Number(booking.invoice.amount) * 100)}</p>
                    </div>
                    <Link 
                      href="/account/invoices"
                      className="text-[10px] font-bold text-amber-500 hover:underline"
                    >
                      VIEW HISTORY
                    </Link>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="w-6 h-6 text-white/10 mb-2" />
                  <p className="text-xs text-white/40 italic">No invoice generated yet.</p>
                  {booking.status === "CONFIRMED" && (
                    <Link 
                      href={`/pay/${booking.id}`} 
                      className="mt-4 text-xs font-bold text-amber-500 hover:underline"
                    >
                      COMPLETE PAYMENT
                    </Link>
                  )}
                </GlassCard>
              )}
          </section>

          {/* Support CTA */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-purple-500" />
              </div>
              Support
            </h2>
            <GlassCard className="text-center p-8">
              <p className="text-sm text-white/60 mb-6">Need help with this booking or having technical issues?</p>
              <a 
                href="mailto:support@studiosuite.ae" 
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
            </GlassCard>
          </section>
        </aside>
      </div>
    </div>
  );
}
