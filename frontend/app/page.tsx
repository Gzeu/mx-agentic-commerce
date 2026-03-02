'use client';

import { useState } from 'react';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { ExtensionLoginButton, WalletConnectLoginButton } from '@multiversx/sdk-dapp/UI';
import { logout } from '@multiversx/sdk-dapp/utils';

import CommerceAgent from '../components/CommerceAgent';
import LeaderboardView from '../components/Leaderboard';

const RANKS = {
  Bronze: { color: '#CD7F32', icon: '🥉', minScore: 0 },
  Silver: { color: '#C0C0C0', icon: '🥈', minScore: 100 },
  Gold: { color: '#FFD700', icon: '🥇', minScore: 1000 },
  Diamond: { color: '#B9F2FF', icon: '💎', minScore: 10000 },
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
    trustScore: 0,
    xp: 0,
    rank: 'Bronze',
    completedOrders: 0,
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
    <main className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SYNDICATE
          </h1>
          <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800">
            Supernova Devnet
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <div className="flex gap-2">
              <WalletConnectLoginButton
                loginButtonText="xPortal"
                className="!bg-blue-600 hover:!bg-blue-700 !px-4 !py-2 !rounded-lg !text-sm !border-none !text-white"
              />
              <ExtensionLoginButton
                loginButtonText="DeFi Wallet"
                className="!bg-purple-600 hover:!bg-purple-700 !px-4 !py-2 !rounded-lg !text-sm !border-none !text-white"
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-mono text-gray-300">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <span className="text-xs text-blue-400 font-bold">{displayBalance} EGLD</span>
              </div>
              <button 
                onClick={() => logout()} 
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-sm transition-colors border border-red-500/20"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex gap-1 px-6 pt-6 overflow-x-auto">
        {(['dashboard', 'agent', 'quests', 'leaderboard'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-t-lg capitalize text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-gray-800 text-white border-t border-x border-gray-700'
                : 'text-gray-400 hover:text-white border-transparent'
            }`}
          >
            {tab === 'dashboard' ? '📊 Dashboard' : 
             tab === 'agent' ? '💬 Commerce Agent' :
             tab === 'quests' ? '🏆 Quests' : '🏅 Leaderboard'}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <div className="px-6 py-6 border-t border-gray-800 min-h-[calc(100vh-140px)] bg-gray-900/30">
        
        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Agent Rank Card */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-xl shadow-black/50">
              <h2 className="text-sm text-gray-400 mb-3 font-medium uppercase tracking-wider">Agent Identity</h2>
              <div className="flex items-center gap-4 mb-5">
                <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center text-3xl border-2" style={{ borderColor: currentRank.color }}>
                  {currentRank.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: currentRank.color }}>
                    {agentStats.rank}
                  </p>
                  <p className="text-xs text-gray-500 bg-gray-950 px-2 py-1 rounded inline-block mt-1">
                    Trust Score: {agentStats.trustScore}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-950 rounded-full h-2.5 border border-gray-800">
                <div
                  className="h-full rounded-full transition-all relative overflow-hidden"
                  style={{ width: `${xpProgress}%`, backgroundColor: currentRank.color }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-gray-500">{agentStats.xp} XP</p>
                <p className="text-xs text-gray-500">Next: {xpToNextRank === Infinity ? 'Max' : xpToNextRank} XP</p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-xl shadow-black/50">
              <h2 className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">Network Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-950 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 text-sm flex items-center gap-2">📦 <span>Orders</span></span>
                  <span className="font-bold text-lg">{agentStats.completedOrders}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-950 p-3 rounded-lg border border-gray-800">
                  <span className="text-gray-400 text-sm flex items-center gap-2">⭐ <span>Total XP</span></span>
                  <span className="font-bold text-lg text-yellow-400">{agentStats.xp}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-xl shadow-black/50">
              <h2 className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveTab('agent')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-sm py-3 px-4 rounded-lg transition-all font-medium flex items-center justify-between"
                >
                  <span>💬 Chat with Agent</span>
                  <span>→</span>
                </button>
                <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm py-3 px-4 rounded-lg transition-all font-medium flex items-center justify-between">
                  <span>🤖 Register Agent SC</span>
                  <span>↗</span>
                </button>
                <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm py-3 px-4 rounded-lg transition-all font-medium flex items-center justify-between">
                  <span>💳 View NFT Receipts</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- AGENT TAB --- */}
        {activeTab === 'agent' && (
          <div className="max-w-4xl mx-auto">
            <CommerceAgent />
          </div>
        )}

        {/* --- QUESTS TAB --- */}
        {activeTab === 'quests' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Active Quests</h2>
              <p className="text-gray-400 text-sm">Complete on-chain commerce actions to earn XP and rank up.</p>
            </div>
            {QUESTS.map(quest => (
              <div key={quest.id} className={`bg-gray-900 rounded-xl p-5 border transition-all hover:border-gray-600 ${
                quest.completed ? 'border-green-800 bg-green-950/30' : 'border-gray-800'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
                      {quest.icon}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{quest.title}</p>
                      <p className="text-sm text-gray-400">{quest.description}</p>
                    </div>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="text-yellow-400 font-bold text-lg">+{quest.xpReward} XP</p>
                    {quest.completed ? (
                      <span className="text-green-400 text-sm font-medium bg-green-900/30 px-2 py-1 rounded mt-1 inline-block">✓ Completed</span>
                    ) : (
                      <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded mt-1 font-medium transition-colors">
                        Start Quest
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- LEADERBOARD TAB --- */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-5xl mx-auto">
            <LeaderboardView />
          </div>
        )}

      </div>
    </main>
  );
}
