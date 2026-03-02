'use client';
import { useState, useEffect } from 'react';
import { Settings, X, Key, Cpu, Globe, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';

const FREE_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'Meta', badge: 'FREE' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1 24B', provider: 'Mistral', badge: 'FREE' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', provider: 'Google', badge: 'FREE' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'Nemotron Nano 12B', provider: 'NVIDIA', badge: 'FREE' },
  { id: 'qwen/qwen3-4b:free', name: 'Qwen3 4B', provider: 'Alibaba', badge: 'FREE' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', badge: 'PAID' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', badge: 'PAID' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', badge: 'PAID' },
];const PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', url: 'https://openrouter.ai/api/v1', placeholder: 'sk-or-v1-...' },
  { id: 'literouter', name: 'LiteRouter', url: 'https://api.literouter.com/v1', placeholder: 'cd53950c...' },
  { id: 'morpheus', name: 'Morpheus (MOR)', url: 'https://api.mor.org/api/v1', placeholder: 'mor_...' },
  { id: 'openai', name: 'OpenAI Direct', url: 'https://api.openai.com/v1', placeholder: 'sk-...' },
  { id: 'custom', name: 'Custom / LiteLLM', url: '', placeholder: 'http://localhost:4000/v1' },
const FREE_MODELS = [
  // OpenRouter FREE models
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'OpenRouter', badge: 'FREE' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1 24B', provider: 'OpenRouter', badge: 'FREE' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', provider: 'OpenRouter', badge: 'FREE' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'Nemotron Nano 12B', provider: 'OpenRouter', badge: 'FREE' },
  { id: 'qwen/qwen3-4b:free', name: 'Qwen3 4B', provider: 'OpenRouter', badge: 'FREE' },
  
  // Morpheus (MOR) — Top picks from free tier
  { id: 'glm-5', name: 'GLM-5 (Reasoning)', provider: 'Morpheus', badge: 'FREE' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Morpheus', badge: 'FREE' },
  { id: 'qwen3-next-80b', name: 'Qwen3 Next 80B', provider: 'Morpheus', badge: 'FREE' },
  { id: 'mistral-31-24b', name: 'Mistral 3.1 24B', provider: 'Morpheus', badge: 'FREE' },
  { id: 'glm-4.7-flash', name: 'GLM-4.7 Flash (Fast)', provider: 'Morpheus', badge: 'FREE' },
  { id: 'llama-3.2-3b', name: 'Llama 3.2 3B (Ultra Fast)', provider: 'Morpheus', badge: 'FREE' },
  
  // Paid models for comparison
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', badge: 'PAID' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', badge: 'PAID' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', badge: 'PAID' },
];}

const DEFAULT_CONFIG: AgentConfig = {
  apiKey: '',
  model: 'meta-llama/llama-3.3-70b-instruct:free',
  provider: 'openrouter',
  baseUrl: 'https://openrouter.ai/api/v1',
};

export const STORAGE_KEY = 'syndicate_agent_config';

export function useAgentConfig() {
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setConfig(JSON.parse(saved));
    } catch {}
  }, []);
  const saveConfig = (newConfig: AgentConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };
  return { config, saveConfig };
}

interface Props { onClose: () => void; }

export default function AgentSettings({ onClose }: Props) {
  const { config, saveConfig } = useAgentConfig();
  const [local, setLocal] = useState<AgentConfig>(config);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const selectedProvider = PROVIDERS.find(p => p.id === local.provider) || PROVIDERS[0];

  const handleProviderChange = (providerId: string) => {
    const p = PROVIDERS.find(x => x.id === providerId)!;
    setLocal(prev => ({ ...prev, provider: providerId, baseUrl: p.url }));
  };

  const handleSave = () => {
    saveConfig(local);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <span className="text-white font-semibold text-lg">Agent Configuration</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Globe className="w-4 h-4 text-blue-400" />Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map(p => (
                <button key={p.id} onClick={() => handleProviderChange(p.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    local.provider === p.id ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}>{p.name}</button>
              ))}
            </div>
            {local.provider === 'custom' && (
              <input type="text" value={local.baseUrl}
                onChange={e => setLocal(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder={selectedProvider.placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500" />
            )}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Key className="w-4 h-4 text-yellow-400" />API Key
              <span className="text-xs text-zinc-500">(stored locally only)</span>
            </label>
            <div className="relative">
              <input type={showKey ? 'text' : 'password'} value={local.apiKey}
                onChange={e => setLocal(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder={selectedProvider.placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono" />
              <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-zinc-600">Leave empty to use the server default key</p>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Cpu className="w-4 h-4 text-green-400" />Model
            </label>
            <div className="space-y-2">
              {FREE_MODELS.map(m => (
                <button key={m.id} onClick={() => setLocal(prev => ({ ...prev, model: m.id }))}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left ${
                    local.model === m.id ? 'bg-purple-900/40 border-purple-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}>
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">{m.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      m.badge === 'FREE' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                    }`}>{m.badge}</span>
                    <span className="text-xs text-zinc-600">{m.provider}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg transition-all">
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Config'}
          </button>
        </div>
      </div>
    </div>
  );
}
