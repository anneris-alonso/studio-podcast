import { requireUser } from "@/lib/auth-guards";
import { listUserInvoices } from "@/server/data-access";
import { formatAED } from "@/lib/format";
import Link from "next/link";
import { FileText, ChevronRight, ExternalLink, Receipt } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function InvoicesPage() {
  const user = await requireUser();
  const invoices = await listUserInvoices(user.id);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
        <p className="text-white/60 mt-1">Manage your payment history and download invoices.</p>
      </header>

      <div className="space-y-4">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <GlassCard key={invoice.id} className="hover:bg-white/5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Receipt className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      Invoice #{invoice.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-white/50">
                      {invoice.createdAt.toLocaleDateString('en-AE', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-10">
                  <div className="text-right">
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Amount</p>
                    <p className="text-xl font-bold">{formatAED(Number(invoice.amount) * 100)}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <StatusBadge status={invoice.status} />
                    {invoice.bookingId && (
                      <Link 
                        href={`/account/bookings/${invoice.bookingId}`}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        title="View related booking"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4 text-white/20">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium">No invoices found</h3>
            <p className="text-white/40 text-sm mt-1">Your payment history will appear here once you make a booking.</p>
            <Link href="/book" className="mt-6 inline-block text-amber-500 font-semibold hover:underline">
              Start by booking a session
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
