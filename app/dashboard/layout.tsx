'use client';

import React from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Navbar from '@/components/layout/Navbar';

/* ------------------------------------------------------------------ */
/*  Dashboard layout — sidebar + navbar wrapper for /dashboard/*       */
/* ------------------------------------------------------------------ */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top navbar */}
      <Navbar isAuthenticated={true} userName="Utilisateur" />

      {/* Sidebar */}
      <DashboardSidebar userName="Utilisateur" />

      {/* Main content area — offset for navbar (h-14) and sidebar (lg:w-60) */}
      <main className="pt-14 lg:pl-60">
        <div className="mx-auto max-w-5xl flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
