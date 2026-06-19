'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import {
  LayoutDashboard, FileSpreadsheet, Users, Building, ClipboardCheck,
  FileText, Settings, Sun, Moon, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as db from '@/lib/db';

export default function MobileHeader() {
  const { darkMode, mobileMenuOpen, user, setActiveTab, setDarkMode, setMobileMenuOpen, handleLogOut } = useDashboardStore();
  return (
    <div className="no-print flex md:hidden absolute top-0 left-0 right-0 h-16 bg-card border-b border-border items-center justify-between px-6 z-30">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-gradient-to-br from-emerald-600 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow">
          YT
        </div>
        <span className="font-heading font-bold text-sm">Treasurer Hub</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          Menu
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border shadow-xl p-6 flex flex-col gap-2 z-40" onClick={() => setMobileMenuOpen(false)}>
          <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
            <LayoutDashboard className="h-4 w-4" /> Position
          </button>
          <button onClick={() => setActiveTab('ledger')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
            <FileSpreadsheet className="h-4 w-4" /> Ledger
          </button>
          <button onClick={() => setActiveTab('meetings')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
            <Users className="h-4 w-4" /> Meetings
          </button>
          <button onClick={() => setActiveTab('lodgments')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
            <Building className="h-4 w-4" /> Lodgments
          </button>
          <button onClick={() => setActiveTab('reconciliation')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
            <ClipboardCheck className="h-4 w-4" /> Reconciliation
          </button>
          <button onClick={() => setActiveTab('reports')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
            <FileText className="h-4 w-4" /> Reports
          </button>
          <button onClick={() => setActiveTab('settings')} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left">
            <Settings className="h-4 w-4" /> Settings
          </button>
          {db.isSupabaseConfigured() && user && (
            <button onClick={handleLogOut} className="flex items-center gap-3 px-4 py-3 rounded text-sm text-left text-rose-500 hover:text-rose-600 font-semibold border-t border-border/50">
              <LogOut className="h-4 w-4" /> Log Out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
