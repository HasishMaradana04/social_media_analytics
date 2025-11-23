import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart2, BrainCircuit, Hash, Menu, X, Bell, Link as LinkIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`
    }
  >
    {icon}
    <span className="font-medium">{label}</span>
  </NavLink>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-2 px-2 mb-8 mt-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
               <BarChart2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">SocialPulse</h1>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem to="/" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
            <NavItem to="/posts" icon={<Hash className="w-5 h-5" />} label="Post Explorer" onClick={() => setIsMobileMenuOpen(false)} />
            <NavItem to="/competitors" icon={<Users className="w-5 h-5" />} label="Competitors" onClick={() => setIsMobileMenuOpen(false)} />
            <NavItem to="/ai-insights" icon={<BrainCircuit className="w-5 h-5" />} label="AI Insights" onClick={() => setIsMobileMenuOpen(false)} />
            <NavItem to="/connect" icon={<LinkIcon className="w-5 h-5" />} label="Connections" onClick={() => setIsMobileMenuOpen(false)} />
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-800">
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-colors mb-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            <div className="px-4 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                  {user?.avatar ? <img src={user.avatar} alt="User" className="w-full h-full object-cover"/> : 'JD'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user?.fullName || 'Guest'}</p>
                  <p className="text-xs text-slate-400 truncate">Pro Plan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur z-40">
            <button 
                className="md:hidden text-slate-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            
            <div className="flex items-center gap-4 ml-auto">
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-slate-900"></span>
                </button>
            </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
