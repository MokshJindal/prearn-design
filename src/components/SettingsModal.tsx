import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { 
  getStoredApiKey, 
  setStoredApiKey, 
  getStoredModel, 
  setStoredModel, 
  AVAILABLE_MODELS, 
  callClaudeApi 
} from '../services/claude';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [model, setModel] = useState(getStoredModel());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setStoredModel(model);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key to test.' });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      const reply = await callClaudeApi(
        'Respond with the exact word: "READY"',
        'You are a connection diagnostic assistant.',
        apiKey,
        model
      );

      if (reply.includes('READY')) {
        setTestResult({
          success: true,
          message: `Connection successful! ${model} responded verified.`,
        });
        setStoredApiKey(apiKey);
      } else {
        setTestResult({
          success: true,
          message: `Received response from Claude: ${reply.slice(0, 60)}...`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection failed. Please check your API key and permissions.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#181716] border border-white/10 rounded-2xl shadow-2xl p-6 text-neutral-200 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Anthropic Claude API Settings</h3>
              <p className="text-xs text-neutral-400">Bring Your Own Key (BYOK) Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 my-5 text-xs">
          {/* API Key Input */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">
              Anthropic API Key (sk-ant-...)
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Your key is stored securely in your browser's local storage and used directly for Anthropic API calls.</span>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">
              Default Claude Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-brand-500 font-sans"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.description}
                </option>
              ))}
            </select>
          </div>

          {/* Diagnostic Test Button */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={testing || !apiKey}
              className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-200 font-medium text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  <span>Testing API Key...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>Test Connection with Anthropic</span>
                </>
              )}
            </button>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">{testResult.message}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-emerald-400 font-medium">
            {savedSuccess ? '✓ Settings saved!' : ''}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs shadow-glow transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
