'use client';

import { useState, useEffect, useRef } from 'react';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';

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
    <div className="flex flex-col h-[700px] bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>

      <div className="px-6 py-5 border-b border-white/10 bg-white/5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 p-[1px]">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-lg">🤖</div>
          </div>
          <div>
            <h2 className="font-bold text-white leading-tight">Orchestrator Terminal</h2>
            <p className="text-xs text-white/50">UCP / ACP / x402 Stack</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div> 
          <span className="text-xs font-bold text-green-400 tracking-wide">ACTIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-white text-black rounded-2xl rounded-tr-sm px-5 py-3 shadow-lg'
                  : msg.role === 'system'
                  ? 'bg-black/60 text-blue-300 font-mono text-xs border border-white/5 rounded-xl px-4 py-2'
                  : 'bg-[#1A1D24] text-white border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl'
              }`}
            >
              {msg.role === 'system' && <span className="text-white/30 mr-2">&gt;</span>}
              <span className="whitespace-pre-wrap leading-relaxed">{msg.text}</span>
              
              {msg.payload && (
                <div className="mt-4 p-4 bg-black/50 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">Tx Payload</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/20">Ready for Sign</span>
                  </div>
                  
                  <div className="space-y-2 font-mono text-xs text-white/70 mb-4 bg-black/50 p-3 rounded-lg border border-white/5">
                    <div className="flex"><span className="w-16 text-white/40">To:</span> <span className="truncate text-blue-300">{msg.payload.receiver}</span></div>
                    <div className="flex"><span className="w-16 text-white/40">Data:</span> <span className="truncate text-yellow-300">{msg.payload.data}</span></div>
                    <div className="flex"><span className="w-16 text-white/40">Value:</span> <span>{msg.payload.value} wei</span></div>
                  </div>
                  
                  <button 
                    onClick={() => signTransaction(msg.payload)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Sign & Execute on MultiversX
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1A1D24] text-white border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-2 items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md z-10">
        <div className="relative group">
          {/* Input Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
          
          <div className="relative flex items-center bg-black border border-white/10 rounded-xl overflow-hidden">
            <input
              type="text"
              className="flex-1 bg-transparent px-5 py-4 text-sm text-white placeholder-white/30 focus:outline-none"
              placeholder={isLoggedIn ? "Instruct the agent (e.g. 'Accept research quest')..." : "Connect xPortal wallet to interact..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping || !isLoggedIn}
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim() || !isLoggedIn}
              className="mr-2 bg-white text-black disabled:bg-white/10 disabled:text-white/30 p-2.5 rounded-lg transition-transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}