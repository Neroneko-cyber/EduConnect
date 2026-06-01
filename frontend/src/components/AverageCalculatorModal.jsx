import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator } from 'lucide-react';

const AverageCalculatorModal = ({ isOpen, onClose, onApply, title }) => {
  const [items, setItems] = useState([{ id: Date.now(), score: '' }]);

  useEffect(() => {
    if (isOpen) {
      setItems([{ id: Date.now(), score: '' }]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScoreChange = (id, value) => {
    setItems(items.map(item => item.id === id ? { ...item, score: value } : item));
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), score: '' }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const validScores = items
    .map(i => parseFloat(i.score))
    .filter(s => !isNaN(s));
    
  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  const average = validScores.length > 0 ? (sum / validScores.length).toFixed(2) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator size={18} className="text-blue-600" />
            {title || 'Hitung Rata-rata'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2 mb-4">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-500 w-16">Item {index + 1}:</span>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nilai (0-100)"
                  value={item.score}
                  onChange={(e) => handleScoreChange(item.id, e.target.value)}
                />
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length === 1}
                  className={`p-2 rounded-xl ${items.length === 1 ? 'text-slate-300' : 'text-rose-500 hover:bg-rose-50'} transition-colors`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAddItem}
            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold text-sm hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <Plus size={16} /> Tambah Item
          </button>

          <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700 flex flex-col gap-1 mb-6">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Jumlah Item Valid:</span>
              <span className="font-semibold text-slate-700">{validScores.length}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Total Nilai:</span>
              <span className="font-semibold text-slate-700">{sum}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-blue-600 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
              <span>Rata-rata:</span>
              <span>{average}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={() => {
                onApply(parseFloat(average));
                onClose();
              }}
              disabled={validScores.length === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Terapkan Nilai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AverageCalculatorModal;
