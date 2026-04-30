import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserSwitcher } from '../modules/users/UserSwitcher';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col overflow-hidden">
            <header className="glass shrink-0 z-40 border-b border-white/5 relative">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link
                            to="/"
                            className="text-2xl font-black tracking-tighter text-white transition-all hover:scale-105 active:scale-95"
                        >
                            Task<span className="text-[hsl(var(--primary))]">Bid</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-2">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'bg-[hsl(var(--primary))] text-white shadow-[0_0_20px_rgba(47,47,228,0.3)]' : 'hover:bg-white/5 text-slate-500'}`
                                }
                            >
                                Board
                            </NavLink>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    `px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'bg-[hsl(var(--primary))] text-white shadow-[0_0_20px_rgba(47,47,228,0.3)]' : 'hover:bg-white/5 text-slate-500'}`
                                }
                            >
                                Dashboard
                            </NavLink>
                        </nav>
                    </div>
                    <UserSwitcher />
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 max-w-7xl flex-1 overflow-y-auto no-scrollbar">
                {children}
            </main>
        </div>
    );
};
