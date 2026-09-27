import React, { useState, useEffect } from 'react';
import SearchProduct from '../components/SearchProduct';
import TrackedProductsList from '../components/TrackedProductsList';
import ExportButton from '../components/ExportButton';
import { getTrackedProducts } from '../services/api';
import { Activity, ShieldCheck, Clock, RefreshCw, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    fetchTrackedProducts();
    const interval = setInterval(fetchTrackedProducts, 5 * 60 * 1000); // 5 min auto refresh
    return () => clearInterval(interval);
  }, []);

  const fetchTrackedProducts = async () => {
    try {
      setLoading(true);
      const { data } = await getTrackedProducts();
      setProducts(data || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching tracked products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
              <BarChart3 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">INE Price Tracker</h1>
              <p className="text-xs text-slate-500">Product Price Monitoring & Scraping Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ExportButton />
            <button
              onClick={fetchTrackedProducts}
              disabled={loading}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
              title="Refresh product list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Status Info Card Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-sky-50 text-sky-700 rounded-lg border border-sky-100">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Monitoring</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{products.length} Product(s)</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scraper Engine</span>
              <p className="text-sm font-semibold text-emerald-700 mt-0.5">Playwright + Backoff Active</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Auto Check Schedule</span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">Every 2 Hours (Cron Scheduled)</p>
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Search & Add */}
          <div className="lg:col-span-1 space-y-6">
            <SearchProduct onProductAdded={fetchTrackedProducts} />
          </div>

          {/* Right Column: Tracked Products & Charts */}
          <div className="lg:col-span-2 space-y-6">
            <TrackedProductsList products={products} onRefresh={fetchTrackedProducts} />
          </div>
        </div>
      </main>
    </div>
  );
}
