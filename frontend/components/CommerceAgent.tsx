'use client';

import { useState } from 'react';
import { useGetAccountInfo, useGetIsLoggedIn } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';

export default function CommerceAgent() {
  const { address } = useGetAccountInfo();
  const isLoggedIn = useGetIsLoggedIn();
  
  const [messages, setMessages] = useState<{ role: 'user' | 'agent' | 'system'; text: string; payload?: any }[]>([
    { role: 'agent', text: 'Hello! I am your SYNDICATE Commerce Agent. What would you like to purchase or research today? (e.g., "Find me the best AI server hosting and book it")' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      // In a real prod app, this calls the Next.js API route which runs the Node Agent
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, userAddress: address })
      });

      const data = await response.json();

      // Display system traces
      if (data.traces && data.traces.length > 0) {
        data.traces.forEach((trace: string, i: number) => {
          setTimeout(() => {
            setMessages((prev) => [...prev, { role: 'system', text: trace }]);
          }, i * 1000);
        });
      }

      // Display final agent response and Tx payload if present
      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          role: 'agent', 
          text: data.reply,
          payload: data.transaction
        }]);
        setIsTyping(false);
      }, (data.traces?.length || 0) * 1000 + 1000);

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
      const sessionId = await sendTransactions({
        transactions: [
          {
            value: txData.value || "0",
            data: txData.data,
            receiver: txData.receiver,
            gasLimit: parseInt(txData.gasLimit) || 10000000
          }
        ],
        transactionsDisplayInfo: {
          processingMessage: 'Processing Agentic Commerce Transaction',
          errorMessage: 'An error has occurred during transaction execution',
          successMessage: 'Transaction successful! Agent XP awarded.',
        },
        redirectAfterSign: false,
      });
      console.log("Transaction session ID:", sessionId);
    } catch (err) {
      console.error("Sign tx error:", err);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2">
          <span>🤖</span> Agent Interface
        </h2>
        <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-gray-800 text-gray-300 font-mono text-xs border border-gray-700'
                  : 'bg-gray-700 text-white shadow-lg'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {/* Actionable Transaction Box inside Agent message */}
              {msg.payload && (
                <div className="mt-3 p-3 bg-gray-800 border border-gray-600 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2 font-mono">Prepared Transaction</p>
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-xs bg-gray-900 p-1.5 rounded text-blue-300 truncate max-w-[200px]">
                      {msg.payload.data}
                    </code>
                    <button 
                      onClick={() => signTransaction(msg.payload)}
                      className="bg-blue-500 hover:bg-blue-400 text-white text-xs px-3 py-1.5 rounded shadow transition-colors font-bold whitespace-nowrap"
                    >
                      Sign & Execute
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white max-w-[80%] rounded-xl px-4 py-2 text-sm animate-pulse flex gap-1 items-center">
              <span>Agent is thinking</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <div className="flex gap-2 relative">
          <input
            type="text"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder={isLoggedIn ? "Type your commerce intent..." : "Please connect your wallet first..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping || !isLoggedIn}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim() || !isLoggedIn}
            className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:text-gray-400 text-white p-1.5 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
