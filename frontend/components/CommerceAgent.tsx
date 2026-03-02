'use client';

import { useState, useEffect, useRef } from 'react';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { Bot, Send, User, ChevronRight, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function CommerceAgent() {
  const { address } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'agent' | 'system'; text: string; payload?: any }[]>([
    { role: 'agent', text: 'Hello! I am your SYNDICATE Commerce Agent. Ready to orchestrate transactions.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, userAddress: address })
      });

      const data = await response.json();

      if (data.traces && data.traces.length > 0) {
        data.traces.forEach((trace: string, i: number) => {
          setTimeout(() => {
            setMessages((prev) => [...prev, { role: 'system', text: trace }]);
          }, i * 800);
        });
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          role: 'agent', 
          text: data.reply,
          payload: data.transaction
        }]);
        setIsTyping(false);
      }, (data.traces?.length || 0) * 800 + 800);

    } catch (error) {
      setMessages((prev) => [...prev, { role: 'system', text: '[Error] Failed to connect to Agent Orchestrator.' }]);
      setIsTyping(false);
    }
  };

  const signTransaction = async (txData: any) => {
    if (!isLoggedIn) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      await sendTransactions({
        transactions: [{
          value: txData.value || "0",
          data: txData.data,
          receiver: txData.receiver,
          gasLimit: parseInt(txData.gasLimit) || 10000000
        }],
        transactionsDisplayInfo: {
          processingMessage: 'Processing Agentic Commerce Transaction',
          errorMessage: 'An error has occurred',
          successMessage: 'Transaction successful!',
        },
        redirectAfterSign: false,
      });
    } catch (err) {
      console.error("Sign tx error:", err);
    }
  };

  return (
    <div className="flex flex-col h-[750px] bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100 text-lg">SYNDICATE Orchestrator</h2>
            <p className="text-xs text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-green-500" /> 
              Secured Connection
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300">System Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              {msg.role !== 'system' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-zinc-800' : 'bg-blue-600/20 border border-blue-500/30'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-blue-400" />}
                </div>
              )}

              {/* Message Bubble */}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-zinc-100 text-zinc-900 rounded-tr-sm'
                      : msg.role === 'system'
                      ? 'bg-zinc-900 text-zinc-400 font-mono text-xs border border-zinc-800 rounded-xl flex items-center gap-2'
                      : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'system' && <ChevronRight className="w-3 h-3 text-zinc-500" />}
                  <span className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</span>
                </div>

                {/* Transaction Payload Card */}
                {msg.payload && (
                  <div className="mt-2 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                      <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" /> Action Required
                      </span>
                    </div>
                    <div className="p-4 space-y-3 font-mono text-xs text-zinc-300">
                      <div className="grid grid-cols-4 gap-2">
                        <span className="text-zinc-500 col-span-1">To:</span> 
                        <span className="col-span-3 truncate text-blue-400">{msg.payload.receiver}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <span className="text-zinc-500 col-span-1">Data:</span> 
                        <span className="col-span-3 truncate">{msg.payload.data}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <span className="text-zinc-500 col-span-1">Value:</span> 
                        <span className="col-span-3">{msg.payload.value} wei</span>
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-950 border-t border-zinc-800">
                      <button 
                        onClick={() => signTransaction(msg.payload)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        Sign & Execute
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-4 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-xl focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            placeholder={isLoggedIn ? "Message SYNDICATE Agent..." : "Connect wallet to interact..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping || !isLoggedIn}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim() || !isLoggedIn}
            className="mr-2 p-2 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {!isLoggedIn && (
          <p className="text-center text-xs text-zinc-500 mt-3">
            Authentication required to orchestrate tasks.
          </p>
        )}
      </div>
    </div>
  );
}