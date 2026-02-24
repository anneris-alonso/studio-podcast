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
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const user = await requireUser();
  const booking = await getBookingDetailForUser(user.id, bookingId);

  if (!booking) {
    notFound();
  }

  const packageItem = booking.lineItems.find(li => !li.serviceId);
  const addOns = booking.lineItems.filter(li => li.serviceId);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <Link 
        href="/account/bookings" 
        className="inline-flex items-center text-sm text-slate-400 hover:text-accent-pink transition-colors gap-2 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Bookings
      </Link>

      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-4">
          <header>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">{booking.room.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-5 h-5 text-accent-pink" />
                {formatDubaiDate(booking.startTime, "PPPP")}
              </span>
              <span className="flex items-center gap-2 text-slate-500">
                <Clock className="w-5 h-5 text-accent-pink" />
                {formatDubaiDate(booking.startTime, "p")} - {formatDubaiDate(booking.endTime, "p")}
              </span>
            </div>
          </header>

          <div className="flex items-center gap-4">
            <StatusBadge status={booking.status} />
            <div className="flex items-center gap-2 text-sm">
            {booking.calendarInviteSentAt ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-accent-violet" />
                <span className="text-slate-400">Calendar invite sent</span>
                <Link 
                  href={`/api/bookings/${booking.id}/calendar`}
                  className="ml-4 flex items-center gap-1.5 text-[10px] font-bold text-accent-pink hover:text-accent-violet transition-colors uppercase tracking-wider"
                  aria-label="Download calendar invite (.ics)"
                >
                  <Download className="w-3 h-3" />
                  Download .ICS
                </Link>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-slate-300" />
                <span className="text-slate-500">Invite pending</span>
              </>
            )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto min-w-[240px] rounded-xl border-y border-r border-slate-200 border-l-4 border-l-accent-pink bg-white/50 hover:bg-slate-50 transition-all shadow-sm relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-pink/[0.02] to-transparent pointer-events-none" />
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest relative z-10">Grand Total</p>
          <p className="text-4xl font-black mt-1 bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent relative z-10">{formatAED(booking.totalPriceMinorSnapshot)}</p>
          {booking.usedCreditMinutes > 0 && (
            <p className="text-[10px] text-accent-violet mt-2 font-bold uppercase relative z-10">
              Paid with {booking.usedCreditMinutes} minutes credit
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Package & Add-ons breakdown */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-accent-pink/5 flex items-center justify-center">
                <FileBox className="w-4 h-4 text-accent-pink" />
              </div>
              Breakdown
            </h2>
            <div className="space-y-1 rounded-2xl overflow-hidden border border-slate-200 bg-white/50 shadow-sm">
                  {/* Package Line */}
                  {packageItem && (
                    <div className="p-5 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
                      <div>
                        <p className="font-bold text-lg text-slate-900">{packageItem.nameSnapshot}</p>
                        <p className="text-xs text-slate-500">Base Package Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatAED(packageItem.totalPriceMinorSnapshot)}</p>
                        <p className="text-[10px] text-slate-400 truncate">{packageItem.quantity} unit @ {formatAED(packageItem.unitPriceMinorSnapshot)}</p>
                      </div>
                    </div>
                  )}
              
              {/* Add-ons */}
                {addOns.map((item) => (
                  <div key={item.id} className="p-5 flex justify-between items-center border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">{item.nameSnapshot}</p>
                      <p className="text-xs text-slate-500">Additional Service</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">{formatAED(item.totalPriceMinorSnapshot)}</p>
                      <p className="text-[10px] text-slate-400 truncate">{item.quantity} × {formatAED(item.unitPriceMinorSnapshot)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Secure Assets (Files) */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                <Video className="w-4 h-4 text-accent-blue" />
              </div>
              Session Files
            </h2>
            {booking.assets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {booking.assets.map((asset) => (
                  <div key={asset.id} className="p-4 rounded-xl bg-white/50 border border-slate-200 flex items-center justify-between group hover:border-accent-blue/30 hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Badge variant="outline" className="text-[8px] uppercase border-slate-200 text-slate-500">{asset.kind}</Badge>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate max-w-[150px] text-slate-900">{asset.filename}</p>
                        <p className="text-[10px] text-slate-500">{(asset.sizeBytes / 1024 / 1024).toFixed(1)} MB • {asset.kind}</p>
                      </div>
                    </div>
                    <a 
                      href={`/api/assets/${asset.id}/download`}
                      className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-accent-blue/10 hover:text-accent-blue transition-colors"
                      download
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <Video className="w-8 h-8 mx-auto mb-4 text-slate-300" />
                <p className="text-sm text-slate-500">No files uploaded for this session yet.</p>
                <p className="text-[10px] mt-1 text-slate-400 uppercase tracking-widest">Files will appear here after post-production</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-10">
          {/* Invoice Summary */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-lg bg-accent-violet/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-accent-violet" />
              </div>
              Payment
            </h2>
              {booking.invoice ? (
                <div className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-50 transition-all shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Invoice #</span>
                    <span className="font-mono text-slate-900 font-bold">{booking.invoice.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Paid at</span>
                    <span className="text-slate-900">{booking.invoice.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase tracking-tighter text-slate-400">Amount Paid</p>
                      <p className="text-xl font-bold text-slate-900">{formatAED(Number(booking.invoice.amount) * 100)}</p>
                    </div>
                    <Link 
                      href="/account/invoices"
                      className="text-[10px] font-bold text-accent-pink hover:text-accent-violet transition-colors"
                    >
                      VIEW HISTORY
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-50 transition-all shadow-sm p-6 flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="w-6 h-6 mb-2 text-slate-300" />
                  <p className="text-xs italic text-slate-500">No invoice generated yet.</p>
                  {booking.status === "CONFIRMED" && (
                    <Link 
                      href={`/pay/${booking.id}`} 
                      className="mt-4 text-sm font-bold text-accent-pink hover:text-white transition-colors"
                    >
                      COMPLETE PAYMENT
                    </Link>
                  )}
                </div>
              )}
          </section>

          {/* Support CTA */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-900">
                <div className="w-8 h-8 rounded-lg bg-accent-violet/5 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-accent-violet" />
                </div>
                Support
              </h2>
              <div className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-50 transition-all shadow-sm p-8 text-center">
                <p className="text-sm mb-6 text-slate-500">Need help with this booking or having technical issues?</p>
                <a 
                  href="mailto:support@studiosuite.ae" 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold transition-colors text-slate-600 hover:text-slate-900"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </a>
              </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
