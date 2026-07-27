import React, { useState } from 'react';
import { Household, UserProfile } from '../../types';
import { X, Settings, Users, Database, ShieldCheck, RefreshCw, Copy, Check, Info } from 'lucide-react';
import { SUPABASE_CONFIG } from '../../lib/supabaseClient';

interface HouseholdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  users: UserProfile[];
  onUpdateHousehold: (household: Household) => void;
  onResetData: () => void;
}

export const HouseholdSettingsModal: React.FC<HouseholdSettingsModalProps> = ({
  isOpen,
  onClose,
  household,
  users,
  onUpdateHousehold,
  onResetData
}) => {
  if (!isOpen) return null;

  const [householdName, setHouseholdName] = useState(household.name);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHousehold({
      ...household,
      name: householdName.trim() || household.name
    });
    onClose();
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(household.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Household Settings & Backend</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 text-xs">
          
          {/* Household Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-600">
              Household Configuration
            </h3>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Apartment / Household Name</label>
              <input
                type="text"
                value={householdName}
                onChange={e => setHouseholdName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3.5 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Roommate Invite Code</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={household.inviteCode}
                  className="w-full bg-slate-50 border border-slate-200 text-indigo-700 font-mono font-bold rounded-lg px-3.5 py-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyInviteCode}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-semibold flex items-center space-x-1"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Share this code with new roommates to join this shared household.
              </p>
            </div>
          </div>

          {/* Roommates List */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-indigo-600">
              Active Roommates ({users.length})
            </h3>

            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                    <div>
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[10px] text-slate-500">{u.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Connection Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                Supabase Backend
              </span>
              <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                SUPABASE_CONFIG.isConfigured ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {SUPABASE_CONFIG.isConfigured ? 'Connected' : 'Frontend Mode (Local Persistence)'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Frontend is running with rich state & LocalStorage persistence. To connect your Supabase backend later, set <code className="bg-slate-200/70 px-1 py-0.5 rounded text-indigo-800 font-mono">VITE_SUPABASE_URL</code> and <code className="bg-slate-200/70 px-1 py-0.5 rounded text-indigo-800 font-mono">VITE_SUPABASE_ANON_KEY</code>.
            </p>
          </div>

          {/* Reset Seed Data */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset application state back to default seed dataset?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Seed Dataset</span>
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md shadow-sm transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
