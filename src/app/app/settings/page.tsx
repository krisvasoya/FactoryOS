'use client';

import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Building, Info } from 'lucide-react';
import { TableSkeleton } from '@/components/skeleton';

interface CompanyInfo {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstNumber: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [error, setError] = useState('');

  // Form Invite State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [invitePassword, setInvitePassword] = useState('password123'); // Default simple password

  // Company Details Form State
  const [compName, setCompName] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compGst, setCompGst] = useState('');

  async function loadSettings() {
    try {
      const res = await fetch('/api/v1/settings');
      if (res.ok) {
        const data = await res.json();
        setCompany(data.company);
        setCompName(data.company.name);
        setCompPhone(data.company.phone || '');
        setCompAddress(data.company.address || '');
        setCompGst(data.company.gstNumber || '');

        setMembers(data.members);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadSettings();
    }, 0);
  }, []);

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateCompany',
          name: compName,
          phone: compPhone,
          address: compAddress,
          gstNumber: compGst,
        }),
      });

      if (res.ok) {
        alert('Company settings updated successfully.');
        loadSettings();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update company.');
      }
    } catch {
      setError('Connection failure.');
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'inviteUser',
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          password: invitePassword,
        }),
      });

      if (res.ok) {
        setShowInviteModal(false);
        setInviteName('');
        setInviteEmail('');
        setInvitePassword('password123');
        loadSettings();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to onboard team member.');
      }
    } catch {
      setError('Connection error.');
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">System Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure corporate tenant parameters, GST identifiers, and customize user permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Company configurations */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-3">
              <Building className="h-4 w-4 text-sky-400" /> Tenant Company Profile
            </h3>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateCompany} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Registered Company Name *</label>
                  <input
                    type="text"
                    required
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">GST / Tax Identifier Number</label>
                  <input
                    type="text"
                    value={compGst}
                    onChange={(e) => setCompGst(e.target.value)}
                    placeholder="e.g. 29AAAAA1111A1Z1"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Corporate Contact Phone</label>
                  <input
                    type="text"
                    value={compPhone}
                    onChange={(e) => setCompPhone(e.target.value)}
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Tenant ID (Isolated context UUID)</label>
                  <input
                    type="text"
                    disabled
                    value={company?.email || 'SYSTEM_MAPPED'}
                    className="w-full h-9 border border-border rounded-xl bg-secondary/10 px-3 text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Corporate Address</label>
                <input
                  type="text"
                  value={compAddress}
                  onChange={(e) => setCompAddress(e.target.value)}
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-secondary px-4 py-2.5 font-bold hover:bg-secondary/70 transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Members invite panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 self-start">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-indigo-400" /> Member Privileges
              </h3>
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-xs text-sky-400 font-semibold hover:underline"
              >
                + Add User
              </button>
            </div>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {members.map((member) => (
                <div key={member.id} className="flex justify-between items-center text-xs border border-border/40 rounded-xl px-3 py-2.5 bg-secondary/10">
                  <div>
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{member.email}</div>
                  </div>
                  <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${
                    member.role === 'Owner'
                      ? 'bg-gradient-to-tr from-sky-400 to-indigo-600 text-white'
                      : member.role === 'Production'
                      ? 'bg-sky-500/10 text-sky-500'
                      : member.role === 'Accountant'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-sky-400" /> Onboard Staff Member
              </span>
              <button onClick={() => setShowInviteModal(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Default Password *</label>
                  <input
                    type="password"
                    required
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    placeholder="password123"
                    className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="vikram@apexmfg.com"
                  className="w-full h-9 border border-border rounded-xl bg-secondary/20 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Privilege Authorization Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-9 border border-border rounded-xl bg-card px-2 focus:outline-none"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Manager">Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Production">Production Line Operator</option>
                  <option value="Warehouse">Warehouse Manager</option>
                  <option value="Sales">Sales Manager</option>
                  <option value="Viewer">Viewer (Read Only)</option>
                </select>
              </div>

              <div className="rounded-xl border border-border bg-secondary/15 p-3 flex gap-2">
                <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-[10px] text-muted-foreground leading-relaxed">
                  Invited members belong strictly to your tenant sandbox and can only access materials or financials mapping to your <strong>companyId</strong>.
                </span>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
              >
                Register Staff User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
