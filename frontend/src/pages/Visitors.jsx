import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  X, 
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import PeriodFilter from '../components/PeriodFilter';

const Visitors = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  // Period Filter State
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'M',
    category: 'Yangi mijoz',
    comment: ''
  });
  const [formError, setFormError] = useState('');

  const canEdit = ['director', 'admin'].includes(user?.role);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      let url = `/visitors/?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}&period=${period}`;
      if (period === 'custom') {
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
      }
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (genderFilter) url += `&gender=${encodeURIComponent(genderFilter)}`;
      
      const res = await api.get(url);
      if (res.data.results !== undefined) {
        setVisitors(res.data.results);
        setTotalCount(res.data.count);
      } else {
        setVisitors(res.data);
        setTotalCount(res.data.length);
      }
    } catch (err) {
      console.error('Error fetching visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchVisitors();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, categoryFilter, genderFilter, period, startDate, endDate, page, pageSize]);

  // Reset to page 1 on filter change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handleGenderChange = (e) => {
    setGenderFilter(e.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(1);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.full_name) {
      setFormError("Ism-familiyani kiritish shart!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : null
      };

      await api.post('/visitors/', payload);
      setIsModalOpen(false);
      setFormData({
        full_name: '',
        age: '',
        gender: 'M',
        category: 'Yangi mijoz',
        comment: ''
      });
      fetchVisitors();
    } catch (err) {
      console.error('Error creating visitor:', err);
      setFormError('Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const categoryBadges = {
    'Yangi mijoz': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Eski klient': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Xabar olingan': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Adashib kirgan': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    'Otmen qildi': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    'Boshqa': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-400" />
            Tashrif buyuruvchilar (Bemorlar)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Klinikaga kelgan mijozlar va bemorlar ro'yxati, registratsiya bo'limi
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            <span>Yangi Bemor Qo'shish</span>
          </button>
        )}
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

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Ism-familiya yoki izoh bo'yicha qidiruv..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="w-full md:w-56">
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Barcha kategoriyalar</option>
            <option value="Yangi mijoz">Yangi mijoz</option>
            <option value="Eski klient">Eski klient</option>
            <option value="Xabar olingan">Xabar olingan</option>
            <option value="Adashib kirgan">Adashib kirgan</option>
            <option value="Otmen qildi">Otmen qildi</option>
            <option value="Boshqa">Boshqa</option>
          </select>
        </div>

        {/* Gender Filter Dropdown */}
        <div className="w-full md:w-40">
          <select
            value={genderFilter}
            onChange={handleGenderChange}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Barcha jins</option>
            <option value="M">Erkak</option>
            <option value="F">Ayol</option>
          </select>
        </div>
      </div>

      {/* Visitors Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Ism-Familiya</th>
                <th className="py-3.5 px-4">Yosh / Jins</th>
                <th className="py-3.5 px-4">Kategoriya</th>
                <th className="py-3.5 px-4">Jami to'langan</th>
                <th className="py-3.5 px-4">Izoh</th>
                <th className="py-3.5 px-4">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Ma'lumotlar yuklanmoqda...
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    Bemorlar topilmadi
                  </td>
                </tr>
              ) : (
                visitors.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 font-bold text-xs border border-slate-700">
                        {item.full_name ? item.full_name[0] : '?'}
                      </div>
                      <span>{item.full_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span>{item.age ? `${item.age} yosh` : '—'}</span>
                      <span className="text-slate-500 mx-1.5">•</span>
                      <span className={item.gender === 'M' ? 'text-blue-400' : 'text-pink-400'}>
                        {item.gender === 'M' ? 'Erkak' : 'Ayol'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${categoryBadges[item.category] || categoryBadges['Boshqa']}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      <div className="space-y-0.5">
                        <div className="text-emerald-400">
                          {item.total_paid_uzs ? item.total_paid_uzs.toLocaleString('uz-UZ') : 0} UZS
                        </div>
                        {item.total_paid_usd > 0 && (
                          <div className="text-amber-300 text-xs font-bold">
                            +${item.total_paid_usd.toLocaleString('en-US')} USD
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {item.comment || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      {new Date(item.created_at).toLocaleDateString('uz-UZ', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
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
            <span>Jami: <strong className="text-slate-200">{totalCount}</strong> ta bemor</span>
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

      {/* Register New Visitor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              Yangi Bemor Registratsiyasi
            </h3>
            <p className="text-xs text-slate-400 mb-5">Qabulxonaga kelgan pacient ma'lumotlarini kiriting</p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Ism va Familiya *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="masalan: Alisher Navoiy"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Yoshi <span className="text-slate-500 font-normal">(ixtiyoriy)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="25"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Jinsi *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="M">Erkak</option>
                    <option value="F">Ayol</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Kategoriya *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Yangi mijoz">Yangi mijoz</option>
                  <option value="Eski klient">Eski klient</option>
                  <option value="Xabar olingan">Xabar olingan</option>
                  <option value="Adashib kirgan">Adashib kirgan</option>
                  <option value="Otmen qildi">Otmen qildi</option>
                  <option value="Boshqa">Boshqa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Izoh / Shikoyati
                </label>
                <textarea
                  rows="3"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Tish og'rig'i, plomba, maslahat va h.k."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-cyan-500/20"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitors;
