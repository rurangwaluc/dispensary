import { ComingSoonPage } from '@/components/coming-soon-page';

export default function ProductsPage() {
  return (
    <ComingSoonPage
      eyebrow="Products"
      title="Products and drugs"
      description="This page will help the owner add drugs, set prices, track quantity, check expiry dates, and know what is low in stock."
      nextStep="This is the next main feature we should build."
    />
  );
}
