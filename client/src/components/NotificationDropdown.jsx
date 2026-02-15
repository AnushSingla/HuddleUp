import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { UserPlus, Check, X, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

export default function NotificationDropdown({ isOpen, onClose }) {
    const { friendRequests, loading, acceptRequest, declineRequest } = useNotifications();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-[380px] bg-white/80 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 rounded-[32px] shadow-2xl overflow-hidden z-[100]"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
                        Inbox
                    </h3>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                        {friendRequests.length} New
                    </span>
                </div>

                {/* Content */}
                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center space-y-4">
                            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                    ) : friendRequests.length > 0 ? (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {friendRequests.map((req) => (
                                <div key={req._id} className="p-5 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                                            {req.username.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                                                {req.username}
                                            </p>
                                            <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                                Wants to connect
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => acceptRequest(req._id)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => declineRequest(req._id)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all border border-zinc-200 dark:border-zinc-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 text-zinc-400 dark:text-zinc-600">
                                <BellOff className="w-8 h-8" />
                            </div>
                            <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Crickets here...</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2 font-bold uppercase tracking-widest leading-relaxed">
                                No new requests for now!
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 text-center border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 uppercase tracking-[0.2em] transition-colors"
                    >
                        Close Control Center
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
