
import React, { useState } from 'react';
import { Item, Project, UserPreferences, getCurrencySymbol } from '../types';
import { Search, ExternalLink, Loader2, DollarSign, Building2 } from 'lucide-react';
import { findManual, analyzeItemValue } from '../services/geminiService';

interface ItemCardProps {
  item: Item;
  projects: Project[];
  preferences?: UserPreferences;
  onEdit: (item: Item) => void;
  onUpdate: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, projects, preferences, onEdit, onUpdate }) => {
  const [isFindingManual, setIsFindingManual] = useState(false);
  const [isValuating, setIsValuating] = useState(false);
  const [geminiValuation, setGeminiValuation] = useState<string | null>(null);

  const itemProjects = projects.filter(p => item.projectIds.includes(p.id));
  const fullDescription = `${item.brand ? item.brand + ' ' : ''}${item.name} ${item.model || ''}`;

  const handleFindManual = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFindingManual(true);
    try {
      const results = await findManual(fullDescription, item.description || item.notes);
      if (results.length > 0) {
        const bestMatch = results[0];
        onUpdate({
          ...item,
          manualUrl: bestMatch.uri,
          manualTitle: bestMatch.title
        });
      } else {
        alert("Gemini couldn't find a specific manual. Try adding more details to the item description.");
      }
    } finally {
      setIsFindingManual(false);
    }
  };

  const handleValuate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsValuating(true);
    try {
      // Pass the currency code preference to Gemini
      const value = await analyzeItemValue(
        fullDescription, 
        item.description || item.notes || '',
        preferences?.currency || 'USD'
      );
      setGeminiValuation(value);
    } finally {
      setIsValuating(false);
    }
  };

  const displayCurrency = preferences ? getCurrencySymbol(preferences.currency) : '$';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:border-indigo-300 transition-colors shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-semibold text-slate-800 leading-tight">
          {item.brand && <span className="text-indigo-600 mr-1">{item.brand}</span>}
          {item.name}
        </h4>
        <div className="flex items-center gap-1">
            {item.isFixed && (
                <span title="Fixed Fixture (Building Insurance)" className="p-0.5 bg-indigo-50 text-indigo-600 rounded">
                    <Building2 className="w-3 h-3" />
                </span>
            )}
            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full whitespace-nowrap ml-1">
            {item.category}
            </span>
        </div>
      </div>
      
      {(item.model || item.type) && (
        <div className="text-xs text-slate-500 mb-2 flex gap-2">
          {item.model && <span className="font-mono bg-slate-50 px-1 rounded">{item.model}</span>}
          {item.type && <span>{item.type}</span>}
        </div>
      )}
      
      <p className="text-sm text-slate-500 mb-3 line-clamp-2 min-h-[2.5em] flex-grow">
        {item.description || item.notes || "No description."}
      </p>

      {item.value !== undefined && (
        <div className="mb-2 text-sm font-semibold text-emerald-600">
          Valued: {displayCurrency}{item.value}
        </div>
      )}

      {geminiValuation && (
        <div className="mb-3 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
          AI Est: {geminiValuation}
        </div>
      )}

      {item.manualUrl && (
        <a 
          href={item.manualUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-3"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3 h-3" />
          {item.manualTitle || "View Manual"}
        </a>
      )}

      <div className="flex flex-wrap gap-1 mb-4">
        {itemProjects.map(p => (
          <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 flex items-center gap-1">
             <div className={`w-1.5 h-1.5 rounded-full ${p.color}`} />
             {p.name}
          </span>
        ))}
      </div>

      <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(item); }}
          className="flex-1 text-xs py-1.5 px-2 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium"
        >
          Edit
        </button>
        
        {!item.manualUrl && (
          <button 
            onClick={handleFindManual}
            disabled={isFindingManual}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium disabled:opacity-50"
            title="Find Manual with Gemini"
          >
            {isFindingManual ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
            <span>Manual</span>
          </button>
        )}

        <button 
          onClick={handleValuate}
          disabled={isValuating}
          className="flex items-center justify-center p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
          title="Estimate Value with Gemini"
        >
          {isValuating ? <Loader2 className="w-3 h-3 animate-spin" /> : <DollarSign className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};
