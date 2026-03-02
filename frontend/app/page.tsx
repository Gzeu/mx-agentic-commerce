'use client';

import { useState } from 'react';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { ExtensionLoginButton, WalletConnectLoginButton } from '@multiversx/sdk-dapp/UI';
import { logout } from '@multiversx/sdk-dapp/utils';

import CommerceAgent from '../components/CommerceAgent';
import LeaderboardView from '../components/Leaderboard';

const RANKS = {
  Bronze: { color: '#CD7F32', bg: 'from-[#CD7F32]/20 to-[#CD7F32]/5', icon: '🥉', minScore: 0 },
  Silver: { color: '#C0C0C0', bg: 'from-[#C0C0C0]/20 to-[#C0C0C0]/5', icon: '🥈', minScore: 100 },
  Gold: { color: '#FFD700', bg: 'from-[#FFD700]/20 to-[#FFD700]/5', icon: '🥇', minScore: 1000 },
  Diamond: { color: '#00F0FF', bg: 'from-[#00F0FF]/20 to-[#00F0FF]/5', icon: '💎', minScore: 10000 },
};

interface AgentStats {
  trustScore: number;
  xp: number;
  rank: keyof typeof RANKS;
  completedOrders: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  icon: string;
}

const QUESTS: Quest[] = [
  { id: 'q1', title: 'First Commerce', description: 'Complete your first agentic commerce order', xpReward: 500, completed: false, icon: '🛒' },
  { id: 'q2', title: 'Register Agent', description: 'Register your AI agent on-chain', xpReward: 200, completed: false, icon: '🤖' },
  { id: 'q3', title: 'MCP Pioneer', description: 'Execute 5 MCP tool calls', xpReward: 300, completed: false, icon: '🔧' },
  { id: 'q4', title: 'x402 Master', description: 'Execute 10 x402 micropayments', xpReward: 1000, completed: false, icon: '⚡' },
  { id: 'q5', title: 'Guild Founder', description: 'Create an agent guild', xpReward: 2000, completed: false, icon: '🏰' },
];

export default function Home() {
  const isLoggedIn = useGetIsLoggedIn();
  const { address, balance } = useGetAccountInfo();
  
  const [agentStats] = useState<AgentStats>({
    trustScore: 840,
    xp: 840,
    rank: 'Silver',
    completedOrders: 3,
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agent' | 'quests' | 'leaderboard'>('dashboard');

  const currentRank = RANKS[agentStats.rank];
  const xpToNextRank = agentStats.rank === 'Bronze' ? 100 :
    agentStats.rank === 'Silver' ? 1000 :
    agentStats.rank === 'Gold' ? 10000 : Infinity;
  const xpProgress = agentStats.rank === 'Diamond' ? 100 :
    Math.min((agentStats.xp / xpToNextRank) * 100, 100);

  const displayBalance = balance ? (Number(balance) / 1e18).toFixed(4) : '0.0000';

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      
      {/* Dynamic Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Glass Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              SYNDICATE 
              <span className="bg-white/10 text-white/70 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-white/10">Beta</span>
            </h1>
            <p className="text-xs text-blue-400 font-medium">MultiversX Supernova</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <div className="flex gap-3">
              <WalletConnectLoginButton
                loginButtonText="Connect xPortal"
                className="!bg-white !text-black hover:!bg-gray-200 !px-5 !py-2.5 !rounded-xl !text-sm !font-bold !border-none transition-transform hover:scale-105 active:scale-95"
              />
              <ExtensionLoginButton
                loginButtonText="Extension"
                className="!bg-white/10 hover:!bg-white/20 !text-white !px-5 !py-2.5 !rounded-xl !text-sm !font-bold !border-none backdrop-blur-md transition-colors"
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 pl-4 pr-1.5 py-1.5 rounded-2xl backdrop-blur-md">
              <div className="flex flex-col items-end">
                <span className="text-xs font-mono text-gray-400">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <span className="text-sm text-white font-bold">{displayBalance} EGLD</span>
              </div>
              <div className="w-px h-8 bg-white/10 mx-1"></div>
              <button 
                onClick={() => logout()} 
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                title="Disconnect"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Pills */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="inline-flex gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 overflow-x-auto w-full md:w-auto">
          {(['dashboard', 'agent', 'quests', 'leaderboard'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl capitalize text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-white text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'dashboard' ? '📊 Dashboard' : 
               tab === 'agent' ? '💬 Agent Terminal' :
               tab === 'quests' ? '🏆 Quests' : '🏅 Leaderboard'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-4 pb-20">
        
        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Main Agent Rank Card (Spans 8 cols) */}
            <div className={`md:col-span-8 rounded-3xl p-8 border border-white/10 bg-gradient-to-br ${currentRank.bg} relative overflow-hidden backdrop-blur-sm`}>
              {/* Decorative background element */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-5xl shadow-xl backdrop-blur-md">
                    {currentRank.icon}
                  </div>
                  <div>
                    <h2 className="text-white/60 font-semibold tracking-wider text-sm uppercase mb-1">Agent Identity</h2>
                    <h3 className="text-4xl font-extrabold text-white mb-2">{agentStats.rank} Tier</h3>
                    <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-sm font-mono text-white/80">Trust Score: {agentStats.trustScore}</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-64 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-sm mb-2 font-semibold text-white/80">
                    <span>Progress</span>
                    <span style={{ color: currentRank.color }}>{Math.floor(xpProgress)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-3 border border-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 relative"
                      style={{ width: `${xpProgress}%`, backgroundColor: currentRank.color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-2 text-white/40 font-mono">
                    <span>{agentStats.xp} XP</span>
                    <span>{xpToNextRank === Infinity ? 'MAX' : xpToNextRank} XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Spans 4 cols) */}
            <div className="md:col-span-4 space-y-4">
               <button 
                  onClick={() => setActiveTab('agent')}
                  className="w-full h-[100px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 p-6 rounded-3xl border border-white/10 flex items-center justify-between group transition-all"
                >
                  <div className="text-left">
                    <h3 className="font-bold text-lg mb-1">Agent Terminal</h3>
                    <p className="text-blue-200 text-sm">Start commerce flow</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">💬</span>
                  </div>
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors">
                    <span className="text-2xl">🤖</span>
                    <span className="text-xs font-bold text-white/70">Register SC</span>
                  </button>
                  <button className="bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors">
                    <span className="text-2xl">💳</span>
                    <span className="text-xs font-bold text-white/70">Receipts</span>
                  </button>
                </div>
            </div>

            {/* Sub Stats Row */}
            <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">📦</div>
                <div>
                  <p className="text-white/50 text-sm font-medium">Completed Orders</p>
                  <p className="text-2xl font-bold">{agentStats.completedOrders}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-xl text-blue-400">⚡</div>
                <div>
                  <p className="text-white/50 text-sm font-medium">Active Protocols</p>
                  <p className="text-2xl font-bold">UCP / ACP</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-xl text-green-400">🛡️</div>
                <div>
                  <p className="text-white/50 text-sm font-medium">AP2 Auth Status</p>
                  <p className="text-2xl font-bold">Secured</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- AGENT TAB --- */}
        {activeTab === 'agent' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CommerceAgent />
          </div>
        )}

        {/* --- QUESTS TAB --- */}
        {activeTab === 'quests' && (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-extrabold mb-2">Active Quests</h2>
                <p className="text-white/50">Complete on-chain actions to earn XP and rank up your Agent.</p>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-sm font-mono text-blue-400">
                Total Earned: 840 XP
              </div>
            </div>
            
            <div className="grid gap-4">
              {QUESTS.map(quest => (
                <div key={quest.id} className={`group rounded-2xl p-5 border transition-all duration-300 ${
                  quest.completed 
                    ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10' 
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                }`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                        quest.completed ? 'bg-green-500/20' : 'bg-black/50 border border-white/5'
                      }`}>
                        {quest.icon}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white mb-1">{quest.title}</p>
                        <p className="text-sm text-white/50 leading-tight">{quest.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end justify-center min-w-[120px]">
                      <p className="text-yellow-400 font-bold mb-2">+{quest.xpReward} XP</p>
                      {quest.completed ? (
                        <span className="text-green-400 text-xs font-bold uppercase tracking-wider bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-400/20">
                          ✓ Completed
                        </span>
                      ) : (
                        <button className="text-xs bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-bold transition-transform active:scale-95">
                          Start Quest
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- LEADERBOARD TAB --- */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <LeaderboardView />
          </div>
        )}

      </div>
      
      {/* Global CSS for animations */}
      <style dangerouslySetContent={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </main>
  );
}