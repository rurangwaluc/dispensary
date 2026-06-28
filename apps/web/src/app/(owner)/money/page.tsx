import { desc } from 'drizzle-orm';
import { db } from '@dispensary/db/client';
import { expenses, moneyAdditions, moneyTransfers } from '@dispensary/db/schema';
import { addMoneyAction, moveMoneyAction } from '@/lib/money/actions';
import { getMoneyBalances, paymentMethods, paymentName } from '@/lib/money/balance';

type MoneyPageProps = {
  searchParams?: Promise<{
    error?: string;
    moved?: string;
    added?: string;
  }>;
};

function money(value: string | number) {
  return `RWF ${Number(value).toLocaleString('en-US')}`;
}

export default async function MoneyPage({ searchParams }: MoneyPageProps) {
  const params = await searchParams;
  const error = params?.error || '';
  const moved = params?.moved === '1';
  const added = params?.added === '1';

  const balances = await getMoneyBalances();

  const transferList = await db
    .select()
    .from(moneyTransfers)
    .orderBy(desc(moneyTransfers.movedAt))
    .limit(10);

  const additionList = await db
    .select()
    .from(moneyAdditions)
    .orderBy(desc(moneyAdditions.addedAt))
    .limit(10);

  const expenseList = await db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.expenseDate))
    .limit(10);

  const totalMoney = balances.reduce((sum, item) => sum + item.balance, 0);
  const totalIn = balances.reduce((sum, item) => sum + item.moneyIn, 0);
  const totalOut = balances.reduce((sum, item) => sum + item.moneyOut, 0);
  const hasNegative = balances.some((item) => item.balance < 0);

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
          Money
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
          See what came in, what went out, and what is left.
        </p>
      </div>

      {hasNegative ? (
        <div className="border border-yellow-200 bg-yellow-50 p-4 text-sm font-bold text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
          Some money places are below zero because old expenses were recorded before starting money was added.
          Add starting money to correct them.
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {balances.map((item) => (
          <article
            key={item.method}
            className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {item.name}
            </p>
            <p
              className={
                item.balance < 0
                  ? 'mt-3 text-xl font-black tracking-tight text-red-700 dark:text-red-300 sm:text-2xl'
                  : 'mt-3 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl'
              }
            >
              {money(item.balance)}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              In: {money(item.moneyIn)} · Out: {money(item.moneyOut)}
            </p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-3 gap-3">
        <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Total money
          </p>
          <p className="mt-3 text-xl font-black text-slate-950 dark:text-white">
            {money(totalMoney)}
          </p>
        </article>

        <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Money in
          </p>
          <p className="mt-3 text-xl font-black text-green-700 dark:text-green-300">
            {money(totalIn)}
          </p>
        </article>

        <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Money out
          </p>
          <p className="mt-3 text-xl font-black text-red-700 dark:text-red-300">
            {money(totalOut)}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[380px_380px_1fr]">
        <form
          action={addMoneyAction}
          className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Add money</h3>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Use this when the owner puts money in.
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="paymentMethod" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Where
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-950"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {paymentName(method)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="addAmount" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Amount
              </label>
              <input
                id="addAmount"
                name="amount"
                inputMode="decimal"
                required
                placeholder="Example: 20000"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="addNotes" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Notes
              </label>
              <textarea
                id="addNotes"
                name="notes"
                rows={3}
                placeholder="Example: Starting cash"
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
              />
            </div>
          </div>

          {added ? (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
              Money added.
            </div>
          ) : null}

          <button className="mt-5 h-11 w-full rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600">
            Add money
          </button>
        </form>

        <form
          action={moveMoneyAction}
          className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-lg font-black text-slate-950 dark:text-white">Move money</h3>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Example: move cash to bank.
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="fromPaymentMethod" className="text-sm font-black text-slate-800 dark:text-slate-200">
                From
              </label>
              <select
                id="fromPaymentMethod"
                name="fromPaymentMethod"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-950"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {paymentName(method)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="toPaymentMethod" className="text-sm font-black text-slate-800 dark:text-slate-200">
                To
              </label>
              <select
                id="toPaymentMethod"
                name="toPaymentMethod"
                defaultValue="BANK"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-950"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {paymentName(method)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="moveAmount" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Amount
              </label>
              <input
                id="moveAmount"
                name="amount"
                inputMode="decimal"
                required
                placeholder="Example: 20000"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-950"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="moveNotes" className="text-sm font-black text-slate-800 dark:text-slate-200">
                Notes
              </label>
              <textarea
                id="moveNotes"
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

          {moved ? (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
              Money moved.
            </div>
          ) : null}

          <button className="mt-5 h-11 w-full rounded-lg bg-sky-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-600">
            Move money
          </button>
        </form>

        <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-1">
          <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Recent money added</h3>

            {additionList.length === 0 ? (
              <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                No money added yet.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {additionList.map((addition) => (
                  <div key={addition.id} className="py-3">
                    <p className="font-black text-slate-900 dark:text-white">
                      {paymentName(addition.paymentMethod)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {money(addition.amount)} · {addition.addedAt.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Recent money moved</h3>

            {transferList.length === 0 ? (
              <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                No money moved yet.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {transferList.map((transfer) => (
                  <div key={transfer.id} className="py-3">
                    <p className="font-black text-slate-900 dark:text-white">
                      {paymentName(transfer.fromPaymentMethod)} → {paymentName(transfer.toPaymentMethod)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {money(transfer.amount)} · {transfer.movedAt.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Recent expenses</h3>

            {expenseList.length === 0 ? (
              <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                No expenses yet.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {expenseList.map((expense) => (
                  <div key={expense.id} className="py-3">
                    <p className="font-black text-slate-900 dark:text-white">{expense.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {paymentName(expense.paymentMethod)} · {money(expense.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </section>
  );
}
