"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Briefcase,
    CheckCircle2,
    Users,
    Settings,
    LogOut,
    LayoutDashboard
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Footer } from '@/components/layout/Footer';

const sidebarItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { label: "Triage", href: "/dashboard/triage", icon: CheckCircle2 },
    { label: "Candidates", href: "/dashboard/candidates", icon: Users },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-md-surface flex text-md-on-surface font-roboto">
            {/* Sidebar */}
            <aside className="w-64 bg-md-surface-container-low border-r border-md-outline/10 flex flex-col fixed h-full z-20 transition-all duration-300">
                <div className="h-16 flex items-center px-6 border-b border-md-outline/10">
                    <span className="text-xl font-bold text-md-primary font-display">TATS</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-md-secondary-container text-md-on-secondary-container font-medium'
                                        : 'text-md-on-surface-variant hover:bg-md-surface-container-high hover:text-md-on-surface'}
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : 'group-hover:text-md-primary'}`} />
                                <span className="text-sm tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-md-outline/10 space-y-1">
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-3 rounded-full text-md-on-surface-variant hover:bg-md-surface-container-high hover:text-md-on-surface transition-all duration-200"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-sm tracking-wide">Settings</span>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-md-error hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm tracking-wide font-medium">Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            {/* Main Content */}
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                <div className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}
