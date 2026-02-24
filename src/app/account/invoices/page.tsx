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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing & Invoices</h1>
        <p className="mt-1 text-slate-500">Manage your payment history and download invoices.</p>
      </header>

      <div className="space-y-4">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-xl border border-slate-200 bg-white/50 hover:bg-slate-50 hover:border-accent-violet/30 transition-all shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-accent-violet/10 flex items-center justify-center border border-accent-violet/20">
                    <Receipt className="w-6 h-6 text-accent-violet" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      Invoice #{invoice.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-slate-400">
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
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Amount</p>
                    <p className="text-xl font-bold text-slate-900">{formatAED(Number(invoice.amount) * 100)}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <StatusBadge status={invoice.status} />
                    {invoice.bookingId && (
                      <Link 
                        href={`/account/bookings/${invoice.bookingId}`}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-accent-pink/5 text-slate-400 hover:text-accent-pink transition-colors border border-slate-100"
                        title="View related booking"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4 text-slate-300">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No invoices found</h3>
            <p className="text-slate-500 text-sm mt-1">Your payment history will appear here once you make a booking.</p>
            <Link href="/book" className="mt-6 inline-block text-accent-pink font-semibold hover:text-accent-violet transition-colors">
              Start by booking a session
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
