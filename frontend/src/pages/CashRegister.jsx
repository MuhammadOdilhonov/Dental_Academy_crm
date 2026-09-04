import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import FinancialSummaryTable from '../components/FinancialSummaryTable';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Banknote, 
  DollarSign,
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  X, 
  AlertCircle, 
  RefreshCw,
  Landmark,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Calendar
} from 'lucide-react';

import PeriodFilter from '../components/PeriodFilter';

const CashRegister = () => {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [search, setSearch] = useState('');

  // Period Filter State
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [inflowModalOpen, setInflowModalOpen] = useState(false);
  const [outflowModalOpen, setOutflowModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  // Tahrirlanayotgan tranzaksiya id (faqat direktor) — null bo'lsa yangi qo'shish
  const [editingId, setEditingId] = useState(null);

  // Tahrirlash / o'tgan sanaga kirim-chiqim faqat direktor (yoki superadmin) uchun
  const isDirector = ['director', 'superadmin'].includes(user?.role);

  // Inflow Form State
  const [inflowData, setInflowData] = useState({
    visitor: '',
    isCustomSource: false,
    custom_source_name: '',
    amount: '',
    currency: 'UZS',
    payment_method: 'CASH',
    comment: '',
    created_at: ''  // faqat direktor uchun — o'tgan kun sanasi (YYYY-MM-DD)
  });

  // Outflow Form State
  const [outflowData, setOutflowData] = useState({
    amount: '',
    currency: 'UZS',
    payment_method: 'CASH',
    expense_category: '',
    comment: '',
    created_at: ''  // faqat direktor uchun — o'tgan kun sanasi (YYYY-MM-DD)
  });

  // Balance Metrics by Currency
  const [metrics, setMetrics] = useState({
    totalInflowUZS: 0,
    totalInflowUSD: 0,
    totalOutflowUZS: 0,
    totalOutflowUSD: 0,
    cashBalanceUZS: 0,
    cashBalanceUSD: 0,
    cardBalanceUZS: 0,
    cardBalanceUSD: 0,
    mobileBalanceUZS: 0,
    mobileBalanceUSD: 0,
    transferBalanceUZS: 0,
    transferBalanceUSD: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/transactions/?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}&period=${period}`;
      let allUrl = `/transactions/?all=true&period=${period}`;

      if (period === 'custom') {
        if (startDate) {
          url += `&start_date=${startDate}`;
          allUrl += `&start_date=${startDate}`;
        }
        if (endDate) {
          url += `&end_date=${endDate}`;
          allUrl += `&end_date=${endDate}`;
        }
      }

      if (typeFilter) url += `&type=${encodeURIComponent(typeFilter)}`;
      if (methodFilter) url += `&payment_method=${encodeURIComponent(methodFilter)}`;
      if (currencyFilter) url += `&currency=${encodeURIComponent(currencyFilter)}`;

      const [transRes, visRes, allTransRes] = await Promise.all([
        api.get(url),
        api.get('/visitors/?all=true'),
        api.get(allUrl)
      ]);

      if (transRes.data.results !== undefined) {
        setTransactions(transRes.data.results);
        setTotalCount(transRes.data.count);
      } else {
        setTransactions(transRes.data);
        setTotalCount(transRes.data.length);
      }

      setVisitors(Array.isArray(visRes.data) ? visRes.data : visRes.data.results || []);

      // Compute overall metrics from all transactions grouped by currency
      const allTrans = Array.isArray(allTransRes.data) ? allTransRes.data : allTransRes.data.results || [];
      let inUZS = 0, inUSD = 0;
      let outUZS = 0, outUSD = 0;
      let cashInUZS = 0, cashOutUZS = 0;
      let cashInUSD = 0, cashOutUSD = 0;
      let cardInUZS = 0, cardOutUZS = 0;
      let cardInUSD = 0, cardOutUSD = 0;
      let mobileInUZS = 0, mobileOutUZS = 0;
      let mobileInUSD = 0, mobileOutUSD = 0;
      let transferInUZS = 0, transferOutUZS = 0;
      let transferInUSD = 0, transferOutUSD = 0;

      allTrans.forEach(t => {
        const amt = parseFloat(t.amount) || 0;
        const curr = t.currency || 'UZS';

        if (t.type === 'INFLOW') {
          if (curr === 'UZS') {
            inUZS += amt;
            if (t.payment_method === 'CASH') cashInUZS += amt;
            if (t.payment_method === 'CARD') cardInUZS += amt;
            if (t.payment_method === 'MOBILE') mobileInUZS += amt;
            if (t.payment_method === 'TRANSFER') transferInUZS += amt;
          } else {
            inUSD += amt;
            if (t.payment_method === 'CASH') cashInUSD += amt;
            if (t.payment_method === 'CARD') cardInUSD += amt;
            if (t.payment_method === 'MOBILE') mobileInUSD += amt;
            if (t.payment_method === 'TRANSFER') transferInUSD += amt;
          }
        } else {
          if (curr === 'UZS') {
            outUZS += amt;
            if (t.payment_method === 'CASH') cashOutUZS += amt;
            if (t.payment_method === 'CARD') cardOutUZS += amt;
            if (t.payment_method === 'MOBILE') mobileOutUZS += amt;
            if (t.payment_method === 'TRANSFER') transferOutUZS += amt;
          } else {
            outUSD += amt;
            if (t.payment_method === 'CASH') cashOutUSD += amt;
            if (t.payment_method === 'CARD') cardOutUSD += amt;
            if (t.payment_method === 'MOBILE') mobileOutUSD += amt;
            if (t.payment_method === 'TRANSFER') transferOutUSD += amt;
          }
        }
      });

      setMetrics({
        totalInflowUZS: inUZS,
        totalInflowUSD: inUSD,
        totalOutflowUZS: outUZS,
        totalOutflowUSD: outUSD,

        cash_in_uzs: cashInUZS,
        cash_out_uzs: cashOutUZS,
        cashBalanceUZS: cashInUZS - cashOutUZS,

        cash_in_usd: cashInUSD,
        cash_out_usd: cashOutUSD,
        cashBalanceUSD: cashInUSD - cashOutUSD,

        card_in_uzs: cardInUZS,
        card_out_uzs: cardOutUZS,
        cardBalanceUZS: cardInUZS - cardOutUZS,

        card_in_usd: cardInUSD,
        card_out_usd: cardOutUSD,
        cardBalanceUSD: cardInUSD - cardOutUSD,

        mobile_in_uzs: mobileInUZS,
        mobile_out_uzs: mobileOutUZS,
        mobileBalanceUZS: mobileInUZS - mobileOutUZS,

        mobile_in_usd: mobileInUSD,
        mobile_out_usd: mobileOutUSD,
        mobileBalanceUSD: mobileInUSD - mobileOutUSD,

        transfer_in_uzs: transferInUZS,
        transfer_out_uzs: transferOutUZS,
        transferBalanceUZS: transferInUZS - transferOutUZS,

        transfer_in_usd: transferInUSD,
        transfer_out_usd: transferOutUSD,
        transferBalanceUSD: transferInUSD - transferOutUSD,
      });

    } catch (err) {
      console.error('Error loading cash data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter, methodFilter, currencyFilter, period, startDate, endDate, page, pageSize]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
    setPage(1);
  };

  const handleMethodChange = (e) => {
    setMethodFilter(e.target.value);
    setPage(1);
  };

  const handleCurrencyFilterChange = (e) => {
    setCurrencyFilter(e.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(1);
  };

  const handleInflowSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!inflowData.amount || parseFloat(inflowData.amount) <= 0) {
      setFormError("To'g'ri kirim summasini kiriting!");
      return;
    }

    if (!inflowData.isCustomSource && !inflowData.visitor) {
      setFormError("Iltimos, mijozni tanlang yoki 'Boshqa' manbani ko'rsating!");
      return;
    }

    if (inflowData.isCustomSource && !inflowData.custom_source_name) {
      setFormError("Boshqa mijoz nomi / manbasini kiriting!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: 'INFLOW',
        amount: parseFloat(inflowData.amount),
        currency: inflowData.currency,
        payment_method: inflowData.payment_method,
        comment: inflowData.comment,
        visitor: inflowData.isCustomSource ? null : parseInt(inflowData.visitor, 10),
        custom_source_name: inflowData.isCustomSource ? inflowData.custom_source_name : null,
      };

      // Faqat direktor o'tgan sanaga kirim kirita oladi
      if (isDirector && inflowData.created_at) {
        payload.created_at = `${inflowData.created_at}T12:00:00`;
      }

      if (editingId) {
        await api.patch(`/transactions/${editingId}/`, payload);
      } else {
        await api.post('/transactions/', payload);
      }
      closeInflowModal();
      fetchData();
    } catch (err) {
      console.error('Inflow submit error:', err);
      setFormError('Kirim saqlashda xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOutflowSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!outflowData.amount || parseFloat(outflowData.amount) <= 0) {
      setFormError("To'g'ri chiqim summasini kiriting!");
      return;
    }

    if (!outflowData.expense_category) {
      setFormError("Xarajat kategoriyasini kiriting!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: 'OUTFLOW',
        amount: parseFloat(outflowData.amount),
        currency: outflowData.currency,
        payment_method: outflowData.payment_method,
        expense_category: outflowData.expense_category,
        comment: outflowData.comment,
      };

      // Faqat direktor o'tgan sanaga chiqim kirita oladi
      if (isDirector && outflowData.created_at) {
        payload.created_at = `${outflowData.created_at}T12:00:00`;
      }

      if (editingId) {
        await api.patch(`/transactions/${editingId}/`, payload);
      } else {
        await api.post('/transactions/', payload);
      }
      closeOutflowModal();
      fetchData();
    } catch (err) {
      console.error('Outflow submit error:', err);
      setFormError('Chiqim saqlashda xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Modal ochish / yopish yordamchilari ----
  const closeInflowModal = () => {
    setInflowModalOpen(false);
    setEditingId(null);
    setInflowData({
      visitor: '', isCustomSource: false, custom_source_name: '',
      amount: '', currency: 'UZS', payment_method: 'CASH', comment: '', created_at: ''
    });
  };

  const closeOutflowModal = () => {
    setOutflowModalOpen(false);
    setEditingId(null);
    setOutflowData({
      amount: '', currency: 'UZS', payment_method: 'CASH',
      expense_category: '', comment: '', created_at: ''
    });
  };

  const openInflowModal = () => {
    setFormError('');
    setEditingId(null);
    setInflowData({
      visitor: '', isCustomSource: false, custom_source_name: '',
      amount: '', currency: 'UZS', payment_method: 'CASH', comment: '', created_at: ''
    });
    setInflowModalOpen(true);
  };

  const openOutflowModal = () => {
    setFormError('');
    setEditingId(null);
    setOutflowData({
      amount: '', currency: 'UZS', payment_method: 'CASH',
      expense_category: '', comment: '', created_at: ''
    });
    setOutflowModalOpen(true);
  };

  // Mavjud tranzaksiyani tahrirlash (faqat direktor)
  const openEditModal = (item) => {
    setFormError('');
    setEditingId(item.id);
    const dateStr = item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : '';
    if (item.type === 'INFLOW') {
      setInflowData({
        visitor: item.visitor ? String(item.visitor) : '',
        isCustomSource: !item.visitor && !!item.custom_source_name,
        custom_source_name: item.custom_source_name || '',
        amount: String(item.amount),
        currency: item.currency || 'UZS',
        payment_method: item.payment_method || 'CASH',
        comment: item.comment || '',
        created_at: dateStr
      });
      setInflowModalOpen(true);
    } else {
      setOutflowData({
        amount: String(item.amount),
        currency: item.currency || 'UZS',
        payment_method: item.payment_method || 'CASH',
        expense_category: item.expense_category || '',
        comment: item.comment || '',
        created_at: dateStr
      });
      setOutflowModalOpen(true);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-7 h-7 text-cyan-400" />
            Kassa Boshqaruvi (So'm va Dollar)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            So'm (UZS) va Dollar (USD) moliyaviy amaliyotlari va kassa balansi
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={openInflowModal}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 text-sm"
          >
            <ArrowUpRight className="w-5 h-5" />
            <span>Kirim Qilish</span>
          </button>

          <button
            onClick={openOutflowModal}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/20 transition-all transform active:scale-95 text-sm"
          >
            <ArrowDownLeft className="w-5 h-5" />
            <span>Chiqim Qilish</span>
          </button>
        </div>
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

      {/* Balance Metrics Row (UZS & USD Separated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow */}
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami Kirim</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-lg font-bold text-emerald-400">
              +{metrics.totalInflowUZS.toLocaleString('uz-UZ')} <span className="text-xs font-normal">UZS</span>
            </div>
            <div className="text-base font-semibold text-emerald-300">
              +${metrics.totalInflowUSD.toLocaleString('en-US')} <span className="text-xs font-normal">USD</span>
            </div>
          </div>
        </div>

        {/* Total Outflow */}
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami Chiqim</p>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-lg font-bold text-rose-400">
              -{metrics.totalOutflowUZS.toLocaleString('uz-UZ')} <span className="text-xs font-normal">UZS</span>
            </div>
            <div className="text-base font-semibold text-rose-300">
              -${metrics.totalOutflowUSD.toLocaleString('en-US')} <span className="text-xs font-normal">USD</span>
            </div>
          </div>
        </div>

        {/* Cash Balance (Naqd) */}
        <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Naqd Pul Qoldig'i</p>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-lg font-bold text-cyan-400">
              {metrics.cashBalanceUZS.toLocaleString('uz-UZ')} <span className="text-xs font-normal">UZS</span>
            </div>
            <div className="text-base font-semibold text-cyan-300">
              ${metrics.cashBalanceUSD.toLocaleString('en-US')} <span className="text-xs font-normal">USD</span>
            </div>
          </div>
        </div>

        {/* Non-cash & Transfer Balance */}
        <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Karta, Mobile & O'tkazma</p>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-lg font-bold text-purple-400">
              {(metrics.cardBalanceUZS + metrics.mobileBalanceUZS + metrics.transferBalanceUZS).toLocaleString('uz-UZ')} <span className="text-xs font-normal">UZS</span>
            </div>
            <div className="text-base font-semibold text-purple-300">
              ${(metrics.cardBalanceUSD + metrics.mobileBalanceUSD + metrics.transferBalanceUSD).toLocaleString('en-US')} <span className="text-xs font-normal">USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Financial Summary Table Widget */}
      <FinancialSummaryTable financials={{
        total_inflow_uzs: metrics.totalInflowUZS,
        total_inflow_usd: metrics.totalInflowUSD,
        total_outflow_uzs: metrics.totalOutflowUZS,
        total_outflow_usd: metrics.totalOutflowUSD,
        net_profit_uzs: metrics.totalInflowUZS - metrics.totalOutflowUZS,
        net_profit_usd: metrics.totalInflowUSD - metrics.totalOutflowUSD,

        cash_in_uzs: metrics.cash_in_uzs,
        cash_out_uzs: metrics.cash_out_uzs,
        cash_balance_uzs: metrics.cashBalanceUZS,

        cash_in_usd: metrics.cash_in_usd,
        cash_out_usd: metrics.cash_out_usd,
        cash_balance_usd: metrics.cashBalanceUSD,

        card_in_uzs: metrics.card_in_uzs,
        card_out_uzs: metrics.card_out_uzs,
        card_balance_uzs: metrics.cardBalanceUZS,

        card_in_usd: metrics.card_in_usd,
        card_out_usd: metrics.card_out_usd,
        card_balance_usd: metrics.cardBalanceUSD,

        mobile_in_uzs: metrics.mobile_in_uzs,
        mobile_out_uzs: metrics.mobile_out_uzs,
        mobile_balance_uzs: metrics.mobileBalanceUZS,

        mobile_in_usd: metrics.mobile_in_usd,
        mobile_out_usd: metrics.mobile_out_usd,
        mobile_balance_usd: metrics.mobileBalanceUSD,

        transfer_in_uzs: metrics.transfer_in_uzs,
        transfer_out_uzs: metrics.transfer_out_uzs,
        transfer_balance_uzs: metrics.transferBalanceUZS,

        transfer_in_usd: metrics.transfer_in_usd,
        transfer_out_usd: metrics.transfer_out_usd,
        transfer_balance_usd: metrics.transferBalanceUSD,
      }} />

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Manba, xarajat turi, izoh yoki mijoz ismi..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Currency Filter */}
        <div className="w-full md:w-40">
          <select
            value={currencyFilter}
            onChange={handleCurrencyFilterChange}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="">Barcha Valyuta</option>
            <option value="UZS">💵 UZS (So'm)</option>
            <option value="USD">💲 USD (Dollar)</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="w-full md:w-40">
          <select
            value={typeFilter}
            onChange={handleTypeChange}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Barcha turlar</option>
            <option value="INFLOW">Kirim</option>
            <option value="OUTFLOW">Chiqim</option>
          </select>
        </div>

        {/* Method Filter */}
        <div className="w-full md:w-48">
          <select
            value={methodFilter}
            onChange={handleMethodChange}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Barcha to'lovlar</option>
            <option value="CASH">💵 Naqd</option>
            <option value="CARD">💳 Karta</option>
            <option value="MOBILE">📱 Mobile (Click/Payme)</option>
            <option value="TRANSFER">🏦 Bank o'tkazish</option>
          </select>
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Tur</th>
                <th className="py-3.5 px-4">Mijoz / Manba / Kategoriya</th>
                <th className="py-3.5 px-4">Summa va Valyuta</th>
                <th className="py-3.5 px-4">To'lov Usuli</th>
                <th className="py-3.5 px-4">Izoh</th>
                <th className="py-3.5 px-4">Kiritdi</th>
                <th className="py-3.5 px-4">Vaqti</th>
                {isDirector && <th className="py-3.5 px-4 text-right">Amallar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={isDirector ? 9 : 8} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Tranzaksiyalar yuklanmoqda...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={isDirector ? 9 : 8} className="text-center py-12 text-slate-400">
                    Tranzaksiyalar topilmadi
                  </td>
                </tr>
              ) : (
                transactions.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.type === 'INFLOW' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Kirim
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Chiqim
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {item.visitor_detail ? (
                        <div className="flex items-center gap-1.5 text-cyan-300">
                          <UserCheck className="w-4 h-4 text-cyan-400" />
                          <span>{item.visitor_detail.full_name}</span>
                        </div>
                      ) : item.custom_source_name ? (
                        <span className="text-amber-300">{item.custom_source_name}</span>
                      ) : (
                        <span className="text-rose-300 font-semibold">{item.expense_category || 'Xarajat'}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className={item.type === 'INFLOW' ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.type === 'INFLOW' ? '+' : '-'}
                          {item.currency === 'USD' ? '$' : ''}
                          {parseFloat(item.amount).toLocaleString(item.currency === 'USD' ? 'en-US' : 'uz-UZ')}
                          {item.currency === 'UZS' ? ' UZS' : ' USD'}
                        </span>
                        <span className={`text-[10px] font-sans px-1.5 py-0.5 rounded uppercase font-bold ${
                          item.currency === 'USD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}>
                          {item.currency || 'UZS'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {item.payment_method === 'CASH' && '💵 Naqd'}
                        {item.payment_method === 'CARD' && '💳 Karta'}
                        {item.payment_method === 'MOBILE' && '📱 Mobile'}
                        {item.payment_method === 'TRANSFER' && '🏦 Bank o\'tkazish'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs max-w-xs truncate">
                      {item.comment || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-medium">
                      {item.created_by_detail?.first_name || item.created_by_detail?.username || 'User'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      <div>
                        {new Date(item.created_at).toLocaleDateString('uz-UZ', {
                          year: '2-digit',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {item.updated_at && (
                        <div className="text-[10px] text-amber-400/80 mt-0.5 flex items-center gap-1">
                          <Pencil className="w-2.5 h-2.5" />
                          {new Date(item.updated_at).toLocaleDateString('uz-UZ', {
                            year: '2-digit',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </td>
                    {isDirector && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-slate-700 hover:border-cyan-500/40 transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Tahrirlash
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span>Sahifada ko'rsatish:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={10}>10 ta</option>
              <option value={50}>50 ta</option>
              <option value={100}>100 ta</option>
            </select>
            <span>Jami: <strong className="text-slate-200">{totalCount}</strong> ta tranzaksiya</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-300 font-medium px-2">
              {page} / {totalPages}-sahifa
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inflow Modal */}
      {inflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={closeInflowModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-emerald-400 mb-1 flex items-center gap-2">
              {editingId ? <Pencil className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
              {editingId ? 'Kirimni Tahrirlash' : 'Kassaga Kirim Qilish'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">Admin kiritgan mijoz yoki boshqa manbani tanlang</p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleInflowSubmit} className="space-y-4">
              {/* Sana tanlash — faqat direktor o'tgan kunlarga ham kirita oladi */}
              {isDirector && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Sana (o'tgan kun uchun) {editingId ? '' : '— bo\'sh qoldirilsa bugun'}
                  </label>
                  <input
                    type="date"
                    value={inflowData.created_at}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setInflowData({ ...inflowData, created_at: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Toggle Source Mode */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs font-semibold text-slate-300">
                  {inflowData.isCustomSource ? "Boshqa Manba / Mijoz Ismi" : "Ro'yxatdagi Bemor (Admin kiritgan)"}
                </span>
                <button
                  type="button"
                  onClick={() => setInflowData({ ...inflowData, isCustomSource: !inflowData.isCustomSource })}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline"
                >
                  {inflowData.isCustomSource ? "Bemor tanlash" : "Boshqa tanlash"}
                </button>
              </div>

              {inflowData.isCustomSource ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Mijoz nomi yoki Manba *
                  </label>
                  <input
                    type="text"
                    required
                    value={inflowData.custom_source_name}
                    onChange={(e) => setInflowData({ ...inflowData, custom_source_name: e.target.value })}
                    placeholder="masalan: Dorixona ijarasi / Toshmat aka"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Bemorni tanlang *
                  </label>
                  <select
                    value={inflowData.visitor}
                    onChange={(e) => setInflowData({ ...inflowData, visitor: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Bemor tanlanmagan --</option>
                    {visitors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.full_name} ({v.category} {v.age ? `- ${v.age} yosh` : ''})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Valyuta tanlash (So'm UZS / Dollar USD) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Valyutani tanlang *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setInflowData({ ...inflowData, currency: 'UZS' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      inflowData.currency === 'UZS'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>So'm (UZS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInflowData({ ...inflowData, currency: 'USD' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      inflowData.currency === 'USD'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Dollar (USD $)</span>
                  </button>
                </div>
              </div>

              {/* Kirim Summasi Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Kirim Summasi ({inflowData.currency === 'USD' ? 'USD $' : 'UZS So\'m'}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={inflowData.amount}
                    onChange={(e) => setInflowData({ ...inflowData, amount: e.target.value })}
                    placeholder={inflowData.currency === 'USD' ? '100' : '500000'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold font-mono text-slate-400">
                    {inflowData.currency === 'USD' ? '$ USD' : 'UZS'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  To'lov usuli *
                </label>
                <select
                  value={inflowData.payment_method}
                  onChange={(e) => setInflowData({ ...inflowData, payment_method: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="CASH">💵 Naqd</option>
                  <option value="CARD">💳 Karta</option>
                  <option value="MOBILE">📱 Mobile (Click / Payme / Uzum)</option>
                  <option value="TRANSFER">🏦 Bank o'tkazish</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Izoh / To'lov maqsadi
                </label>
                <textarea
                  rows="2"
                  value={inflowData.comment}
                  onChange={(e) => setInflowData({ ...inflowData, comment: e.target.value })}
                  placeholder="Xizmat to'lovi..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={closeInflowModal}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? 'Saqlanmoqda...' : (editingId ? 'Kirimni Yangilash' : 'Kirimni Saqlash')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Outflow Modal */}
      {outflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={closeOutflowModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-rose-400 mb-1 flex items-center gap-2">
              {editingId ? <Pencil className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
              {editingId ? 'Chiqimni Tahrirlash' : 'Kassadan Chiqim Qilish'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">Klinika xarajatlarini ro'yxatga olish</p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleOutflowSubmit} className="space-y-4">
              {/* Sana tanlash — faqat direktor o'tgan kunlarga ham kirita oladi */}
              {isDirector && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Sana (o'tgan kun uchun) {editingId ? '' : '— bo\'sh qoldirilsa bugun'}
                  </label>
                  <input
                    type="date"
                    value={outflowData.created_at}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setOutflowData({ ...outflowData, created_at: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Valyuta tanlash (So'm UZS / Dollar USD) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Valyutani tanlang *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOutflowData({ ...outflowData, currency: 'UZS' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      outflowData.currency === 'UZS'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>So'm (UZS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOutflowData({ ...outflowData, currency: 'USD' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      outflowData.currency === 'USD'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Dollar (USD $)</span>
                  </button>
                </div>
              </div>

              {/* Chiqim Summasi Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Chiqim Summasi ({outflowData.currency === 'USD' ? 'USD $' : 'UZS So\'m'}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={outflowData.amount}
                    onChange={(e) => setOutflowData({ ...outflowData, amount: e.target.value })}
                    placeholder={outflowData.currency === 'USD' ? '50' : '200000'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base text-slate-100 font-mono font-bold focus:outline-none focus:border-rose-500"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold font-mono text-slate-400">
                    {outflowData.currency === 'USD' ? '$ USD' : 'UZS'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Xarajat Kategoriyasi *
                </label>
                <input
                  type="text"
                  required
                  value={outflowData.expense_category}
                  onChange={(e) => setOutflowData({ ...outflowData, expense_category: e.target.value })}
                  placeholder="masalan: Kommunal / Materiallar / Oylik"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  To'lov usuli *
                </label>
                <select
                  value={outflowData.payment_method}
                  onChange={(e) => setOutflowData({ ...outflowData, payment_method: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="CASH">💵 Naqd</option>
                  <option value="CARD">💳 Karta</option>
                  <option value="MOBILE">📱 Mobile (Click / Payme / Uzum)</option>
                  <option value="TRANSFER">🏦 Bank o'tkazish</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Izoh
                </label>
                <textarea
                  rows="2"
                  value={outflowData.comment}
                  onChange={(e) => setOutflowData({ ...outflowData, comment: e.target.value })}
                  placeholder="Batafsil tushuntirish..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={closeOutflowModal}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-rose-500/20"
                >
                  {submitting ? 'Saqlanmoqda...' : (editingId ? 'Chiqimni Yangilash' : 'Chiqimni Saqlash')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegister;
