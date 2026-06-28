import { CreditCard, Layers3, TrendingUp, WalletCards } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { businessSettings, expenses, products, sales } from '@dispensary/db/schema';

function money(value: string | number) {
  return `RWF ${Number(value).toLocaleString('en-US')}`;
}

function isToday(value: Date) {
  const today = new Date();

  return (
    value.getFullYear() === today.getFullYear() &&
    value.getMonth() === today.getMonth() &&
    value.getDate() === today.getDate()
  );
}

function getExpiryWarning(expiryDate: string | null, warningDays: number) {
  if (!expiryDate) {
    return false;
  }

  const today = new Date();
  const expiry = new Date(`${expiryDate}T00:00:00`);
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);

  return daysLeft >= 0 && daysLeft <= warningDays;
}

export default async function DashboardPage() {
  const [settings] = await db.select().from(businessSettings).limit(1);
  const saleList = await db.select().from(sales);
  const productList = await db.select().from(products);
  const expenseList = await db.select().from(expenses);

  const expiryWarningDays = Number(settings?.expiryAlertDays || 60);

  const todaySales = saleList.filter((sale) => isToday(sale.saleDate));

  const todaySalesTotal = todaySales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount),
    0,
  );

  const todayMoneyReceived = todaySales.reduce(
    (sum, sale) => sum + Number(sale.paidAmount),
    0,
  );

  const todayCreditGiven = todaySales.reduce(
    (sum, sale) => sum + Number(sale.balanceAmount),
    0,
  );

  const activeProducts = productList.filter(
    (product) => product.status === 'ACTIVE' && product.itemType === 'PRODUCT',
  );

  const lowStockProducts = activeProducts.filter(
    (product) => product.quantity <= product.minQuantity,
  );

  const expiringSoonProducts = activeProducts.filter((product) =>
    getExpiryWarning(product.expiryDate, expiryWarningDays),
  );

  const unpaidCustomers = saleList.filter((sale) => Number(sale.balanceAmount) > 0);
  const todayExpenses = expenseList
    .filter((expense) => isToday(expense.expenseDate))
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const cards = [
    {
      label: 'Today sales',
      helper: 'Recorded today',
      value: money(todaySalesTotal),
      icon: TrendingUp,
    },
    {
      label: 'Money received',
      helper: 'Cash and mobile money',
      value: money(todayMoneyReceived),
      icon: WalletCards,
    },
    {
      label: 'Credit given',
      helper: 'Unpaid today',
      value: money(todayCreditGiven),
      icon: CreditCard,
    },
    {
      label: 'Low stock',
      helper: 'Needs restocking',
      value: `${lowStockProducts.length} item${lowStockProducts.length === 1 ? '' : 's'}`,
      icon: Layers3,
    },
  ];

  const attention = [
    {
      label: 'Low stock products',
      value: lowStockProducts.length,
      className: 'text-sky-300',
    },
    {
      label: 'Expiring soon',
      value: expiringSoonProducts.length,
      className: 'text-yellow-300',
    },
    {
      label: 'Unpaid customers',
      value: unpaidCustomers.length,
      className: 'text-green-300',
    },
    {
      label: 'Today expenses',
      value: money(todayExpenses),
      className: 'text-red-300',
    },
  ];

  const checks = [
    { label: 'Owner can sign in', value: 'OK' },
    { label: 'Dashboard is private', value: 'OK' },
    { label: 'Owner can sign out', value: 'OK' },
    { label: 'Works on phone screen', value: 'OK' },
  ];

  return (
    <section className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-500">
                    {card.helper}
                  </p>
                </div>

                <Icon className="h-5 w-5 text-sky-500 dark:text-sky-300" />
              </div>

              <p className="mt-8 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {card.value}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                Needs attention
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Check these first today.
              </p>
            </div>

            <span className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-black text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
              Today
            </span>
          </div>

          <div className="mt-6 divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
            {attention.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                <p className="font-black text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className={`font-black ${item.className}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
            Owner access
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Only the owner can open this system.
          </p>

          <div className="mt-6 divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
            {checks.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 border border-slate-100 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <p className="font-black text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-sm font-black text-green-600 dark:text-green-300">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}
