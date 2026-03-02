'use client';
import { useState, useEffect, useRef } from 'react';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { Bot, Send, User, ChevronRight, Activity, ShieldCheck, Zap, Settings } from 'lucide-react';
import AgentSettings, { useAgentConfig } from './AgentSettings';

export default function CommerceAgent() {
  const { address } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { config: agentConfig } = useAgentConfig();
  const [showSettings, setShowSettings] = useState(false);

  const [messages, setMessages] = useState<{ role: 'user' | 'agent' | 'system'; text: string; payload?: any }>([
    { role: 'agent', text: 'Hello! I am your SYNDICATE Commerce Agent. Ready to orchestrate transactions.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          userAddress: address,
          agentConfig: agentConfig
        })
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.error) {
        setMessages((prev) => [...prev, { role: 'system', text: `Error: ${data.error}` }]);
        return;
      }
      if (data.traces?.length) {
        setMessages((prev) => [...prev, { role: 'system', text: data.traces.join('\n') }]);
      }
      setMessages((prev) => [...prev, { role: 'agent', text: data.reply, payload: data.transaction }]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: 'system', text: 'Network error. Please try again.' }]);
    }
  };

  const handleSign = async (payload: any) => {
    try {
      await sendTransactions({
        transactions: [{
          receiver: payload.receiver,
          data: payload.data,
          gasLimit: parseInt(payload.gasLimit),
          value: payload.value
        }],
        transactionsDisplayInfo: { transactionDuration: 10000, successMessage: 'Transaction sent!', errorMessage: 'Transaction failed.' }
      });
    } catch {
      setMessages((prev) => [...prev, { role: 'system', text: 'Transaction signing failed or was cancelled.' }]);
    }
  };

  const modelShortName = agentConfig.model.split('/').pop()?.replace(':free', '') || 'llama-3.3-70b';

  return (
    <>
      {showSettings && <AgentSettings onClose={() => setShowSettings(false)} />}
      <div className="flex flex-col h-full bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">SYNDICATE Agent</div>
              <div className="text-xs text-zinc-500">{modelShortName} · {agentConfig.provider}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-green-400' : 'bg-zinc-600'}`} />
            <span className="text-xs text-zinc-500">{isLoggedIn ? 'Connected' : 'Not connected'}</span>
            <button
              onClick={() => setShowSettings(true)}
              className="ml-2 p-1.5 rounded-lg text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 transition-all"
              title="Agent Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}>
              {msg.role !== 'user' && (
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                  msg.role === 'agent' ? 'bg-purple-600/20 border border-purple-500/30' : 'bg-zinc-800 border border-zinc-700'
                }`}>
                  {msg.role === 'agent' ? <Bot className="w-3.5 h-3.5 text-purple-400" /> : <Activity className="w-3.5 h-3.5 text-zinc-400" />}
                </div>
              )}
              <div className={`max-w-[80%] space-y-2`}>
                <div className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : msg.role === 'agent'
                    ? 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700'
                    : 'bg-zinc-900 text-zinc-400 font-mono text-xs border border-zinc-800'
                }`}>
                  {msg.text}
                </div>
                {msg.payload && (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-yellow-400 font-semibold">
                      <Zap className="w-3.5 h-3.5" /> Transaction Ready
                    </div>
                    <div className="space-y-1 font-mono text-xs text-zinc-400">
                      <div><span className="text-zinc-600">To: </span>{msg.payload.receiver?.slice(0, 20)}...</div>
                      <div><span className="text-zinc-600">Gas: </span>{msg.payload.gasLimit}</div>
                      <div><span className="text-zinc-600">Value: </span>{msg.payload.value} wei</div>
                    </div>
                    <button
                      onClick={() => handleSign(msg.payload)}
                      disabled={!isLoggedIn}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Sign & Execute
                    </button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-zinc-700 border border-zinc-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-zinc-300" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl rounded-bl-none px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900">
          {!isLoggedIn && (
            <div className="mb-2 flex items-center gap-2 text-xs text-yellow-500/80 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Connect your wallet to sign transactions
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isLoggedIn ? 'Ask SYNDICATE anything... (swap, quest, negotiate)' : 'Connect wallet to interact...'}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {['Swap 0.1 EGLD', 'Accept quest', 'Negotiate discount'].map(s => (
              <button key={s} onClick={() => setInput(s)}
                className="text-xs px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />{s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
