'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { adminLogout } from "@/lib/api-client";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  Megaphone,
  Briefcase,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const normalizedPath = pathname ? pathname.replace(/\/+$/, '') : '';
  if (normalizedPath === '/admin/login') {
    return <AdminAuthGuard>{children}</AdminAuthGuard>;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Booklets & Covers", href: "/admin/booklets", icon: BookOpen, badge: "12" },
    { label: "Courses", href: "/admin/courses", icon: GraduationCap },
    { label: "Reader Leads", href: "/admin/readers", icon: Users },
    { label: "Advertisements", href: "/admin/ads", icon: Megaphone },
    { label: "Projects / Work", href: "/admin/projects", icon: Briefcase },
    { label: "Capabilities", href: "/admin/capabilities", icon: Sparkles },
    { label: "Services", href: "/admin/services", icon: Layers },
    { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    { label: "Site Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleSignOut = () => {
    adminLogout();
    router.push('/admin/login');
  };

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-black text-white">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 hidden md:flex">
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <img src="/logo.webp" alt="Ūrdhv Ascens" className="h-6 w-auto object-contain" />
              <span className="text-base font-black tracking-wider text-white uppercase">
                ŪRDHV <span className="text-emerald-400">CONTROL</span>
              </span>
            </Link>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
              v2.0
            </span>
          </div>
          
          <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-800 text-zinc-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-zinc-800 flex flex-col gap-2">
            <a
              href="https://urdhvascens.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 w-full px-3 py-2 bg-red-500/10 text-red-400 rounded-lg font-medium text-xs hover:bg-red-500/20 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Admin Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
          <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-zinc-400">HOSTINGER CONTROL CENTER</span>
              <span className="text-zinc-700">•</span>
              <span className="text-xs font-medium text-emerald-400">Live API Dynamic Sync</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">admin@urdhvascens.com</span>
            </div>
          </header>

          <div className="p-6 md:p-8 overflow-y-auto flex-1">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
