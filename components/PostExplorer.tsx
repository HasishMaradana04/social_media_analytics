import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { analyzeSentiment } from '../services/geminiService';
import { api } from '../services/api';
import { MessageSquare, Heart, Share2, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [sentiment, setSentiment] = useState<string | null>(post.sentiment || null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeSentiment(post.content);
    setSentiment(result);
    setAnalyzing(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full hover:border-indigo-500/50 transition-colors">
      {post.mediaUrl && (
        <div className="h-48 w-full bg-slate-900 relative">
          <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white uppercase font-bold">
            {post.mediaType}
          </div>
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs text-slate-400">{post.timestamp}</span>
        </div>
        <p className="text-slate-200 text-sm mb-4 flex-1">{post.content}</p>
        
        {sentiment && (
            <div className={`mb-4 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between
                ${sentiment.toLowerCase().includes('positive') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  sentiment.toLowerCase().includes('negative') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                <span>AI Sentiment: {sentiment}</span>
            </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex gap-4 text-slate-400 text-sm">
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {post.likes}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {post.comments}</span>
            <span className="flex items-center gap-1"><Share2 className="w-4 h-4" /> {post.shares}</span>
          </div>
          
          <button 
            onClick={handleAnalyze}
            disabled={analyzing || !!sentiment}
            className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {sentiment ? 'Analyzed' : 'Analyze'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PostExplorer: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (e: any) {
      console.error("Failed to fetch posts", e);
      setError(e.message || "Failed to retrieve posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading && posts.length === 0) return (
    <div className="p-10 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p>Loading Posts...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Post Explorer</h1>
          <p className="text-slate-400">View performance and analyze sentiment across platforms.</p>
        </div>
        <button 
            onClick={fetchPosts} 
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            title="Refresh"
        >
            <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
                <p className="font-medium">Error loading posts</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
            <button 
                onClick={fetchPosts} 
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-xs font-medium transition-colors"
            >
                Retry
            </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 ? (
        <div className="p-10 text-center bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-slate-300">No posts found from connected accounts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostExplorer;