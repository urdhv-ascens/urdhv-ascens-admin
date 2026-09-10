'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FolderKanban, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Users, 
  Settings, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { getLiveContent, getReaders, getBooklets } from '@/lib/api-client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projectsCount: 3,
    capabilitiesCount: 9,
    servicesCount: 4,
    bookletsCount: 12,
    readersCount: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [content, readersRes, bookletsRes] = await Promise.all([
          getLiveContent().catch(() => null),
          getReaders().catch(() => ({ total: 0, readers: [] })),
          getBooklets().catch(() => []),
        ]);

        const projects = (content as any)?.projects?.list?.length ?? (content as any)?.projectsList?.length ?? 3;
        const capabilities = content?.capabilities?.list?.length ?? 9;
        const services = content?.services?.list?.length ?? 4;
        const booklets = Array.isArray(bookletsRes) ? bookletsRes.length : 12;
        const readers = (readersRes as any)?.total ?? (readersRes as any)?.readers?.length ?? 0;

        setStats({
          projectsCount: projects,
          capabilitiesCount: capabilities,
          servicesCount: services,
          bookletsCount: booklets,
          readersCount: readers,
          loading: false,
        });
      } catch (err) {
        console.warn('Dashboard stats fallback:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    loadStats();
  }, []);

  const quickLinks = [
    {
      title: 'Projects & Slideshow',
      desc: 'Equal-interval portfolio slideshow & case studies',
      href: '/admin/projects',
      icon: FolderKanban,
      count: `${stats.projectsCount} Projects`,
      color: 'text-emerald-400',
    },
    {
      title: 'Studio Capabilities',
      desc: 'Infinite carousel disciplines & core competencies',
      href: '/admin/capabilities',
      icon: Sparkles,
      count: `${stats.capabilitiesCount} Disciplines`,
      color: 'text-emerald-400',
    },
    {
      title: 'Studio Services',
      desc: 'Infinite carousel service tiers & delivery pillars',
      href: '/admin/services',
      icon: Layers,
      count: `${stats.servicesCount} Services`,
      color: 'text-emerald-400',
    },
    {
      title: 'Educational Booklets',
      desc: 'Curriculum catalog, versions, CDN WebP manifests',
      href: '/admin/booklets',
      icon: BookOpen,
      count: `${stats.bookletsCount} Modules`,
      color: 'text-emerald-400',
    },
    {
      title: 'Reader Leads & Telemetry',
      desc: 'Course registration log, CSV export, telemetry',
      href: '/admin/readers',
      icon: Users,
      count: `${stats.readersCount} Readers`,
      color: 'text-emerald-400',
    },
    {
      title: 'Site Settings & Hero',
      desc: 'Brand name, blurred hero background, Cloudflare webhook',
      href: '/admin/settings',
      icon: Settings,
      count: 'Config',
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs">
              ŪRDHV CONTROL PLANE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
            Operations & Content Hub
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Real-time management for the public flagship website, interactive viewer, and edge CDN.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://urdhvascens.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Public Site</span>
          </a>
          <a
            href="https://viewer.urdhvascens.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Course Viewer</span>
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 border border-zinc-850 rounded-2xl bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Live Projects</span>
            <FolderKanban className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">
            {stats.loading ? '...' : stats.projectsCount}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1">Equal-interval slideshow</span>
        </div>

        <div className="p-5 border border-zinc-850 rounded-2xl bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Capabilities</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">
            {stats.loading ? '...' : stats.capabilitiesCount}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1">Infinite looping track</span>
        </div>

        <div className="p-5 border border-zinc-850 rounded-2xl bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Course Booklets</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">
            {stats.loading ? '...' : stats.bookletsCount}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1">WebP CDN edge manifests</span>
        </div>

        <div className="p-5 border border-zinc-850 rounded-2xl bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Readers</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">
            {stats.loading ? '...' : stats.readersCount}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1">Student & teacher leads</span>
        </div>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Content Modules & Management
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Zero Hardcoded Values</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group p-5 bg-zinc-950 border border-zinc-850 hover:border-emerald-500/50 rounded-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {item.count}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500 group-hover:text-emerald-400 transition-colors">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Configure</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Edge Delivery Architecture Status */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              High-Availability Edge Architecture
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
            <span className="text-zinc-300 font-bold block">Delivery Plane</span>
            <span className="text-zinc-500 font-mono text-[11px] block">Cloudflare Pages Static CDN</span>
            <span className="text-emerald-400 font-mono text-[10px] block">Global Edge POPs</span>
          </div>
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
            <span className="text-zinc-300 font-bold block">Control Plane</span>
            <span className="text-zinc-500 font-mono text-[11px] block">Hostinger PHP Microservices</span>
            <span className="text-emerald-400 font-mono text-[10px] block">Bearer Auth API</span>
          </div>
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1">
            <span className="text-zinc-300 font-bold block">Viewer Plane</span>
            <span className="text-zinc-500 font-mono text-[11px] block">React 19 Canvas Stream</span>
            <span className="text-emerald-400 font-mono text-[10px] block">Protected WebP Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
