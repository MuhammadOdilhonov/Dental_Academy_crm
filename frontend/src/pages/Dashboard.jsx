import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import FinancialSummaryTable from '../components/FinancialSummaryTable';
import PeriodFilter from '../components/PeriodFilter';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  UserX, 
  PieChart, 
  Banknote, 
  CreditCard, 
  Landmark, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      let url = `/dashboard/stats/?period=${period}`;
      if (period === 'custom') {
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
      }
      const res = await api.get(url);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period, startDate, endDate]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
          <p className="text-sm font-medium">Analitika va hisobotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const financials = stats?.financials || {};
  const visitors = stats?.visitors || {};
  const totalGender = (visitors.male_count || 0) + (visitors.female_count || 0);
  const malePercent = totalGender > 0 ? Math.round((visitors.male_count / totalGender) * 100) : 0;
  const femalePercent = totalGender > 0 ? 100 - malePercent : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-cyan-400" />
            Direktor Analitika Dashboardi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Klinikaning umumiy moliyaviy va pacientlar statistikasi
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Period Filter (Bugun, Kechagi, Shu hafta, Shu oy, Custom Date) */}
      <PeriodFilter 
        period={period} 
        setPeriod={setPeriod} 
        startDate={startDate} 
        setStartDate={setStartDate} 
        endDate={endDate} 
        setEndDate={setEndDate} 
      />

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Inflow */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami Kirim (Tushum)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-2xl font-extrabold text-emerald-400">
              +{financials.total_inflow_uzs?.toLocaleString('uz-UZ')} UZS
            </div>
            <div className="text-xl font-bold text-emerald-300">
              +${financials.total_inflow_usd?.toLocaleString('en-US')} USD
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">So'm va Dollar ko'rinishidagi tushumlar</p>
        </div>

        {/* Total Outflow */}
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami Chiqim (Xarajat)</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-2xl font-extrabold text-rose-400">
              -{financials.total_outflow_uzs?.toLocaleString('uz-UZ')} UZS
            </div>
            <div className="text-xl font-bold text-rose-300">
              -${financials.total_outflow_usd?.toLocaleString('en-US')} USD
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">So'm va Dollar ko'rinishidagi chiqimlar</p>
        </div>

        {/* Net Profit */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 relative overflow-hidden bg-gradient-to-tr from-cyan-950/40 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Sof Qoldiq</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-2xl font-extrabold text-cyan-400">
              {financials.net_profit_uzs?.toLocaleString('uz-UZ')} UZS
            </div>
            <div className="text-xl font-bold text-cyan-300">
              ${financials.net_profit_usd?.toLocaleString('en-US')} USD
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Kirim va chiqim o'rtasidagi sof qoldiq</p>
        </div>
      </div>

      {/* Payment Methods Breakdown Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Naqd Pul Qoldig'i</p>
            <p className="text-sm font-bold text-slate-100 mt-0.5">
              {financials.cash_balance_uzs?.toLocaleString('uz-UZ')} UZS
            </p>
            <p className="text-xs font-semibold text-amber-300">
              ${financials.cash_balance_usd?.toLocaleString('en-US')} USD
            </p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Plastik & Mobile Qoldig'i</p>
            <p className="text-sm font-bold text-slate-100 mt-0.5">
              {((financials.card_balance_uzs || 0) + (financials.mobile_balance_uzs || 0)).toLocaleString('uz-UZ')} UZS
            </p>
            <p className="text-xs font-semibold text-amber-300">
              ${((financials.card_balance_usd || 0) + (financials.mobile_balance_usd || 0)).toLocaleString('en-US')} USD
            </p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Bank O'tkazmasi Qoldig'i</p>
            <p className="text-sm font-bold text-slate-100 mt-0.5">
              {financials.transfer_balance_uzs?.toLocaleString('uz-UZ')} UZS
            </p>
            <p className="text-xs font-semibold text-amber-300">
              ${financials.transfer_balance_usd?.toLocaleString('en-US')} USD
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Financial Summary Table Widget (USD & UZS Breakdown) */}
      <FinancialSummaryTable financials={financials} />

      {/* Grid Section for Patient Stats & Category Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-cyan-400" />
              Pacientlar Jins Nisbati (Erkak / Ayol)
            </h3>
            <span className="text-xs text-slate-400 font-semibold bg-slate-800 px-2.5 py-1 rounded-lg">
              Jami: {visitors.total_count} ta bemor
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-blue-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Erkaklar
                </span>
                <span className="text-slate-200">{visitors.male_count} ta ({malePercent}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${malePercent}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-pink-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" /> Ayollar
                </span>
                <span className="text-slate-200">{visitors.female_count} ta ({femalePercent}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-500 rounded-full transition-all duration-500" 
                  style={{ width: `${femalePercent}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Cancellation Metric Box */}
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-300">Otmen Qilingan Tashriflar</p>
                <p className="text-xs text-slate-400">Qabulni bekor qilgan pacientlar soni</p>
              </div>
            </div>
            <span className="text-xl font-bold text-rose-400 font-mono">
              {visitors.cancelled_count} ta
            </span>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
              <PieChart className="w-5 h-5 text-cyan-400" />
              Kategoriyalar Kesimida Statistika
            </h3>
          </div>

          <div className="space-y-3">
            {visitors.category_breakdown?.map((cat, idx) => {
              const pct = visitors.total_count > 0 ? Math.round((cat.count / visitors.total_count) * 100) : 0;
              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-sm font-medium text-slate-200">{cat.category}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {cat.count} ta ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions Widget */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="font-bold text-slate-100 mb-4 text-base flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Oxirgi Kassa Harakatlari
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="py-2.5 px-3">Tur</th>
                <th className="py-2.5 px-3">Manba / Mijoz</th>
                <th className="py-2.5 px-3">Summa</th>
                <th className="py-2.5 px-3">To'lov usuli</th>
                <th className="py-2.5 px-3">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats?.recent_transactions?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3">
                    {item.type === 'INFLOW' ? (
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Kirim
                      </span>
                    ) : (
                      <span className="text-rose-400 text-xs font-semibold flex items-center gap-1">
                        <ArrowDownLeft className="w-3.5 h-3.5" /> Chiqim
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-200">
                    {item.visitor_detail?.full_name || item.custom_source_name || item.expense_category}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    <span className={item.type === 'INFLOW' ? 'text-emerald-400' : 'text-rose-400'}>
                      {item.type === 'INFLOW' ? '+' : '-'}
                      {item.currency === 'USD' ? '$' : ''}
                      {parseFloat(item.amount).toLocaleString(item.currency === 'USD' ? 'en-US' : 'uz-UZ')}
                      {item.currency === 'UZS' ? ' UZS' : ' USD'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-400">
                    {item.payment_method}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-500 font-mono">
                    {new Date(item.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
