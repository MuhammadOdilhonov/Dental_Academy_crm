import React from 'react';
import { Banknote, CreditCard, Landmark, DollarSign, Wallet } from 'lucide-react';

const FinancialSummaryTable = ({ financials }) => {
  if (!financials) return null;

  // UZS data
  const cashInUZS = financials.cash_in_uzs || 0;
  const cashOutUZS = financials.cash_out_uzs || 0;
  const cashBalUZS = financials.cash_balance_uzs || (cashInUZS - cashOutUZS);

  const nonCashInUZS = (financials.card_in_uzs || 0) + (financials.mobile_in_uzs || 0);
  const nonCashOutUZS = (financials.card_out_uzs || 0) + (financials.mobile_out_uzs || 0);
  const nonCashBalUZS = (financials.card_balance_uzs || 0) + (financials.mobile_balance_uzs || 0);

  const transferInUZS = financials.transfer_in_uzs || 0;
  const transferOutUZS = financials.transfer_out_uzs || 0;
  const transferBalUZS = financials.transfer_balance_uzs || (transferInUZS - transferOutUZS);

  const totalInUZS = financials.total_inflow_uzs || (cashInUZS + nonCashInUZS + transferInUZS);
  const totalOutUZS = financials.total_outflow_uzs || (cashOutUZS + nonCashOutUZS + transferOutUZS);
  const totalNetUZS = financials.net_profit_uzs || (totalInUZS - totalOutUZS);

  // USD data
  const cashInUSD = financials.cash_in_usd || 0;
  const cashOutUSD = financials.cash_out_usd || 0;
  const cashBalUSD = financials.cash_balance_usd || (cashInUSD - cashOutUSD);

  const nonCashInUSD = (financials.card_in_usd || 0) + (financials.mobile_in_usd || 0);
  const nonCashOutUSD = (financials.card_out_usd || 0) + (financials.mobile_out_usd || 0);
  const nonCashBalUSD = (financials.card_balance_usd || 0) + (financials.mobile_balance_usd || 0);

  const transferInUSD = financials.transfer_in_usd || 0;
  const transferOutUSD = financials.transfer_out_usd || 0;
  const transferBalUSD = financials.transfer_balance_usd || (transferInUSD - transferOutUSD);

  const totalInUSD = financials.total_inflow_usd || (cashInUSD + nonCashInUSD + transferInUSD);
  const totalOutUSD = financials.total_outflow_usd || (cashOutUSD + nonCashOutUSD + transferOutUSD);
  const totalNetUSD = financials.net_profit_usd || (totalInUSD - totalOutUSD);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-cyan-400" />
          Moliyaviy Yig'indi Hisobot (So'm va Dollar)
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          Naqd, Karta va Bank o'tkazmalari kesimidagi kirim-chiqim yig'indisi
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-4">Valyuta / To'lov Usuli</th>
              <th className="py-3 px-4 text-right">Kirim (Tushum)</th>
              <th className="py-3 px-4 text-right">Chiqim (Xarajat)</th>
              <th className="py-3 px-4 text-right">Net Qoldiq</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {/* UZS SECTION HEADER */}
            <tr className="bg-slate-900/40 text-xs font-sans font-bold text-cyan-400 uppercase tracking-wider">
              <td colSpan="4" className="py-2.5 px-4 bg-cyan-950/30 border-l-4 border-cyan-500">
                💵 SO'M (UZS) MOLIYAVIY HISOBOTI
              </td>
            </tr>

            {/* UZS Naqd */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 font-sans font-medium text-slate-200 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Naqd Pul (UZS)</span>
              </td>
              <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                +{cashInUZS.toLocaleString('uz-UZ')} UZS
              </td>
              <td className="py-3 px-4 text-right text-rose-400 font-semibold">
                -{cashOutUZS.toLocaleString('uz-UZ')} UZS
              </td>
              <td className="py-3 px-4 text-right font-extrabold text-cyan-300">
                {cashBalUZS.toLocaleString('uz-UZ')} UZS
              </td>
            </tr>

            {/* UZS Karta & Mobile */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 font-sans font-medium text-slate-200 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Plastik Karta & Mobile (UZS)</span>
              </td>
              <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                +{nonCashInUZS.toLocaleString('uz-UZ')} UZS
              </td>
              <td className="py-3 px-4 text-right text-rose-400 font-semibold">
                -{nonCashOutUZS.toLocaleString('uz-UZ')} UZS
              </td>
              <td className="py-3 px-4 text-right font-extrabold text-cyan-300">
                {nonCashBalUZS.toLocaleString('uz-UZ')} UZS
              </td>
            </tr>

            {/* UZS Transfer */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 font-sans font-medium text-slate-200 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-purple-400" />
                <span>Bank O'tkazmasi (UZS)</span>
              </td>
              <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                +{transferInUZS.toLocaleString('uz-UZ')} UZS
              </td>
              <td className="py-3 px-4 text-right text-rose-400 font-semibold">
                -{transferOutUZS.toLocaleString('uz-UZ')} UZS
              </td>
              <td className="py-3 px-4 text-right font-extrabold text-cyan-300">
                {transferBalUZS.toLocaleString('uz-UZ')} UZS
              </td>
            </tr>

            {/* UZS TOTAL ROW */}
            <tr className="bg-slate-900/80 font-bold border-t border-b border-cyan-500/30">
              <td className="py-3 px-4 font-sans text-cyan-300">
                JAMI SO'M (UZS) BALANSI
              </td>
              <td className="py-3 px-4 text-right text-emerald-400 font-extrabold">
                +{totalInUZS.toLocaleString('uz-UZ')} UZS
              </td>
              <td className="py-3 px-4 text-right text-rose-400 font-extrabold">
                -{totalOutUZS.toLocaleString('uz-UZ')} UZS
              </td>
              <td className="py-3 px-4 text-right text-base text-cyan-400 font-extrabold">
                {totalNetUZS.toLocaleString('uz-UZ')} UZS
              </td>
            </tr>

            {/* USD SECTION HEADER */}
            <tr className="bg-slate-900/40 text-xs font-sans font-bold text-amber-400 uppercase tracking-wider">
              <td colSpan="4" className="py-2.5 px-4 bg-amber-950/30 border-l-4 border-amber-500 pt-4">
                💲 DOLLAR (USD $) MOLIYAVIY HISOBOTI
              </td>
            </tr>

            {/* USD Naqd */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 font-sans font-medium text-slate-200 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-400" />
                <span>Naqd Dollar (USD $)</span>
              </td>
              <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                +${cashInUSD.toLocaleString('en-US')}
              </td>
              <td className="py-3 px-4 text-right text-rose-400 font-semibold">
                -${cashOutUSD.toLocaleString('en-US')}
              </td>
              <td className="py-3 px-4 text-right font-extrabold text-amber-300">
                ${cashBalUSD.toLocaleString('en-US')}
              </td>
            </tr>

            {/* USD Karta & Mobile */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 font-sans font-medium text-slate-200 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Karta & Mobile Dollar (USD $)</span>
              </td>
              <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                +${nonCashInUSD.toLocaleString('en-US')}
              </td>
              <td className="py-3 px-4 text-right text-rose-400 font-semibold">
                -${nonCashOutUSD.toLocaleString('en-US')}
              </td>
              <td className="py-3 px-4 text-right font-extrabold text-amber-300">
                ${nonCashBalUSD.toLocaleString('en-US')}
              </td>
            </tr>

            {/* USD Transfer */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 font-sans font-medium text-slate-200 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>Bank O'tkazmasi Dollar (USD $)</span>
              </td>
              <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                +${transferInUSD.toLocaleString('en-US')}
              </td>
              <td className="py-3 px-4 text-right text-rose-400 font-semibold">
                -${transferOutUSD.toLocaleString('en-US')}
              </td>
              <td className="py-3 px-4 text-right font-extrabold text-amber-300">
                ${transferBalUSD.toLocaleString('en-US')}
              </td>
            </tr>

            {/* USD TOTAL ROW */}
            <tr className="bg-slate-900/80 font-bold border-t border-b border-amber-500/30">
              <td className="py-3 px-4 font-sans text-amber-300">
                JAMI DOLLAR (USD $) BALANSI
              </td>
              <td className="py-3 px-4 text-right text-emerald-400 font-extrabold">
                +${totalInUSD.toLocaleString('en-US')}
              </td>
              <td className="py-3 px-4 text-right text-rose-400 font-extrabold">
                -${totalOutUSD.toLocaleString('en-US')}
              </td>
              <td className="py-3 px-4 text-right text-base text-amber-300 font-extrabold">
                ${totalNetUSD.toLocaleString('en-US')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialSummaryTable;
