import React from 'react';
import { Hammer, HardHat, Clock } from 'lucide-react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 inline-block">
          <HardHat size={80} className="text-blue-500 mb-2 mx-auto" />
          <div className="flex justify-center gap-2 mt-4 text-slate-400">
            <Hammer size={24} className="animate-bounce" style={{ animationDelay: '0ms' }} />
            <Clock size={24} className="animate-bounce" style={{ animationDelay: '150ms' }} />
          </div>
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
        {title}
      </h1>
      
      <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mb-8 leading-relaxed">
        {description || "Halaman ini sedang dalam tahap pengembangan dan akan segera hadir pada pembaruan EduConnect berikutnya."}
      </p>

      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-800/50 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
        Under Construction
      </div>
    </div>
  );
};

export default PlaceholderPage;
