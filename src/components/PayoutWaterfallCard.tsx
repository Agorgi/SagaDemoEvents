import { type LaunchPayoutSummary } from "@/src/data/launches";
import { formatCurrency } from "@/src/lib/utils";

export function PayoutWaterfallCard({
  payouts
}: {
  payouts: LaunchPayoutSummary;
}) {
  const totalRevenue = payouts.ticketSales + payouts.merchSales;
  const totalCosts = payouts.costs.reduce((sum, item) => sum + item.amount, 0);
  const contributorTotal = payouts.contributorPayouts.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <section className="surface-card p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Payout waterfall</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Metric label="Total sales" value={formatCurrency(totalRevenue)} />
        <Metric label="Costs" value={formatCurrency(totalCosts)} />
        <Metric label="Team payouts" value={formatCurrency(contributorTotal)} />
        <Metric label="Host net" value={formatCurrency(payouts.hostNet)} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
          <p className="text-sm font-semibold text-white">Revenue</p>
          <div className="mt-3 space-y-3 text-sm text-app-muted">
            <Row label="Ticket sales" value={formatCurrency(payouts.ticketSales)} />
            <Row label="Merch sales" value={formatCurrency(payouts.merchSales)} />
          </div>
        </div>
        <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
          <p className="text-sm font-semibold text-white">Costs</p>
          <div className="mt-3 space-y-3 text-sm text-app-muted">
            {payouts.costs.map((item) => (
              <Row key={item.label} label={item.label} value={formatCurrency(item.amount)} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
        <p className="text-sm font-semibold text-white">Contributor payouts</p>
        <div className="mt-3 space-y-3 text-sm text-app-muted">
          {payouts.contributorPayouts.map((item) => (
            <Row key={`${item.roleName}-${item.amount}`} label={item.roleName} value={formatCurrency(item.amount)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-app-muted">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

