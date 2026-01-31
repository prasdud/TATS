"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Briefcase,
    CheckCircle2,
    Users,
    Settings,
    LogOut,
    LayoutDashboard,
    Menu,
    X
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-md-surface flex text-md-on-surface font-roboto">
            {/* Mobile Header with Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-md-surface-container-low border-b border-md-outline/10 px-4 flex items-center justify-between z-30">
                <span className="text-xl font-bold text-md-primary font-display">TATS</span>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-md-on-surface-variant hover:bg-md-surface-container-high rounded-full"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-md-surface-container-low border-r border-md-outline/10 flex flex-col transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                `}
            >
                <div className="h-16 flex items-center px-6 border-b border-md-outline/10 text-xl font-bold text-md-primary font-display">
                    <span className="md:block hidden">TATS</span> {/* Hide logo on mobile sidebar header since it's in top bar */}
                    <span className="md:hidden block">Menu</span>
                    {/* Close button inside sidebar for mobile ease */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="ml-auto md:hidden p-1 text-md-on-surface-variant"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
            <main className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-64">
                <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8"> {/* pt-20 to clear mobile header */}
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}
