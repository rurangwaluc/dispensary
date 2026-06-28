import { eq, inArray } from 'drizzle-orm';
import { db } from '@dispensary/db/client';
import {
  businessSettings,
  debtPayments,
  expenses,
  products,
  saleItems,
  sales,
} from '@dispensary/db/schema';

export type ReportRange = 'day' | 'month' | 'all';

export function money(value: string | number) {
  return `RWF ${Number(value).toLocaleString('en-US')}`;
}

export function paymentName(value: string) {
  const names: Record<string, string> = {
    CASH: 'Cash',
    MOBILE_MONEY: 'Mobile money',
    BANK: 'Bank',
    CARD: 'Card',
  };

  return names[value] || value;
}

export function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

export function cleanReportDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return getTodayInputDate();
  }

  return value;
}

export function readableDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isSameDay(value: Date, reportDate: string) {
  const target = new Date(`${reportDate}T12:00:00`);

  return (
    value.getFullYear() === target.getFullYear() &&
    value.getMonth() === target.getMonth() &&
    value.getDate() === target.getDate()
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

export async function getDayReport(reportDate: string) {
  const selectedDate = cleanReportDate(reportDate);

  const [settings] = await db.select().from(businessSettings).limit(1);

  const [saleList, expenseList, debtPaymentList, productList] = await Promise.all([
    db.select().from(sales),
    db.select().from(expenses),
    db.select().from(debtPayments),
    db.select().from(products).where(eq(products.status, 'ACTIVE')),
  ]);

  const filteredSales = saleList.filter((sale) => isSameDay(sale.saleDate, selectedDate));
  const filteredExpenses = expenseList.filter((expense) => isSameDay(expense.expenseDate, selectedDate));
  const filteredDebtPayments = debtPaymentList.filter((payment) => isSameDay(payment.paidAt, selectedDate));

  const saleIds = filteredSales.map((sale) => sale.id);
  const itemList =
    saleIds.length > 0
      ? await db.select().from(saleItems).where(inArray(saleItems.saleId, saleIds))
      : [];

  const productMap = new Map(productList.map((product) => [product.id, product]));

  const salesTotal = filteredSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
  const salesPaid = filteredSales.reduce((sum, sale) => sum + Number(sale.paidAmount), 0);
  const creditGiven = filteredSales.reduce((sum, sale) => sum + Number(sale.balanceAmount), 0);
  const debtPaid = filteredDebtPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const expensesTotal = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const moneyReceived = salesPaid + debtPaid;

  const productCost = itemList.reduce((sum, item) => {
    if (item.itemType === 'SERVICE') {
      return sum;
    }

    const product = productMap.get(item.productId);
    return sum + Number(product?.buyingPrice || 0) * item.quantity;
  }, 0);

  const profitEstimate = salesTotal - productCost - expensesTotal;

  const expiryWarningDays = Number(settings?.expiryAlertDays || 60);
  const activeProducts = productList.filter((product) => product.itemType === 'PRODUCT');

  const lowStock = activeProducts
    .filter((product) => product.quantity <= product.minQuantity)
    .slice(0, 10);

  const expiringSoon = activeProducts
    .filter((product) => getExpiryWarning(product.expiryDate, expiryWarningDays))
    .slice(0, 10);

  const soldProducts = itemList
    .filter((item) => item.itemType === 'PRODUCT')
    .reduce<Map<string, { name: string; quantity: number; total: number }>>((map, item) => {
      const current = map.get(item.productId) || {
        name: item.itemName,
        quantity: 0,
        total: 0,
      };

      current.quantity += item.quantity;
      current.total += Number(item.lineTotal);
      map.set(item.productId, current);

      return map;
    }, new Map());

  const soldServices = itemList
    .filter((item) => item.itemType === 'SERVICE')
    .reduce<Map<string, { name: string; quantity: number; total: number }>>((map, item) => {
      const current = map.get(item.productId) || {
        name: item.itemName,
        quantity: 0,
        total: 0,
      };

      current.quantity += item.quantity;
      current.total += Number(item.lineTotal);
      map.set(item.productId, current);

      return map;
    }, new Map());

  const productRows = Array.from(soldProducts.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const serviceRows = Array.from(soldServices.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const paymentRows = ['CASH', 'MOBILE_MONEY', 'BANK', 'CARD'].map((method) => {
    const saleMoney = filteredSales
      .filter((sale) => sale.paymentMethod === method)
      .reduce((sum, sale) => sum + Number(sale.paidAmount), 0);

    const debtMoney = filteredDebtPayments
      .filter((payment) => payment.paymentMethod === method)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    return {
      method,
      name: paymentName(method),
      total: saleMoney + debtMoney,
    };
  });

  const expenseRows = filteredExpenses.reduce<Map<string, number>>((map, expense) => {
    const current = map.get(expense.category) || 0;
    map.set(expense.category, current + Number(expense.amount));
    return map;
  }, new Map());

  const expenseCategoryRows = Array.from(expenseRows.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return {
    selectedDate,
    readableDate: readableDate(selectedDate),
    expiryWarningDays,
    summary: {
      salesTotal,
      moneyReceived,
      creditGiven,
      expensesTotal,
      profitEstimate,
      salesCount: filteredSales.length,
      lowStockCount: lowStock.length,
      expiringSoonCount: expiringSoon.length,
    },
    paymentRows,
    expenseCategoryRows,
    productRows,
    serviceRows,
    lowStock,
    expiringSoon,
  };
}
