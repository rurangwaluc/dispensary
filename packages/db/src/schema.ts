import { relations } from 'drizzle-orm';
import {
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['OWNER']);
export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'DISABLED']);
export const productStatusEnum = pgEnum('product_status', ['ACTIVE', 'ARCHIVED']);
export const itemTypeEnum = pgEnum('item_type', ['PRODUCT', 'SERVICE']);
export const paymentMethodEnum = pgEnum('payment_method', ['CASH', 'MOBILE_MONEY', 'BANK', 'CARD']);
export const customerStatusEnum = pgEnum('customer_status', ['ACTIVE', 'ARCHIVED']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 180 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('OWNER'),
  status: userStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const businessSettings = pgTable('business_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessName: varchar('business_name', { length: 160 }).notNull(),
  ownerName: varchar('owner_name', { length: 120 }).notNull(),
  phone: varchar('phone', { length: 40 }),
  address: text('address'),
  currency: varchar('currency', { length: 12 }).notNull().default('RWF'),
  lowStockAlertQuantity: varchar('low_stock_alert_quantity', { length: 20 }).notNull().default('5'),
  expiryAlertDays: varchar('expiry_alert_days', { length: 20 }).notNull().default('60'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  phone: varchar('phone', { length: 40 }),
  notes: text('notes'),
  status: customerStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemType: itemTypeEnum('item_type').notNull().default('PRODUCT'),
  name: varchar('name', { length: 180 }).notNull(),
  category: varchar('category', { length: 120 }).notNull(),
  unit: varchar('unit', { length: 40 }).notNull(),
  batchNumber: varchar('batch_number', { length: 80 }),
  supplierName: varchar('supplier_name', { length: 160 }),
  buyingPrice: numeric('buying_price', { precision: 12, scale: 2 }).notNull().default('0'),
  sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).notNull().default('0'),
  quantity: integer('quantity').notNull().default(0),
  minQuantity: integer('min_quantity').notNull().default(5),
  expiryDate: date('expiry_date'),
  notes: text('notes'),
  status: productStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sales = pgTable('sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  customerName: varchar('customer_name', { length: 160 }),
  customerPhone: varchar('customer_phone', { length: 40 }),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('CASH'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  balanceAmount: numeric('balance_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  saleDate: timestamp('sale_date', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const saleItems = pgTable('sale_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  saleId: uuid('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  itemName: varchar('item_name', { length: 180 }).notNull(),
  itemType: itemTypeEnum('item_type').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull().default('0'),
  lineTotal: numeric('line_total', { precision: 12, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const debtPayments = pgTable('debt_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  saleId: uuid('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('CASH'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  paidAt: timestamp('paid_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const stockArrivals = pgTable('stock_arrivals', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  productName: varchar('product_name', { length: 180 }).notNull(),
  quantityReceived: integer('quantity_received').notNull(),
  buyingPrice: numeric('buying_price', { precision: 12, scale: 2 }).notNull().default('0'),
  supplierName: varchar('supplier_name', { length: 160 }),
  batchNumber: varchar('batch_number', { length: 80 }),
  expiryDate: date('expiry_date'),
  reference: varchar('reference', { length: 120 }),
  notes: text('notes'),
  arrivedAt: timestamp('arrived_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 180 }).notNull(),
  category: varchar('category', { length: 120 }).notNull().default('Other'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull().default('0'),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('CASH'),
  expenseDate: timestamp('expense_date', { withTimezone: true }).defaultNow().notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales),
}));

export const productsRelations = relations(products, ({ many }) => ({
  saleItems: many(saleItems),
  stockArrivals: many(stockArrivals),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  items: many(saleItems),
  debtPayments: many(debtPayments),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const debtPaymentsRelations = relations(debtPayments, ({ one }) => ({
  sale: one(sales, {
    fields: [debtPayments.saleId],
    references: [sales.id],
  }),
}));

export const stockArrivalsRelations = relations(stockArrivals, ({ one }) => ({
  product: one(products, {
    fields: [stockArrivals.productId],
    references: [products.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type BusinessSettings = typeof businessSettings.$inferSelect;
export type NewBusinessSettings = typeof businessSettings.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;

export type SaleItem = typeof saleItems.$inferSelect;
export type NewSaleItem = typeof saleItems.$inferInsert;

export type DebtPayment = typeof debtPayments.$inferSelect;
export type NewDebtPayment = typeof debtPayments.$inferInsert;

export type StockArrival = typeof stockArrivals.$inferSelect;
export type NewStockArrival = typeof stockArrivals.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
