
import React from 'react';
import { Room, Item, UserPreferences, formatRoomDimensions } from '../types';
import { ArrowRight, Box } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  itemCount: number;
  preferences?: UserPreferences;
  onClick: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, itemCount, preferences, onClick }) => {
  const dimensionsDisplay = preferences 
    ? formatRoomDimensions(room, preferences.units) 
    : room.dimensions || 'No dimensions';

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Box className="w-24 h-24 text-indigo-600 transform rotate-12 translate-x-4 -translate-y-4" />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-slate-800 mb-1">{room.name}</h3>
        <p className="text-sm text-slate-500 mb-4">{dimensionsDisplay} • {itemCount} items</p>
        <p className="text-slate-600 line-clamp-2 mb-6 h-12 text-sm leading-relaxed">
          {room.description || "No description provided."}
        </p>
        
        <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
          Enter Room <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </div>
  );
};
