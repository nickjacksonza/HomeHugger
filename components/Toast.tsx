import React, { useEffect } from 'react';
import { CheckCircle2, Cloud } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn z-50">
      <Cloud className="w-5 h-5 text-indigo-400" />
      <div>
        <p className="text-sm font-medium">{message}</p>
        <p className="text-[10px] text-slate-400">Synced to local storage</p>
      </div>
      <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2" />
    </div>
  );
};