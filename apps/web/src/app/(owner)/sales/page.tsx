import { ComingSoonPage } from '@/components/coming-soon-page';

export default function SalesPage() {
  return (
    <ComingSoonPage
      eyebrow="Sales"
      title="Sales"
      description="This page will help the owner record product sales, service sales, paid sales, and sales where the customer will pay later."
      nextStep="We will build this after products, services, and stock are ready."
    />
  );
}
