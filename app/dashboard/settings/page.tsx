"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
                <h1 className="text-headline-large font-bold text-md-on-surface">Settings</h1>
                <p className="text-body-large text-md-on-surface-variant">
                    Manage your account and application preferences.
                </p>
            </div>

            <div className="bg-md-surface-container-low rounded-[24px] p-6 border border-md-outline/10">
                <h2 className="text-title-large font-medium text-md-on-surface mb-6">Account Actions</h2>

                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-md-error-container text-md-on-error-container hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
            </div>

            <div className="bg-md-surface-container rounded-[24px] p-8 border border-md-outline/10 text-center text-md-on-surface-variant">
                <p>This is the {`{Settings}`} page.</p>
            </div>
        </div>
    );
}
