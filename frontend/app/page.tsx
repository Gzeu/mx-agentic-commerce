'use client';

import { useState, useEffect } from 'react';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { ExtensionLoginButton, WalletConnectLoginButton } from '@multiversx/sdk-dapp/UI';

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
  const { address } = useGetAccountInfo();
  const [agentStats, setAgentStats] = useState<AgentStats>({
    trustScore: 0,
    xp: 0,
    rank: 'Bronze',
    completedOrders: 0,
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quests' | 'leaderboard'>('dashboard');

  const currentRank = RANKS[agentStats.rank];
  const xpToNextRank = agentStats.rank === 'Bronze' ? 100 :
    agentStats.rank === 'Silver' ? 1000 :
    agentStats.rank === 'Gold' ? 10000 : Infinity;
  const xpProgress = agentStats.rank === 'Diamond' ? 100 :
    Math.min((agentStats.xp / xpToNextRank) * 100, 100);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            mx-agentic-commerce
          </h1>
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">Supernova</span>
        </div>
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <div className="flex gap-2">
              <WalletConnectLoginButton
                loginButtonText="xPortal"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
              />
              <ExtensionLoginButton
                loginButtonText="Extension"
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
              <span className="text-lg">{currentRank.icon}</span>
              <span className="text-sm font-mono">{address.slice(0, 8)}...{address.slice(-6)}</span>
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex gap-1 px-6 pt-4">
        {(['dashboard', 'quests', 'leaderboard'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg capitalize text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'dashboard' ? '📊 Dashboard' : tab === 'quests' ? '🏆 Quests' : '🏅 Leaderboard'}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="px-6 py-4">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Agent Rank Card */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="text-sm text-gray-400 mb-3">Agent Rank</h2>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{currentRank.icon}</span>
                <div>
                  <p className="text-xl font-bold" style={{ color: currentRank.color }}>
                    {agentStats.rank}
                  </p>
                  <p className="text-xs text-gray-500">Trust Score: {agentStats.trustScore}</p>
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${xpProgress}%`, backgroundColor: currentRank.color }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{agentStats.xp} / {xpToNextRank === Infinity ? '∞' : xpToNextRank} XP</p>
            </div>

            {/* Stats Card */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="text-sm text-gray-400 mb-3">Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">📦 Completed Orders</span>
                  <span className="font-bold">{agentStats.completedOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">⭐ Total XP</span>
                  <span className="font-bold">{agentStats.xp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">🔒 Trust Score</span>
                  <span className="font-bold">{agentStats.trustScore}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h2 className="text-sm text-gray-400 mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2 px-3 rounded-lg transition-colors">
                  🤖 Register Agent
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-sm py-2 px-3 rounded-lg transition-colors">
                  🚀 New Commerce Intent
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-sm py-2 px-3 rounded-lg transition-colors">
                  💳 View NFT Receipts
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="space-y-3">
            {QUESTS.map(quest => (
              <div key={quest.id} className={`bg-gray-900 rounded-xl p-4 border ${
                quest.completed ? 'border-green-800 bg-green-950' : 'border-gray-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{quest.icon}</span>
                    <div>
                      <p className="font-medium">{quest.title}</p>
                      <p className="text-sm text-gray-400">{quest.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">+{quest.xpReward} XP</p>
                    {quest.completed && <span className="text-green-400 text-xs">✓ Done</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="font-bold">🏅 Agent Leaderboard</h2>
            </div>
            <div className="p-4 text-center text-gray-500">
              <p className="text-2xl mb-2">👀</p>
              <p>Leaderboard loading... Connect wallet to see rankings.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
