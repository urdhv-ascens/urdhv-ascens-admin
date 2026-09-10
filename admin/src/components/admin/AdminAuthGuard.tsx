'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { verifyAdminSession } from '@/lib/api-client';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (pathname === '/admin/login') {
        setIsChecking(false);
        return;
      }

      const isValid = await verifyAdminSession();
      if (!isValid) {
        router.push('/admin/login');
      } else {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground font-medium text-xs font-mono">
            Verifying Hostinger Control Center Session...
          </span>
        </div>
      </div>
    );
  }

  // If on login page, don't render the dashboard layout wrapper
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <>{children}</>;
}
