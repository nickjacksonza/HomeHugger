
import React, { useState } from 'react';
import { Room, Item, Project, UserPreferences, formatRoomDimensions } from '../types';
import { ItemCard } from './ItemCard';
import { ArrowLeft, Plus, Zap, Move, Building2, Package } from 'lucide-react';
import { suggestRoomItems } from '../services/geminiService';

interface RoomDetailProps {
  room: Room;
  items: Item[];
  rooms: Room[];
  projects: Project[];
  preferences: UserPreferences;
  onBack: () => void;
  onAddItem: (roomId: string, suggestion?: string) => void;
  onEditItem: (item: Item) => void;
  onUpdateItem: (item: Item) => void;
  onNavigate: (roomId: string) => void;
  onEditRoom: (room: Room) => void;
}

export const RoomDetail: React.FC<RoomDetailProps> = ({ 
  room, items, rooms, projects, preferences, onBack, onAddItem, onEditItem, onUpdateItem, onNavigate, onEditRoom
}) => {
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const linkedRooms = rooms.filter(r => room.linkedRoomIds.includes(r.id));
  const dimensionsDisplay = formatRoomDimensions(room, preferences.units);

  const fixtures = items.filter(i => i.isFixed);
  const contents = items.filter(i => !i.isFixed);
  
  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const items = await suggestRoomItems(room.name, room.description);
      setSuggestions(items);
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 animate-fadeIn">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{room.name}</h2>
            <div className="text-sm font-medium text-slate-500 mb-4">{dimensionsDisplay}</div>
            <p className="text-slate-600 text-sm mb-6">{room.description}</p>
            <button 
              onClick={() => onEditRoom(room)}
              className="w-full py-2 px-4 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors"
            >
              Edit Room Details
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Move className="w-4 h-4" /> Connected Rooms
            </h3>
            {linkedRooms.length > 0 ? (
              <div className="space-y-2">
                {linkedRooms.map(lr => (
                  <button
                    key={lr.id}
                    onClick={() => onNavigate(lr.id)}
                    className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors text-sm font-medium border border-slate-100 hover:border-indigo-200"
                  >
                    Go to {lr.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No linked rooms.</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Room Inventory</h3>
            <div className="flex gap-2">
               <button 
                onClick={handleSuggest}
                disabled={suggesting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors"
              >
                <Zap className={`w-4 h-4 ${suggesting ? 'animate-spin' : ''}`} />
                {suggesting ? 'Thinking...' : 'AI Suggest Items'}
              </button>
              <button 
                onClick={() => onAddItem(room.id)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Gemini Suggestions
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onAddItem(room.id, s);
                      setSuggestions(prev => prev.filter(i => i !== s));
                    }}
                    className="px-3 py-1 bg-white text-indigo-700 text-xs font-medium rounded-full border border-indigo-200 hover:border-indigo-400 hover:shadow-sm transition-all"
                  >
                    + {s}
                  </button>
                ))}
                <button 
                  onClick={() => setSuggestions([])}
                  className="px-3 py-1 text-indigo-400 hover:text-indigo-700 text-xs"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Fixtures Section */}
          {(fixtures.length > 0 || contents.length === 0) && (
            <div className="mb-8">
               <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Fixtures & Fittings (Building)
                  <span className="text-xs font-normal text-slate-400 ml-2">({fixtures.length})</span>
               </h4>
               {fixtures.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {fixtures.map(item => (
                     <ItemCard 
                       key={item.id} 
                       item={item} 
                       projects={projects}
                       preferences={preferences}
                       onEdit={onEditItem}
                       onUpdate={onUpdateItem}
                     />
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-lg border border-slate-100 border-dashed">
                   No fixed items added yet (e.g., built-in wardrobes, fitted kitchen).
                 </p>
               )}
            </div>
          )}

          {/* Contents Section */}
          <div>
               <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Room Contents (Moveable)
                  <span className="text-xs font-normal text-slate-400 ml-2">({contents.length})</span>
               </h4>
               {contents.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {contents.map(item => (
                     <ItemCard 
                       key={item.id} 
                       item={item} 
                       projects={projects}
                       preferences={preferences}
                       onEdit={onEditItem}
                       onUpdate={onUpdateItem}
                     />
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-lg border border-slate-100 border-dashed">
                   No moveable contents added yet.
                 </p>
               )}
          </div>

        </div>
      </div>
    </div>
  );
};
