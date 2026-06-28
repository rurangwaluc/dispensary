import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';
import { cleanReportDate, getDayReport, money } from '@/lib/reports/report-data';

export const runtime = 'nodejs';

type ReportPdfProps = {
  report: Awaited<ReturnType<typeof getDayReport>>;
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: 18,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#7dd3fc',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 5,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 10,
  },
  section: {
    backgroundColor: '#ffffff',
    border: '1 solid #e2e8f0',
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  card: {
    width: '23.5%',
    backgroundColor: '#ffffff',
    border: '1 solid #e2e8f0',
    padding: 10,
  },
  label: {
    fontSize: 7,
    color: '#64748b',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    fontWeight: 700,
  },
  helper: {
    color: '#64748b',
    fontSize: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
    paddingVertical: 7,
    alignItems: 'center',
  },
  rowLast: {
    flexDirection: 'row',
    paddingVertical: 7,
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontWeight: 700,
  },
  small: {
    color: '#64748b',
    fontSize: 8,
    marginTop: 2,
  },
  amount: {
    width: 120,
    textAlign: 'right',
    fontWeight: 700,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  empty: {
    color: '#64748b',
    fontSize: 9,
  },
  footer: {
    color: '#64748b',
    fontSize: 8,
    marginTop: 8,
    textAlign: 'center',
  },
});

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.helper}>{helper}</Text>
    </View>
  );
}

function MoneyRows({
  rows,
}: {
  rows: { name: string; total: number }[];
}) {
  return (
    <View>
      {rows.map((row, index) => (
        <View key={row.name} style={index === rows.length - 1 ? styles.rowLast : styles.row}>
          <Text style={styles.name}>{row.name}</Text>
          <Text style={styles.amount}>{money(row.total)}</Text>
        </View>
      ))}
    </View>
  );
}

function SoldRows({
  rows,
  empty,
  quantityLabel,
}: {
  rows: { name: string; quantity: number; total: number }[];
  empty: string;
  quantityLabel: string;
}) {
  if (rows.length === 0) {
    return <Text style={styles.empty}>{empty}</Text>;
  }

  return (
    <View>
      {rows.map((row, index) => (
        <View key={row.name} style={index === rows.length - 1 ? styles.rowLast : styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{row.name}</Text>
            <Text style={styles.small}>
              {quantityLabel}: {row.quantity}
            </Text>
          </View>
          <Text style={styles.amount}>{money(row.total)}</Text>
        </View>
      ))}
    </View>
  );
}

function ReportPdf({ report }: ReportPdfProps) {
  const summary = [
    { label: 'Sales', value: money(report.summary.salesTotal), helper: 'Products and services sold' },
    { label: 'Money received', value: money(report.summary.moneyReceived), helper: 'Sales paid plus debt paid' },
    { label: 'Unpaid', value: money(report.summary.creditGiven), helper: 'Money customers still owe' },
    { label: 'Expenses', value: money(report.summary.expensesTotal), helper: 'Money spent' },
    { label: 'Profit estimate', value: money(report.summary.profitEstimate), helper: 'Sales minus cost and expenses' },
    { label: 'Sales count', value: report.summary.salesCount, helper: 'Number of sales' },
    { label: 'Low stock', value: report.summary.lowStockCount, helper: 'Products needing restock' },
    {
      label: 'Expiring soon',
      value: report.summary.expiringSoonCount,
      helper: `${report.expiryWarningDays} days warning`,
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Dispensary report</Text>
          <Text style={styles.title}>Daily Business Report</Text>
          <Text style={styles.subtitle}>Report for {report.readableDate}</Text>
        </View>

        <View style={styles.grid}>
          {summary.map((item) => (
            <SummaryCard
              key={item.label}
              label={item.label}
              value={item.value}
              helper={item.helper}
            />
          ))}
        </View>

        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Money received by method</Text>
              <MoneyRows rows={report.paymentRows} />
            </View>
          </View>

          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expenses by category</Text>
              {report.expenseCategoryRows.length === 0 ? (
                <Text style={styles.empty}>No expenses on this day.</Text>
              ) : (
                <MoneyRows
                  rows={report.expenseCategoryRows.map((row) => ({
                    name: row.category,
                    total: row.total,
                  }))}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top products sold</Text>
              <SoldRows
                rows={report.productRows}
                empty="No products sold on this day."
                quantityLabel="Quantity sold"
              />
            </View>
          </View>

          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top services sold</Text>
              <SoldRows
                rows={report.serviceRows}
                empty="No services sold on this day."
                quantityLabel="Times sold"
              />
            </View>
          </View>
        </View>

        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Products to restock</Text>
              {report.lowStock.length === 0 ? (
                <Text style={styles.empty}>No low stock products.</Text>
              ) : (
                report.lowStock.map((product, index) => (
                  <View
                    key={product.id}
                    style={index === report.lowStock.length - 1 ? styles.rowLast : styles.row}
                  >
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.amount}>
                      {product.quantity} {product.unit}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expiring soon</Text>
              {report.expiringSoon.length === 0 ? (
                <Text style={styles.empty}>No product is expiring soon.</Text>
              ) : (
                report.expiringSoon.map((product, index) => (
                  <View
                    key={product.id}
                    style={index === report.expiringSoon.length - 1 ? styles.rowLast : styles.row}
                  >
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.amount}>{product.expiryDate || 'No date'}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated by Dispensary Manager · {new Date().toLocaleDateString('en-US')}
        </Text>
      </Page>
    </Document>
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const selectedDate = cleanReportDate(url.searchParams.get('date') || undefined);
  const report = await getDayReport(selectedDate);

  const pdf = await renderToBuffer(<ReportPdf report={report} />);
  const filename = `dispensary-report-${selectedDate}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
