import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getPriceHistory, getScrapeLogs } from '../services/api';
import ScrapeLog from './ScrapeLog';
import { RefreshCw, TrendingDown, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

export default function ProductDetail({ productId, productName, optionName }) {
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [productId, days]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, logsRes] = await Promise.all([
        getPriceHistory(productId, days),
        getScrapeLogs(productId, 50)
      ]);
      setHistory(historyRes.data || []);
      setLogs(logsRes.data || []);
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const validRecords = history.filter((h) => h.status === 'success' && h.price !== null);
  const avgPrice = validRecords.length > 0
    ? (validRecords.reduce((sum, h) => sum + h.price, 0) / validRecords.length).toFixed(2)
    : 'N/A';

  const latestPrice = validRecords.length > 0 ? validRecords[validRecords.length - 1].price : null;
  const lowestPrice = validRecords.length > 0 ? Math.min(...validRecords.map((h) => h.price)) : null;

  const failedCount = history.filter((h) => h.status === 'failed').length;

  return (
    <div className="space-y-6 pt-2">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Latest Scraped Price</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {latestPrice !== null ? `₹${latestPrice.toFixed(2)}` : 'No Data'}
          </p>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4">
          <span className="text-xs font-medium text-blue-700 uppercase tracking-wider">Average Price ({days}d)</span>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {avgPrice !== 'N/A' ? `₹${avgPrice}` : 'N/A'}
          </p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4">
          <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Lowest Recorded Price</span>
          <p className="text-2xl font-bold text-emerald-900 mt-1">
            {lowestPrice !== null ? `₹${lowestPrice.toFixed(2)}` : 'N/A'}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Successful / Failed Runs</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            <span className="text-emerald-700">{validRecords.length}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-rose-600">{failedCount}</span>
          </p>
        </div>
      </div>

      {/* Price Trend Chart Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Price Trend History</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tracking price fluctuations over selected time window</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setDays(1)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  days === 1 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setDays(7)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  days === 7 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setDays(30)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  days === 30 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
              title="Refresh chart & logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {validRecords.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={validRecords} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  labelFormatter={(val) => `Time: ${new Date(val).toLocaleString()}`}
                  formatter={(val) => [`₹${Number(val).toFixed(2)}`, 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#0369a1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs">
            <Calendar className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
            <p>No valid price data recorded in the last {days} day(s).</p>
            <p className="text-slate-400 mt-1">Run a scrape to begin gathering price metrics.</p>
          </div>
        )}
      </div>

      {/* Scrape Logs Component */}
      <ScrapeLog logs={logs} />
    </div>
  );
}
