import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const PeriodFilter = ({ period, setPeriod, startDate, setStartDate, endDate, setEndDate }) => {
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <div className="glass-panel p-3.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-slate-800">
      {/* Quick Period Buttons */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <div className="flex items-center text-xs font-semibold text-slate-400 mr-2 shrink-0">
          <Clock className="w-4 h-4 text-cyan-400 mr-1.5" />
          <span>Vaqt oralig'i:</span>
        </div>

        <button
          type="button"
          onClick={() => handlePeriodChange('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            period === 'all'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Barchasi
        </button>

        <button
          type="button"
          onClick={() => handlePeriodChange('today')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            period === 'today'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Bugun
        </button>

        <button
          type="button"
          onClick={() => handlePeriodChange('yesterday')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            period === 'yesterday'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Kechagi
        </button>

        <button
          type="button"
          onClick={() => handlePeriodChange('week')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            period === 'week'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Shu Hafta
        </button>

        <button
          type="button"
          onClick={() => handlePeriodChange('month')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            period === 'month'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Shu Oy
        </button>

        <button
          type="button"
          onClick={() => handlePeriodChange('custom')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
            period === 'custom'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Sana Tanlash</span>
        </button>
      </div>

      {/* Custom Date Range Picker */}
      {period === 'custom' && (
        <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-amber-500/40 text-xs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400"
          />
          <span className="text-slate-400 font-bold">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400"
          />
        </div>
      )}
    </div>
  );
};

export default PeriodFilter;
