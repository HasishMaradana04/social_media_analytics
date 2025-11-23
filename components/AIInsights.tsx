import React, { useState } from 'react';
import { generateContentStrategy, predictViralScore } from '../services/geminiService';
import { BrainCircuit, Lightbulb, Target, ArrowRight, Loader2, BarChart2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIInsights: React.FC = () => {
  // Strategy State
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [strategyResult, setStrategyResult] = useState('');
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  // Viral Prediction State
  const [postDraft, setPostDraft] = useState('');
  const [prediction, setPrediction] = useState<{ score: number; reasoning: string } | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const handleGenerateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setStrategyLoading(true);
    setStrategyError(null);
    try {
      const result = await generateContentStrategy(topic, platform);
      setStrategyResult(result);
    } catch (err: any) {
      setStrategyError(err.message || "Failed to generate strategy");
    } finally {
      setStrategyLoading(false);
    }
  };

  const handlePredictViral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postDraft) return;
    setPredictionLoading(true);
    setPredictionError(null);
    try {
      const result = await predictViralScore(postDraft);
      setPrediction(result);
    } catch (err: any) {
      setPredictionError(err.message || "Failed to predict viral score");
    } finally {
      setPredictionLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="text-indigo-500" /> AI Insights Lab
        </h1>
        <p className="text-slate-400">Leverage Gemini 2.5 Flash Lite for quick tasks and Gemini 3.0 Pro for deep reasoning.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Strategy Generator */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Strategy Generator</h2>
              <p className="text-xs text-slate-400">Deep reasoning with Gemini 3 Pro</p>
            </div>
          </div>

          <form onSubmit={handleGenerateStrategy} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Topic / Niche</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Sustainable Fashion, Keto Diet..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Platform</label>
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option>Instagram</option>
                <option>Twitter / X</option>
                <option>LinkedIn</option>
                <option>TikTok</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={strategyLoading || !topic}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {strategyLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
              Generate Strategy
            </button>
          </form>

          {strategyError && (
             <div className="mt-auto mb-4 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-start gap-2 text-rose-400 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{strategyError}</p>
             </div>
          )}

          {strategyResult && !strategyError && (
            <div className="mt-auto bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">AI Suggestions:</h3>
              <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                {strategyResult}
              </div>
            </div>
          )}
        </div>

        {/* Viral Prediction Model */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-pink-500/10 rounded-lg text-pink-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Viral Predictor</h2>
              <p className="text-xs text-slate-400">Predict post success before publishing</p>
            </div>
          </div>

          <form onSubmit={handlePredictViral} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Draft Post Content</label>
              <textarea 
                value={postDraft}
                onChange={(e) => setPostDraft(e.target.value)}
                rows={4}
                placeholder="Type your caption or post text here..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500 transition-colors resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={predictionLoading || !postDraft}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {predictionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
              Predict Impact
            </button>
          </form>

          {predictionError && (
             <div className="mt-auto mb-4 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-start gap-2 text-rose-400 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{predictionError}</p>
             </div>
          )}

          {prediction && !predictionError && (
            <div className="mt-auto">
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">{prediction.score}</span>
                    <span className="text-sm text-slate-400 mb-1">/ 100 Viral Score</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full mb-4 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                            prediction.score > 75 ? 'bg-emerald-500' : prediction.score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${prediction.score}%` }}
                    ></div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                    <h3 className="text-sm font-semibold text-pink-300 mb-1">Reasoning:</h3>
                    <p className="text-slate-300 text-sm">{prediction.reasoning}</p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple Icon component helper
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

export default AIInsights;