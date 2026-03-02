'use client';

import { useState } from 'react';

export default function CommerceAgent() {
  const [messages, setMessages] = useState<{ role: 'user' | 'agent' | 'system'; text: string }[]>([
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

    // Simulate Agentic Commerce Flow
    setTimeout(() => {
      setMessages((prev) => [...prev, { 
        role: 'system', 
        text: `[UCP] Discovering providers for intent: "${userText}"... Found 2 compatible providers.` 
      }]);
    }, 1000);

    setTimeout(() => {
      setMessages((prev) => [...prev, { 
        role: 'system', 
        text: `[x402] Provider API is paywalled. Executing atomic micropayment of 0.005 EGLD... Finalized in 280ms (Supernova).` 
      }]);
    }, 2500);

    setTimeout(() => {
      setMessages((prev) => [...prev, { 
        role: 'system', 
        text: `[ACP] Checkout session built. Generating smart contract transaction payload...` 
      }]);
    }, 4000);

    setTimeout(() => {
      setMessages((prev) => [...prev, { 
        role: 'agent', 
        text: `I've found the best option for you and prepared the checkout. Please sign the MultiversX transaction to confirm your order. You will earn +500 XP for this quest!` 
      }]);
      setIsTyping(false);
    }, 5500);
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2">
          <span>🤖</span> Agent Interface
        </h2>
        <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded-full">Online</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-gray-800 text-gray-300 font-mono text-xs border border-gray-700'
                  : 'bg-gray-700 text-white'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white max-w-[80%] rounded-xl px-4 py-2 text-sm animate-pulse">
              Agent is thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            placeholder="Type your commerce intent..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
