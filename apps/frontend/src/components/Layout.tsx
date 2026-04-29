import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            <header className="border-b border-[hsl(var(--secondary))] p-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">TaskBid</h1>
            </header>
            <main className="container mx-auto p-4">{children}</main>
        </div>
    );
};
