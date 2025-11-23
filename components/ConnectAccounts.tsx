import React, { useEffect, useState } from 'react';
import { api, ConnectedAccount } from '../services/api';
import { Check, Link as LinkIcon, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';

const ConnectAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Input states for form modal
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [handleInput, setHandleInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await api.getConnectedAccounts();
      setAccounts(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load connected accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    if (!handleInput) return;
    setProcessing(platform);
    setModalError(null);
    
    try {
      await api.connectAccount(platform, handleInput);
      await loadAccounts();
      setActiveModal(null);
      setHandleInput('');
    } catch (e: any) {
      console.error(e);
      setModalError(e.message || "Failed to connect account. Please check your credentials.");
    } finally {
      setProcessing(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!window.confirm(`Are you sure you want to disconnect ${platform}? Data associated with this account will be removed.`)) return;
    setProcessing(platform);
    setError(null);
    try {
      await api.disconnectAccount(platform);
      await loadAccounts();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to disconnect account");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500 w-8 h-8"/></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Connect Accounts</h1>
          <p className="text-slate-400">Add your accounts via ID/Handle to start tracking live metrics.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.platform} className={`bg-slate-800 rounded-xl border ${account.connected ? 'border-emerald-500/30' : 'border-slate-700'} p-6 transition-all`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-full p-2 flex items-center justify-center border border-slate-700">
                  {account.platform === 'Kindle' ? (
                     <span className="text-xl font-bold text-orange-500">K</span>
                  ) : (
                    <img src={
                        account.platform === 'Twitter' ? 'https://cdn-icons-png.flaticon.com/512/733/733579.png' :
                        account.platform === 'LinkedIn' ? 'https://cdn-icons-png.flaticon.com/512/174/174857.png' :
                        account.platform === 'YouTube' ? 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' :
                        account.platform === 'Instagram' ? 'https://cdn-icons-png.flaticon.com/512/174/174855.png' :
                        ''
                    } alt={account.platform} className="w-full h-full object-contain" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{account.platform}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${account.connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {account.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {account.connected ? (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Connected ID:</p>
                  <p className="text-white font-mono bg-slate-900/50 px-3 py-1.5 rounded border border-slate-700/50 truncate">
                    @{account.handle}
                  </p>
                </div>
              ) : (
                 <p className="text-sm text-slate-500 h-[52px]">Enter your ID to sync {account.platform} data.</p>
              )}

              <div className="pt-2">
                {account.connected ? (
                  <button 
                    onClick={() => handleDisconnect(account.platform)}
                    disabled={!!processing}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
                  >
                    {processing === account.platform ? <Loader2 className="animate-spin w-4 h-4"/> : <Trash2 className="w-4 h-4" />}
                    Disconnect
                  </button>
                ) : (
                  <button 
                    onClick={() => { setActiveModal(account.platform); setModalError(null); }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Connect {account.platform}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 border border-slate-700 shadow-2xl animate-fade-in-up">
            <h3 className="text-lg font-bold text-white mb-4">Connect {activeModal}</h3>
            <p className="text-slate-400 text-sm mb-4">
                {activeModal === 'Kindle' 
                    ? "Enter your KDP Author ID or Book ASIN to track sales rank and reviews." 
                    : "Enter your user handle (e.g. @username) to fetch latest posts and engagement metrics."}
            </p>
            
            {modalError && (
                <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{modalError}</span>
                </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {activeModal === 'Kindle' ? 'Author ID / ASIN' : 'Username / Handle'}
              </label>
              <div className="flex">
                {activeModal !== 'Kindle' && (
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-600 bg-slate-700 text-slate-400 text-sm">
                    @
                    </span>
                )}
                <input 
                  type="text" 
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  className={`flex-1 block w-full bg-slate-900 border-slate-600 text-white focus:ring-indigo-500 focus:border-indigo-500 p-2.5 ${activeModal !== 'Kindle' ? 'rounded-r-lg rounded-l-none' : 'rounded-lg'}`}
                  placeholder={activeModal === 'Kindle' ? 'B08...' : 'username'}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setActiveModal(null); setHandleInput(''); setModalError(null); }}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleConnect(activeModal)}
                disabled={!handleInput || !!processing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {processing === activeModal ? <Loader2 className="animate-spin w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                Sync Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectAccounts;