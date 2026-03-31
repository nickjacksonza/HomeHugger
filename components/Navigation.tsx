import React from 'react';
import { Home, Grid, Box, Sparkles, BarChart3, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItemClass = (active: boolean) => 
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
      active 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView({ type: 'DASHBOARD' })}>
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Home className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 hidden md:block">HomeInventory<span className="text-indigo-600">AI</span></h1>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setView({ type: 'DASHBOARD' })}
            className={navItemClass(currentView.type === 'DASHBOARD' || currentView.type === 'ROOM_DETAIL')}
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Rooms</span>
          </button>
          
          <button 
            onClick={() => setView({ type: 'ALL_ITEMS' })}
            className={navItemClass(currentView.type === 'ALL_ITEMS')}
          >
            <Box className="w-4 h-4" />
            <span className="hidden sm:inline">Items</span>
          </button>

          <button 
            onClick={() => setView({ type: 'PROJECTS' })}
            className={navItemClass(currentView.type === 'PROJECTS' || currentView.type === 'PROJECT_DETAIL')}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Projects</span>
          </button>

          <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>

          <button 
            onClick={() => setView({ type: 'REPORTS' })}
            className={navItemClass(currentView.type === 'REPORTS')}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Reports</span>
          </button>

          <button 
            onClick={() => setView({ type: 'SETTINGS' })}
            className={navItemClass(currentView.type === 'SETTINGS')}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
};