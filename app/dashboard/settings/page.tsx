"use client";

import { signOut } from "next-auth/react";
import { LogOut, Trash2, AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { deleteAccount } from "@/app/actions/auth";

export default function SettingsPage() {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteAccount();
            if (result.success) {
                await signOut({ callbackUrl: '/login' });
            } else {
                alert("Failed to delete account. Please try again.");
                setIsDeleting(false);
            }
        } catch (error) {
            console.error(error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
                <h1 className="text-headline-large font-bold text-md-on-surface">Settings</h1>
                <p className="text-body-large text-md-on-surface-variant">
                    Manage your account and application preferences.
                </p>
            </div>

            {/* Account Actions */}
            <div className="bg-md-surface-container-low rounded-[24px] p-6 border border-md-outline/10 space-y-6">
                <h2 className="text-title-large font-medium text-md-on-surface">Account</h2>

                <div className="flex flex-col md:flex-row gap-4">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-md-secondary-container text-md-on-secondary-container hover:opacity-90 transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-[24px] p-8 border border-red-200 dark:border-red-900/30">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-md-error">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-title-large font-bold text-md-error">Danger Zone</h2>
                        <p className="text-md-on-surface-variant opacity-80 mt-1">
                            Permanent actions that cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-md-surface rounded-2xl border border-red-100 dark:border-red-900/20">
                    <div>
                        <h3 className="font-bold text-md-on-surface">Delete Account</h3>
                        <p className="text-sm text-md-on-surface-variant mt-1">
                            Permanently removes your account, all jobs, candidates, and triage data.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full border border-md-error text-md-error hover:bg-md-error hover:text-md-on-error transition-all font-medium whitespace-nowrap"
                    >
                        <Trash2 className="w-5 h-5" />
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Custom Modal Overlay */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-md-surface-container rounded-[28px] max-w-md w-full p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-md-outline/10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-headline-small font-bold text-md-error flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" /> Delete Account?
                            </h2>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="p-2 hover:bg-md-surface-container-high rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-md-on-surface-variant" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="text-md-on-surface-variant">
                                This action is <strong>irreversible</strong>. Are you absolutely sure you want to proceed?
                            </p>
                            <div className="bg-md-error-container text-md-on-error-container p-4 rounded-xl text-sm font-medium">
                                All your data including jobs and candidate evaluations will be permanently destroyed.
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="px-6 py-2.5 rounded-full text-md-primary font-medium hover:bg-md-primary/10 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="px-6 py-2.5 rounded-full bg-md-error text-md-on-error font-medium hover:bg-md-error/90 transition-colors shadow-lg disabled:opacity-70 flex items-center gap-2"
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete Everything"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
