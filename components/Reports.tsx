
import React, { useState, useMemo } from 'react';
import { Item, Room, Project, CATEGORIES, UserPreferences, getCurrencySymbol } from '../types';
import { Download, Filter, FileSpreadsheet, DollarSign, Package } from 'lucide-react';

interface ReportsProps {
  items: Item[];
  rooms: Room[];
  projects: Project[];
  preferences: UserPreferences;
}

export const Reports: React.FC<ReportsProps> = ({ items, rooms, projects, preferences }) => {
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'contents'>('all');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchRoom = filterRoom === 'all' || item.roomId === filterRoom;
      const matchCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchProject = filterProject === 'all' || item.projectIds.includes(filterProject);
      
      let matchType = true;
      if (filterType === 'fixed') matchType = item.isFixed === true;
      if (filterType === 'contents') matchType = !item.isFixed;

      return matchRoom && matchCategory && matchProject && matchType;
    });
  }, [items, filterRoom, filterCategory, filterProject, filterType]);

  const totalValue = filteredItems.reduce((sum, item) => sum + (item.value || 0), 0);
  const currencySymbol = getCurrencySymbol(preferences.currency);

  const handleExportCSV = () => {
    // Extended CSV Headers
    const headers = ['Brand', 'Name', 'Model', 'Type', 'Category', 'Insurance Type', 'Room', 'Projects', 'Description', 'Notes', `Value (${preferences.currency})`, 'Purchase Date'];
    
    const csvContent = [
      headers.join(','),
      ...filteredItems.map(item => {
        const roomName = rooms.find(r => r.id === item.roomId)?.name || 'Unknown Room';
        const projectNames = projects
          .filter(p => item.projectIds.includes(p.id))
          .map(p => p.name)
          .join('; ');
        
        // Helper to escape CSV fields
        const esc = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;

        return [
          esc(item.brand),
          esc(item.name),
          esc(item.model),
          esc(item.type),
          esc(item.category),
          item.isFixed ? "Fixed (Building)" : "Contents",
          esc(roomName),
          esc(projectNames),
          esc(item.description),
          esc(item.notes),
          item.value || 0,
          esc(item.purchaseDate)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derive dynamic categories for filter
  const availableCategories = useMemo(() => {
    const cats = new Set([...CATEGORIES, ...items.map(i => i.category)]);
    return Array.from(cats).sort();
  }, [items]);

  return (
    <div className="max-w-7xl mx-auto px-4 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Export</h2>
          <p className="text-slate-500">Generate insights and export your inventory data.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={filteredItems.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Items</p>
            <h3 className="text-3xl font-bold text-slate-800">{filteredItems.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Package className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Value</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {currencySymbol}{totalValue.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{preferences.currency}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          >
            <option value="all">All Types</option>
            <option value="contents">Contents (Moveable)</option>
            <option value="fixed">Fixtures (Fixed)</option>
          </select>

          <select 
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          >
            <option value="all">All Rooms</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          >
            <option value="all">All Categories</option>
            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          >
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-700">Item Name</th>
                <th className="px-6 py-3 font-semibold text-slate-700">Brand / Model</th>
                <th className="px-6 py-3 font-semibold text-slate-700">Type</th>
                <th className="px-6 py-3 font-semibold text-slate-700">Category</th>
                <th className="px-6 py-3 font-semibold text-slate-700">Room</th>
                <th className="px-6 py-3 font-semibold text-slate-700">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.name}
                      {item.type && <div className="text-xs text-slate-500">{item.type}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-medium text-slate-800">{item.brand || '-'}</div>
                      <div className="text-xs">{item.model}</div>
                    </td>
                     <td className="px-6 py-4 text-slate-600">
                      <span className={`px-2 py-1 rounded-full text-xs border ${item.isFixed ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        {item.isFixed ? 'Fixed' : 'Contents'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {rooms.find(r => r.id === item.roomId)?.name}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">
                      {item.value ? `${currencySymbol}${item.value}` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No items match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
