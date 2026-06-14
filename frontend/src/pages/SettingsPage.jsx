import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Zap, Check, CreditCard, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpgrade = (planName) => {
    setUpgrading(true);
    // Mock upgrade process
    setTimeout(() => {
      setMessage(`Successfully upgraded to ${planName} Plan! (Mocked for hackathon)`);
      setUpgrading(false);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and billing plan.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Card */}
        <div className="glass rounded-2xl border border-border overflow-hidden shadow-md p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-500 font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Member since {new Date(user?.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="glass rounded-2xl border border-border overflow-hidden shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                Current Plan
                <span className="bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {user?.plan || 'FREE'}
                </span>
              </h2>
              <p className="text-muted-foreground text-sm">You are currently on the {user?.plan || 'FREE'} plan.</p>
            </div>
          </div>

          {message && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg flex items-center gap-2 text-sm font-semibold animate-fade-in">
              <Check className="h-4 w-4" />
              {message}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className={`border rounded-xl p-5 ${user?.plan !== 'PRO' && user?.plan !== 'ENTERPRISE' ? 'bg-secondary/20 border-border' : 'border-indigo-500 bg-indigo-500/5'}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Pro Plan</h3>
                <Zap className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">$13 / month - 5,000 links, 5 custom domains, advanced analytics.</p>
              <button 
                onClick={() => handleUpgrade('PRO')}
                disabled={upgrading || user?.plan === 'PRO' || user?.plan === 'ENTERPRISE'}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-indigo-500 transition-colors"
              >
                {user?.plan === 'PRO' || user?.plan === 'ENTERPRISE' ? 'Current Plan' : upgrading ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            </div>

            <div className={`border rounded-xl p-5 ${user?.plan !== 'ENTERPRISE' ? 'bg-secondary/20 border-border' : 'border-indigo-500 bg-indigo-500/5'}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Premium Plan</h3>
                <CreditCard className="h-5 w-5 text-pink-500" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">$41 / month - 15,000 links, 15 custom domains, API access.</p>
              <button 
                onClick={() => handleUpgrade('ENTERPRISE')}
                disabled={upgrading || user?.plan === 'ENTERPRISE'}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {user?.plan === 'ENTERPRISE' ? 'Current Plan' : upgrading ? 'Processing...' : 'Upgrade to Premium'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
