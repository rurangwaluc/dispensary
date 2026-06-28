import Link from 'next/link';
import { desc, ilike, or } from 'drizzle-orm';
import { Search } from 'lucide-react';
import { db } from '@dispensary/db/client';
import { expenses } from '@dispensary/db/schema';
import { createExpenseAction } from '@/lib/expenses/actions';

type ExpensesPageProps = {
  searchParams?: Promise<{
    q?: string;
    take?: string;
    error?: string;
    added?: string;
  }>;
};

const PAGE_SIZE = 10;

function money(value: string | number) {
  return `RWF ${Number(value).toLocaleString('en-US')}`;
}

function paymentName(value: string) {
  const names: Record<string, string> = {
    CASH: 'Cash',
    MOBILE_MONEY: 'Mobile money',
    BANK: 'Bank',
    CARD: 'Card',
  };

  return names[value] || value;
}

function isToday(value: Date) {
  const today = new Date();

  return (
    value.getFullYear() === today.getFullYear() &&
    value.getMonth() === today.getMonth() &&
    value.getDate() === today.getDate()
  );
}

function isThisMonth(value: Date) {
  const today = new Date();

  return value.getFullYear() === today.getFullYear() && value.getMonth() === today.getMonth();
}

function buildLoadMoreHref(q: string, nextTake: number) {
  const params = new URLSearchParams();

  if (q) {
    params.set('q', q);
  }

  params.set('take', String(nextTake));

  return `/expenses?${params.toString()}`;
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const params = await searchParams;
  const q = params?.q?.trim() || '';
  const take = Math.max(PAGE_SIZE, Number(params?.take || PAGE_SIZE));
  const error = params?.error || '';
  const added = params?.added === '1';

  const expenseList = await db
    .select()
    .from(expenses)
    .where(
      q
        ? or(
            ilike(expenses.name, `%${q}%`),
            ilike(expenses.category, `%${q}%`),
            ilike(expenses.notes, `%${q}%`),
          )
        : undefined,
    )
    .orderBy(desc(expenses.expenseDate));

  const visibleExpenses = expenseList.slice(0, take);
  const hasMore = expenseList.length > visibleExpenses.length;

  const todayExpenses = expenseList.filter((expense) => isToday(expense.expenseDate));
  const monthExpenses = expenseList.filter((expense) => isThisMonth(expense.expenseDate));

  const todayTotal = todayExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const allTotal = expenseList.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const summary = [
    { label: 'Today expenses', value: money(todayTotal), helper: 'Spent today' },
    { label: 'This month', value: money(monthTotal), helper: 'Spent this month' },
    { label: 'All expenses', value: money(allTotal), helper: 'Total shown here' },
    { label: 'Records', value: expenseList.length, helper: 'Expense entries' },
  ];

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
          Expenses
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
          Record money spent by the dispensary.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((item) => (
          <article
            key={item.label}
            className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p className="mt-3 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              {item.value}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              {item.helper}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <form
          action={createExpenseAction}
          className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Add expense</h3>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Save money that went out.
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Expense name
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="Example: Rent, transport, electricity"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Category
              </label>
              <input
                id="category"
                name="category"
                required
                defaultValue="Other"
                placeholder="Example: Rent"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-black text-slate-800 dark:text-slate-200">
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  inputMode="decimal"
                  required
                  placeholder="Example: 5000"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="expenseDate" className="text-sm font-black text-slate-800 dark:text-slate-200">
                  Date
                </label>
                <input
                  id="expenseDate"
                  name="expenseDate"
                  type="date"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-950"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="paymentMethod" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Payment method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-950"
              >
                <option value="CASH">Cash</option>
                <option value="MOBILE_MONEY">Mobile money</option>
                <option value="BANK">Bank</option>
                <option value="CARD">Card</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Optional"
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
              />
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
              {error}
            </div>
          ) : null}

          {added ? (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
              Expense saved.
            </div>
          ) : null}

          <button className="mt-5 h-11 w-full rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600">
            Save expense
          </button>
        </form>

        <div className="space-y-4">
          <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <form className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search expense name, category, or notes"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
                />
              </div>
              <button className="h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200">
                Search
              </button>
            </form>
          </div>

          {visibleExpenses.length === 0 ? (
            <section className="border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                No expenses found
              </h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                Add an expense or change your search.
              </p>
            </section>
          ) : (
            <>
              <div className="hidden overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Expense</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {visibleExpenses.map((expense) => (
                      <tr key={expense.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-950/70">
                        <td className="px-4 py-5 align-top">
                          <p className="font-black text-slate-900 dark:text-white">{expense.name}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {expense.notes || 'No notes'}
                          </p>
                        </td>

                        <td className="px-4 py-5 align-top font-black text-slate-900 dark:text-white">
                          {expense.category}
                        </td>

                        <td className="px-4 py-5 align-top font-black text-slate-900 dark:text-white">
                          {paymentName(expense.paymentMethod)}
                        </td>

                        <td className="px-4 py-5 align-top font-black text-slate-900 dark:text-white">
                          {expense.expenseDate.toLocaleDateString()}
                        </td>

                        <td className="px-4 py-5 text-right align-top font-black text-red-700 dark:text-red-300">
                          {money(expense.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {visibleExpenses.map((expense) => (
                  <article
                    key={expense.id}
                    className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-slate-950 dark:text-white">{expense.name}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {expense.category} · {paymentName(expense.paymentMethod)}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-black text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
                        {money(expense.amount)}
                      </span>
                    </div>

                    <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {expense.expenseDate.toLocaleDateString()}
                    </p>

                    {expense.notes ? (
                      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                        {expense.notes}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>

              <div className="flex flex-col items-center gap-2 border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Showing {visibleExpenses.length} of {expenseList.length}
                </p>

                {hasMore ? (
                  <Link
                    href={buildLoadMoreHref(q, take + PAGE_SIZE)}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-200"
                  >
                    Load more
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>
    </section>
  );
}
