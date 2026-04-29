import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserSwitcher } from '../modules/users/UserSwitcher';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            <header className="border-b border-white/5 bg-[hsl(var(--secondary))/0.6] backdrop-blur-xl sticky top-0 z-40">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link
                            to="/"
                            className="text-2xl font-black tracking-tighter text-[hsl(var(--primary))] hover:scale-105 transition-all"
                        >
                            TASKBID
                        </Link>
                        <nav className="hidden md:flex items-center gap-2">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-[hsl(var(--primary))] text-white shadow-lg shadow-[hsl(var(--primary))/0.2]' : 'hover:bg-white/5 text-slate-400'}`
                                }
                            >
                                Board
                            </NavLink>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    `px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-[hsl(var(--primary))] text-white shadow-lg shadow-[hsl(var(--primary))/0.2]' : 'hover:bg-white/5 text-slate-400'}`
                                }
                            >
                                Dashboard
                            </NavLink>
                        </nav>
                    </div>
                    <UserSwitcher />
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
    );
};
