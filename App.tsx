
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Room, Item, Project, ViewState, UserPreferences, CATEGORIES, CURRENCIES, getCurrencySymbol } from './types';
import { Navigation } from './components/Navigation';
import { RoomCard } from './components/RoomCard';
import { RoomDetail } from './components/RoomDetail';
import { ProjectView } from './components/ProjectView';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { RoomModal, ItemModal } from './components/Modals';
import { Plus } from 'lucide-react';
import { ItemCard } from './components/ItemCard';
import { Toast } from './components/Toast';

// Safe ID Generator
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substr(2, 9);
};

// Cookie Helpers
const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=31536000`; // 1 year
};

function App() {
  // State
  const [view, setView] = useState<ViewState>({ type: 'DASHBOARD' });
  const [showAutoSave, setShowAutoSave] = useState(false);
  const isFirstRender = useRef(true);
  
  // Data State with simple local storage persistence
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem('inventory_rooms');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem('inventory_items');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('inventory_projects');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // User Preferences State (loaded from Cookie or defaults)
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const savedCurrency = getCookie('inventory_currency');
    const savedUnits = getCookie('inventory_units');
    
    // Check if saved currency is a valid code, otherwise fallback or check if it was a symbol
    const validCodes = CURRENCIES.map(c => c.code);
    let currencyCode = 'USD';
    
    if (savedCurrency) {
        if (validCodes.includes(savedCurrency)) {
            currencyCode = savedCurrency;
        } else {
            // Attempt to find by symbol (legacy migration)
            const found = CURRENCIES.find(c => c.symbol === savedCurrency);
            if (found) currencyCode = found.code;
        }
    }

    return {
      currency: currencyCode,
      units: (savedUnits === 'metric' ? 'metric' : 'imperial')
    };
  });

  // Modal State
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(undefined);
  const [newItemSuggestion, setNewItemSuggestion] = useState<string | undefined>(undefined);

  // Persistence Effects with visual feedback
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    localStorage.setItem('inventory_rooms', JSON.stringify(rooms));
    localStorage.setItem('inventory_items', JSON.stringify(items));
    localStorage.setItem('inventory_projects', JSON.stringify(projects));
    
    setShowAutoSave(true);
  }, [rooms, items, projects]);

  // Derived state for autocomplete
  const existingBrands = useMemo(() => Array.from(new Set(items.map(i => i.brand).filter(Boolean))) as string[], [items]);
  const existingTypes = useMemo(() => Array.from(new Set(items.map(i => i.type).filter(Boolean))) as string[], [items]);
  const existingCategories = useMemo(() => {
    const usedCategories = new Set(items.map(i => i.category).filter(Boolean));
    // Merge with defaults
    CATEGORIES.forEach(c => usedCategories.add(c));
    return Array.from(usedCategories) as string[];
  }, [items]);

  // Handler for saving preferences
  const handleSavePreferences = (prefs: UserPreferences) => {
    setPreferences(prefs);
    setCookie('inventory_currency', prefs.currency);
    setCookie('inventory_units', prefs.units);
  };

  // Handlers for Data Management
  const handleExportData = () => {
    const data = {
      rooms,
      items,
      projects,
      exportDate: new Date().toISOString(),
      version: '1.1'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.rooms && Array.isArray(data.rooms)) setRooms(data.rooms);
        if (data.items && Array.isArray(data.items)) setItems(data.items);
        if (data.projects && Array.isArray(data.projects)) setProjects(data.projects);
        alert('Data restored successfully!');
      } catch (err) {
        alert('Failed to import data. Invalid file format.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleClearData = () => {
    setRooms([]);
    setItems([]);
    setProjects([]);
    localStorage.clear();
    alert('All data has been reset.');
  };

  // Handlers
  const handleAddRoom = (roomData: Omit<Room, 'id'> | Room) => {
    let newRoom: Room;
    let oldRoom: Room | undefined;

    // Identify if editing or creating
    if ('id' in roomData) {
      newRoom = roomData as Room;
      oldRoom = rooms.find(r => r.id === newRoom.id);
    } else {
      newRoom = { ...roomData, id: generateId() };
    }

    // Reciprocal Linking Logic
    const newLinkedIds = new Set(newRoom.linkedRoomIds);
    const oldLinkedIds = new Set(oldRoom ? oldRoom.linkedRoomIds : []);

    // Create the updated rooms array based on the current state
    let updatedRooms = rooms.map(r => {
      // If this is the room being updated, return the new data
      if (r.id === newRoom.id) return newRoom;

      const isLinkedNow = newLinkedIds.has(r.id);
      const wasLinkedBefore = oldLinkedIds.has(r.id);

      // Case A: Room is now linked to NewRoom, but wasn't (add reciprocal link)
      if (isLinkedNow && !r.linkedRoomIds.includes(newRoom.id)) {
        return { ...r, linkedRoomIds: [...r.linkedRoomIds, newRoom.id] };
      }
      
      // Case B: Room was linked to NewRoom, but link is removed in NewRoom (remove reciprocal link)
      if (!isLinkedNow && wasLinkedBefore && r.linkedRoomIds.includes(newRoom.id)) {
        return { ...r, linkedRoomIds: r.linkedRoomIds.filter(id => id !== newRoom.id) };
      }

      return r;
    });

    // If adding a new room, it wasn't in the map above, so append it
    if (!oldRoom) {
      updatedRooms = [...updatedRooms, newRoom];
    }

    setRooms(updatedRooms);
    setEditingRoom(undefined);
    setIsRoomModalOpen(false);
  };

  const handleAddItem = (itemData: Omit<Item, 'id'> | Item) => {
    if ('id' in itemData) {
      setItems(items.map(i => i.id === itemData.id ? itemData : i));
    } else {
      setItems([...items, { ...itemData, id: generateId() }]);
    }
    setEditingItem(undefined);
    setIsItemModalOpen(false);
    setNewItemSuggestion(undefined);
  };

  const handleAddProject = (projectData: Omit<Project, 'id'>) => {
    setProjects([...projects, { ...projectData, id: generateId() }]);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    // Clean up tags in items
    setItems(items.map(i => ({
      ...i,
      projectIds: i.projectIds.filter(pid => pid !== id)
    })));
  };

  // Render logic
  const renderContent = () => {
    switch (view.type) {
      case 'DASHBOARD':
        return (
          <div className="max-w-7xl mx-auto px-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Your Home</h2>
                <p className="text-slate-500 mt-1">Manage your inventory room by room.</p>
              </div>
              <button 
                onClick={() => { setEditingRoom(undefined); setIsRoomModalOpen(true); }}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
              >
                <Plus className="w-5 h-5" />
                Add Room
              </button>
            </div>

            {rooms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">No rooms yet</h3>
                <p className="text-slate-400 max-w-md mx-auto mt-2">Start by adding your first room (e.g., Living Room, Kitchen) to begin tracking your inventory.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    preferences={preferences}
                    itemCount={items.filter(i => i.roomId === room.id).length}
                    onClick={() => setView({ type: 'ROOM_DETAIL', roomId: room.id })}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'ROOM_DETAIL':
        const room = rooms.find(r => r.id === view.roomId);
        if (!room) return <div>Room not found</div>;
        return (
          <RoomDetail 
            room={room}
            items={items.filter(i => i.roomId === room.id)}
            rooms={rooms}
            projects={projects}
            preferences={preferences}
            onBack={() => setView({ type: 'DASHBOARD' })}
            onNavigate={(id) => setView({ type: 'ROOM_DETAIL', roomId: id })}
            onAddItem={(roomId, suggestion) => {
              setActiveRoomId(roomId);
              setNewItemSuggestion(suggestion);
              setEditingItem(undefined);
              setIsItemModalOpen(true);
            }}
            onEditItem={(item) => {
              setEditingItem(item);
              setIsItemModalOpen(true);
            }}
            onUpdateItem={(item) => handleAddItem(item)}
            onEditRoom={(room) => {
              setEditingRoom(room);
              setIsRoomModalOpen(true);
            }}
          />
        );

      case 'PROJECTS':
        return (
          <ProjectView 
            projects={projects}
            items={items}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      
      case 'ALL_ITEMS':
        return (
           <div className="max-w-7xl mx-auto px-4 animate-fadeIn">
             <h2 className="text-2xl font-bold text-slate-800 mb-6">All Items</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {items.map(item => (
                 <ItemCard 
                    key={item.id} 
                    item={item} 
                    projects={projects}
                    preferences={preferences}
                    onEdit={(item) => { setEditingItem(item); setIsItemModalOpen(true); }}
                    onUpdate={(item) => handleAddItem(item)}
                 />
               ))}
             </div>
           </div>
        );

      case 'REPORTS':
        return (
          <Reports 
            items={items}
            rooms={rooms}
            projects={projects}
            preferences={preferences}
          />
        );

      case 'SETTINGS':
        return (
          <Settings 
            preferences={preferences}
            onSavePreferences={handleSavePreferences}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onClearData={handleClearData}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navigation currentView={view} setView={setView} />
      
      <main>
        {renderContent()}
      </main>

      {isRoomModalOpen && (
        <RoomModal 
          room={editingRoom}
          allRooms={rooms}
          preferences={preferences}
          onSave={handleAddRoom}
          onClose={() => setIsRoomModalOpen(false)}
        />
      )}

      {isItemModalOpen && (
        <ItemModal
          item={editingItem}
          roomId={editingItem?.roomId || activeRoomId}
          projects={projects}
          allRooms={rooms}
          initialName={newItemSuggestion}
          existingBrands={existingBrands}
          existingCategories={existingCategories}
          existingTypes={existingTypes}
          currencySymbol={getCurrencySymbol(preferences.currency)}
          onSave={handleAddItem}
          onClose={() => setIsItemModalOpen(false)}
        />
      )}

      <Toast 
        message="Changes Saved" 
        isVisible={showAutoSave} 
        onClose={() => setShowAutoSave(false)} 
      />
    </div>
  );
}

export default App;
