
import React, { useState, useEffect } from 'react';
import { Room, Item, Project, UserPreferences } from '../types';
import { X, Calculator, Calendar, Building2, Home } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scaleIn overflow-hidden flex flex-col max-h-[90vh]">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <button 
          onClick={onClose} 
          type="button"
          className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

export const RoomModal: React.FC<{
  room?: Room;
  allRooms: Room[];
  preferences: UserPreferences;
  onSave: (room: Omit<Room, 'id'> | Room) => void;
  onClose: () => void;
}> = ({ room, allRooms, preferences, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    width: '' as string | number,
    length: '' as string | number,
    description: '',
    linkedRoomIds: [] as string[]
  });

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        width: room.width || '',
        length: room.length || '',
        description: room.description,
        linkedRoomIds: room.linkedRoomIds
      });
    }
  }, [room]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const width = Math.abs(Number(formData.width) || 0);
    const length = Math.abs(Number(formData.length) || 0);

    const cleanData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      width,
      length,
      linkedRoomIds: formData.linkedRoomIds,
      unit: preferences.units
    };

    onSave(room ? { ...room, ...cleanData } : cleanData);
  };

  const toggleLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      linkedRoomIds: prev.linkedRoomIds.includes(id) 
        ? prev.linkedRoomIds.filter(lid => lid !== id)
        : [...prev.linkedRoomIds, id]
    }));
  };

  const area = (Number(formData.width) || 0) * (Number(formData.length) || 0);
  const unitLabel = preferences.units === 'imperial' ? 'ft' : 'm';

  return (
    <Modal title={room ? 'Edit Room' : 'Add New Room'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
          <input 
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Master Bedroom"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Width ({unitLabel})</label>
            <input 
              type="number"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.width}
              onChange={e => setFormData({...formData, width: e.target.value})}
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Length ({unitLabel})</label>
            <input 
              type="number"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.length}
              onChange={e => setFormData({...formData, length: e.target.value})}
              placeholder="0.0"
            />
          </div>
        </div>

        {area > 0 && (
          <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
            <Calculator className="w-4 h-4" />
            <span>Calculated Area: <strong>{area.toFixed(2)} sq {unitLabel}</strong></span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            rows={3}
            placeholder="Describe the room..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Connected To (Reciprocal)</label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {allRooms.filter(r => r.id !== room?.id).map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleLink(r.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                  formData.linkedRoomIds.includes(r.id)
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {r.name}
              </button>
            ))}
            {allRooms.length <= (room ? 1 : 0) && <p className="text-sm text-slate-400 col-span-2">No other rooms to link yet.</p>}
          </div>
          <p className="text-xs text-slate-500 mt-2">Linking a room here automatically links it back from the other room.</p>
        </div>

        <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium mt-4">
          Save Room
        </button>
      </form>
    </Modal>
  );
};

export const ItemModal: React.FC<{
  item?: Item;
  roomId?: string;
  projects: Project[];
  allRooms: Room[];
  existingBrands?: string[];
  existingCategories?: string[];
  existingTypes?: string[];
  initialName?: string;
  currencySymbol: string;
  onSave: (item: Omit<Item, 'id'> | Item) => void;
  onClose: () => void;
}> = ({ 
  item, 
  roomId, 
  projects, 
  allRooms, 
  existingBrands = [], 
  existingCategories = [], 
  existingTypes = [],
  initialName, 
  currencySymbol,
  onSave, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    name: initialName || '',
    description: '',
    category: existingCategories[0] || 'Other',
    type: '',
    brand: '',
    model: '',
    notes: '',
    roomId: roomId || allRooms[0]?.id || '',
    projectIds: [] as string[],
    value: '' as string | number,
    purchaseDate: '',
    isFixed: false
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        type: item.type || '',
        brand: item.brand || '',
        model: item.model || '',
        notes: item.notes || '',
        roomId: item.roomId,
        projectIds: item.projectIds,
        value: item.value || '',
        purchaseDate: item.purchaseDate || '',
        isFixed: item.isFixed || false
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomId) {
      alert("Please create a room first.");
      return;
    }

    const cleanData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      type: formData.type.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      notes: formData.notes.trim(),
      roomId: formData.roomId,
      projectIds: formData.projectIds,
      value: formData.value ? Math.abs(Number(formData.value)) : undefined,
      purchaseDate: formData.purchaseDate,
      isFixed: formData.isFixed
    };

    onSave(item ? { ...item, ...cleanData } : cleanData);
  };

  const toggleProject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(id)
        ? prev.projectIds.filter(pid => pid !== id)
        : [...prev.projectIds, id]
    }));
  };

  if (allRooms.length === 0) {
     return (
        <Modal title="No Rooms Found" onClose={onClose}>
            <div className="text-center py-6">
                <p className="text-slate-600 mb-4">You need to create a room before you can add items.</p>
                <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Close
                </button>
            </div>
        </Modal>
     )
  }

  return (
    <Modal title={item ? 'Edit Item' : 'Add New Item'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Brand & Name (Primary Identifiers) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
            <input 
              list="brands-list"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.brand}
              onChange={e => setFormData({...formData, brand: e.target.value})}
              placeholder="Select or type..."
            />
            <datalist id="brands-list">
              {existingBrands.map(b => <option key={b} value={b} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. 55in TV"
            />
          </div>
        </div>

        {/* Row 2: Category & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <input
              list="categories-list"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              placeholder="Select or type..."
            />
            <datalist id="categories-list">
              {existingCategories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <input 
              list="types-list"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              placeholder="e.g. OLED, Smart"
            />
            <datalist id="types-list">
              {existingTypes.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>
        </div>

        {/* Row 3: Model & Room */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Model / Serial</label>
            <input 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.model}
              onChange={e => setFormData({...formData, model: e.target.value})}
              placeholder="e.g. QE55Q60AA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Room</label>
            <select
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={formData.roomId}
              onChange={e => setFormData({...formData, roomId: e.target.value})}
            >
              {allRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>

        {/* Fixed / Contents Toggle */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.isFixed ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        {formData.isFixed ? <Building2 className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-800">
                            {formData.isFixed ? 'Fixed Fixture' : 'Moveable Item'}
                        </div>
                        <div className="text-xs text-slate-500">
                            {formData.isFixed 
                                ? 'Covered by Building Insurance (e.g. fitted wardrobe)' 
                                : 'Covered by Contents Insurance (e.g. furniture)'}
                        </div>
                    </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.isFixed}
                        onChange={e => setFormData({...formData, isFixed: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
            </label>
        </div>

        {/* Row 4: Value & Date */}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold bg-slate-100 px-2 py-2 rounded-l-lg border border-r-0 border-slate-300">{currencySymbol}</span>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
              <div className="relative">
                 <input 
                    type="date"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.purchaseDate}
                    onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                 />
                 <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
        </div>

        {/* Description & Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
          <input 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Brief summary for list view"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea 
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            rows={3}
            placeholder="Detailed specs, purchase info, condition, etc."
          />
        </div>

        {/* Projects */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Projects</label>
          <div className="flex flex-wrap gap-2">
            {projects.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProject(p.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-2 ${
                  formData.projectIds.includes(p.id)
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${p.color}`} />
                {p.name}
              </button>
            ))}
            {projects.length === 0 && <p className="text-sm text-slate-400">No projects created yet.</p>}
          </div>
        </div>

        <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium mt-4">
          Save Item
        </button>
      </form>
    </Modal>
  );
};
