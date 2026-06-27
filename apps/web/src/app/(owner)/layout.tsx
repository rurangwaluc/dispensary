import { AppHeader } from '@/components/app-header';
import { requireOwner } from '@/lib/auth/session';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner();

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-3 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-5 sm:py-5 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5">
        <AppHeader ownerName={owner.name} />
        {children}
      </div>
    </main>
  );
}
